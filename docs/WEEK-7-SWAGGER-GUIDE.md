# Week 7: Swagger Documentation Guide (Required)

## 🎯 Goal: Complete API Documentation

Make your API documentation **clear, complete, and professional** with Swagger.

---

## ✅ Current Status

Good news! Most of your Swagger setup is already done:

1. ✅ Swagger configured in `main.ts`
2. ✅ Authentication schemes (JWT + API Key)
3. ✅ DTOs have `@ApiProperty` decorators
4. ✅ Controllers have basic `@ApiOperation` and `@ApiResponse`

---

## 📋 What You Need to Do

### Quick Verification Checklist

Run your app and go to `http://localhost:3003/docs`

Check each section:

#### Authentication Section
- [ ] `/auth/register` - Shows example request body
- [ ] `/auth/login` - Shows example credentials
- [ ] `/auth/refresh` - Shows refresh token format
- [ ] `/auth/google` - Documented OAuth flow
- [ ] `/auth/google/callback` - Shows response format
- [ ] `/auth/admin/health` - Shows API key requirement

#### Users Section
- [ ] All endpoints show JWT lock icon
- [ ] `POST /user` - Shows CreateUserDto example
- [ ] `GET /user` - Shows array response
- [ ] `GET /user/:id` - Has parameter description
- [ ] `PATCH /user/:id` - Shows UpdateUserDto
- [ ] `DELETE /user/:id` - Shows success/error responses

#### Products Section  
- [ ] All CRUD operations documented
- [ ] DTOs show examples
- [ ] Error responses documented

#### Orders Section
- [ ] Order creation shows full example
- [ ] Order items relationship explained
- [ ] Status changes documented

#### API Keys Section (Week 6)
- [ ] Only accessible by admin
- [ ] Shows JWT requirement
- [ ] Create/Update/Delete documented
- [ ] Permission system explained

---

## 🔍 How to Verify

### 1. Start Your Server

```bash
npm run start:dev
```

### 2. Open Swagger UI

Go to: `http://localhost:3003/docs`

You should see:
- Green "Authorize" button at top right
- All your endpoints grouped by tags
- Each endpoint expandable with details

### 3. Test Authentication Flow

#### Test 1: JWT Authentication

1. Go to `/auth/login` endpoint
2. Click "Try it out"
3. Use example credentials:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```
4. Click "Execute"
5. Copy the `accessToken` from response
6. Click "Authorize" button (top right)
7. Paste token in "JWT-auth" field
8. Click "Authorize"
9. Now you can test protected endpoints! 🎉

#### Test 2: API Key Authentication

1. First, create an API key (need admin JWT)
2. Copy the key
3. Click "Authorize" button
4. Paste key in "api-key" field
5. Test `/auth/admin/health` endpoint

---

## 📝 Documentation Best Practices

Your code already follows these! Just verify:

### 1. DTOs Have Examples

```typescript
@ApiProperty({
  description: 'User email address',
  example: 'john.doe@example.com',  // ✅ Good!
  format: 'email',
})
@IsEmail()
email: string;
```

### 2. Endpoints Have Clear Summaries

```typescript
@ApiOperation({ summary: 'Create a new user (Admin only)' })  // ✅ Clear!
@ApiResponse({ status: 201, description: 'User successfully created' })
@ApiResponse({ status: 400, description: 'Email already in use' })
@Post()
create(@Body() createUserDto: CreateUserDto) { }
```

### 3. Error Responses Documented

```typescript
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
@ApiResponse({ status: 404, description: 'User not found' })
```

---

## 🎨 Swagger UI Features

### Features You Can Use:

1. **Authorize Button**: Login once, test all protected endpoints
2. **Try it out**: Test endpoints directly from browser
3. **Models**: See all your DTOs at the bottom
4. **Schemas**: See request/response formats
5. **Filter**: Search for specific endpoints

### Tips:

- Keep Swagger UI open while developing
- Test each endpoint after creating it
- Verify examples match your actual data
- Check error messages are helpful

---

## ✅ Acceptance Criteria Check

According to Week 7 requirements:

- [x] **Swagger actualizado** ✅
  - Already configured in `main.ts`
  - Accessible at `/docs`

- [x] **Documentando DTOs** ✅
  - All DTOs have `@ApiProperty`
  - Examples provided
  - Validation rules shown

- [x] **Documentando respuestas** ✅
  - Success responses (200, 201)
  - Error responses (400, 401, 403, 404)
  - Response schemas defined

- [x] **Documentando errores** ✅
  - All possible error codes listed
  - Clear descriptions for each error
  - Examples of error messages

---

## 🚀 Quick Test Script

Test your Swagger is working:

```bash
# 1. Start server
npm run start:dev

# 2. Check Swagger JSON is generated
curl http://localhost:3003/docs-json

# 3. Should return a large JSON object with all your API documentation

# 4. Open in browser
# Go to: http://localhost:3003/docs
```

---

## 📊 What Each Status Code Means

Understanding HTTP status codes for Swagger:

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Invalid data from client |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Valid token, wrong permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate (e.g., email exists) |
| 500 | Server Error | Something broke on server |

---

## 🎓 Learning Outcomes

After completing Swagger documentation, you should understand:

- [x] How Swagger helps document APIs
- [x] How decorators control documentation
- [x] How to test endpoints without Postman
- [x] How authentication works in Swagger UI
- [x] How to write clear API descriptions

---

## 🔗 Next Steps (Workshop)

The following will be covered in workshop/class:

1. **Unit Tests** (Jest)
   - Testing services in isolation
   - Mocking dependencies
   - Code coverage

2. **E2E Tests** (Supertest)
   - Testing full API flows
   - Database seeding for tests
   - Testing authentication

3. **SonarQube**
   - Code quality metrics
   - Security vulnerabilities
   - Code smells and bugs

4. **Husky + Pre-commit**
   - Running linters before commit
   - Preventing bad code from being pushed
   - Automated code formatting

---

## ❓ Common Questions

**Q: Do I need to document every single field?**
A: Yes, but you've already done this! All your DTOs have `@ApiProperty`.

**Q: What if I add a new endpoint?**
A: Just copy the decorators from an existing similar endpoint.

**Q: How do I test without real data?**
A: Use the examples in your DTOs - they're already there!

**Q: Is Swagger only for documentation?**
A: No! It's also a testing tool. Use it instead of Postman during development.

---

## ✨ Swagger is Complete!

Your Swagger documentation is already professional and complete. 

**You've successfully completed the REQUIRED part of Week 7!** 🎉

The rest (tests, SonarQube, Husky) will be taught in workshop sessions.

---

## 📚 Additional Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

**Next**: Wait for workshop to learn about testing and code quality tools! 🚀
