import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { GatewayModule } from '../src/gateway/gateway.module';

describe('Categories E2E Tests', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let categoryId: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Category CRUD Operations', () => {
    it('POST /categories - admin should create category', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Athletic Wear',
          description: 'All athletic wear and accessories',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Athletic Wear');
      categoryId = response.body.data.id;
    });

    it('GET /categories - should retrieve all categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /categories/:id - should retrieve category by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toBe(categoryId);
      expect(response.body.data.name).toBe('Athletic Wear');
    });

    it('PATCH /categories/:id - admin should update category', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated athletic wear and gear',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.description).toContain('Updated');
    });

    it('DELETE /categories/:id - admin should delete category', async () => {
      // Create a category to delete
      const createRes = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Category to Delete',
          description: 'This will be deleted',
        });

      const deleteId = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/categories/${deleteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('Category Authorization', () => {
    it('POST /categories - user should be forbidden', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Category',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('PATCH /categories/:id - user should be forbidden', async () => {
      await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'New Name' })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /categories/:id - user should be forbidden', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Category Validation', () => {
    it('POST /categories - should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /categories - should reject duplicate names', async () => {
      // Create first category
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Unique Category' });

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Unique Category' })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('Category Products', () => {
    it('GET /categories/:id/products - should get category products', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${categoryId}/products`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
