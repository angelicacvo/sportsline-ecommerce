import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { GatewayModule } from '../src/gateway/gateway.module';

describe('OrderItems E2E Tests', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let orderId: string;
  let orderItemId: string;
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
        name: 'Test Item Product',
        description: 'A product for testing order items',
        price: 49.99,
        stock: 100,
      });
    productId = productRes.body.data.id;

    // Create an order
    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        userId: userId,
        status: 'pending',
        shippingAddress: '100 Test St, City, State',
        items: [
          {
            productId: productId,
            quantity: 1,
            price: 49.99,
          },
        ],
      });
    orderId = orderRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('OrderItem CRUD Operations', () => {
    it('POST /orders/:id/items - user should add item to order', async () => {
      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 2,
          price: 49.99,
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.quantity).toBe(2);
      expect(response.body.data.price).toBe(49.99);
      orderItemId = response.body.data.id;
    });

    it('GET /orders/:id/items - should retrieve order items', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('GET /orders/:orderId/items/:itemId - should retrieve item by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}/items/${orderItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toBe(orderItemId);
      expect(response.body.data.orderId).toBe(orderId);
    });

    it('PATCH /orders/:orderId/items/:itemId - user should update item quantity', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/items/${orderItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 3,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.quantity).toBe(3);
    });

    it('DELETE /orders/:orderId/items/:itemId - user should remove item from order', async () => {
      // Create an item to delete
      const createRes = await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 1,
          price: 49.99,
        });

      const deleteId = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/orders/${orderId}/items/${deleteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('OrderItem Authorization', () => {
    it('POST /orders/:id/items - other user cannot add items to order', async () => {
      const otherUserLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'other@sportsline.com', password: 'other123' });

      const otherUserToken = otherUserLogin.body.data.accessToken;

      await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          productId: productId,
          quantity: 1,
          price: 49.99,
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /orders/:orderId/items/:itemId - other user cannot remove items', async () => {
      const otherUserLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'other@sportsline.com', password: 'other123' });

      const otherUserToken = otherUserLogin.body.data.accessToken;

      await request(app.getHttpServer())
        .delete(`/orders/${orderId}/items/${orderItemId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('PATCH /orders/:orderId/items/:itemId - admin can update any item', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/items/${orderItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: 5,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.quantity).toBe(5);
    });
  });

  describe('OrderItem Calculations', () => {
    it('Item total should be calculated correctly (quantity * price)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 3,
          price: 49.99,
        })
        .expect(HttpStatus.CREATED);

      const itemTotal = response.body.data.total;
      expect(itemTotal).toBeCloseTo(149.97, 2); // 3 * 49.99
    });

    it('Item discount should reduce total', async () => {
      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 2,
          price: 49.99,
          discount: 10, // 10% discount
        })
        .expect(HttpStatus.CREATED);

      const itemTotal = response.body.data.total;
      const expectedTotal = 2 * 49.99 * 0.9; // 2 * 49.99 * (1 - 0.1)
      expect(itemTotal).toBeCloseTo(expectedTotal, 2);
    });

    it('Item tax should be calculated correctly', async () => {
      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 1,
          price: 50.00,
          tax: 5, // 5% tax
        })
        .expect(HttpStatus.CREATED);

      const tax = response.body.data.tax;
      expect(tax).toBeCloseTo(2.5, 2); // 50 * 0.05
    });
  });

  describe('OrderItem Inventory Impact', () => {
    it('Creating order item should decrease product stock', async () => {
      // Get initial product stock
      const productBefore = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const stockBefore = productBefore.body.data.stock;

      // Create new order
      const newOrderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          status: 'pending',
          shippingAddress: '200 Test Ave, City, State',
          items: [
            {
              productId: productId,
              quantity: 5,
              price: 49.99,
            },
          ],
        });

      // Check product stock after
      const productAfter = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const stockAfter = productAfter.body.data.stock;
      expect(stockAfter).toBeLessThan(stockBefore);
    });

    it('Removing order item should increase product stock', async () => {
      // Create order with item
      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId,
          status: 'pending',
          shippingAddress: '300 Test Lane, City, State',
          items: [
            {
              productId: productId,
              quantity: 2,
              price: 49.99,
            },
          ],
        });

      const newOrderId = orderRes.body.data.id;

      // Get item
      const itemsRes = await request(app.getHttpServer())
        .get(`/orders/${newOrderId}/items`)
        .set('Authorization', `Bearer ${userToken}`);

      const itemId = itemsRes.body.data[0].id;

      // Get stock before deletion
      const productBefore = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const stockBefore = productBefore.body.data.stock;

      // Delete item
      await request(app.getHttpServer())
        .delete(`/orders/${newOrderId}/items/${itemId}`)
        .set('Authorization', `Bearer ${userToken}`);

      // Check stock after
      const productAfter = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const stockAfter = productAfter.body.data.stock;
      expect(stockAfter).toBeGreaterThan(stockBefore);
    });
  });

  describe('OrderItem Validation', () => {
    it('POST /orders/:id/items - should validate required fields', async () => {
      await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /orders/:id/items - should validate quantity is positive', async () => {
      await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: -1,
          price: 49.99,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /orders/:id/items - should validate price is positive', async () => {
      await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 1,
          price: -49.99,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /orders/:id/items - should validate product exists', async () => {
      await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: 'non-existent-id',
          quantity: 1,
          price: 49.99,
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('POST /orders/:id/items - should validate sufficient stock', async () => {
      await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 999999, // More than available stock
          price: 49.99,
        })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('OrderItem Product Snapshot', () => {
    it('OrderItem should store product details at time of creation', async () => {
      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: productId,
          quantity: 1,
          price: 49.99,
        })
        .expect(HttpStatus.CREATED);

      // Verify product snapshot data
      expect(response.body.data).toHaveProperty('productSnapshot');
      expect(response.body.data.productSnapshot).toHaveProperty('name');
      expect(response.body.data.productSnapshot).toHaveProperty('description');
      expect(response.body.data.productSnapshot.name).toBe('Test Item Product');
    });
  });
});
