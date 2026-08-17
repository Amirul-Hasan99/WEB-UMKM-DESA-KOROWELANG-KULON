const request = require('supertest');
const app = require('../../src/server');

describe('Authentication & Admin API Endpoints (/api/admin)', () => {
  let authToken = '';

  it('POST /api/admin/login - should authenticate valid staff admin credentials', async () => {
    const loginPayload = {
      email: 'admin@kutoharjo.desa.id',
      password: 'admin123',
    };

    const response = await request(app)
      .post('/api/admin/login')
      .send(loginPayload);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');

    authToken = response.body.token;
  });

  it('POST /api/admin/login - should reject invalid credentials (401 Unauthorized)', async () => {
    const invalidPayload = {
      email: 'admin@kutoharjo.desa.id',
      password: 'wrongpassword',
    };

    const response = await request(app)
      .post('/api/admin/login')
      .send(invalidPayload);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/admin/profile - should reject requests without Authorization header (401)', async () => {
    const response = await request(app).get('/api/admin/profile');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/admin/profile - should allow authenticated staff with valid Bearer token', async () => {
    if (!authToken) return;

    const response = await request(app)
      .get('/api/admin/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('email', 'admin@kutoharjo.desa.id');
  });
});
