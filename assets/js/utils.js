// Utilitaires pour l'application HR Dashboard
const Utils = {
    
    // Formatage des dates
    formatDate(date, options = {}) {
        const defaultOptions = {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        };
        
        return new Intl.DateTimeFormat('fr-FR', { ...defaultOptions, ...options })
            .format(new Date(date));
    },

    formatDateTime(date, options = {}) {
        const defaultOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Intl.DateTimeFormat('fr-FR', { ...defaultOptions, ...options })
            .format(new Date(date));
    },

    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            return 'À l\'instant';
        }
    },

    // Validation des données
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validateRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    validateLength(value, min, max) {
        const length = value ? value.toString().length : 0;
        return length >= min && length <= max;
    },

    validateFeedback(feedback) {
        const errors = {};

        if (!this.validateRequired(feedback.category)) {
            errors.category = 'La catégorie est obligatoire';
        }

        if (!this.validateRequired(feedback.message)) {
            errors.message = 'Le message est obligatoire';
        } else if (!this.validateLength(feedback.message, 10, 500)) {
            errors.message = 'Le message doit contenir entre 10 et 500 caractères';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Gestion des erreurs
    handleError(error, context = '') {
        console.error(`Erreur ${context}:`, error);
        
        const errorMessages = {
            'Network Error': 'Erreur de connexion réseau',
            'Timeout': 'Délai d\'attente dépassé',
            'Unauthorized': 'Accès non autorisé',
            'Forbidden': 'Action interdite',
            'Not Found': 'Ressource non trouvée',
            'Server Error': 'Erreur serveur interne'
        };

        return errorMessages[error.message] || error.message || 'Une erreur inattendue s\'est produite';
    },

    // Debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttling
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Stockage local sécurisé (simulation)
    storage: {
        set(key, value, ttl = null) {
            const data = {
                value,
                timestamp: Date.now(),
                ttl
            };
            // Simulation - en réalité on utiliserait localStorage
            this._cache = this._cache || {};
            this._cache[key] = data;
        },

        get(key) {
            // Simulation - en réalité on utiliserait localStorage
            if (!this._cache || !this._cache[key]) return null;
            
            const data = this._cache[key];
            
            // Vérification TTL
            if (data.ttl && (Date.now() - data.timestamp) > data.ttl) {
                delete this._cache[key];
                return null;
            }
            
            return data.value;
        },

        remove(key) {
            if (this._cache && this._cache[key]) {
                delete this._cache[key];
            }
        },

        clear() {
            this._cache = {};
        }
    },

    // Génération d'identifiants uniques
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Manipulation des couleurs
    getColorForMood(mood) {
        const colors = {
            1: '#f56565', // Rouge
            2: '#ed8936', // Orange
            3: '#718096', // Gris
            4: '#48bb78', // Vert
            5: '#38b2ac'  // Turquoise
        };
        return colors[mood] || colors[3];
    },

    getColorForPriority(priority) {
        const colors = {
            low: '#48bb78',    // Vert
            medium: '#ed8936', // Orange
            high: '#f56565'    // Rouge
        };
        return colors[priority] || colors.medium;
    },

    // Calculs statistiques
    calculateAverage(numbers) {
        if (!numbers || numbers.length === 0) return 0;
        return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    },

    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    },

    calculateTrend(data, periods = 2) {
        if (!data || data.length < periods * 2) return 0;
        
        const recent = data.slice(0, periods);
        const older = data.slice(periods, periods * 2);
        
        const recentAvg = this.calculateAverage(recent);
        const olderAvg = this.calculateAverage(older);
        
        return recentAvg - olderAvg;
    },

    // Export de données
    exportToCSV(data, filename = 'export.csv') {
        if (!data || data.length === 0) {
            throw new Error('Aucune donnée à exporter');
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                // Échapper les virgules et guillemets
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(','))
        ].join('\n');

        this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    },

    exportToJSON(data, filename = 'export.json') {
        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
    },

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    },

    // Manipulation du DOM
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, attributes[key]);
            } else {
                element[key] = attributes[key];
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Element) {
                element.appendChild(child);
            }
        });
        
        return element;
    },

    // Animation et transitions
    animateValue(element, start, end, duration = 1000) {
        const startTimestamp = performance.now();
        const step = (timestamp) => {
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    },

    slideDown(element, duration = 300) {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        
        const height = element.scrollHeight;
        element.style.height = height + 'px';
        
        setTimeout(() => {
            element.style.height = 'auto';
            element.style.overflow = 'visible';
            element.style.transition = '';
        }, duration);
    },

    slideUp(element, duration = 300) {
        element.style.height = element.scrollHeight + 'px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.height = '0';
        });
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    },

    // Détection des capacités du navigateur
    getDeviceInfo() {
        return {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isTablet: /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768,
            isDesktop: window.innerWidth > 1024,
            supportsLocalStorage: typeof(Storage) !== "undefined",
            supportsServiceWorker: 'serviceWorker' in navigator,
            supportsNotifications: 'Notification' in window,
            language: navigator.language || 'fr-FR',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    },

    // Gestion des permissions
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            throw new Error('Ce navigateur ne supporte pas les notifications');
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission === 'denied') {
            return false;
        }
        
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    },

    showNotification(title, options = {}) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                                icon: '/assets/images/logo.png',
                                badge: '/assets/images/logo.png',
                            });
                        }
                    }
                };