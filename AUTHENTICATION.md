# Sportsline E-Commerce API

A comprehensive e-commerce backend application built with NestJS, featuring advanced authentication mechanisms, role-based access control, and API key management.

## 🚀 Features

### Authentication & Authorization
- **JWT Authentication**: Access tokens (1h) and refresh tokens (7d)
- **OAuth2 with Google**: Social login integration
- **X-API-KEY Authentication**: For service-to-service communication
- **Role-Based Access Control (RBAC)**: Dynamic roles and permissions from database
- **API Key Permissions**: Granular permission control for API keys

### Core Modules
- **Users**: User management with role assignment
- **Products**: Product catalog management
- **Orders**: Order processing and tracking
- **Clients**: Client information management
- **API Keys**: Secure API key generation and management

### Additional Features
- Swagger/OpenAPI documentation
- Database seeding for development
- Custom middleware (Logger, Validation)
- Exception filters and interceptors
- TypeORM with PostgreSQL

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Google OAuth credentials (for OAuth functionality)

## 🛠️ Installation

```bash
# Install dependencies
npm install
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=sportsline_ecommerce

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3003/auth/google/callback

# API Key (Legacy - for backward compatibility)
API_KEY=your_api_key_here

# Application
PORT=3003
NODE_ENV=development
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs: `http://localhost:3003/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

## 🗄️ Database Setup

```bash
# Run migrations (if applicable)
npm run migration:run

# Seed database with initial data
npm run seed
```

The seeder will create:
- Default permissions
- Admin, Vendor, and Customer roles
- Sample users with different roles
- Sample API keys with permissions

## 🏃 Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at: `http://localhost:3003`

Swagger documentation: `http://localhost:3003/api`

## 📚 API Documentation

### Authentication Methods

#### 1. JWT Bearer Token
Used for user-based authentication after login.

```bash
# Register a new user
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "customer"
}

# Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Login
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Use token in subsequent requests
GET /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. Google OAuth
Social login using Google accounts.

```bash
# Initiate Google OAuth flow (redirect to Google)
GET /auth/google

# After successful authentication, user is redirected to callback
GET /auth/google/callback
# Returns JWT tokens
```

**Flow:**
1. Frontend redirects user to `/auth/google`
2. User authenticates with Google
3. Google redirects back to `/auth/google/callback`
4. Backend returns JWT tokens
5. Frontend stores tokens and uses Bearer authentication

#### 3. X-API-KEY Authentication
For service-to-service communication and external integrations.

```bash
# Create an API key (requires admin role)
POST /api-keys
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "name": "Mobile App",
  "key": "sk_prod_abc123xyz456def789",
  "permissions": ["read:products", "write:orders", "admin:health"],
  "description": "API key for mobile application",
  "expiresAt": "2026-12-31T23:59:59Z"
}

# Use API key to access protected endpoints
GET /auth/admin/health
X-API-KEY: sk_prod_abc123xyz456def789

# Response (if key has 'admin:health' permission)
{
  "status": "healthy",
  "uptime": 12345,
  "timestamp": "2025-12-04T10:30:00Z",
  "message": "API Key authentication successful with admin:health permission"
}
```

### API Key Permissions

API keys support granular permissions for different operations:

| Permission | Description |
|------------|-------------|
| `read:products` | View product information |
| `write:products` | Create/update products |
| `read:orders` | View orders |
| `write:orders` | Create/update orders |
| `read:users` | View user information |
| `write:users` | Create/update users |
| `admin:health` | Access system health endpoints |
| `*` | Wildcard - grants all permissions |

**Example: API Key Management**

```bash
# List all API keys (admin only)
GET /api-keys
Authorization: Bearer <admin_jwt_token>

# Get specific API key
GET /api-keys/:id
Authorization: Bearer <admin_jwt_token>

# Update API key (e.g., disable it)
PATCH /api-keys/:id
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "isActive": false,
  "permissions": ["read:products"]
}

# Delete API key
DELETE /api-keys/:id
Authorization: Bearer <admin_jwt_token>
```

### Role-Based Access Control

#### Available Roles
- **Admin**: Full system access
- **Vendor**: Can manage products and view orders
- **Customer**: Can place orders and view own data

#### Permission System

Permissions are stored in the database and assigned to roles:

```
Admin Role:
  - users:read, users:write, users:delete
  - products:read, products:write, products:delete
  - orders:read, orders:write, orders:delete
  - roles:manage, permissions:manage

Vendor Role:
  - products:read, products:write
  - orders:read

Customer Role:
  - products:read
  - orders:read, orders:write (own orders only)
```

**Example: Protected Endpoints**

```typescript
// In controllers:

@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Get('users')
getAllUsers() {} // Only admins can access

@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'vendor')
@Get('products')
getAllProducts() {} // Admins and vendors can access
```

### Refresh Token Flow

```bash
# Refresh access token using refresh token
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🏗️ Project Structure

```
src/
├── api-key/              # API key management module
│   ├── entities/
│   ├── dto/
│   ├── api-key.controller.ts
│   ├── api-key.service.ts
│   └── api-key.module.ts
├── auth/                 # Authentication module
│   ├── guards/          # Auth, Roles, API Key guards
│   ├── strategies/      # JWT, Google OAuth strategies
│   ├── decorators/      # Custom decorators
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── user/                 # User management
├── product/              # Product catalog
├── order/                # Order processing
├── role/                 # Role management
├── permission/           # Permission management
├── common/               # Shared resources
│   ├── middleware/
│   ├── interceptors/
│   └── filters/
├── database/             # Database configuration
│   ├── seeds/           # Database seeders
│   └── factories/       # Data factories
├── app.module.ts
└── main.ts
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use strong JWT secrets** - Generate with `openssl rand -base64 32`
3. **Rotate API keys regularly** - Set expiration dates
4. **Hash API keys** - In production, store hashed versions
5. **Use HTTPS in production** - Encrypt data in transit
6. **Implement rate limiting** - Prevent brute force attacks
7. **Validate all inputs** - Use ValidationPipe and DTOs
8. **Log security events** - Track authentication failures

## 📊 Database Schema

### Key Entities

**Users**
- id (UUID)
- username
- email
- password (hashed)
- googleId (for OAuth)
- provider (local/google)
- role (relationship)
- refreshToken (hashed)

**Roles**
- id (UUID)
- name
- description
- permissions (many-to-many)

**Permissions**
- id (UUID)
- name
- resource
- action

**ApiKeys**
- id (UUID)
- name
- key (unique)
- permissions (array)
- isActive
- expiresAt
- lastUsedAt

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 📝 License

This project is [MIT licensed](LICENSE).

## 👥 Authors

- Angélica - Initial work

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Riwi for the learning opportunity
- All contributors and reviewers
