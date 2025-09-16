// Base de données simulée en mémoire
class Database {
    constructor() {
        this.data = {
            employees: [],
            feedbacks: [],
            moods: [],
            surveys: [],
            trainings: []
        };
        this.initialized = false;
    }

    // Initialisation de la base de données avec des données de test
    init() {
        if (this.initialized) return;
        
        this.data.employees = this.generateMockEmployees(42);
        this.data.feedbacks = this.generateMockFeedbacks(18);
        this.data.moods = this.generateMockMoods();
        this.data.surveys = this.generateMockSurveys();
        this.data.trainings = this.generateMockTrainings();
        
        this.initialized = true;
        console.log('📊 Base de données initialisée avec succès');
    }

    // Génération des employés fictifs
    generateMockEmployees(count) {
        const departments = ['IT', 'RH', 'Marketing', 'Ventes', 'Finance', 'Support'];
        const names = [
            'Alice Martin', 'Bob Durand', 'Claire Petit', 'David Moreau', 'Emma Bernard',
            'François Rousseau', 'Gabrielle Simon', 'Henri Michel', 'Isabelle Leroy',
            'Julien Garcia', 'Karine Roux', 'Laurent Fournier', 'Marie Girard',
            'Nicolas Bonnet', 'Olivia Dupont', 'Pierre Lambert', 'Quentin Faure',
            'Rachel Mercier', 'Sylvain Blanc', 'Thierry Guerin'
        ];

        const employees = [];
        for (let i = 1; i <= count; i++) {
            employees.push({
                id: i,
                name: names[(i - 1) % names.length] || `Employé ${i}`,
                email: `employee${i}@company.com`,
                department: departments[Math.floor(Math.random() * departments.length)],
                position: this.getRandomPosition(),
                mood: Math.floor(Math.random() * 5) + 1,
                lastFeedback: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                active: Math.random() > 0.1 // 90% actifs
            });
        }
        return employees;
    }

    // Positions aléatoires
    getRandomPosition() {
        const positions = [
            'Développeur', 'Designer', 'Chef de projet', 'Analyste', 'Consultant',
            'Manager', 'Directeur', 'Assistant', 'Spécialiste', 'Coordinateur'
        ];
        return positions[Math.floor(Math.random() * positions.length)];
    }

