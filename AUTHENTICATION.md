# Authentication Guide

This document describes the authentication mechanisms available in the SportsLine E-commerce API.

## Table of Contents

1. [JWT Authentication (Bearer Token)](#jwt-authentication)
2. [API Key Authentication (X-API-Key)](#api-key-authentication)
3. [OAuth2 Google Authentication](#oauth2-google-authentication)

---

## JWT Authentication

The primary authentication method using JSON Web Tokens.

### How to Use

1. **Login** to get your access token:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@sportsline.com",
       "password": "admin123"
     }'
   ```

2. **Use the token** in subsequent requests:
   ```bash
   curl -X GET http://localhost:3000/auth/profile \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Test Credentials

- **Admin**: admin@sportsline.com / admin123
- **User**: user@sportsline.com / user123

### Token Details

- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Valid for 7 days
- **Endpoint**: `/auth/refresh` to renew tokens

---

## API Key Authentication

For external integrations and service-to-service communication.

### Creating an API Key

1. **Login with JWT** first
2. **Create API Key**:
   ```bash
   curl -X POST http://localhost:3000/auth/api-keys \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "My App Key",
       "expiresAt": "2026-12-31T23:59:59Z"
     }'
   ```

3. **Response** contains your API key:
   ```json
   {
     "id": "uuid",
     "key": "sk_abc123...",
     "name": "My App Key",
     "expiresAt": "2026-12-31T23:59:59Z",
     "createdAt": "2025-11-30T..."
   }
   ```

   ⚠️ **Important**: Save the `key` value - it won't be shown again!

### Using API Keys

Use the `x-api-key` header instead of Bearer token:

```bash
curl -X GET http://localhost:3000/auth/test-api-key \
  -H "x-api-key: sk_abc123..."
```

### Managing API Keys

**List your API keys**:
```bash
curl -X GET http://localhost:3000/auth/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Revoke an API key**:
```bash
curl -X DELETE http://localhost:3000/auth/api-keys/KEY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test API Key (from seed)

A test API key is available after running seed:
```
Run: npm run seed
```

Test it:
```bash
curl -X GET http://localhost:3000/auth/test-api-key \
  -H "x-api-key: YOUR_API_KEY_FROM_SEED"
```

### API Key Features

- ✅ Secure 64-character random keys
- ✅ Optional expiration dates
- ✅ Automatic tracking of last usage
- ✅ Can be revoked anytime
- ✅ Same permissions as the user who created it

---

## OAuth2 Google Authentication

Login with your Google account.

### Setup Instructions

1. **Get Google OAuth credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `http://localhost:3000/auth/google/callback`

2. **Configure environment variables** in `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   ```

3. **Restart the application** to load new environment variables

### How to Use

**Option 1: Browser Flow**

1. Navigate to: `http://localhost:3000/auth/google`
2. Sign in with your Google account
3. You'll be redirected back with JWT tokens

**Option 2: API Testing**

```bash
# Initiate Google OAuth (opens browser)
curl -X GET http://localhost:3000/auth/google

# After callback, you'll receive:
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "user"
  }
}
```

### OAuth Flow

1. User clicks "Login with Google"
2. Redirected to Google login page
3. User authorizes the application
4. Google redirects back with authorization code
5. Backend exchanges code for user info
6. System creates/finds user account
7. Returns JWT tokens for API access

### OAuth Features

- ✅ Automatic user creation on first login
- ✅ Links Google email to existing accounts
- ✅ No password storage (passwordless login)
- ✅ Returns standard JWT tokens
- ✅ Same API access as regular users

---

## Using Authentication in Swagger

### JWT Bearer Token

1. Click **"Authorize"** button (🔒 icon at top)
2. In the Bearer Auth field, enter: `Bearer YOUR_ACCESS_TOKEN`
3. Click **Authorize**
4. All protected endpoints will now include your token

### API Key

1. Click **"Authorize"** button
2. In the api-key field, enter your key: `sk_abc123...`
3. Click **Authorize**
4. Endpoints marked with 🔑 will use your API key

---

## Security Best Practices

### For JWT Tokens

- ✅ Store tokens securely (never in localStorage for sensitive apps)
- ✅ Always use HTTPS in production
- ✅ Implement token refresh before expiration
- ✅ Validate tokens on every request

### For API Keys

- ✅ Never commit API keys to version control
- ✅ Rotate keys periodically
- ✅ Set expiration dates
- ✅ Revoke compromised keys immediately
- ✅ Use different keys for different environments
- ✅ Monitor API key usage

### For OAuth2

- ✅ Keep client secrets secure
- ✅ Validate redirect URIs
- ✅ Use state parameter for CSRF protection
- ✅ Don't expose OAuth tokens to frontend
- ✅ Handle errors gracefully

---

## Troubleshooting

### "Invalid or expired API key"

- Check if the key is still active
- Verify no typos in the key
- Check if key has expired
- Use `/auth/api-keys` to list active keys

### "Unauthorized" with JWT

- Token might be expired (15min lifetime)
- Use refresh token to get new access token
- Check Bearer prefix is included

### Google OAuth not working

- Verify GOOGLE_CLIENT_ID is set correctly
- Check redirect URI matches Google Console
- Ensure Google+ API is enabled
- Check browser console for errors

---

## Migration Guide

### From previous authentication

If upgrading from a previous version:

1. Existing JWT authentication continues to work
2. API keys are opt-in (create as needed)
3. OAuth is additive (doesn't replace existing auth)
4. No breaking changes to existing endpoints

### Database changes

The API key feature adds a new table:

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  userId BIGINT NOT NULL,
  isActive BOOLEAN DEFAULT true,
  expiresAt TIMESTAMP NULL,
  lastUsedAt TIMESTAMP NULL,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);
```

User table now allows null passwords for OAuth users.

---

## API Reference

### Authentication Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | None | Register new user |
| `/auth/login` | POST | None | Login with credentials |
| `/auth/refresh` | POST | Refresh | Renew access token |
| `/auth/profile` | GET | Bearer | Get user profile |
| `/auth/api-keys` | POST | Bearer | Create API key |
| `/auth/api-keys` | GET | Bearer | List API keys |
| `/auth/api-keys/:id` | DELETE | Bearer | Revoke API key |
| `/auth/test-api-key` | GET | API Key | Test API key |
| `/auth/google` | GET | None | Start Google OAuth |
| `/auth/google/callback` | GET | None | Google OAuth callback |

---

## Examples

### Complete Authentication Flow (cURL)

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sportsline.com","password":"admin123"}' \
  | jq -r '.data.accessToken')

# 2. Create API Key
API_KEY=$(curl -s -X POST http://localhost:3000/auth/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"CLI Key"}' \
  | jq -r '.data.key')

# 3. Use API Key
curl -X GET http://localhost:3000/auth/test-api-key \
  -H "x-api-key: $API_KEY"

# 4. List all products using JWT
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer $TOKEN"

# 5. List all products using API Key
curl -X GET http://localhost:3000/products \
  -H "x-api-key: $API_KEY"
```

### JavaScript/TypeScript Example

```typescript
// Login
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@sportsline.com',
    password: 'admin123'
  })
});
const { accessToken } = await loginResponse.json();

// Use JWT
const profileResponse = await fetch('http://localhost:3000/auth/profile', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// Create API Key
const keyResponse = await fetch('http://localhost:3000/auth/api-keys', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'My App Key' })
});
const { key } = await keyResponse.json();

// Use API Key
const testResponse = await fetch('http://localhost:3000/auth/test-api-key', {
  headers: { 'x-api-key': key }
});
```

---

## Support

For issues or questions:
- Check Swagger documentation at `/docs`
- Review this authentication guide
- Check application logs for detailed errors
- Ensure all environment variables are configured
