# 🚀 Getting Started - Sportsline E-Commerce

## Prerequisites

- **Node.js** v18+
- **npm** v9+
- **Docker Desktop** (Windows/Mac) or **Docker + Docker Compose** (Linux)
- **Git**

## Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd sportsline-ecommerce
npm install
```

### 2. Environment Variables

Verify `.env` file exists with:
```env
DATABASE_HOST=localhost
DATABASE_PORT=8326
DATABASE_USER=jeferson
DATABASE_PASSWORD=JefersonKainToph
DATABASE_NAME=sportsline

JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=640270787250-gjoi768v0rnmttpc82mlgenjud8r524i.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### 3. Start with Docker (Recommended)
```bash
# First time: Clean volumes
docker compose down -v

# Build and start all services
docker compose up --build -d

# Seed database with test data
npm run seed
```

### 4. Verify Installation
```bash
# Check services status
docker compose ps

# All services should show "Up"
# Gateway: http://localhost:3000
# Swagger: http://localhost:3000/docs
```

## Test Credentials

**Admin User:**
- Email: `admin@sportsline.com`
- Password: `admin123`

**Regular User:**
- Email: `user@sportsline.com`
- Password: `user123`

**Test API Key:**
```
sk_test_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Next Steps

- 📖 Read [AUTHENTICATION.md](../AUTHENTICATION.md) for authentication methods
- 🧪 Check [docs/TESTING.md](./TESTING.md) for testing procedures
- 🏗️ See [docs/ARCHITECTURE.md](./ARCHITECTURE.md) for system architecture

## Troubleshooting

**Port conflicts:**
```bash
# Check ports in use
netstat -ano | findstr "3000 8326"

# Stop services
docker compose down
```

**Database issues:**
```bash
# Reset database
docker compose down -v
docker compose up -d postgres
npm run seed
```

**Gateway not starting:**
```bash
# Check logs
docker logs sportsline-ecommerce-gateway-1

# Restart gateway
docker compose restart gateway
```
