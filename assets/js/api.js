// Gestionnaire d'API REST simulée avec Supabase
class APIManager {
    constructor() {
        this.baseURL = 'https://votre-projet.supabase.co/rest/v1';
        this.apiKey = 'votre-cle-api-publique';
        this.connected = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    // Simulation de connexion à Supabase
    async connect() {
        try {
            await this.simulateNetworkDelay();
            this.connected = true;
            console.log('✅ Connexion API simulée établie');
            return true;
        } catch (error) {
            console.error('❌ Erreur de connexion API:', error);
            this.connected = false;
            return false;
        }
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

    // Méthode générique pour les requêtes API
    async request(endpoint, options = {}) {
        let attempts = 0;
        
        while (attempts < this.retryAttempts) {
            try {
                await this.simulateNetworkDelay();
                this.simulateNetworkError();
                
                const response = await this.simulateAPICall(endpoint, options);
                return response;
                
            } catch (error) {
                attempts++;
                console.warn(`Tentative ${attempts}/${this.retryAttempts} échouée:`, error.message);
                
                if (attempts >= this.retryAttempts) {
                    throw new Error(`Échec après ${this.retryAttempts} tentatives: ${error.message}`);
                }
                
                await new Promise(resolve => 
                    setTimeout(resolve, this.retryDelay * attempts)
                );
            }
        }
    }

    // Simulation d'appel API
    async simulateAPICall(endpoint, options) {
        const { method = 'GET', data } = options;
        
        // Simulation de différents endpoints
        switch (true) {
            case endpoint.includes('/employees'):
                return this.handleEmployeesAPI(endpoint, method, data);
            case endpoint.includes('/feedbacks'):
                return this.handleFeedbacksAPI(endpoint, method, data);
            case endpoint.includes('/moods'):
                return this.handleMoodsAPI(endpoint, method, data);
            case endpoint.includes('/surveys'):
                return this.handleSurveysAPI(endpoint, method, data);
            case endpoint.includes('/trainings'):
                return this.handleTrainingsAPI(endpoint, method, data);
            default:
                throw new Error(`Endpoint non supporté: ${endpoint}`);
        }
    }

    // API Employés
    async handleEmployeesAPI(endpoint, method, data) {
        switch (method) {
            case 'GET':
                if (endpoint.includes('select=')) {
                    const filters = this.parseFilters(endpoint);
                    return database.getEmployees(filters);
                }
                return database.getEmployees();
                
            case 'POST':
                return database.addEmployee(data);
                
            case 'PUT':
            case 'PATCH':
                const empId = this.extractIdFromEndpoint(endpoint);
                return database.updateEmployee(empId, data);
                
            default:
                throw new Error(`Méthode ${method} non supportée pour /employees`);
        }
    }

    // API Feedbacks
    async handleFeedbacksAPI(endpoint, method, data) {
        switch (method) {
            case 'GET':
                const filters = this.parseFilters(endpoint);
                return database.getFeedbacks(filters);
                
            case 'POST':
                const feedback = database.addFeedback(data);
                // Simulation de notification temps réel
                this.notifyRealTime('feedback', feedback);
                return feedback;
                
            case 'PUT':
            case 'PATCH':
                const feedbackId = this.extractIdFromEndpoint(endpoint);
                return database.updateFeedback(feedbackId, data);
                
            default:
                throw new Error(`Méthode ${method} non supportée pour /feedbacks`);
        }
    }

    // API Humeurs
    async handleMoodsAPI(endpoint, method, data) {
        switch (method) {
            case 'GET':
                const dateRange = this.parseDateRange(endpoint);
                return database.getMoods(dateRange);
                
            case 'POST':
                const mood = database.addMood(data);
                this.notifyRealTime('mood', mood);
                return mood;
                
            default:
                throw new Error(`Méthode ${method} non supportée pour /moods`);
        }
    }

    // API Sondages
    async handleSurveysAPI(endpoint, method, data) {
        switch (method) {
            case 'GET':
                if (endpoint.includes('/responses')) {
                    // Retourner les réponses d'un sondage
                    const surveyId = this.extractIdFromEndpoint(endpoint);
                    return this.getSurveyResponses(surveyId);
                }
                return database.getSurveys();
                
            case 'POST':
                if (endpoint.includes('/responses')) {
                    // Ajouter une réponse à un sondage
                    return this.addSurveyResponse(data);
                }
                return database.addSurvey(data);
                
            default:
                throw new Error(`Méthode ${method} non supportée pour /surveys`);
        }
    }

    // API Formations
    async handleTrainingsAPI(endpoint, method, data) {
        switch (method) {
            case 'GET':
                return database.getTrainings();
                
            case 'POST':
                if (endpoint.includes('/ratings')) {
                    const trainingId = this.extractIdFromEndpoint(endpoint);
                    return database.addTrainingRating(trainingId, data);
                }
                break;
                
            default:
                throw new Error(`Méthode ${method} non supportée pour /trainings`);
        }
    }

    // Utilitaires pour parsing
    parseFilters(endpoint) {
        const filters = {};
        const url = new URL(`http://localhost${endpoint}`);
        
        if (url.searchParams.has('department')) {
            filters.department = url.searchParams.get('department');
        }
        if (url.searchParams.has('category')) {
            filters.category = url.searchParams.get('category');
        }
        if (url.searchParams.has('priority')) {
            filters.priority = url.searchParams.get('priority');
        }
        if (url.searchParams.has('status')) {
            filters.status = url.searchParams.get('status');
        }
        
        return filters;
    }

    parseDateRange(endpoint) {
        const url = new URL(`http://localhost${endpoint}`);
        const range = {};
        
        if (url.searchParams.has('start_date')) {
            range.start = new Date(url.searchParams.get('start_date'));
        }
        if (url.searchParams.has('end_date')) {
            range.end = new Date(url.searchParams.get('end_date'));
        }
        
        return range;
    }

    extractIdFromEndpoint(endpoint) {
        const matches = endpoint.match(/\/(\d+)/);
        return matches ? parseInt(matches[1]) : null;
    }

    // Gestion des réponses aux sondages
    getSurveyResponses(surveyId) {
        // Simulation de réponses aux sondages
        const responses = [];
        const responseCount = Math.floor(Math.random() * 20) + 10;
        
        for (let i = 1; i <= responseCount; i++) {
            responses.push({
                id: i,
                surveyId: surveyId,
                employeeId: Math.floor(Math.random() * 42) + 1,
                answers: this.generateRandomAnswers(),
                submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            });
        }
        
        return responses;
    }

    addSurveyResponse(responseData) {
        // Simulation d'ajout de réponse
        const response = {
            id: Date.now(),
            ...responseData,
            submittedAt: new Date()
        };
        
        // Mise à jour du compteur de réponses du sondage
        const survey = database.getSurveyById(responseData.surveyId);
        if (survey) {
            survey.responses += 1;
        }
        
        return response;
    }

    generateRandomAnswers() {
        return {
            question1: Math.floor(Math.random() * 5) + 1,
            question2: Math.floor(Math.random() * 5) + 1,
            question3: Math.floor(Math.random() * 5) + 1,
            comment: 'Commentaire généré automatiquement'
        };
    }

    // Simulation de notifications temps réel
    notifyRealTime(type, data) {
        // Simulation de WebSocket/Server-Sent Events
        setTimeout(() => {
            const event = new CustomEvent('realTimeUpdate', {
                detail: { type, data }
            });
            document.dispatchEvent(event);
        }, 100);
    }

    // Méthodes publiques pour l'application
    async getEmployees(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/employees${queryParams ? '?' + queryParams : ''}`;
        return this.request(endpoint);
    }

    async createEmployee(employeeData) {
        return this.request('/employees', {
            method: 'POST',
            data: employeeData
        });
    }

    async updateEmployee(id, updates) {
        return this.request(`/employees/${id}`, {
            method: 'PATCH',
            data: updates
        });
    }

    async getFeedbacks(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/feedbacks${queryParams ? '?' + queryParams : ''}`;
        return this.request(endpoint);
    }

    async createFeedback(feedbackData) {
        return this.request('/feedbacks', {
            method: 'POST',
            data: feedbackData
        });
    }

    async updateFeedback(id, updates) {
        return this.request(`/feedbacks/${id}`, {
            method: 'PATCH',
            data: updates
        });
    }

    async getMoods(dateRange = {}) {
        const queryParams = new URLSearchParams();
        if (dateRange.start) queryParams.set('start_date', dateRange.start.toISOString());
        if (dateRange.end) queryParams.set('end_date', dateRange.end.toISOString());
        
        const endpoint = `/moods${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return this.request(endpoint);
    }

    async createMood(moodData) {
        return this.request('/moods', {
            method: 'POST',
            data: moodData
        });
    }

    async getSurveys() {
        return this.request('/surveys');
    }

    async createSurvey(surveyData) {
        return this.request('/surveys', {
            method: 'POST',
            data: surveyData
        });
    }

    async getSurveyResponses(surveyId) {
        return this.request(`/surveys/${surveyId}/responses`);
    }

    async submitSurveyResponse(surveyId, responseData) {
        return this.request(`/surveys/${surveyId}/responses`, {
            method: 'POST',
            data: { surveyId, ...responseData }
        });
    }

    async getTrainings() {
        return this.request('/trainings');
    }

    async rateTraining(trainingId, rating, comment = '') {
        return this.request(`/trainings/${trainingId}/ratings`, {
            method: 'POST',
            data: { rating, comment, timestamp: new Date() }
        });
    }

    // Méthodes d'analytics
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

    getMoodAnalytics(period) {
        const moods = database.getMoods();
        const periodDays = parseInt(period.replace('d', ''));
        const cutoffDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
        
        const filteredMoods = moods.filter(m => new Date(m.date) >= cutoffDate);
        
        return {
            average: filteredMoods.reduce((sum, m) => sum + parseFloat(m.averageMood), 0) / filteredMoods.length,
            trend: database.calculateMoodTrend(),
            distribution: this.calculateMoodDistribution(filteredMoods),
            timeline: filteredMoods.map(m => ({
                date: m.date,
                value: parseFloat(m.averageMood),
                responses: m.responses
            }))
        };
    }

    getFeedbackAnalytics(period) {
        const feedbacks = database.getFeedbacks();
        const periodDays = parseInt(period.replace('d', ''));
        const cutoffDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
        
        const filteredFeedbacks = feedbacks.filter(f => new Date(f.timestamp) >= cutoffDate);
        
        return {
            total: filteredFeedbacks.length,
            byCategory: this.groupBy(filteredFeedbacks, 'category'),
            byPriority: this.groupBy(filteredFeedbacks, 'priority'),
            timeline: this.groupFeedbacksByDate(filteredFeedbacks)
        };
    }

    getSurveyAnalytics(period) {
        const surveys = database.getSurveys();
        
        return {
            total: surveys.length,
            active: surveys.filter(s => s.status === 'active').length,
            averageResponseRate: surveys.reduce((sum, s) => 
                sum + (s.responses / s.totalEmployees), 0) / surveys.length * 100,
            byStatus: this.groupBy(surveys, 'status')
        };
    }

    // Utilitaires
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    groupFeedbacksByDate(feedbacks) {
        const grouped = {};
        feedbacks.forEach(feedback => {
            const date = new Date(feedback.timestamp).toDateString();
            grouped[date] = (grouped[date] || 0) + 1;
        });
        return grouped;
    }

    calculateMoodDistribution(moods) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        moods.forEach(mood => {
            if (mood.details) {
                distribution[1] += mood.details.mood1 || 0;
                distribution[2] += mood.details.mood2 || 0;
                distribution[3] += mood.details.mood3 || 0;
                distribution[4] += mood.details.mood4 || 0;
                distribution[5] += mood.details.mood5 || 0;
            }
        });
        
        return distribution;
    }

    // Gestion des erreurs et monitoring
    async healthCheck() {
        try {
            await this.simulateNetworkDelay(50, 200);
            return {
                status: 'healthy',
                database: 'connected',
                lastCheck: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'error',
                database: 'disconnected',
                error: error.message,
                lastCheck: new Date().toISOString()
            };
        }
    }

    // Méthodes de synchronisation
    async syncData() {
        console.log('🔄 Synchronisation des données...');
        
        try {
            // Simulation de synchronisation avec Supabase
            await this.simulateNetworkDelay(1000, 2000);
            
            const stats = database.getStats();
            console.log('📊 Données synchronisées:', stats);
            
            return {
                success: true,
                timestamp: new Date().toISOString(),
                stats
            };
        } catch (error) {
            console.error('❌ Erreur de synchronisation:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Instance globale de l'API
const api = new APIManager();