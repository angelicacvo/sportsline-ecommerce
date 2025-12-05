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

Create or verify `.env` file in the root directory with:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=8326
DATABASE_USER=jeferson
DATABASE_PASSWORD=your-secure-password
DATABASE_NAME=sportsline

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# SonarCloud Configuration (Optional - for code quality analysis)
# Get token from: https://sonarcloud.io/account/security
# SONAR_TOKEN=your-sonarcloud-token-here
```

**Important:** Replace placeholder values with your actual credentials before deploying to production.

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
- 🧪 Check [TESTING.md](./TESTING.md) for testing procedures
- 🏗️ See [ARCHITECTURE.md](./ARCHITECTURE.md) for system architecture
- 🔍 See [QUALITY_TOOLS.md](./QUALITY_TOOLS.md) for Husky and SonarQube setup

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
