import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { GatewayModule } from '../src/gateway/gateway.module';

describe('Products E2E Tests', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let productId: string;

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

  describe('Product CRUD Operations', () => {
    it('POST /products - admin should create product', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Running Shoes',
          description: 'High-quality running shoes',
          price: 99.99,
          categoryId: 1,
          stock: 50,
          sku: 'SHOES-001',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Running Shoes');
      productId = response.body.data.id;
    });

    it('GET /products - should retrieve all products', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('GET /products/:id - should retrieve product by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toBe(productId);
      expect(response.body.data.name).toBe('Running Shoes');
    });

    it('PATCH /products/:id - admin should update product', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 89.99,
          stock: 45,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.price).toBe(89.99);
      expect(response.body.data.stock).toBe(45);
    });

    it('DELETE /products/:id - admin should delete product', async () => {
      // Create a product to delete
      const createRes = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Product to Delete',
          price: 10.00,
          categoryId: 1,
          stock: 1,
        });

      const deleteId = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/products/${deleteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('Product Authorization', () => {
    it('POST /products - user should be forbidden', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Product',
          price: 99.99,
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('PATCH /products/:id - user should be forbidden', async () => {
      await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 50.00 })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /products/:id - user should be forbidden', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Product Search and Filter', () => {
    it('GET /products?search=shoe - should search products', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?search=shoe')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /products?categoryId=1 - should filter by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?categoryId=1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /products?minPrice=50&maxPrice=150 - should filter by price range', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?minPrice=50&maxPrice=150')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Product Validation', () => {
    it('POST /products - should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Incomplete Product' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /products - should validate price is positive', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Product',
          price: -10.00,
          categoryId: 1,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
