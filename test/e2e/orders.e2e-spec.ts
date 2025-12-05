import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { GatewayModule } from '../src/gateway/gateway.module';

describe('Orders E2E Tests', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let orderId: string;
  let userId: string;
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

    // Get user ID from profile
    const profileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${userToken}`);
    userId = profileRes.body.data.id;

    // Create a product for order items
    const productRes = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        stock: 100,
      });
    productId = productRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Order CRUD Operations', () => {
    it('POST /orders - user should create order', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          status: 'pending',
          shippingAddress: '123 Main St, City, State 12345',
          items: [
            {
              productId: productId,
              quantity: 2,
              price: 99.99,
            },
          ],
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.userId).toBe(userId);
      orderId = response.body.data.id;
    });

    it('GET /orders - user should retrieve their orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('GET /orders/:id - user should retrieve order by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.userId).toBe(userId);
    });

    it('PATCH /orders/:id - user should update order status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'confirmed',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.status).toBe('confirmed');
    });

    it('DELETE /orders/:id - user should delete own order', async () => {
      // Create order to delete
      const createRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          status: 'pending',
          shippingAddress: '456 Oak Ave, Town, State 54321',
          items: [
            {
              productId: productId,
              quantity: 1,
              price: 99.99,
            },
          ],
        });

      const deleteId = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/orders/${deleteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('Order Authorization', () => {
    it('GET /orders/:id - user cannot access other user orders', async () => {
      // Create a second user token
      const otherUserLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'other@sportsline.com', password: 'other123' });

      const otherUserToken = otherUserLogin.body.data.accessToken;

      await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('PATCH /orders/:id - admin should update any order', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'shipped',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.status).toBe('shipped');
    });
  });

  describe('Order Filtering and Search', () => {
    it('GET /orders?status=pending - should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        response.body.data.forEach((order: any) => {
          expect(order.status).toBe('pending');
        });
      }
    });

    it('GET /orders?startDate=2024-01-01&endDate=2025-12-31 - should filter by date range', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders?startDate=2024-01-01&endDate=2025-12-31')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /orders?skip=0&take=10 - should paginate results', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders?skip=0&take=10')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Order Validation', () => {
    it('POST /orders - should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /orders - should validate shipping address', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          status: 'pending',
          shippingAddress: '', // Empty address
          items: [
            {
              productId: productId,
              quantity: 1,
              price: 99.99,
            },
          ],
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /orders - should validate items array', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          status: 'pending',
          shippingAddress: '123 Main St, City, State',
          items: [], // Empty items
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /orders - should validate item quantity', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          status: 'pending',
          shippingAddress: '123 Main St, City, State',
          items: [
            {
              productId: productId,
              quantity: 0, // Invalid quantity
              price: 99.99,
            },
          ],
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Order Status Progression', () => {
    it('Order status should progress: pending -> confirmed -> shipped -> delivered', async () => {
      // Create new order
      const createRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          status: 'pending',
          shippingAddress: '789 Elm St, City, State',
          items: [
            {
              productId: productId,
              quantity: 1,
              price: 99.99,
            },
          ],
        });

      const newOrderId = createRes.body.data.id;
      let orderRes = createRes;

      // Verify initial status
      expect(orderRes.body.data.status).toBe('pending');

      // Update to confirmed
      orderRes = await request(app.getHttpServer())
        .patch(`/orders/${newOrderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'confirmed' });
      expect(orderRes.body.data.status).toBe('confirmed');

      // Update to shipped
      orderRes = await request(app.getHttpServer())
        .patch(`/orders/${newOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped' });
      expect(orderRes.body.data.status).toBe('shipped');

      // Update to delivered
      orderRes = await request(app.getHttpServer())
        .patch(`/orders/${newOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'delivered' });
      expect(orderRes.body.data.status).toBe('delivered');
    });
  });

  describe('Order Calculations', () => {
    it('Order total should be calculated correctly', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          status: 'pending',
          shippingAddress: '321 Pine St, City, State',
          items: [
            {
              productId: productId,
              quantity: 2,
              price: 99.99,
            },
          ],
        })
        .expect(HttpStatus.CREATED);

      const total = response.body.data.total;
      expect(total).toBeCloseTo(199.98, 2);
    });
  });
});
