# Week 6: Advanced Authentication (x-api-key & OAuth)

## 📚 What You'll Learn

This week builds on previous concepts:
- **Week 4**: Guards and custom decorators
- **Week 5**: JWT authentication with Passport
- **Week 6**: Advanced authentication methods for external services

## 🎯 Implemented Features

### 1. X-API-KEY Authentication

**Purpose**: Allow external services/systems to authenticate without user credentials.

**How it works**:
```
Client Request → X-API-KEY header → ApiKeyGuard → Database validation → Access granted/denied
```

**Key Components**:

- **`ApiKey` Entity** (Week 2 concept - TypeORM):
  ```typescript
  @Entity('api_keys')
  export class ApiKey {
    @Column() key: string;           // The actual API key
    @Column('simple-array') permissions: string[];  // e.g., ['read:products', 'write:orders']
    @Column() isActive: boolean;     // Can enable/disable keys
    @Column() expiresAt: Date;       // Optional expiration
  }
  ```

- **`ApiKeyService`** (Week 3 concept - Services):
  - CRUD operations for API keys
  - `validateKey()`: Checks if key exists, is active, and not expired
  - `hasPermission()`: Verifies key has specific permission

- **`ApiKeyGuard`** (Week 4 concept - Guards):
  ```typescript
  @Injectable()
  export class ApiKeyGuard implements CanActivate {
    // Reads X-API-KEY from headers
    // Validates against database
    // Checks permissions using Reflector (Week 4)
  }
  ```

- **`@RequireApiKeyPermission` Decorator** (Week 4 concept):
  ```typescript
  @RequireApiKeyPermission('read:products')
  @UseGuards(ApiKeyGuard)
  @Get('products')
  getProducts() {}
  ```

**Usage Example**:
```bash
# Create API key (admin only)
POST /api-keys
Authorization: Bearer <your_jwt_token>
{
  "name": "Mobile App",
  "key": "sk_prod_abc123xyz",
  "permissions": ["read:products", "write:orders"]
}

# Use API key
GET /products
X-API-KEY: sk_prod_abc123xyz
```

---

### 2. OAuth2 with Google

**Purpose**: Allow users to login with their Google account (social login).

**OAuth Flow**:
```
1. User clicks "Login with Google"
2. Redirect to Google login page
3. User authenticates with Google
4. Google redirects back with user profile
5. Our app creates/finds user and generates JWT tokens
```

**Key Components**:

- **`GoogleStrategy`** (Week 5 concept - Passport Strategy):
  ```typescript
  export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigService) {
      super({
        clientID: configService.get('GOOGLE_CLIENT_ID'),      // From Week 1 .env
        clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
        callbackURL: '/auth/google/callback',
        scope: ['email', 'profile'],
      });
    }
    
    validate(accessToken, refreshToken, profile, done) {
      // Extract user data from Google profile
      // Pass to AuthService
    }
  }
  ```

- **`GoogleOAuthGuard`** (Week 4 concept - Guards):
  ```typescript
  @Injectable()
  export class GoogleOAuthGuard extends AuthGuard('google') {}
  // Similar to AuthGuard('jwt') from Week 5
  ```

- **Updated `User` Entity** (Week 2 concept):
  ```typescript
  @Entity('users')
  export class User {
    @Column({ nullable: true }) password: string;  // Nullable for OAuth users
    @Column({ nullable: true }) googleId: string;  // Google user ID
    @Column({ default: 'local' }) provider: string; // 'local' or 'google'
  }
  ```

- **`AuthService.validateGoogleUser()`** (Week 5 concept - Auth Service):
  ```typescript
  async validateGoogleUser(googleProfile) {
    // 1. Check if user exists by email
    // 2. If not, create new user (UserService from Week 3)
    // 3. If exists, link Google account
    // 4. Generate JWT tokens (Week 5 pattern)
  }
  ```

**Usage Example**:
```bash
# Frontend redirects to:
GET /auth/google

# Google redirects back to:
GET /auth/google/callback
# Returns: { accessToken, refreshToken, user }

# Frontend stores tokens and uses Bearer auth (Week 5)
```

---

### 3. API Key Permission System

**Granular Permissions**:
```typescript
// Permission format: action:resource
'read:products'    // Can view products
'write:products'   // Can create/update products
'read:orders'      // Can view orders
'write:orders'     // Can create orders
'admin:health'     // Can access system health
'*'                // Wildcard - all permissions
```

**How Permissions Work**:
1. Admin creates API key with specific permissions
2. External service includes key in requests
3. `ApiKeyGuard` reads `@RequireApiKeyPermission` decorator
4. Validates key has required permission
5. Allows/denies access

