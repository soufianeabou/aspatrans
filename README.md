# ASPATRANS - Application de Transport de Marchandises

Application mobile React Native pour la gestion de transport de marchandises au Maroc, similaire à Uber pour les entreprises.

## 🏗️ Architecture

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** pour la base de données
- **JWT** pour l'authentification
- **bcryptjs** pour le hashing des mots de passe

### Frontend
- **React Native** + **Expo**
- **TypeScript**
- **React Navigation** (Stack + Bottom Tabs)
- **Axios** pour les requêtes HTTP
- **AsyncStorage** pour la persistance du token

## 👥 Rôles

1. **Business Owner** : Crée des demandes de transport, accepte/rejette des contrats
2. **Admin** : Gère les demandes, crée des contrats, assigne des transporteurs
3. **Driver** : Exécute les trajets, gère sa disponibilité
4. **Transport Company** : Gère sa flotte (véhicules et chauffeurs), voit ses revenus

## 📋 Workflow

1. **Business** crée une demande de transport
2. **Admin** reçoit la demande, trouve un transporteur, crée un contrat
3. **Business** accepte le contrat → Trajets générés automatiquement
4. **Chauffeur** reçoit les trajets et les exécute

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Expo CLI
- Android Studio / Xcode (pour l'émulateur)

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Configurer les variables d'environnement
npm run dev
```

### Base de données

```bash
# Créer la base de données
createdb aspatrans

# Créer les tables
psql -d aspatrans -f db/schema.sql

# Insérer les données de test
psql -d aspatrans -f db/seed.sql
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## 🔐 Identifiants de test

- **Business Owner** : `owner@business.ma` / `business123`
- **Admin** : `admin@aspatrans.ma` / `admin123`
- **Transport Company** : `owner@transco.ma` / `transco123`
- **Driver 1** : `driver1@transco.ma` / `driver123`
- **Driver 2** : `driver2@transco.ma` / `driver123`

## 📱 Structure du projet

```
ASPA/
├── backend/          # API Node.js + Express
├── frontend/         # Application React Native
├── db/              # Scripts SQL (schema + seed)
└── README.md
```

## 🎨 Couleurs

- **Primary** : #2196F3 (Bleu - Business)
- **Secondary** : #FF9800 (Orange - Admin/Transport)
- **Success** : #4CAF50 (Vert - Driver)

## 📝 Documentation

- `NOTES_AMELIORATIONS.md` : Liste des améliorations futures
- `WORKFLOW_TEST.md` : Guide de test du workflow complet

## 🔄 Fonctionnalités principales

- ✅ Authentification complète (register/login/JWT)
- ✅ Création de demandes de transport
- ✅ Gestion de contrats (création, acceptation, rejet)
- ✅ Génération automatique de trajets selon la fréquence
- ✅ Gestion de flotte (véhicules et chauffeurs)
- ✅ Tracking GPS pour les trajets
- ✅ Interface complète pour tous les rôles

## 📄 License

MIT

