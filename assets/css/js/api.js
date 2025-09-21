// Gestionnaire d'API REST avec intégration Supabase réelle
class APIManager {
    constructor() {
        this.baseURL = 'https://votre-projet.supabase.co/rest/v1';
        this.apiKey = 'votre-cle-api-publique';
        this.connected = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.supabaseClient = null;
        this.useRealSupabase = false;
    }

    // Connexion à Supabase (vraie ou simulée)
    async connect() {
        try {
            // Vérifier si Supabase est disponible et configuré
            if (typeof supabase !== 'undefined' && supabaseConfig.url && supabaseConfig.anonKey && 
                supabaseConfig.url !== 'https://votre-projet.supabase.co' && 
                supabaseConfig.anonKey !== 'votre-cle-api-publique') {
                
                console.log('🔌 Tentative de connexion Supabase réelle...');
                
                // Initialiser le client Supabase
                this.supabaseClient = supabase.createClient(
                    supabaseConfig.url,
                    supabaseConfig.anonKey
                );

                // Test de connexion
                const { data, error } = await this.supabaseClient
                    .from('employees')
                    .select('count', { count: 'exact' })
                    .limit(1);

                if (!error) {
                    this.connected = true;
                    this.useRealSupabase = true;
                    console.log('✅ Connexion Supabase réelle établie');
                    console.log(`📊 Nombre d'employés: ${data?.length || 0}`);
                    
                    // Configurer le temps réel
                    this.setupRealtimeSubscriptions();
                    return true;
                } else {
                    console.warn('⚠️ Erreur connexion Supabase:', error.message);
                }
            }
            
            // Mode simulation si pas de Supabase
            console.log('🔄 Mode simulation activé');
            await this.simulateNetworkDelay();
            this.connected = true;
            this.useRealSupabase = false;
            return true;
            
        } catch (error) {
            console.error('❌ Erreur de connexion:', error);
            this.connected = false;
            this.useRealSupabase = false;
            return false;
        }
    }

