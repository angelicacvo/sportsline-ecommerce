import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { GatewayModule } from '../src/gateway/gateway.module';

describe('Users E2E Tests', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let userId: string;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@sportsline.com', password: 'admin123' });
    adminToken = adminLogin.body.data.accessToken;

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@sportsline.com', password: 'user123' });
    userToken = userLogin.body.data.accessToken;

    // Get user ID from profile
    const profileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${userToken}`);
    userId = profileRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User CRUD Operations', () => {
    it('POST /users - admin should create user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newuser@sportsline.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          role: 'user',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe('newuser@sportsline.com');
      expect(response.body.data.firstName).toBe('New');
      expect(response.body.data.lastName).toBe('User');
      createdUserId = response.body.data.id;
    });

    it('GET /users - admin should retrieve all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('GET /users/:id - user should retrieve user by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toBe(userId);
    });

    it('PATCH /users/:id - user should update own profile', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Profile',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('Profile');
    });

    it('PATCH /users/:id - admin should update any user', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'AdminUpdated',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.firstName).toBe('AdminUpdated');
    });

    it('DELETE /users/:id - admin should delete user', async () => {
      // Create a user to delete
      const createRes = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'deleteuser@sportsline.com',
          password: 'password123',
          firstName: 'Delete',
          lastName: 'Me',
        });

      const deleteId = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/users/${deleteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('User Authorization', () => {
    it('POST /users - regular user should be forbidden', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'unauthorized@sportsline.com',
          password: 'password123',
          firstName: 'Unauthorized',
          lastName: 'User',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('GET /users - regular user should be forbidden to list all', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('PATCH /users/:id - user cannot modify other user profiles', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Hacker',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /users/:id - user cannot delete other users', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('User Profile', () => {
    it('GET /auth/profile - should retrieve current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toBe(userId);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('firstName');
      expect(response.body.data).toHaveProperty('role');
    });

    it('GET /auth/profile - should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('User Validation', () => {
    it('POST /users - should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /users - should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /users - should validate password strength', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'validuser@sportsline.com',
          password: '123', // Too short
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /users - should reject duplicate email', async () => {
      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'duplicate@sportsline.com',
          password: 'password123',
          firstName: 'First',
          lastName: 'User',
        });

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'duplicate@sportsline.com',
          password: 'password123',
          firstName: 'Second',
          lastName: 'User',
        })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('User Roles and Permissions', () => {
    it('POST /users - admin can assign different roles', async () => {
      const userRes = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'moderator@sportsline.com',
          password: 'password123',
          firstName: 'Moderator',
          lastName: 'User',
          role: 'moderator',
        });

      expect(userRes.body.data.role).toBe('moderator');
    });

    it('PATCH /users/:id - admin can update user role', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'admin',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.role).toBe('admin');
    });
  });

  describe('User Search and Filtering', () => {
    it('GET /users?search=test - should search users by name or email', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?search=test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /users?role=admin - should filter users by role', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        response.body.data.forEach((user: any) => {
          expect(user.role).toBe('admin');
        });
      }
    });

    it('GET /users?skip=0&take=10 - should paginate users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?skip=0&take=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('User Password Management', () => {
    it('PATCH /users/:id - can update password', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          password: 'newpassword123',
        })
        .expect(HttpStatus.OK);
    });

    it('POST /auth/login - should work with updated password', async () => {
      // Create new user first
      const userRes = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'passwordtest@sportsline.com',
          password: 'initialpassword',
          firstName: 'Password',
          lastName: 'Test',
        });

      const testUserId = userRes.body.data.id;

      // Update password
      await request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          password: 'newpassword123',
        });

      // Try login with new password
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'passwordtest@sportsline.com',
          password: 'newpassword123',
        })
        .expect(HttpStatus.OK);

      expect(loginRes.body.data).toHaveProperty('accessToken');
    });
  });

  describe('User Activity Tracking', () => {
    it('GET /users/:id - user should have lastLogin timestamp', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveProperty('lastLogin');
    });

    it('GET /users/:id - user should have createdAt timestamp', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveProperty('createdAt');
    });
  });

  describe('User Avatar Management', () => {
    it('PATCH /users/:id - should update user avatar', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          avatar: 'https://example.com/avatar.jpg',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.avatar).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('User Email Verification', () => {
    it('POST /users - new user should have email unverified initially', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'unverified@sportsline.com',
          password: 'password123',
          firstName: 'Unverified',
          lastName: 'User',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.data).toHaveProperty('emailVerified');
    });
  });

  describe('User Deactivation', () => {
    it('PATCH /users/:id - admin can deactivate user', async () => {
      // Create user to deactivate
      const userRes = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'deactivate@sportsline.com',
          password: 'password123',
          firstName: 'Deactivate',
          lastName: 'Me',
        });

      const testUserId = userRes.body.data.id;

      // Deactivate user
      const response = await request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.isActive).toBe(false);
    });

    it('POST /auth/login - deactivated user cannot login', async () => {
      // Create user
      const userRes = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'cannotlogin@sportsline.com',
          password: 'password123',
          firstName: 'NoLogin',
          lastName: 'User',
        });

      const testUserId = userRes.body.data.id;

      // Deactivate user
      await request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false,
        });

      // Try to login
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'cannotlogin@sportsline.com',
          password: 'password123',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
