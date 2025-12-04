# 🐳 Docker Guide - Complete Setup

## 🎯 Objetivo
Containerizar la aplicación NestJS con PostgreSQL usando Docker.

---

## 📦 Paso 1: Instalar Docker

### Windows / Mac
Descargar Docker Desktop desde: https://www.docker.com/products/docker-desktop

### Linux (Ubuntu)
```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

Verificar instalación:
```bash
docker --version
docker-compose --version
```

---

## 📝 Paso 2: Crear Dockerfile

Crear `Dockerfile` en la raíz del proyecto:

```dockerfile
# ================================
# Stage 1: Build
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# ================================
# Stage 2: Production
# ================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3003

# Start application
CMD ["node", "dist/main"]
```

---

## 🐘 Paso 3: Crear docker-compose.yml

Crear `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: sportsline-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - sportsline-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # NestJS Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: sportsline-app
    restart: unless-stopped
    ports:
      - "${PORT}:3003"
    environment:
      NODE_ENV: production
      PORT: 3003
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      API_KEY: ${API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - sportsline-network
    volumes:
      - ./dist:/app/dist
      - ./node_modules:/app/node_modules

volumes:
  postgres_data:
    driver: local

networks:
  sportsline-network:
    driver: bridge
```

---

## 📄 Paso 4: Crear .dockerignore

Crear `.dockerignore`:

```
node_modules/
dist/
.git/
.gitignore
.env
.env.local
.env.production
npm-debug.log
coverage/
.vscode/
.idea/
*.md
!README.md
test/
```

---

## 🚀 Paso 5: Comandos Docker

### Construir imagen

```bash
docker-compose build
```

### Iniciar contenedores

```bash
docker-compose up -d
```

### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo app
docker-compose logs -f app

# Solo postgres
docker-compose logs -f postgres
```

### Detener contenedores

```bash
docker-compose down
```

### Detener y eliminar volúmenes

```bash
docker-compose down -v
```

### Reiniciar servicios

```bash
docker-compose restart
```

### Ver contenedores corriendo

```bash
docker ps
```

---

## 🔧 Paso 6: Ejecutar Migraciones en Docker

```bash
# Acceder al contenedor
docker exec -it sportsline-app sh

# Dentro del contenedor
npm run typeorm:run
npm run seed

# Salir
exit
```

O directamente:

```bash
docker exec sportsline-app npm run typeorm:run
docker exec sportsline-app npm run seed
```

---

## 🗄️ Paso 7: Acceder a PostgreSQL en Docker

```bash
# Conectarse a la base de datos
docker exec -it sportsline-postgres psql -U postgres -d sportsline_db

# Comandos PostgreSQL útiles
\dt                  # Listar tablas
\d users             # Describir tabla users
SELECT * FROM users; # Consultar usuarios
\q                   # Salir
```

---

## 📊 Paso 8: Verificar que funciona

```bash
# Ver logs de la aplicación
docker-compose logs -f app

# Debería mostrar:
# [Nest] LOG [NestFactory] Starting Nest application...
# [Nest] LOG [InstanceLoader] AppModule dependencies initialized
# 🚀 Server running on http://localhost:3003
```

Abrir navegador:
- API: http://localhost:3003
- Swagger: http://localhost:3003/docs

---

## 🛠️ Troubleshooting

### Error: Port already in use

```bash
# Cambiar puerto en .env
PORT=3004

# O matar proceso usando el puerto
# Windows
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3003
kill -9 <PID>
```

### Error: Cannot connect to database

```bash
# Verificar que postgres está corriendo
docker ps

# Ver logs de postgres
docker-compose logs postgres

# Reiniciar postgres
docker-compose restart postgres
```

### Rebuild completo

```bash
# Detener todo
docker-compose down -v

# Eliminar imágenes
docker rmi sportsline-app

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

---

## 📦 Paso 9: Docker para Producción

### Optimizar Dockerfile para producción:

```dockerfile
FROM node:20-alpine AS production

WORKDIR /app

# Instalar solo dependencias necesarias
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado
COPY dist ./dist

# Usuario no-root para seguridad
USER node

EXPOSE 3003

CMD ["node", "dist/main"]
```

### Usar variables de entorno externas:

```bash
# Crear .env.production
DB_HOST=your-production-db.com
DB_PORT=5432
DB_USER=prod_user
DB_PASSWORD=secure_password

# Ejecutar con env específico
docker-compose --env-file .env.production up -d
```

---

## ✅ Checklist Docker

- [ ] Docker Desktop instalado
- [ ] Dockerfile creado
- [ ] docker-compose.yml configurado
- [ ] .dockerignore creado
- [ ] Imagen construida exitosamente
- [ ] Contenedores corriendo
- [ ] Base de datos conectada
- [ ] Migraciones ejecutadas
- [ ] Seeders ejecutados
- [ ] API accesible en http://localhost:3003

---

## 📚 Comandos Útiles

```bash
# Ver uso de recursos
docker stats

# Limpiar sistema Docker
docker system prune -a

# Ver imágenes
docker images

# Eliminar imagen específica
docker rmi <image-id>

# Entrar al contenedor con bash
docker exec -it sportsline-app sh

# Copiar archivos desde/hacia contenedor
docker cp sportsline-app:/app/file.txt ./local-file.txt
docker cp ./local-file.txt sportsline-app:/app/
```

---

## 🚀 Siguiente Paso

**[Testing Guide →](./TESTING-GUIDE.md)**