    // Configuration des abonnements temps réel
    setupRealtimeSubscriptions() {
        if (!this.supabaseClient) return;

        const channel = this.supabaseClient
            .channel('hr-dashboard')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'feedbacks'
            }, (payload) => {
                console.log('📝 Nouveau feedback reçu:', payload.new);
                this.notifyRealTime('feedback', payload.new);
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'moods'
            }, (payload) => {
                console.log('😊 Nouvelle humeur reçue:', payload.new);
                this.notifyRealTime('mood', payload.new);
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'survey_responses'
            }, (payload) => {
                console.log('📊 Nouvelle réponse sondage:', payload.new);
                this.notifyRealTime('survey', payload.new);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('🔔 Abonnements temps réel actifs');
                }
            });
    }

    // Simulation de délai réseau
    simulateNetworkDelay(min = 100, max = 800) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Simulation d'erreur réseau aléatoire
    simulateNetworkError() {
        const errorRate = 0.05; // 5% de chance d'erreur
        if (Math.random() < errorRate) {
            throw new Error('Erreur réseau simulée');
        }
    }

    // === GESTION DES EMPLOYÉS ===

    async getEmployees(filters = {}) {
        if (this.useRealSupabase && this.supabaseClient) {
            let query = this.supabaseClient
                .from('employees')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters.department) {
                query = query.eq('department', filters.department);
            }
            if (filters.active !== undefined) {
                query = query.eq('active', filters.active);
            }

            const { data, error } = await query;
            if (error) throw error;
            
            return data.map(emp => ({
                ...emp,
                employeeId: emp.id // Compatibilité avec l'ancien format
            }));
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return database.getEmployees(filters);
    }

    async createEmployee(employeeData) {
        if (this.useRealSupabase && this.supabaseClient) {
            const { data, error } = await this.supabaseClient
                .from('employees')
                .insert([{
                    name: employeeData.name,
                    email: employeeData.email,
                    department: employeeData.department,
                    position: employeeData.position
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return database.addEmployee(employeeData);
    }

    async updateEmployee(id, updates) {
        if (this.useRealSupabase && this.supabaseClient) {
            const { data, error } = await this.supabaseClient
                .from('employees')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return database.updateEmployee(id, updates);
    }

    // === GESTION DES FEEDBACKS ===

    async getFeedbacks(filters = {}) {
        if (this.useRealSupabase && this.supabaseClient) {
            let query = this.supabaseClient
                .from('feedbacks')
                .select(`
                    *,
                    employees:employee_id (
                        name,
                        email
                    )
                `)
                .order('created_at', { ascending: false });

            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            if (filters.priority) {
                query = query.eq('priority', filters.priority);
            }
            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            const { data, error } = await query;
            if (error) throw error;
            
            return data.map(feedback => ({
                ...feedback,
                employeeId: feedback.employee_id,
                timestamp: feedback.created_at
            }));
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return database.getFeedbacks(filters);
    }

    async createFeedback(feedbackData) {
        if (this.useRealSupabase && this.supabaseClient) {
            // D'abord, créer un employé temporaire s'il n'existe pas
            let employeeId = feedbackData.employeeId;
            
            if (!employeeId) {
                // Créer un employé temporaire pour la démo
                const { data: newEmployee, error: empError } = await this.supabaseClient
                    .from('employees')
                    .insert([{
                        name: 'Utilisateur Demo',
                        email: `demo${Date.now()}@company.com`,
                        department: 'Demo',
                        position: 'Utilisateur'
                    }])
                    .select()
                    .single();

                if (empError) {
                    console.warn('Erreur création employé temporaire:', empError);
                    employeeId = null;
                } else {
                    employeeId = newEmployee.id;
                }
            }

            const { data, error } = await this.supabaseClient
                .from('feedbacks')
                .insert([{
                    employee_id: employeeId,
                    category: feedbackData.category,
                    message: feedbackData.message,
                    priority: feedbackData.priority,
                    anonymous: feedbackData.anonymous || false
                }])
                .select()
                .single();

            if (error) throw error;
            
            // Notifier en temps réel
            this.notifyRealTime('feedback', data);
            
            return {
                ...data,
                employeeId: data.employee_id,
                timestamp: data.created_at
            };
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        const result = database.addFeedback(feedbackData);
        this.notifyRealTime('feedback', result);
        return result;
    }

    async updateFeedback(id, updates) {
        if (this.useRealSupabase && this.supabaseClient) {
            const { data, error } = await this.supabaseClient
                .from('feedbacks')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return database.updateFeedback(id, updates);
    }

    // === GESTION DES HUMEURS ===

    async getMoods(dateRange = {}) {
        if (this.useRealSupabase && this.supabaseClient) {
            let query = this.supabaseClient
                .from('moods')
                .select(`
                    *,
                    employees:employee_id (
                        name
                    )
                `)
                .order('date', { ascending: false });

            if (dateRange.start) {
                query = query.gte('date', dateRange.start.toISOString().split('T')[0]);
            }
            if (dateRange.end) {
                query = query.lte('date', dateRange.end.toISOString().split('T')[0]);
            }

            const { data, error } = await query;
            if (error) throw error;
            
            return data.map(mood => ({
                ...mood,
                mood: mood.mood_score,
                employeeId: mood.employee_id,
                timestamp: mood.created_at
            }));
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return database.getMoods(dateRange);
    }

    async createMood(moodData) {
        if (this.useRealSupabase && this.supabaseClient) {
            // Créer un employé temporaire si nécessaire
            let employeeId = moodData.employeeId;
            
            if (!employeeId) {
                const { data: newEmployee, error: empError } = await this.supabaseClient
                    .from('employees')
                    .insert([{
                        name: 'Utilisateur Demo',
                        email: `demo${Date.now()}@company.com`,
                        department: 'Demo'
                    }])
                    .select()
                    .single();

                if (!empError && newEmployee) {
                    employeeId = newEmployee.id;
                }
            }

            const today = new Date().toISOString().split('T')[0];
            
            // Vérifier si une humeur existe déjà aujourd'hui pour cet employé
            const { data: existingMood } = await this.supabaseClient
                .from('moods')
                .select('*')
                .eq('employee_id', employeeId)
                .eq('date', today)
                .single();

            let result;
            if (existingMood) {
                // Mettre à jour l'humeur existante
                const { data, error } = await this.supabaseClient
                    .from('moods')
                    .update({
                        mood_score: moodData.mood,
                        comment: moodData.comment
                    })
                    .eq('id', existingMood.id)
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            } else {
                // Créer une nouvelle humeur
                const { data, error } = await this.supabaseClient
                    .from('moods')
                    .insert([{
                        employee_id: employeeId,
                        mood_score: moodData.mood,
                        date: today,
                        comment: moodData.comment
                    }])
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            }

            // Notifier en temps réel
            this.notifyRealTime('mood', result);
            
            return {
                ...result,
                mood: result.mood_score,
                employeeId: result.employee_id,
                timestamp: result.created_at
            };
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        const result = database.addMood(moodData);
        this.notifyRealTime('mood', result);
        return result;
    }

    // === GESTION DES SONDAGES ===

    async getSurveys() {
        if (this.useRealSupabase && this.supabaseClient) {
            const { data, error } = await this.supabaseClient
                .from('surveys')
                .select(`
                    *,
                    survey_responses (
                        id
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Compter les réponses et ajouter les infos manquantes
            return data.map(survey => ({
                ...survey,
                responses: survey.survey_responses?.length || 0,
                totalEmployees: 42 // Valeur par défaut, à récupérer dynamiquement si besoin
            }));
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return database.getSurveys();
    }

    async createSurvey(surveyData) {
        if (this.useRealSupabase && this.supabaseClient) {
            const { data, error } = await this.supabaseClient
                .from('surveys')
                .insert([{
                    title: surveyData.title,
                    description: surveyData.description,
                    questions: surveyData.questions || []
                }])
                .select()
                .single();

            if (error) throw error;
            return {
                ...data,
                responses: 0,
                totalEmployees: 42
            };
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return database.addSurvey(surveyData);
    }

    async getSurveyResponses(surveyId) {
        if (this.useRealSupabase && this.supabaseClient) {
            const { data, error } = await this.supabaseClient
                .from('survey_responses')
                .select(`
                    *,
                    employees:employee_id (
                        name,
                        email
                    )
                `)
                .eq('survey_id', surveyId)
                .order('submitted_at', { ascending: false });

            if (error) throw error;
            return data;
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return this.generateMockSurveyResponses(surveyId);
    }

    async submitSurveyResponse(surveyId, responseData) {
        if (this.useRealSupabase && this.supabaseClient) {
            const { data, error } = await this.supabaseClient
                .from('survey_responses')
                .insert([{
                    survey_id: surveyId,
                    employee_id: responseData.employeeId,
                    answers: responseData.answers
                }])
                .select()
                .single();

            if (error) throw error;
            
            this.notifyRealTime('survey', data);
            return data;
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return {
            id: Date.now(),
            surveyId,
            ...responseData,
            submittedAt: new Date()
        };
    }

    // === GESTION DES FORMATIONS ===

    async getTrainings() {
        if (this.useRealSupabase && this.supabaseClient) {
            const { data, error } = await this.supabaseClient
                .from('trainings')
                .select(`
                    *,
                    training_ratings (
                        rating,
                        comment
                    )
                `)
                .order('start_date', { ascending: false });

            if (error) throw error;
            
            return data.map(training => {
                const ratings = training.training_ratings || [];
                const avgRating = ratings.length > 0 ?
                    ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length :
                    null;
                
                return {
                    ...training,
                    rating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
                    ratings: ratings
                };
            });
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return database.getTrainings();
    }

    async rateTraining(trainingId, rating, comment = '') {
        if (this.useRealSupabase && this.supabaseClient) {
            // Créer un employé temporaire si nécessaire
            let employeeId = 1; // ID par défaut
            
            const { data, error } = await this.supabaseClient
                .from('training_ratings')
                .upsert([{
                    training_id: trainingId,
                    employee_id: employeeId,
                    rating: rating,
                    comment: comment
                }], {
                    onConflict: 'training_id,employee_id'
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }

        // Mode simulation
        await this.simulateNetworkDelay();
        return database.addTrainingRating(trainingId, { rating, comment });
    }

    // === ANALYTICS ===

    async getAnalytics(type, period = '30d') {
        await this.simulateNetworkDelay(200, 500);
        
        switch (type) {
            case 'mood':
                return this.getMoodAnalytics(period);
            case 'feedback':
                return this.getFeedbackAnalytics(period);
            case 'survey':
                return this.getSurveyAnalytics(period);
            default:
                throw new Error(`Type d'analytics non supporté: ${type}`);
        }
    }

    async getMoodAnalytics(period) {
        const periodDays = parseInt(period.replace('d', ''));
        const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
        
        const moods = await this.getMoods({ start: startDate });
        
        if (moods.length === 0) {
            return {
                average: 3,
                trend: 0,
                distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                timeline: []
            };
        }
        
        const average = moods.reduce((sum, m) => sum + (m.mood || m.mood_score), 0) / moods.length;
        
        return {
            average: parseFloat(average.toFixed(1)),
            trend: this.calculateTrend(moods.map(m => m.mood || m.mood_score)),
            distribution: this.calculateMoodDistribution(moods),
            timeline: moods.map(m => ({
                date: m.date,
                value: m.mood || m.mood_score
            }))
        };
    }

    async getFeedbackAnalytics(period) {
        const periodDays = parseInt(period.replace('d', ''));
        const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
        
        const feedbacks = await this.getFeedbacks();
        const filteredFeedbacks = feedbacks.filter(f => 
            new Date(f.timestamp || f.created_at) >= startDate
        );
        
        return {
            total: filteredFeedbacks.length,
            byCategory: this.groupBy(filteredFeedbacks, 'category'),
            byPriority: this.groupBy(filteredFeedbacks, 'priority'),
            timeline: this.groupFeedbacksByDate(filteredFeedbacks)
        };
    }

    async getSurveyAnalytics(period) {
        const surveys = await this.getSurveys();
        
        return {
            total: surveys.length,
            active: surveys.filter(s => s.status === 'active').length,
            averageResponseRate: surveys.length > 0 ?
                surveys.reduce((sum, s) => sum + (s.responses / (s.totalEmployees || 42)), 0) / surveys.length * 100 :
                0,
            byStatus: this.groupBy(surveys, 'status')
        };
    }

    // === UTILITAIRES ===

    calculateTrend(values) {
        if (values.length < 4) return 0;
        
        const recent = values.slice(0, Math.floor(values.length / 2));
        const older = values.slice(Math.floor(values.length / 2));
        
        const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
        const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;
        
        return parseFloat((recentAvg - olderAvg).toFixed(1));
    }

    calculateMoodDistribution(moods) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        moods.forEach(mood => {
            const score = mood.mood || mood.mood_score;
            if (score >= 1 && score <= 5) {
                distribution[score]++;
            }
        });
        
        return distribution;
    }

    groupBy(array, key) {
        const grouped = {};
        array.forEach(item => {
            const group = item[key] || 'unknown';
            grouped[group] = (grouped[group] || 0) + 1;
        });
        return grouped;
    }

    groupFeedbacksByDate(feedbacks) {
        const grouped = {};
        feedbacks.forEach(feedback => {
            const date = new Date(feedback.timestamp || feedback.created_at).toDateString();
            grouped[date] = (grouped[date] || 0) + 1;
        });
        return grouped;
    }

    generateMockSurveyResponses(surveyId) {
        const responses = [];
        const responseCount = Math.floor(Math.random() * 20) + 10;
        
        for (let i = 1; i <= responseCount; i++) {
            responses.push({
                id: i,
                surveyId: surveyId,
                employeeId: Math.floor(Math.random() * 42) + 1,
                answers: {
                    question1: Math.floor(Math.random() * 5) + 1,
                    question2: Math.floor(Math.random() * 5) + 1,
                    question3: Math.floor(Math.random() * 5) + 1,
                    comment: 'Commentaire généré automatiquement'
                },
                submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            });
        }
        
        return responses;
    }

    // Simulation de notifications temps réel
    notifyRealTime(type, data) {
        setTimeout(() => {
            const event = new CustomEvent('realTimeUpdate', {
                detail: { type, data }
            });
            document.dispatchEvent(event);
        }, 100);
    }

    // Gestion des erreurs et monitoring
    async healthCheck() {
        try {
            if (this.useRealSupabase && this.supabaseClient) {
                const { data, error } = await this.supabaseClient
                    .from('employees')
                    .select('count')
                    .limit(1);

                return {
                    status: error ? 'error' : 'healthy',
                    database: error ? 'disconnected' : 'connected',
                    mode: 'supabase',
                    error: error?.message,
                    lastCheck: new Date().toISOString()
                };
            } else {
                await this.simulateNetworkDelay(50, 200);
                return {
                    status: 'healthy',
                    database: 'simulation',
                    mode: 'simulation',
                    lastCheck: new Date().toISOString()
                };
            }
        } catch (error) {
            return {
                status: 'error',
                database: 'disconnected',
                mode: this.useRealSupabase ? 'supabase' : 'simulation',
                error: error.message,
                lastCheck: new Date().toISOString()
            };
        }
    }

    // Synchronisation des données
    async syncData() {
        console.log('🔄 Synchronisation des données...');
        
        try {
            let stats;
            if (this.useRealSupabase && this.supabaseClient) {
                // Statistiques depuis Supabase
                const [employees, feedbacks, moods, surveys] = await Promise.all([
                    this.supabaseClient.from('employees').select('id', { count: 'exact' }),
                    this.supabaseClient.from('feedbacks').select('id', { count: 'exact' }),
                    this.supabaseClient.from('moods').select('mood_score'),
                    this.supabaseClient.from('surveys').select('id, status', { count: 'exact' })
                ]);

                const avgMood = moods.data?.length > 0 ? 
                    moods.data.reduce((sum, m) => sum + m.mood_score, 0) / moods.data.length : 3;

                stats = {
                    totalEmployees: employees.count || 0,
                    totalFeedbacks: feedbacks.count || 0,
                    averageMood: parseFloat(avgMood.toFixed(1)),
                    activeSurveys: surveys.data?.filter(s => s.status === 'active').length || 0
                };
            } else {
                // Mode simulation
                await this.simulateNetworkDelay(1000, 2000);
                stats = database.getStats();
            }
            
            console.log('📊 Données synchronisées:', stats);
            
            return {
                success: true,
                timestamp: new Date().toISOString(),
                mode: this.useRealSupabase ? 'supabase' : 'simulation',
                stats
            };
            
        } catch (error) {
            console.error('❌ Erreur de synchronisation:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
                mode: this.useRealSupabase ? 'supabase' : 'simulation'
            };
        }
    }
}

// Instance globale de l'API
const api = new APIManager();