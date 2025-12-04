# 🚀 Deployment Guide - Hetzner Server

## 🎯 Objetivo
Desplegar la aplicación NestJS en el servidor Hetzner con PM2.

---

## 📋 Información del Servidor

| Campo | Valor |
|-------|-------|
| IP | 5.78.128.37 |
| Usuario | coder |
| Puerto SSH | 22 |
| OS | Ubuntu 24.04 |

---

## 🔐 Paso 1: Configurar SSH en Termius

### Generar llave SSH (si no tienes)

```bash
# Windows (PowerShell)
ssh-keygen -t rsa -b 4096 -C "tu-email@example.com"

# Guardar en: C:\Users\TuUsuario\.ssh\id_rsa
```

### Configurar en Termius

1. Abrir Termius
2. Ir a **Keychain** → **Add Key**
3. Seleccionar tu llave privada: `~/.ssh/id_rsa`
4. Crear **New Host**:
   - **Address**: 5.78.128.37
   - **Port**: 22
   - **Username**: coder
   - **Key**: Seleccionar la llave importada

---

## 📦 Paso 2: Preparar Servidor

### Conectar al servidor

```bash
ssh coder@5.78.128.37
```

### Instalar Node.js 20

```bash
# Actualizar sistema
sudo apt update
sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar
node --version  # v20.x.x
npm --version
```

### Instalar PM2

```bash
sudo npm install -g pm2

# Verificar
pm2 --version
```

### Instalar PostgreSQL (si no está)

```bash
sudo apt install postgresql postgresql-contrib -y

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Configurar PostgreSQL

```bash
# Cambiar a usuario postgres
sudo -u postgres psql

# Crear usuario y base de datos
CREATE USER sportsline_user WITH PASSWORD 'tu_password_segura';
CREATE DATABASE sportsline_db OWNER sportsline_user;
GRANT ALL PRIVILEGES ON DATABASE sportsline_db TO sportsline_user;

# Salir
\q
```

---

## 🏗️ Paso 3: Preparar Proyecto para Producción

### En tu computadora local

```bash
# 1. Build del proyecto
npm run build

# 2. Crear archivo .env.production
cp .env .env.production

# Editar .env.production con datos del servidor
PORT=3003
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_USER=sportsline_user
DB_PASSWORD=tu_password_segura
DB_NAME=sportsline_db
JWT_SECRET=production-secret-change-this
API_KEY=production-api-key
```

---

## 📤 Paso 4: Transferir Archivos al Servidor

### Opción 1: Con SCP

```bash
# Crear carpeta en servidor
ssh coder@5.78.128.37 "mkdir -p ~/apps/sportsline"

# Transferir archivos
scp -r dist/ coder@5.78.128.37:~/apps/sportsline/
scp package.json coder@5.78.128.37:~/apps/sportsline/
scp package-lock.json coder@5.78.128.37:~/apps/sportsline/
scp .env.production coder@5.78.128.37:~/apps/sportsline/.env
```

### Opción 2: Con Git (Recomendado)

```bash
# En el servidor
cd ~/apps
git clone https://github.com/tu-usuario/sportsline-ecommerce.git
cd sportsline-ecommerce

# Instalar dependencias de producción
npm ci --only=production

# Copiar .env (crear manualmente o desde .env.example)
nano .env
# Pegar configuración de producción
```

---

## 🔧 Paso 5: Configurar PM2

### En el servidor

```bash
cd ~/apps/sportsline-ecommerce

# Instalar dependencias de producción
npm ci --only=production

# Ejecutar migraciones
npm run typeorm:run

# Ejecutar seeders
npm run seed

# Iniciar con PM2
pm2 start dist/main.js --name sportsline-api

# Ver logs
pm2 logs sportsline-api

# Ver status
pm2 status
```

### Configurar PM2 Ecosystem

Crear `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'sportsline-api',
    script: './dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3003
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
  }]
};
```

Iniciar con ecosystem:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🌐 Paso 6: Configurar Nginx (Opcional)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/sportsline
```

Contenido:

```nginx
server {
    listen 80;
    server_name 5.78.128.37;

    location / {
        proxy_pass http://localhost:3003;
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

Activar configuración:

```bash
sudo ln -s /etc/nginx/sites-available/sportsline /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔥 Paso 7: Configurar Firewall

```bash
# Permitir SSH, HTTP y puerto de la app
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 3003/tcp
sudo ufw enable

# Ver status
sudo ufw status
```

---

## 📊 Paso 8: Monitoreo con PM2

```bash
# Ver logs en tiempo real
pm2 logs sportsline-api

# Ver métricas
pm2 monit

# Reiniciar aplicación
pm2 restart sportsline-api

# Detener aplicación
pm2 stop sportsline-api

# Eliminar de PM2
pm2 delete sportsline-api

# Ver logs guardados
pm2 logs sportsline-api --lines 100
```

---

## 🔄 Paso 9: Script de Actualización

Crear `deploy.sh` en el servidor:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

cd ~/apps/sportsline-ecommerce

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🏗️ Building application..."
npm run build

echo "🗄️ Running migrations..."
npm run typeorm:run

echo "♻️ Restarting PM2..."
pm2 restart sportsline-api

echo "✅ Deployment complete!"
pm2 status
```

Dar permisos:

```bash
chmod +x deploy.sh
```

Ejecutar:

```bash
./deploy.sh
```

---

## 🐛 Troubleshooting

### Puerto en uso

```bash
# Ver qué usa el puerto 3003
sudo lsof -i :3003

# Matar proceso
sudo kill -9 <PID>
```

### Error de permisos

```bash
# Cambiar owner de la carpeta
sudo chown -R coder:coder ~/apps/sportsline-ecommerce
```

### PM2 no arranca al reiniciar

```bash
pm2 startup
# Copiar y ejecutar el comando que te da
pm2 save
```

### Ver logs de errores

```bash
# Logs de PM2
pm2 logs sportsline-api --err

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Logs del sistema
sudo journalctl -u nginx -f
```

---

## ✅ Checklist Deployment

- [ ] Servidor accesible vía SSH
- [ ] Node.js 20 instalado
- [ ] PM2 instalado
- [ ] PostgreSQL configurado
- [ ] Base de datos creada
- [ ] Código transferido al servidor
- [ ] Dependencias instaladas
- [ ] .env configurado
- [ ] Migraciones ejecutadas
- [ ] Seeders ejecutados
- [ ] Aplicación corriendo con PM2
- [ ] PM2 configurado para auto-start
- [ ] Firewall configurado
- [ ] Nginx configurado (opcional)
- [ ] API accesible externamente

---

## 🌐 Verificar Deployment

```bash
# Desde tu computadora
curl http://5.78.128.37:3003

# Debería responder: "Hello World!" o tu mensaje inicial

# Swagger
curl http://5.78.128.37:3003/docs

# Health check
curl http://5.78.128.37:3003/health
```

---

## 📚 Comandos Útiles

```bash
# PM2
pm2 list                    # Ver todas las apps
pm2 info sportsline-api     # Info detallada
pm2 restart all             # Reiniciar todas
pm2 logs --lines 200        # Ver últimos 200 logs

# Sistema
htop                        # Monitor de recursos
df -h                       # Espacio en disco
free -m                     # Memoria RAM

# PostgreSQL
sudo -u postgres psql       # Conectar a PostgreSQL
\l                          # Listar bases de datos
\c sportsline_db            # Conectar a DB
\dt                         # Listar tablas
```

---

## 🎉 ¡Deployment Completo!

Tu aplicación ahora está corriendo en:
- **API**: http://5.78.128.37:3003
- **Swagger**: http://5.78.128.37:3003/docs

---

## 🔒 Seguridad Extra (Recomendado)

```bash
# Cambiar puerto SSH (opcional)
sudo nano /etc/ssh/sshd_config
# Cambiar: Port 22 → Port 2222
sudo systemctl restart sshd

# Deshabilitar login con password (solo SSH keys)
sudo nano /etc/ssh/sshd_config
# Cambiar: PasswordAuthentication yes → no
sudo systemctl restart sshd

# Instalar fail2ban (protección contra brute force)
sudo apt install fail2ban -y
```

---

**¡Tu aplicación está en producción!** 🚀
