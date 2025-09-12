// server/tests/orders.test.js
import request from 'supertest';
import app from '../src/app.js';
import { clearDatabase, createTestUser, createTestOrder } from './helpers.js';

describe('Orders API', () => {
  let userToken, adminToken, order;

  beforeEach(async () => {
    await clearDatabase();
    
    // Create test users
    const userResponse = await request(app)
      .post('/auth/signup')
      .send({ email: 'user@test.com', password: 'password123' });
    
    const adminResponse = await request(app)
      .post('/auth/signup')
      .send({ email: 'admin@test.com', password: 'password123', role: 'ADMIN' });
    
    userToken = userResponse.body.token;
    adminToken = adminResponse.body.token;

    // Create a test order
    order = await createTestOrder(userResponse.body.id, {
      clientToken: 'test-token-1'
    });
  });

  test('POST /orders creates new order', async () => {
    const response = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ sku: 'TEST-123', qty: 2 }],
        client_token: 'unique-token-1'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.items).toHaveLength(1);
  });

  test('POST /orders is idempotent with same client_token', async () => {
    const firstResponse = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ sku: 'TEST-123', qty: 2 }],
        client_token: 'idempotent-token'
      });
    
    const secondResponse = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ sku: 'DIFFERENT', qty: 5 }], // Different data
        client_token: 'idempotent-token' // Same token
      });
    
    expect(secondResponse.body.id).toBe(firstResponse.body.id);
    expect(secondResponse.body.items[0].sku).toBe('TEST-123'); // Original data
  });

  test('PATCH /orders/:id/status fails with stale version', async () => {
    const response = await request(app)
      .patch(`/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'PAID',
        version: order.version - 1 // Stale version
      });
    
    expect(response.status).toBe(409);
  });
});