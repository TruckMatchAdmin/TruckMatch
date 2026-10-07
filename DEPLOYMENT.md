# Guide de Déploiement OVH — TruckMatch 🚛

Ce document détaille l'installation et la mise en production de **TruckMatch** sur le serveur VPS OVH (`152.228.137.4`).

> **RÈGLE CRITIQUE D'ISOLATION :**
> TruckMatch doit tourner dans son propre environnement isolé sans **jamais** modifier, arrêter ou altérer d'autres applications ou configurations Nginx existantes sur le serveur.

---

## 1. Caractéristiques de l'environnement audité

* **Hôte** : `vps-0af3084b.vps.ovh.net` (`152.228.137.4`)
* **OS** : Ubuntu 26.04 LTS (Kernel Linux 7.0)
* **Node.js** : `v20.20.2`
* **Port dédié TruckMatch** : `3005`
* **Processus PM2 dédié** : `truckmatch`
* **Dossier d'installation dédié** : `/home/ubuntu/truckmatch`

---

## 2. Procédure d'installation sur le serveur

### Étape 1 : Cloner le projet dans le répertoire dédié
Connectez-vous en SSH au VPS :
```bash
ssh ubuntu@152.228.137.4
```

Clonez le repository officiel :
```bash
git clone https://github.com/TruckMatchAdmin/TruckMatch.git /home/ubuntu/truckmatch
cd /home/ubuntu/truckmatch
```

### Étape 2 : Configurer `.env.local`
Créez le fichier de production local :
```bash
nano .env.local
```
Collez-y les identifiants officiels :
```env
NEXT_PUBLIC_SUPABASE_URL=https://azxwqcdnwkolodxwsqoq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6eHdxY2Rud2tvbG9keHdzcW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzODYwMTQsImV4cCI6MjEwNjk2MjAxNH0.kTD3kbIXPHUtADkuWPzKCYHSCNc3Wh33TtLVwMjbbC8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6eHdxY2Rud2tvbG9keHdzcW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTM4NjAxNCwiZXhwIjoyMTA2OTYyMDE0fQ.oxHrsae21Vw52L00rbrMn05D0WEzuV7Paqijox7V6jE
NEXT_PUBLIC_SITE_URL=https://truckmatch.fr
PORT=3005
```

### Étape 3 : Installation des dépendances et build
```bash
npm install
npm run build
```

---

## 3. Configuration PM2 (Daemon isolé)

Créer un fichier de configuration PM2 dans `/home/ubuntu/truckmatch/ecosystem.config.cjs` :

```javascript
module.exports = {
  apps: [
    {
      name: "truckmatch",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3005",
      cwd: "/home/ubuntu/truckmatch",
      env: {
        NODE_ENV: "production",
        PORT: 3005
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G"
    }
  ]
};
```

Démarrage et enregistrement dans PM2 :
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

---

## 4. Configuration Nginx dédiée (Fichier indépendant)

Créez le bloc serveur Nginx exclusivement pour le domaine TruckMatch dans :
`/etc/nginx/sites-available/truckmatch`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name truckmatch.fr www.truckmatch.fr;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activation du site sans altérer les autres :
```bash
sudo ln -s /etc/nginx/sites-available/truckmatch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Certificat SSL HTTPS (Certbot)

Une fois les DNS du domaine pointés vers l'IPv4 `152.228.137.4` :
```bash
sudo certbot --nginx -d truckmatch.fr -d www.truckmatch.fr
```

---

## 6. Mises à jour & Rollback

### Déploiement d'une nouvelle version :
```bash
cd /home/ubuntu/truckmatch
git pull origin main
npm install
npm run build
pm2 restart truckmatch
```

### Procédure de Rollback :
```bash
cd /home/ubuntu/truckmatch
git checkout <commit_id_précédent>
npm run build
pm2 restart truckmatch
```
