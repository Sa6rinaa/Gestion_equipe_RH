// Application principale HR Dashboard
class HRDashboard {
    constructor() {
        this.currentUser = { id: 1, name: 'Manager RH', role: 'admin' };
        this.updateInterval = null;
        this.isOnline = navigator.onLine;
        this.notifications = [];
        this.selectedMood = 3;
        this.lastSync = null;
    }

    // Initialisation de l'application
    async init() {
        Logger.info('🚀 Initialisation du Dashboard RH...');
        
        try {
            // Initialiser la base de données
            database.init();
            
            // Connexion à l'API
            await api.connect();
            
            // Configurer les event listeners
            this.setupEventListeners();
            
            // Charger les données initiales
            await this.loadInitialData();
            
            // Démarrer les mises à jour temps réel
            this.startRealTimeUpdates();
            
            // Configurer la gestion hors ligne
            this.setupOfflineHandling();
            
            Logger.info('✅ Dashboard RH initialisé avec succès');
            this.showNotification('Dashboard RH prêt !', 'success');
            
        } catch (error) {
            Logger.error('❌ Erreur lors de l\'initialisation:', error);
            this.showNotification('Erreur d\'initialisation', 'error');
        }
    }

    // Configuration des event listeners
    setupEventListeners() {
        // Gestion du baromètre d'humeur
        this.setupMoodSelector();
        
        // Gestion du formulaire de feedback
        this.setupFeedbackForm();
        
        // Gestion des sondages
        this.setupSurveyInteractions();
        
        // Événements en temps réel
        document.addEventListener('realTimeUpdate', (event) => {
            this.handleRealTimeUpdate(event.detail);
        });
        
        // Gestion de la connectivité
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
        
        // Visibilité de la page
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshData();
            }
        });

        // Validation en temps réel des formulaires
        this.setupFormValidation();
    }

    // Configuration du baromètre d'humeur
    setupMoodSelector() {
        const moodOptions = document.querySelectorAll('.mood-option');
        
        moodOptions.forEach((option, index) => {
            // Événements clavier
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectMood(option);
                } else if (e.key === 'ArrowLeft' && index > 0) {
                    moodOptions[index - 1].focus();
                } else if (e.key === 'ArrowRight' && index < moodOptions.length - 1) {
                    moodOptions[index + 1].focus();
                }
            });
            
            // Événements souris
            option.addEventListener('click', () => this.selectMood(option));
            
            // Mise à jour des attributs ARIA
            option.setAttribute('tabindex', index === 2 ? '0' : '-1'); // Neutre sélectionné par défaut
        });
    }

    selectMood(option) {
        // Retirer la sélection précédente
        document.querySelectorAll('.mood-option').forEach(opt => {
            opt.classList.remove('selected');
            opt.setAttribute('aria-checked', 'false');
            opt.setAttribute('tabindex', '-1');
        });
        
        // Sélectionner la nouvelle option
        option.classList.add('selected');
        option.setAttribute('aria-checked', 'true');
        option.setAttribute('tabindex', '0');
        
        this.selectedMood = parseInt(option.dataset.mood);
        Logger.debug('Humeur sélectionnée:', this.selectedMood);
    }

    // Soumission de l'humeur
    async submitMood() {
        const button = document.querySelector('#moodBtnText');
        const originalText = button.textContent;
        
        try {
            button.innerHTML = '<div class="loading"></div>';
            
            const moodData = {
                mood: this.selectedMood,
                employeeId: this.currentUser.id,
                timestamp: new Date().toISOString()
            };
            
            const result = await api.createMood(moodData);
            Logger.info('Humeur enregistrée:', result);
            
            this.showNotification('Humeur enregistrée avec succès !', 'success');
            this.updateMoodDisplay();
            
        } catch (error) {
            Logger.error('Erreur lors de l\'enregistrement de l\'humeur:', error);
            this.showNotification(Utils.handleError(error, 'enregistrement humeur'), 'error');
        } finally {
            button.textContent = originalText;
        }
    }

    // Configuration du formulaire de feedback
    setupFeedbackForm() {
        const form = document.getElementById('feedbackForm');
        const messageField = document.getElementById('feedbackMessage');
        const charCounter = document.querySelector('.char-counter');
        
        // Compteur de caractères
        if (messageField && charCounter) {
            messageField.addEventListener('input', (e) => {
                const length = e.target.value.length;
                charCounter.textContent = `${length}/500 caractères`;
                
                if (length > 450) {
                    charCounter.style.color = 'var(--warning)';
                } else if (length > 500) {
                    charCounter.style.color = 'var(--danger)';
                } else {
                    charCounter.style.color = 'var(--gray)';
                }
            });
        }
        
        // Soumission du formulaire
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitFeedback();
            });
        }
    }

    // Validation des formulaires
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', Utils.debounce(() => this.validateField(input), 300));
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Validation selon le type de champ
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Ce champ est obligatoire';
        } else if (field.type === 'email' && value && !Utils.validateEmail(value)) {
            isValid = false;
            errorMessage = 'Format d\'email invalide';
        } else if (field.maxLength && value.length > field.maxLength) {
            isValid = false;
            errorMessage = `Maximum ${field.maxLength} caractères`;
        } else if (field.minLength && value && value.length < field.minLength) {
            isValid = false;
            errorMessage = `Minimum ${field.minLength} caractères`;
        }
        
        // Appliquer le style de validation
        field.classList.toggle('error', !isValid);
        field.classList.toggle('success', isValid && value);
        
        // Afficher/masquer le message d'erreur
        let errorElement = field.parentElement.querySelector('.error-message');
        if (!isValid && errorMessage) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                field.parentElement.appendChild(errorElement);
            }
            errorElement.textContent = errorMessage;
        } else if (errorElement) {
            errorElement.remove();
        }
        
        return isValid;
    }

    // Soumission du feedback
    async submitFeedback() {
        const form = document.getElementById('feedbackForm');
        const button = document.querySelector('#feedbackBtnText');
        const originalText = button.textContent;
        
        try {
            // Validation du formulaire
            const formData = new FormData(form);
            const feedbackData = {
                category: formData.get('feedbackCategory') || document.getElementById('feedbackCategory').value,
                message: formData.get('feedbackMessage') || document.getElementById('feedbackMessage').value,
                priority: formData.get('feedbackPriority') || document.getElementById('feedbackPriority').value,
                employeeId: this.currentUser.id
            };
            
            const validation = Utils.validateFeedback(feedbackData);
            if (!validation.isValid) {
                Object.keys(validation.errors).forEach(field => {
                    const fieldElement = document.getElementById(`feedback${field.charAt(0).toUpperCase() + field.slice(1)}`);
                    if (fieldElement) {
                        this.showFieldError(fieldElement, validation.errors[field]);
                    }
                });
                return;
            }
            
            button.innerHTML = '<div class="loading"></div>';
            
            const result = await api.createFeedback(feedbackData);
            Logger.info('Feedback envoyé:', result);
            
            form.reset();
            this.showNotification('Feedback envoyé avec succès !', 'success');
            this.updateFeedbackStats();
            
            // Reset du compteur de caractères
            const charCounter = document.querySelector('.char-counter');
            if (charCounter) charCounter.textContent = '0/500 caractères';
            
        } catch (error) {
            Logger.error('Erreur lors de l\'envoi du feedback:', error);
            this.showNotification(Utils.handleError(error, 'envoi feedback'), 'error');
        } finally {
            button.textContent = originalText;
        }
    }

    showFieldError(field, message) {
        field.classList.add('error');
        let errorElement = field.parentElement.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentElement.appendChild(errorElement);
        }
        errorElement.textContent = message;
        
        setTimeout(() => {
            field.classList.remove('error');
            if (errorElement) errorElement.remove();
        }, 5000);
    }

    // Configuration des interactions avec les sondages
    setupSurveyInteractions() {
        const surveyItems = document.querySelectorAll('.survey-item.interactive');
        
        surveyItems.forEach(item => {
            // Accessibilité clavier
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    }

    // Chargement des données initiales
    async loadInitialData() {
        Logger.info('Chargement des données initiales...');
        
        try {
            Utils.performance.start('loadInitialData');
            
            const [stats, recentFeedbacks, moodData] = await Promise.all([
                this.loadStats(),
                api.getFeedbacks({ limit: 5 }),
                api.getMoods({ limit: 30 })
            ]);
            
            this.updateDisplay(stats, recentFeedbacks, moodData);
            
            Utils.performance.end('loadInitialData');
            this.lastSync = new Date();
            
        } catch (error) {
            Logger.error('Erreur lors du chargement des données:', error);
            this.showNotification('Erreur de chargement des données', 'error');
        }
    }

    async loadStats() {
        return database.getStats();
    }

    // Mise à jour de l'affichage
    updateDisplay(stats, feedbacks, moods) {
        this.updateStats(stats);
        this.updateMoodDisplay();
        this.updateSurveyProgress();
        this.updateTrainingList();
    }

    updateStats(stats) {
        const totalEmployeesEl = document.getElementById('totalEmployees');
        const feedbackCountEl = document.getElementById('feedbackCount');
        
        if (totalEmployeesEl) {
            Utils.animateValue(totalEmployeesEl, 0, stats.totalEmployees, 1000);
        }
        
        if (feedbackCountEl) {
            Utils.animateValue(feedbackCountEl, 0, stats.totalFeedbacks, 1200);
        }
    }

    updateMoodDisplay() {
        const stats = database.getStats();
        const moodPercentage = Math.round((stats.averageMood / 5) * 100);
        
        const progressFill = document.querySelector('.progress-fill');
        const progressDescription = document.querySelector('.progress-description');
        
        if (progressFill) {
            progressFill.style.width = moodPercentage + '%';
        }
        
        if (progressDescription) {
            progressDescription.textContent = `${moodPercentage}% de satisfaction équipe`;
        }
    }

    updateFeedbackStats() {
        const stats = database.getStats();
        const feedbackCountEl = document.getElementById('feedbackCount');
        
        if (feedbackCountEl) {
            Utils.animateValue(feedbackCountEl, 
                parseInt(feedbackCountEl.textContent), 
                stats.totalFeedbacks, 500);
        }
    }

    updateSurveyProgress() {
        const surveys = database.getSurveys();
        const surveyItems = document.querySelectorAll('.survey-item');
        
        surveyItems.forEach((item, index) => {
            if (surveys[index]) {
                const survey = surveys[index];
                const progressBar = item.querySelector('.progress-fill');
                const meta = item.querySelector('.survey-meta span');
                
                if (progressBar && meta) {
                    const percentage = Math.round((survey.responses / survey.totalEmployees) * 100);
                    progressBar.style.width = percentage + '%';
                    meta.textContent = `${survey.responses}/${survey.totalEmployees} réponses (${percentage}%)`;
                }
            }
        });
    }

    updateTrainingList() {
        const trainings = database.getTrainings();
        const trainingList = document.getElementById('trainingList');
        
        if (!trainingList) return;
        
        trainingList.innerHTML = trainings.map(training => `
            <article class="training-item">
                <div class="training-info">
                    <h3>${training.title}</h3>
                    <time class="training-date" datetime="${training.endDate}">
                        ${this.getTrainingStatusText(training)}
                    </time>
                </div>
                <div class="rating-stars" aria-label="${training.rating ? training.rating + ' étoiles sur 5' : 'Non évalué'}">
                    ${this.generateStarRating(training.rating)}
                </div>
            </article>
        `).join('');
    }

    getTrainingStatusText(training) {
        switch (training.status) {
            case 'completed':
                return `Terminée le ${Utils.formatDate(training.endDate)}`;
            case 'ongoing':
                return 'En cours';
            case 'scheduled':
                return `Prévue le ${Utils.formatDate(training.startDate)}`;
            default:
                return 'Statut inconnu';
        }
    }

    generateStarRating(rating) {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        const emptyStars = 5 - fullStars;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push('<span class="star" aria-hidden="true">★</span>');
        }
        
        for (let i = 0; i < emptyStars; i++) {
            stars.push('<span class="star empty" aria-hidden="true">☆</span>');
        }
        
        return stars.join('');
    }

    // Mises à jour temps réel
    startRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            if (this.isOnline && !document.hidden) {
                this.performRealTimeUpdate();
            }
        }, 30000); // 30 secondes
        
        Logger.info('🔄 Mises à jour temps réel démarrées');
    }

    async performRealTimeUpdate() {
        try {
            const shouldUpdate = Math.random() > 0.7; // 30% de chance
            
            if (shouldUpdate) {
                await this.refreshData();
                
                // Simulation de nouvelles données
                if (Math.random() > 0.8) {
                    this.simulateNewFeedback();
                }
                
                if (Math.random() > 0.9) {
                    this.simulateSurveyUpdate();
                }
            }
            
        } catch (error) {
            Logger.warn('Erreur lors de la mise à jour temps réel:', error);
        }
    }

    simulateNewFeedback() {
        const categories = ['management', 'workload', 'environment', 'communication', 'tools'];
        const messages = [
            'Nouvelle suggestion d\'amélioration',
            'Retour positif sur l\'équipe',
            'Point d\'attention sur les outils',
            'Félicitations pour le projet'
        ];
        
        const newFeedback = {
            category: categories[Math.floor(Math.random() * categories.length)],
            message: messages[Math.floor(Math.random() * messages.length)],
            priority: 'medium',
            employeeId: Math.floor(Math.random() * 42) + 1
        };
        
        database.addFeedback(newFeedback);
        this.showNotification('📝 Nouveau feedback reçu !', 'info');
        this.updateFeedbackStats();
    }

    simulateSurveyUpdate() {
        const surveys = database.getSurveys();
        const randomSurvey = surveys[Math.floor(Math.random() * surveys.length)];
        
        if (randomSurvey && randomSurvey.responses < randomSurvey.totalEmployees) {
            randomSurvey.responses += 1;
            this.showNotification(`📊 Nouvelle réponse au sondage: ${randomSurvey.title}`, 'info');
            this.updateSurveyProgress();
        }
    }

    handleRealTimeUpdate(data) {
        Logger.debug('Mise à jour temps réel reçue:', data);
        
        switch (data.type) {
            case 'feedback':
                this.updateFeedbackStats();
                break;
            case 'mood':
                this.updateMoodDisplay();
                break;
            case 'survey':
                this.updateSurveyProgress();
                break;
        }
    }

    async refreshData() {
        try {
            const stats = await this.loadStats();
            this.updateStats(stats);
            this.lastSync = new Date();
        } catch (error) {
            Logger.warn('Erreur lors du rafraîchissement:', error);
        }
    }

    // Gestion hors ligne
    setupOfflineHandling() {
        // Détection initiale
        this.handleOnlineStatus(navigator.onLine);
        
        // Cache des actions hors ligne
        this.offlineQueue = [];
    }

    handleOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        
        if (isOnline) {
            this.showNotification('Connexion rétablie', 'success');
            this.processOfflineQueue();
            this.startRealTimeUpdates();
        } else {
            this.showNotification('Mode hors ligne', 'warning');
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
        }
        
        // Mise à jour de l'UI
        document.body.classList.toggle('offline', !isOnline);
    }

    async processOfflineQueue() {
        if (this.offlineQueue.length === 0) return;
        
        Logger.info(`📤 Traitement de ${this.offlineQueue.length} actions hors ligne`);
        
        for (const action of this.offlineQueue) {
            try {
                await this.executeOfflineAction(action);
                Logger.debug('Action hors ligne exécutée:', action);
            } catch (error) {
                Logger.error('Erreur lors de l\'exécution d\'une action hors ligne:', error);
            }
        }
        
        this.offlineQueue = [];
        this.showNotification('Synchronisation terminée', 'success');
    }

    async executeOfflineAction(action) {
        switch (action.type) {
            case 'feedback':
                return api.createFeedback(action.data);
            case 'mood':
                return api.createMood(action.data);
            case 'survey_response':
                return api.submitSurveyResponse(action.surveyId, action.data);
            default:
                Logger.warn('Type d\'action hors ligne inconnue:', action.type);
        }
    }

    // Interactions avec les sondages
    async openSurvey(surveyType) {
        const surveyTitles = {
            'teleworking': 'Satisfaction Télétravail',
            'cafeteria': 'Qualité Cafétéria', 
            'benefits': 'Avantages Sociaux'
        };
        
        const title = surveyTitles[surveyType];
        Logger.info(`Ouverture du sondage: ${title}`);
        
        this.showNotification(`Ouverture du sondage: ${title}`, 'info');
        
        // Simulation d'ouverture de modal
        await this.showSurveyModal(surveyType, title);
    }

    async showSurveyModal(surveyType, title) {
        // Création dynamique d'une modal simple
        const modal = Utils.createElement('div', {
            className: 'modal-overlay',
            innerHTML: `
                <div class="modal-content">
                    <header class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" aria-label="Fermer">×</button>
                    </header>
                    <main class="modal-body">
                        <p>Cette fonctionnalité sera disponible prochainement.</p>
                        <p>Vous pourrez répondre directement aux questions du sondage.</p>
                    </main>
                    <footer class="modal-footer">
                        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
                            Compris
                        </button>
                    </footer>
                </div>
            `
        });
        
        // Styles de la modal
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;
        
        // Événements
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.body.appendChild(modal);
        
        // Animation d'entrée
        modalContent.style.transform = 'scale(0.8)';
        modalContent.style.opacity = '0';
        
        requestAnimationFrame(() => {
            modalContent.style.transition = 'all 0.3s ease';
            modalContent.style.transform = 'scale(1)';
            modalContent.style.opacity = '1';
        });
    }

    async createSurvey() {
        Logger.info('Création d\'un nouveau sondage');
        
        // Simulation de création
        const newSurvey = {
            title: `Nouveau Sondage ${Date.now()}`,
            description: 'Sondage créé automatiquement',
            questions: ['Question 1', 'Question 2', 'Question 3'],
            totalEmployees: 42
        };
        
        try {
            const result = await api.createSurvey(newSurvey);
            this.showNotification('Sondage créé avec succès !', 'success');
            this.updateSurveyProgress();
        } catch (error) {
            this.showNotification('Erreur lors de la création du sondage', 'error');
        }
    }

    // Gestion des notifications
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        if (!notification || !notificationText) return;
        
        // Configuration de la couleur selon le type
        const colors = {
            success: 'var(--success)',
            error: 'var(--danger)',
            warning: 'var(--warning)', 
            info: 'var(--primary)'
        };
        
        notification.style.background = colors[type] || colors.success;
        notificationText.textContent = message;
        
        // Affichage
        notification.classList.add('show');
        
        // Masquage automatique
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
        
        // Enregistrement pour l'historique
        this.notifications.unshift({
            message,
            type,
            timestamp: new Date()
        });
        
        // Limitation de l'historique
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        
        Logger.info(`Notification [${type}]:`, message);
    }

    // Export des données
    async exportData(format = 'json') {
        Logger.info(`Export des données en format ${format}`);
        
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                user: this.currentUser.name,
                stats: database.getStats(),
                employees: database.getEmployees().length,
                feedbacks: database.getFeedbacks(),
                moods: database.getMoods().slice(0, 30),
                surveys: database.getSurveys(),
                trainings: database.getTrainings(),
                notifications: this.notifications.slice(0, 10)
            };
            
            if (format === 'json') {
                Utils.exportToJSON(exportData, `hr-dashboard-${Utils.formatDate(new Date())}.json`);
            } else if (format === 'csv') {
                // Export CSV des feedbacks uniquement pour l'exemple
                Utils.exportToCSV(exportData.feedbacks, `hr-feedbacks-${Utils.formatDate(new Date())}.csv`);
            }
            
            this.showNotification('Données exportées avec succès !', 'success');
            
        } catch (error) {
            Logger.error('Erreur lors de l\'export:', error);
            this.showNotification('Erreur lors de l\'export', 'error');
        }
    }

    // Méthodes d'analytics
    async generateReport(type, period = '30d') {
        Logger.info(`Génération de rapport: ${type} (${period})`);
        
        try {
            const analytics = await api.getAnalytics(type, period);
            const report = Utils.analytics.generateReport(type, analytics);
            
            this.showReportModal(report);
            
        } catch (error) {
            Logger.error('Erreur lors de la génération du rapport:', error);
            this.showNotification('Erreur lors de la génération du rapport', 'error');
        }
    }

    showReportModal(report) {
        // Création d'une modal pour afficher le rapport
        const modal = Utils.createElement('div', {
            className: 'modal-overlay report-modal',
            innerHTML: `
                <div class="modal-content">
                    <header class="modal-header">
                        <h3>📊 ${report.title}</h3>
                        <button class="modal-close">×</button>
                    </header>
                    <main class="modal-body">
                        <div class="report-content">
                            ${this.formatReportContent(report)}
                        </div>
                    </main>
                    <footer class="modal-footer">
                        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
                            Fermer
                        </button>
                    </footer>
                </div>
            `
        });
        
        // Styles et événements similaires à showSurveyModal
        this.setupModal(modal);
        document.body.appendChild(modal);
    }

    formatReportContent(report) {
        // Format simple du rapport
        return `
            <div class="report-summary">
                <h4>Résumé</h4>
                <p>${report.summary}</p>
            </div>
            ${report.trend ? `
                <div class="report-trend">
                    <h4>Tendance</h4>
                    <p>${report.trend}</p>
                </div>
            ` : ''}
            ${report.recommendations ? `
                <div class="report-recommendations">
                    <h4>Recommandations</h4>
                    <ul>
                        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
    }

    setupModal(modal) {
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); display: flex;
            align-items: center; justify-content: center; z-index: 1000;
        `;
        
        const content = modal.querySelector('.modal-content');
        content.style.cssText = `
            background: white; padding: 30px; border-radius: 15px;
            max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;
        
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Animation
        content.style.transform = 'scale(0.8)';
        content.style.opacity = '0';
        requestAnimationFrame(() => {
            content.style.transition = 'all 0.3s ease';
            content.style.transform = 'scale(1)';
            content.style.opacity = '1';
        });
    }

    // Nettoyage et destruction
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Suppression des event listeners
        document.removeEventListener('realTimeUpdate', this.handleRealTimeUpdate);
        window.removeEventListener('online', this.handleOnlineStatus);
        window.removeEventListener('offline', this.handleOnlineStatus);
        
        Logger.info('🧹 Dashboard RH nettoyé');
    }

    // Méthodes de debug (accessibles via console)
    getDebugInfo() {
        return {
            currentUser: this.currentUser,
            isOnline: this.isOnline,
            lastSync: this.lastSync,
            notificationsCount: this.notifications.length,
            offlineQueueSize: this.offlineQueue.length,
            stats: database.getStats()
        };
    }

    // Test de connectivité
    async testConnection() {
        try {
            const health = await api.healthCheck();
            Logger.info('Test de connectivité:', health);
            this.showNotification(`Statut: ${health.status}`, health.status === 'healthy' ? 'success' : 'error');
            return health;
        } catch (error) {
            Logger.error('Test de connectivité échoué:', error);
            this.showNotification('Connexion indisponible', 'error');
            return { status: 'error', error: error.message };
        }
    }
}

