import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { GatewayModule } from '../src/gateway/gateway.module';

describe('Auth E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('JWT Authentication Flow', () => {
    let accessToken: string;
    let refreshToken: string;

    it('POST /auth/login - should login user and return tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@sportsline.com',
          password: 'admin123',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe('admin@sportsline.com');

      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it('GET /auth/profile - should return user profile with valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.email).toBe('admin@sportsline.com');
    });

    it('GET /auth/profile - should reject without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /auth/refresh - should refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });
  });

  describe('API Key Authentication', () => {
    let apiKey: string;
    let jwtToken: string;

    beforeAll(async () => {
      // Get JWT token first
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@sportsline.com',
          password: 'admin123',
        });

      jwtToken = loginResponse.body.data.accessToken;

      // Create API key
      const keyResponse = await request(app.getHttpServer())
        .post('/auth/api-keys')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ name: 'Test Key' })
        .expect(HttpStatus.CREATED);

      apiKey = keyResponse.body.data.key;
    });

    it('POST /auth/api-keys - should create API key with JWT', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/api-keys')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ name: 'Another Key' })
        .expect(HttpStatus.CREATED);

      expect(response.body.data).toHaveProperty('key');
      expect(response.body.data.key).toMatch(/^sk_/);
    });

    it('GET /auth/test-api-key - should authenticate with API key', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/test-api-key')
        .set('x-api-key', apiKey)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('message');
    });

    it('GET /auth/test-api-key - should reject invalid API key', async () => {
      await request(app.getHttpServer())
        .get('/auth/test-api-key')
        .set('x-api-key', 'invalid_key')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('GET /auth/api-keys - should list user API keys', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/api-keys')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('DELETE /auth/api-keys/:id - should revoke API key', async () => {
      // Create a key to revoke
      const createResponse = await request(app.getHttpServer())
        .post('/auth/api-keys')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ name: 'Key to Revoke' });

      const keyId = createResponse.body.data.id;

      // Revoke it
      await request(app.getHttpServer())
        .delete(`/auth/api-keys/${keyId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      // Verify it's revoked
      await request(app.getHttpServer())
        .get('/auth/test-api-key')
        .set('x-api-key', createResponse.body.data.key)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Role-Based Access Control', () => {
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
      // Login as admin
      const adminLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@sportsline.com',
          password: 'admin123',
        });
      adminToken = adminLogin.body.data.accessToken;

      // Login as user
      const userLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@sportsline.com',
          password: 'user123',
        });
      userToken = userLogin.body.data.accessToken;
    });

    it('POST /categories - admin should create category', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Category',
          description: 'A test category',
        })
        .expect(HttpStatus.CREATED);
    });

    it('POST /categories - user should be forbidden', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Category',
          description: 'A test category',
        })
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Error Handling', () => {
    it('POST /auth/login - should return 401 for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid@sportsline.com',
          password: 'wrongpassword',
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
    });

    it('POST /auth/register - should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // missing password and name
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
