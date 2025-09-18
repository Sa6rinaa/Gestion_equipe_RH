Gestion_equipe_RH
# 🎯 HR Dashboard - Gestion d'Équipe & RH

Un tableau de bord moderne et interactif pour la gestion des ressources humaines, développé avec les dernières technologies web.

## ✨ Fonctionnalités

### 📊 **Baromètre d'Humeur**
- Interface interactive avec 5 niveaux d'émotion
- Suivi en temps réel de la satisfaction équipe
- Historique et tendances des humeurs
- Analytics avancées avec graphiques

### 💬 **Feedback Quotidien**
- Formulaire de feedback catégorisé
- Système de priorités (Faible, Moyenne, Haute)
- Validation en temps réel
- Suivi des feedback non lus

### 📋 **Sondages Internes**
- Création et gestion de sondages personnalisés
- Suivi des taux de participation en temps réel
- Barres de progression dynamiques
- Export des résultats

### 🎓 **Évaluation de Formations**
- Catalogue des formations (terminées, en cours, prévues)
- Système d'évaluation par étoiles
- Commentaires et retours détaillés
- Statistiques de participation

### 📈 **Analytics & Reporting**
- Tableaux de bord interactifs
- Rapports automatisés
- Tendances et prévisions
- Export de données (JSON, CSV)

## 🛠️ Technologies

### Frontend
- **HTML5** sémantique avec accessibilité WCAG
- **CSS3** moderne (Grid, Flexbox, animations CSS)
- **JavaScript ES6+** (modules, async/await, destructuring)
- **Design responsive** pour tous les appareils
- **PWA ready** avec Service Worker

### Backend & Données
- **API REST** complète avec gestion d'erreurs
- **Supabase** pour la base de données PostgreSQL
- **Temps réel** avec WebSocket/Server-Sent Events
- **Authentification** et sécurité RLS
- **Cache** intelligent et mode hors ligne

## 🚀 Installation Rapide

1. **Clonez** ou téléchargez le projet
2. **Ouvrez** `index.html` dans un navigateur moderne
3. **Explorez** les fonctionnalités en mode démo

```bash
# Option serveur local (recommandé pour le développement)
python -m http.server 8000
# ou
npx serve .
```

## ⚙️ Configuration Supabase

### 1. Créer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL du projet et la clé API publique

### 2. Configuration de base

Modifiez `config/supabase.js` :

```javascript
const supabaseConfig = {
    url: 'https://votre-projet.supabase.co',
    anonKey: 'votre-cle-api-publique'
};
```

### 3. Structure de la base de données

Exécutez ce SQL dans l'éditeur Supabase :

```sql
-- Créer la table des employés
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    position TEXT,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des feedbacks
CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'unread',
    anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des humeurs
CREATE TABLE moods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
    date DATE NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
```

### 4. Politiques de sécurité

```sql
-- Employés peuvent voir leur propre profil
CREATE POLICY "Employees can view own profile" ON employees 
FOR SELECT USING (auth.uid() = id);

-- RH peut tout voir
CREATE POLICY "HR can view all employees" ON employees 
FOR SELECT USING (auth.jwt() ->> 'role' = 'hr_admin');

-- Employés peuvent créer des feedbacks
CREATE POLICY "Employees can insert own feedback" ON feedbacks 
FOR INSERT WITH CHECK (auth.uid() = employee_id);
```

## 🎨 Personnalisation

### Couleurs et thème

Modifiez les variables CSS dans `assets/css/styles.css` :

```css
:root {
    --primary: #667eea;      /* Couleur principale */
    --secondary: #764ba2;     /* Couleur secondaire */
    --accent: #f093fb;        /* Couleur d'accent */
    --success: #48bb78;       /* Vert de succès */
    --warning: #ed8936;       /* Orange d'avertissement */
    --danger: #f56565;        /* Rouge de danger */
}
```

### Logo et branding

1. Remplacez `assets/images/logo.png`
2. Modifiez le titre dans `index.html`
3. Personnalisez les textes et libellés

## 📱 Fonctionnalités Avancées

### Mode hors ligne
- Cache automatique des données
- Queue des actions hors ligne
- Synchronisation à la reconnexion

