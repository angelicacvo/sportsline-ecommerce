# 🧪 Testing Guide

## Quick Authentication Tests

### 1. JWT Authentication

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sportsline.com","password":"admin123"}'
```

**Use Token:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. API Key Authentication

**Create Key:**
```bash
curl -X POST http://localhost:3000/auth/api-keys \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key"}'
```

**Use Key:**
```bash
curl -X GET http://localhost:3000/auth/test-api-key \
  -H "x-api-key: YOUR_API_KEY"
```

**Test with Seeded Key:**
```bash
curl -X GET http://localhost:3000/products \
  -H "x-api-key: sk_test_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
```

### 3. Google OAuth

**Setup (One-time):**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized origin: `http://localhost:3000`
4. Add redirect URI: `http://localhost:3000/auth/google/callback`
5. Update `.env` with credentials
6. Restart gateway: `docker compose restart gateway`

**Test:**
- Open in browser: `http://localhost:3000/auth/google`
- Login with Google account
- Receive JWT tokens in response

## Swagger UI Testing

1. Open: `http://localhost:3000/docs`
2. Click **"Authorize"** button (🔒)
3. Enter credentials:
   - **Bearer**: `Bearer YOUR_ACCESS_TOKEN`
   - **api-key**: `YOUR_API_KEY`
4. Test any endpoint

## Unit & E2E Tests

```bash
# Run all tests
npm test

# With coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

## Verification Checklist

### API Key Features
- [ ] Create API key with JWT
- [ ] List user's API keys
- [ ] Revoke API key
- [ ] Authenticate with `x-api-key` header
- [ ] Expired keys are rejected
- [ ] Revoked keys are rejected
- [ ] Test key from seed works

### OAuth Features
- [ ] Google OAuth flow initiates
- [ ] Returns JWT tokens after login
- [ ] Creates new user on first login
- [ ] Links to existing user by email

### Security
- [ ] API keys are 64+ characters
- [ ] Keys have `sk_` prefix
- [ ] Cannot retrieve key after creation
- [ ] JWT tokens expire after 15 minutes
- [ ] Refresh tokens work correctly

## Common Issues

**404 on /auth/google:**
- Verify `GOOGLE_CLIENT_ID` is set in environment
- Check gateway logs: `docker logs sportsline-ecommerce-gateway-1`

**redirect_uri_mismatch:**
- Ensure Google Cloud Console has exact URI: `http://localhost:3000/auth/google/callback`
- Add both origin (`http://localhost:3000`) and redirect URI

**Invalid API key:**
- Check key format starts with `sk_`
- Verify key hasn't expired
- Use `x-api-key` header (lowercase)