**Example**:
```typescript
// Controller
@RequireApiKeyPermission('read:products', 'write:products')
@UseGuards(ApiKeyGuard)
@Post('products')
createProduct() {}

// Request
POST /products
X-API-KEY: sk_prod_abc123

// ApiKeyGuard checks:
// 1. Is key valid and active?
// 2. Does key have 'read:products' AND 'write:products'?
// 3. If yes → allow, if no → 401 Unauthorized
```

---

## 🔧 Setup Instructions

### 1. Environment Variables (.env)

Add these to your `.env` file:

```env
# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3003/auth/google/callback

# Existing from Week 5
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3003/auth/google/callback`
6. Copy Client ID and Secret to `.env`

### 3. Database Migration

The `api_keys` table will be created automatically by TypeORM (Week 2 concept).

Or run migration manually:
```bash
npm run migration:generate -- src/database/migrations/CreateApiKeysTable
npm run migration:run
```

### 4. Install Dependencies

Already installed in Week 6:
```bash
npm install passport-google-oauth20
npm install -D @types/passport-google-oauth20
```

---

## 🧪 Testing the Features

### Test X-API-KEY Authentication

```bash
# 1. Login as admin (Week 5)
POST /auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# 2. Create API key
POST /api-keys
Authorization: Bearer <admin_jwt_token>
{
  "name": "Test Key",
  "key": "sk_test_12345",
  "permissions": ["admin:health"]
}

# 3. Test API key
GET /auth/admin/health
X-API-KEY: sk_test_12345

# Should return: { status: 'healthy', uptime: 12345, ... }
```

### Test Google OAuth

```bash
# 1. Open in browser:
http://localhost:3003/auth/google

# 2. Login with Google account

# 3. You'll be redirected back with tokens:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "provider": "google"
  }
}

# 4. Use access token for protected routes (Week 5)
GET /users/me
Authorization: Bearer eyJhbGc...
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Authentication Type?  │
              └────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────┐      ┌──────────┐      ┌──────────┐
   │   JWT   │      │ X-API-KEY│      │  OAuth   │
   │ (Week 5)│      │ (Week 6) │      │ (Week 6) │
   └─────────┘      └──────────┘      └──────────┘
        │                  │                  │
        ▼                  ▼                  ▼
   AuthGuard         ApiKeyGuard      GoogleOAuthGuard
        │                  │                  │
        ▼                  ▼                  ▼
   JwtStrategy       ApiKeyService    GoogleStrategy
        │                  │                  │
        ▼                  ▼                  ▼
   UserService       DB: api_keys      AuthService
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                           ▼
                    PROTECTED ROUTE
```

---

## 🔗 Connection to Previous Weeks

| Week | Concept Used in Week 6 |
|------|------------------------|
| **Week 1** | ConfigService for environment variables (Google OAuth credentials) |
| **Week 2** | TypeORM entities (ApiKey, User modifications) |
| **Week 3** | Service pattern (ApiKeyService CRUD), DTOs (CreateApiKeyDto) |
| **Week 4** | Guards (ApiKeyGuard, GoogleOAuthGuard), Custom decorators |
| **Week 5** | Passport strategies, JWT tokens, AuthService pattern |

---

## 📝 Key Takeaways

1. **X-API-KEY** is for service-to-service authentication (machines, not users)
2. **OAuth** is for user authentication via third-party providers
3. **Guards** control access based on authentication method
4. **Permissions** provide granular access control
5. All patterns build on previous weeks' concepts

---

## 🚀 Next Steps (Week 7)

- Complete Swagger documentation for all endpoints
- Add unit tests for ApiKeyService and Guards
- Implement SonarQube code quality checks
- Add pre-commit hooks with Husky

---

## 📚 Additional Resources

- [NestJS Guards](https://docs.nestjs.com/guards)
- [Passport.js Strategies](http://www.passportjs.org/packages/)
- [OAuth 2.0 Explained](https://oauth.net/2/)
- [API Key Best Practices](https://cloud.google.com/endpoints/docs/openapi/when-why-api-key)

---

## ❓ Common Issues

**Issue**: Google OAuth redirect not working
- **Solution**: Check `GOOGLE_CALLBACK_URL` matches exactly in Google Console and `.env`

**Issue**: API key validation always fails
- **Solution**: Ensure header name is exactly `x-api-key` (lowercase with hyphens)

**Issue**: User already exists error with OAuth
- **Solution**: Check if user with that email exists but without `googleId`

---

## 🎓 Learning Checkpoint

After completing Week 6, you should understand:
- [x] How to implement multiple authentication strategies
- [x] Difference between user auth (JWT/OAuth) and service auth (API Key)
- [x] How Guards and Strategies work together
- [x] How to create custom decorators for permissions
- [x] How to integrate external OAuth providers

**Ready for Week 7? Let's add tests and documentation! 🚀**
