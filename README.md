# Moultazam Distribution - Application de Gestion Commerciale

Application web de gestion commerciale pour Moultazam Distribution, permettant la création de factures, proformas et bordereaux de livraison.

## 🚀 Fonctionnalités

- ✅ **Gestion des clients** - Ajouter, modifier, supprimer et rechercher des clients
- ✅ **Gestion des produits** - Catalogue de produits avec prix et TVA
- ✅ **Factures** - Création, numérotation automatique (FAC-ANNÉE-XXX), calculs automatiques HT/TVA/TTC
- ✅ **Factures Proforma** - Devis avec mention "Document non valable comme facture"
- ✅ **Bordereaux de livraison** - Suivi des livraisons avec signatures
- ✅ **Génération PDF** - Documents professionnels avec logo Moultazam
- ✅ **Tableau de bord** - Statistiques mensuelles
- ✅ **Authentification sécurisée** - JWT tokens

## 🛠️ Technologies

| Composant | Technologie |
|-----------|-------------|
| Backend | Django 5.0 + Django REST Framework |
| Frontend | React 18 + Vite + TailwindCSS |
| Base de données | PostgreSQL |
| PDF | WeasyPrint |
| Authentification | JWT (Simple JWT) |

## 📋 Prérequis

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- GTK3 (pour WeasyPrint sur Windows)

## 🔧 Installation

### 1. Créer la base de données PostgreSQL

```sql
CREATE DATABASE moultazam_db;
```

### 2. Backend (Django)

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### 3. Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## 🌐 Accès

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin/

## 📁 Structure du projet

```
application_de_gestion_commerciale/
├── backend/
│   ├── apps/
│   │   ├── accounts/      # Gestion utilisateurs
│   │   ├── clients/       # Gestion clients
│   │   ├── products/      # Gestion produits
│   │   ├── invoices/      # Factures
│   │   ├── proformas/     # Factures proforma
│   │   └── delivery_notes/ # Bordereaux de livraison
│   ├── config/            # Configuration Django
│   ├── templates/         # Templates PDF
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── pages/         # Pages de l'application
│   │   ├── context/       # Context React (Auth)
│   │   └── services/      # API client
│   └── package.json
└── img/
    └── _logo.jpg          # Logo Moultazam
```

## 🔐 API Endpoints

### Authentification
- `POST /api/token/` - Obtenir un token JWT
- `POST /api/token/refresh/` - Rafraîchir le token

### Clients
- `GET/POST /api/clients/` - Liste/Création
- `GET/PUT/DELETE /api/clients/{id}/` - Détail/Modification/Suppression

### Produits
- `GET/POST /api/products/` - Liste/Création
- `GET/PUT/DELETE /api/products/{id}/` - Détail/Modification/Suppression

### Factures
- `GET/POST /api/invoices/` - Liste/Création
- `GET/PUT/DELETE /api/invoices/{id}/` - Détail/Modification/Suppression
- `POST /api/invoices/{id}/finalize/` - Finaliser
- `POST /api/invoices/{id}/mark_paid/` - Marquer payée
- `GET /api/invoices/{id}/pdf/` - Télécharger PDF
- `GET /api/invoices/dashboard/` - Statistiques

### Proformas
- `GET/POST /api/proformas/` - Liste/Création
- `GET/PUT/DELETE /api/proformas/{id}/` - Détail/Modification/Suppression
- `POST /api/proformas/{id}/convert_to_invoice/` - Convertir en facture
- `GET /api/proformas/{id}/pdf/` - Télécharger PDF

### Bordereaux
- `GET/POST /api/delivery-notes/` - Liste/Création
- `GET/PUT/DELETE /api/delivery-notes/{id}/` - Détail/Modification/Suppression
- `GET /api/delivery-notes/{id}/pdf/` - Télécharger PDF

## 💰 Gestion TVA

- Taux standard: **18%**
- Possibilité de produits à **0%**
- Devise: **FCFA**

## 📄 Format de numérotation

| Document | Format |
|----------|--------|
| Facture | FAC-2026-001 |
| Proforma | PRO-2026-001 |
| Bordereau | BL-2026-001 |

## ⚠️ Note pour Windows (WeasyPrint)

WeasyPrint nécessite GTK3. Installer via:
1. Télécharger MSYS2: https://www.msys2.org/
2. Installer GTK3: `pacman -S mingw-w64-x86_64-gtk3`
3. Ajouter au PATH: `C:\msys64\mingw64\bin`

Alternative: utiliser WSL2 pour le développement.

## 📞 Support

Moultazam Distribution - Dakar, Sénégal
