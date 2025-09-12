// server/tests/auth.test.js
import request from 'supertest';
import app from '../src/app.js';
import { clearDatabase, createTestUser } from './helpers.js';

describe('Authentication API', () => {
  beforeEach(clearDatabase);

  test('POST /auth/signup creates new user with USER role by default', async () => {
    const response = await request(app)
      .post('/auth/signup')
      .send({ 
        email: 'test@example.com', 
        password: 'Password123!' 
      });
    
    expect(response.status).toBe(201);
    expect(response.body.role).toBe('USER');
  });

  test('POST /auth/login returns JWT token for valid credentials', async () => {
    await createTestUser({ email: 'login@example.com' });
    
    const response = await request(app)
      .post('/auth/login')
      .send({ 
        email: 'login@example.com', 
        password: 'password' 
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });
});