# Guide de Déploiement - Moultazam Distribution

## VPS Hostinger Ubuntu 24.04 LTS
**IP:** 72.62.237.47

---

## 🚀 Déploiement Rapide (Automatique)

### 1. Connexion SSH au VPS

```bash
ssh root@72.62.237.47
```

### 2. Télécharger et exécuter le script

```bash
# Télécharger le script
curl -O https://raw.githubusercontent.com/eldieng/Gestion-Commerciale-Facture-Devis/main/deploy/deploy.sh

# Rendre exécutable
chmod +x deploy.sh

# Exécuter
./deploy.sh
```

### 3. Accéder à l'application

- **Application:** http://72.62.237.47
- **Admin Django:** http://72.62.237.47/admin
- **Identifiants:** admin / admin123

---

## 📋 Déploiement Manuel (Étape par étape)

### Étape 1: Mise à jour du système

```bash
sudo apt update && sudo apt upgrade -y
```

### Étape 2: Installation des dépendances

```bash
sudo apt install -y python3 python3-pip python3-venv python3-dev \
    postgresql postgresql-contrib \
    nginx \
    nodejs npm \
    git curl \
    libpq-dev \
    libcairo2-dev libpango1.0-dev libgdk-pixbuf2.0-dev libffi-dev shared-mime-info
```

### Étape 3: Configuration PostgreSQL

```bash
sudo -u postgres psql

# Dans psql:
CREATE DATABASE moultazam_db;
CREATE USER moultazam_user WITH PASSWORD 'VotreMotDePasseSecurise';
GRANT ALL PRIVILEGES ON DATABASE moultazam_db TO moultazam_user;
ALTER USER moultazam_user CREATEDB;
\q
```

### Étape 4: Cloner le projet

```bash
sudo mkdir -p /var/www/moultazam
cd /var/www/moultazam
git clone https://github.com/eldieng/Gestion-Commerciale-Facture-Devis.git .
```

### Étape 5: Configuration Backend Django

```bash
cd /var/www/moultazam/backend

# Environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Dépendances
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Fichier .env
cat > .env << EOF
DEBUG=False
SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
ALLOWED_HOSTS=72.62.237.47,localhost
DB_NAME=moultazam_db
DB_USER=moultazam_user
DB_PASSWORD=VotreMotDePasseSecurise
DB_HOST=localhost
DB_PORT=5432
EOF

# Migrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

deactivate
```

### Étape 6: Configuration Frontend React

```bash
cd /var/www/moultazam/frontend

# Dépendances
npm install

# Configuration API
echo "VITE_API_URL=http://72.62.237.47/api" > .env.production

# Build
npm run build
```

### Étape 7: Configuration Nginx

```bash
sudo cp /var/www/moultazam/deploy/nginx.conf /etc/nginx/sites-available/moultazam
sudo ln -sf /etc/nginx/sites-available/moultazam /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Étape 8: Configuration Gunicorn (systemd)

```bash
sudo cp /var/www/moultazam/deploy/gunicorn.service /etc/systemd/system/moultazam.service
sudo systemctl daemon-reload
sudo systemctl enable moultazam
sudo systemctl start moultazam
```

### Étape 9: Permissions

```bash
sudo chown -R www-data:www-data /var/www/moultazam
sudo chmod -R 755 /var/www/moultazam
```

---

## 🔒 Configuration SSL (HTTPS) - Optionnel

Si vous avez un nom de domaine:

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

---

## 🛠️ Commandes Utiles

### Gestion du service

```bash
# Statut
sudo systemctl status moultazam

# Redémarrer
sudo systemctl restart moultazam

# Logs
sudo journalctl -u moultazam -f
```

### Mise à jour de l'application

```bash
cd /var/www/moultazam
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
deactivate
sudo systemctl restart moultazam

# Frontend
cd ../frontend
npm install
npm run build
```

### Logs Nginx

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## ⚠️ Sécurité

1. **Changer le mot de passe admin** après la première connexion
2. **Modifier DB_PASSWORD** dans `/var/www/moultazam/backend/.env`
3. **Configurer un pare-feu** (UFW):
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```
4. **Activer HTTPS** avec Certbot si vous avez un domaine

---

## 📞 Support

En cas de problème, vérifiez:
1. Les logs Gunicorn: `sudo journalctl -u moultazam -f`
2. Les logs Nginx: `sudo tail -f /var/log/nginx/error.log`
3. La connexion PostgreSQL: `sudo -u postgres psql -c "\l"`