// Fonctions globales pour compatibilité avec l'HTML
let dashboardInstance = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    dashboardInstance = new HRDashboard();
    await dashboardInstance.init();
});

// Fonctions appelées depuis l'HTML
async function submitMood() {
    if (dashboardInstance) {
        await dashboardInstance.submitMood();
    }
}

async function submitFeedback() {
    if (dashboardInstance) {
        await dashboardInstance.submitFeedback();
    }
}

async function openSurvey(surveyType) {
    if (dashboardInstance) {
        await dashboardInstance.openSurvey(surveyType);
    }
}

async function createSurvey() {
    if (dashboardInstance) {
        await dashboardInstance.createSurvey();
    }
}

function exportData(format = 'json') {
    if (dashboardInstance) {
        dashboardInstance.exportData(format);
    }
}

// Gestion des raccourcis clavier globaux
function handleKeyPress(event, functionName, ...args) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window[functionName](...args);
    }
}

// Export pour accès global et debug
window.HRDashboard = {
    instance: () => dashboardInstance,
    database,
    api,
    Utils,
    Logger,
    exportData,
    submitMood,
    submitFeedback,
    openSurvey,
    createSurvey
};

// Message de démarrage
console.log(`
🎯 HR Dashboard v1.0 - Prêt !
📊 Tapez HRDashboard dans la console pour accéder aux outils de debug
⌨️  Raccourcis disponibles: Ctrl+N (nouveau sondage), Ctrl+E (export), Ctrl+R (actualiser)
`);

// Service Worker pour le mode hors ligne (simulation)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js')
        .then(() => Logger.info('Service Worker enregistré'))
        .catch(err => Logger.warn('Service Worker non disponible:', err));
}