    // Génération des feedbacks fictifs
    generateMockFeedbacks(count) {
        const categories = ['management', 'workload', 'environment', 'communication', 'tools'];
        const priorities = ['low', 'medium', 'high'];
        const messages = [
            'Excellente communication de l\'équipe cette semaine.',
            'Les outils de travail pourraient être améliorés.',
            'Ambiance de travail très positive.',
            'Charge de travail un peu élevée en ce moment.',
            'Management très à l\'écoute des équipes.',
            'Besoin de plus de formation sur les nouveaux outils.',
            'Espaces de travail bien aménagés.',
            'Communication interne à améliorer.',
            'Très satisfait de l\'équipe projet.',
            'Délais parfois serrés mais gérable.'
        ];

        const feedbacks = [];
        for (let i = 1; i <= count; i++) {
            feedbacks.push({
                id: i,
                employeeId: Math.floor(Math.random() * 42) + 1,
                category: categories[Math.floor(Math.random() * categories.length)],
                message: messages[Math.floor(Math.random() * messages.length)],
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                status: 'unread',
                anonymous: Math.random() > 0.7
            });
        }
        return feedbacks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Génération des humeurs fictives
    generateMockMoods() {
        const moods = [];
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today - i * 24 * 60 * 60 * 1000);
            const baseScore = 3.2 + Math.sin(i * 0.1) * 0.8; // Variation sinusoïdale
            
            moods.push({
                id: i + 1,
                date: date,
                averageMood: Math.max(1, Math.min(5, baseScore + (Math.random() - 0.5) * 0.8)).toFixed(1),
                responses: Math.floor(Math.random() * 15) + 25, // 25-40 réponses
                details: {
                    mood1: Math.floor(Math.random() * 5),
                    mood2: Math.floor(Math.random() * 8),
                    mood3: Math.floor(Math.random() * 12),
                    mood4: Math.floor(Math.random() * 15),
                    mood5: Math.floor(Math.random() * 10)
                }
            });
        }
        return moods;
    }

    // Génération des sondages fictifs
    generateMockSurveys() {
        return [
            {
                id: 1,
                title: 'Satisfaction Télétravail',
                description: 'Évaluation de la satisfaction concernant les conditions de télétravail',
                questions: [
                    'Êtes-vous satisfait de vos conditions de télétravail ?',
                    'Avez-vous les outils nécessaires pour bien travailler à distance ?',
                    'La communication avec votre équipe est-elle efficace ?'
                ],
                status: 'active',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                responses: 28,
                totalEmployees: 42
            },
            {
                id: 2,
                title: 'Qualité Cafétéria',
                description: 'Évaluation de la qualité des services de restauration',
                questions: [
                    'Êtes-vous satisfait de la qualité des repas ?',
                    'Les horaires d\'ouverture vous conviennent-ils ?',
                    'Que pensez-vous de la variété des plats proposés ?'
                ],
                status: 'active',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                responses: 35,
                totalEmployees: 42
            },
            {
                id: 3,
                title: 'Avantages Sociaux',
                description: 'Évaluation de la satisfaction concernant les avantages sociaux',
                questions: [
                    'Êtes-vous satisfait des avantages sociaux proposés ?',
                    'Quels avantages aimeriez-vous voir ajoutés ?',
                    'Les informations sur vos droits sont-elles claires ?'
                ],
                status: 'active',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                responses: 12,
                totalEmployees: 42
            }
        ];
    }

    // Génération des formations fictives
    generateMockTrainings() {
        return [
            {
                id: 1,
                title: 'Formation Leadership',
                description: 'Développement des compétences managériales',
                instructor: 'Marie Dubois',
                startDate: new Date('2025-09-01'),
                endDate: new Date('2025-09-12'),
                status: 'completed',
                participants: 15,
                rating: 4.2,
                ratings: [
                    { employeeId: 1, rating: 4, comment: 'Très instructif' },
                    { employeeId: 5, rating: 5, comment: 'Excellent formateur' },
                    { employeeId: 12, rating: 4, comment: 'Contenu pertinent' }
                ]
            },
            {
                id: 2,
                title: 'Gestion du Temps',
                description: 'Optimisation de la productivité personnelle',
                instructor: 'Jean Moreau',
                startDate: new Date('2025-09-10'),
                endDate: new Date('2025-09-20'),
                status: 'ongoing',
                participants: 20,
                rating: 4.8,
                ratings: [
                    { employeeId: 3, rating: 5, comment: 'Techniques très utiles' },
                    { employeeId: 8, rating: 5, comment: 'Formation pratique' }
                ]
            },
            {
                id: 3,
                title: 'Communication Interne',
                description: 'Amélioration des relations interprofessionnelles',
                instructor: 'Sophie Bernard',
                startDate: new Date('2025-09-20'),
                endDate: new Date('2025-09-25'),
                status: 'scheduled',
                participants: 25,
                rating: null,
                ratings: []
            }
        ];
    }

    // Méthodes CRUD pour employés
    getEmployees(filters = {}) {
        let employees = [...this.data.employees];
        
        if (filters.department) {
            employees = employees.filter(emp => emp.department === filters.department);
        }
        
        if (filters.active !== undefined) {
            employees = employees.filter(emp => emp.active === filters.active);
        }
        
        return employees;
    }

    getEmployeeById(id) {
        return this.data.employees.find(emp => emp.id === id);
    }

    addEmployee(employee) {
        const newEmployee = {
            id: this.data.employees.length + 1,
            ...employee,
            joinDate: new Date(),
            mood: 3,
            active: true
        };
        this.data.employees.push(newEmployee);
        return newEmployee;
    }

    updateEmployee(id, updates) {
        const index = this.data.employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            this.data.employees[index] = { ...this.data.employees[index], ...updates };
            return this.data.employees[index];
        }
        return null;
    }

    // Méthodes CRUD pour feedbacks
    getFeedbacks(filters = {}) {
        let feedbacks = [...this.data.feedbacks];
        
        if (filters.category) {
            feedbacks = feedbacks.filter(f => f.category === filters.category);
        }
        
        if (filters.priority) {
            feedbacks = feedbacks.filter(f => f.priority === filters.priority);
        }
        
        if (filters.status) {
            feedbacks = feedbacks.filter(f => f.status === filters.status);
        }
        
        return feedbacks;
    }

    addFeedback(feedback) {
        const newFeedback = {
            id: this.data.feedbacks.length + 1,
            ...feedback,
            timestamp: new Date(),
            status: 'unread'
        };
        this.data.feedbacks.unshift(newFeedback);
        return newFeedback;
    }

    updateFeedback(id, updates) {
        const index = this.data.feedbacks.findIndex(f => f.id === id);
        if (index !== -1) {
            this.data.feedbacks[index] = { ...this.data.feedbacks[index], ...updates };
            return this.data.feedbacks[index];
        }
        return null;
    }

    // Méthodes CRUD pour humeurs
    getMoods(dateRange = {}) {
        let moods = [...this.data.moods];
        
        if (dateRange.start && dateRange.end) {
            moods = moods.filter(m => 
                new Date(m.date) >= dateRange.start && 
                new Date(m.date) <= dateRange.end
            );
        }
        
        return moods.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    addMood(mood) {
        const today = new Date().toDateString();
        const existingMoodIndex = this.data.moods.findIndex(m => 
            new Date(m.date).toDateString() === today
        );

        if (existingMoodIndex !== -1) {
            // Mise à jour de l'humeur du jour
            const existingMood = this.data.moods[existingMoodIndex];
            existingMood.responses += 1;
            // Recalcul de la moyenne (simplifié)
            const totalScore = parseFloat(existingMood.averageMood) * (existingMood.responses - 1) + mood.mood;
            existingMood.averageMood = (totalScore / existingMood.responses).toFixed(1);
            return existingMood;
        } else {
            // Nouvelle entrée pour aujourd'hui
            const newMood = {
                id: this.data.moods.length + 1,
                date: new Date(),
                averageMood: mood.mood.toFixed(1),
                responses: 1,
                details: {
                    mood1: mood.mood === 1 ? 1 : 0,
                    mood2: mood.mood === 2 ? 1 : 0,
                    mood3: mood.mood === 3 ? 1 : 0,
                    mood4: mood.mood === 4 ? 1 : 0,
                    mood5: mood.mood === 5 ? 1 : 0
                }
            };
            this.data.moods.unshift(newMood);
            return newMood;
        }
    }

    // Méthodes pour sondages
    getSurveys() {
        return [...this.data.surveys];
    }

    getSurveyById(id) {
        return this.data.surveys.find(s => s.id === id);
    }

    addSurvey(survey) {
        const newSurvey = {
            id: this.data.surveys.length + 1,
            ...survey,
            createdAt: new Date(),
            responses: 0,
            status: 'active'
        };
        this.data.surveys.push(newSurvey);
        return newSurvey;
    }

    // Méthodes pour formations
    getTrainings() {
        return [...this.data.trainings];
    }

    getTrainingById(id) {
        return this.data.trainings.find(t => t.id === id);
    }

    addTrainingRating(trainingId, rating) {
        const training = this.getTrainingById(trainingId);
        if (training) {
            training.ratings.push(rating);
            // Recalcul de la note moyenne
            const totalRating = training.ratings.reduce((sum, r) => sum + r.rating, 0);
            training.rating = (totalRating / training.ratings.length).toFixed(1);
            return training;
        }
        return null;
    }

    // Méthodes utilitaires
    getStats() {
        const totalEmployees = this.data.employees.filter(emp => emp.active).length;
        const totalFeedbacks = this.data.feedbacks.length;
        const unreadFeedbacks = this.data.feedbacks.filter(f => f.status === 'unread').length;
        const activeSurveys = this.data.surveys.filter(s => s.status === 'active').length;
        
        const recentMood = this.data.moods[0];
        const moodTrend = this.calculateMoodTrend();

        return {
            totalEmployees,
            totalFeedbacks,
            unreadFeedbacks,
            activeSurveys,
            averageMood: recentMood ? parseFloat(recentMood.averageMood) : 3,
            moodTrend
        };
    }

    calculateMoodTrend() {
        if (this.data.moods.length < 7) return 0;
        
        const recent = this.data.moods.slice(0, 3);
        const older = this.data.moods.slice(3, 6);
        
        const recentAvg = recent.reduce((sum, m) => sum + parseFloat(m.averageMood), 0) / recent.length;
        const olderAvg = older.reduce((sum, m) => sum + parseFloat(m.averageMood), 0) / older.length;
        
        return recentAvg - olderAvg;
    }

    // Export/Import des données
    exportData() {
        return {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: this.data
        };
    }

    importData(exportedData) {
        if (exportedData.data && exportedData.version) {
            this.data = exportedData.data;
            this.initialized = true;
            return true;
        }
        return false;
    }

    // Nettoyage des données anciennes
    cleanup(daysToKeep = 90) {
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
        
        this.data.moods = this.data.moods.filter(m => new Date(m.date) > cutoffDate);
        this.data.feedbacks = this.data.feedbacks.filter(f => new Date(f.timestamp) > cutoffDate);
        
        console.log(`🧹 Nettoyage effectué : données antérieures à ${daysToKeep} jours supprimées`);
    }
}

// Instance globale de la base de données
const database = new Database();