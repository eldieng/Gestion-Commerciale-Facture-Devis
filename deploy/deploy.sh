#!/bin/bash

# ===========================================
# Script de déploiement Moultazam Distribution
# VPS Ubuntu 24.04 LTS - Hostinger
# ===========================================

set -e

echo "=========================================="
echo "  Déploiement Moultazam Distribution"
echo "=========================================="

# Variables
APP_DIR="/var/www/moultazam"
REPO_URL="https://github.com/eldieng/Gestion-Commerciale-Facture-Devis.git"

# 1. Mise à jour du système
echo "[1/10] Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# 2. Installation des dépendances
echo "[2/10] Installation des dépendances..."
sudo apt install -y python3 python3-pip python3-venv python3-dev \
    postgresql postgresql-contrib \
    nginx \
    nodejs npm \
    git curl \
    libpq-dev \
    libcairo2-dev libpango1.0-dev libgdk-pixbuf2.0-dev libffi-dev shared-mime-info

# 3. Création de la base de données PostgreSQL
echo "[3/10] Configuration PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE moultazam_db;" 2>/dev/null || echo "Base de données existe déjà"
sudo -u postgres psql -c "CREATE USER moultazam_user WITH PASSWORD 'moultazam_password';" 2>/dev/null || echo "Utilisateur existe déjà"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE moultazam_db TO moultazam_user;"
sudo -u postgres psql -c "ALTER USER moultazam_user CREATEDB;"

# 4. Cloner le repository
echo "[4/10] Clonage du repository..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR && git pull origin main
else
    git clone $REPO_URL $APP_DIR
fi

# 5. Configuration Backend Django
echo "[5/10] Configuration du backend Django..."
cd $APP_DIR/backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances Python
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Créer le fichier .env si nécessaire
if [ ! -f ".env" ]; then
    echo "DEBUG=False" > .env
    echo "SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')" >> .env
    echo "ALLOWED_HOSTS=72.62.237.47,localhost" >> .env
    echo "DB_NAME=moultazam_db" >> .env
    echo "DB_USER=moultazam_user" >> .env
    echo "DB_PASSWORD=moultazam_password" >> .env
    echo "DB_HOST=localhost" >> .env
    echo "DB_PORT=5432" >> .env
fi

# Migrations et fichiers statiques
python manage.py migrate
python manage.py collectstatic --noinput

# Créer un superutilisateur si nécessaire
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@moultazam.sn', 'admin123')" | python manage.py shell

deactivate

# 6. Configuration Frontend React
echo "[6/10] Build du frontend React..."
cd $APP_DIR/frontend

# Installer les dépendances Node.js
npm install

# Créer le fichier .env.production
echo "VITE_API_URL=http://72.62.237.47/api" > .env.production

# Build de production
npm run build

# 7. Configuration Nginx
echo "[7/10] Configuration Nginx..."
sudo cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/moultazam
sudo ln -sf /etc/nginx/sites-available/moultazam /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 8. Configuration Gunicorn (systemd)
echo "[8/10] Configuration Gunicorn..."
sudo cp $APP_DIR/deploy/gunicorn.service /etc/systemd/system/moultazam.service
sudo systemctl daemon-reload
sudo systemctl enable moultazam
sudo systemctl restart moultazam

# 9. Permissions
echo "[9/10] Configuration des permissions..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# 10. Vérification
echo "[10/10] Vérification des services..."
sudo systemctl status moultazam --no-pager
sudo systemctl status nginx --no-pager

echo ""
echo "=========================================="
echo "  Déploiement terminé avec succès !"
echo "=========================================="
echo ""
echo "  URL: http://72.62.237.47"
echo "  Admin: http://72.62.237.47/admin"
echo ""
echo "  Identifiants par défaut:"
echo "    - Utilisateur: admin"
echo "    - Mot de passe: admin123"
echo ""
echo "  ⚠️  IMPORTANT: Changez le mot de passe admin !"
echo "  ⚠️  IMPORTANT: Modifiez DB_PASSWORD dans /var/www/moultazam/backend/.env"
echo ""