### Raccourcis clavier
- `Ctrl + N` : Créer un nouveau sondage
- `Ctrl + E` : Exporter les données
- `Ctrl + R` : Actualiser la page

### Accessibilité
- Navigation au clavier complète
- Screen reader friendly
- Contrastes respectant WCAG 2.1
- Labels ARIA appropriés

### Performance
- Lazy loading des données
- Debounce des actions utilisateur
- Optimisation des requêtes
- Cache intelligent

## 🔧 API Reference

### Endpoints principaux

```javascript
// Employés
GET    /api/employees          // Liste des employés
POST   /api/employees          // Créer un employé
PUT    /api/employees/:id      // Modifier un employé

// Feedbacks
GET    /api/feedbacks          // Liste des feedbacks
POST   /api/feedbacks          // Créer un feedback
PUT    /api/feedbacks/:id      // Modifier un feedback

// Humeurs
GET    /api/moods              // Historique des humeurs
POST   /api/moods              // Enregistrer une humeur

// Sondages
GET    /api/surveys            // Liste des sondages
POST   /api/surveys            // Créer un sondage
GET    /api/surveys/:id/responses  // Réponses d'un sondage
```

### Filtres disponibles

```javascript
// Filtrer les feedbacks
GET /api/feedbacks?category=management&priority=high

// Filtrer les humeurs par période
GET /api/moods?start_date=2025-09-01&end_date=2025-09-30

// Filtrer les employés par département
GET /api/employees?department=IT&active=true
```

## 🧪 Tests et Debug

### Console de développement

Utilisez `HRDashboard` dans la console pour accéder aux outils :

```javascript
// Informations de debug
HRDashboard.instance().getDebugInfo()

// Tester la connexion
HRDashboard.instance().testConnection()

// Exporter les données
HRDashboard.exportData('json')

// Voir les statistiques
HRDashboard.database.getStats()
```

### Tests automatiques

```javascript
// Test de validation
Utils.test.assert(
    Utils.validateEmail('test@example.com'),
    'Validation email fonctionne'
);

// Benchmark de performance
Utils.test.benchmark('Database query', () => {
    database.getFeedbacks();
}, 1000);
```

## 📊 Analytics & Reporting

### Métriques suivies
- Satisfaction moyenne des employés
- Nombre de feedbacks par catégorie
- Taux de participation aux sondages
- Évolution des humeurs dans le temps
- Performance des formations

### Rapports disponibles
- Rapport hebdomadaire des humeurs
- Analyse des feedbacks par département
- Suivi des sondages actifs
- Évaluation de l'efficacité des formations

## 🔐 Sécurité

### Mesures implémentées
- Row Level Security (RLS) avec Supabase
- Validation côté client et serveur
- Sanitisation des entrées utilisateur
- Protection CSRF
- Authentification JWT

### Bonnes pratiques
- Jamais de données sensibles en local storage
- Validation stricte des permissions
- Logs d'audit des actions importantes
- Chiffrement des communications

## 🚀 Déploiement

### Options de déploiement

1. **Netlify** (recommandé pour les sites statiques)
2. **Vercel** (avec fonctions serverless)
3. **GitHub Pages** (pour les démos)
4. **Serveur traditionnel** (Apache/Nginx)

### Variables d'environnement

```bash
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-cle-publique
ENVIRONMENT=production
```

## 📚 Documentation Complète

- [Guide d'installation détaillé](docs/installation.md)
- [Documentation API](docs/api.md)
- [Guide de contribution](docs/contributing.md)
- [Feuille de route](docs/roadmap.md)

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez notre [guide de contribution](CONTRIBUTING.md).

### Comment contribuer
1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 🆘 Support

- **Issues GitHub** : Pour les bugs et demandes de fonctionnalités
- **Documentation** : [Wiki du projet](https://github.com/votre-repo/wiki)
- **Email** : support@votre-domaine.com

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Supabase](https://supabase.com) pour l'infrastructure backend
- [Lucide](https://lucide.dev) pour les icônes
- La communauté open source pour l'inspiration

---

**Développé avec ❤️ pour améliorer la gestion des ressources humaines**

*Version 1.0.0 - Septembre 2025*