const request = require('supertest');
const app = require('../../src/server');

describe('GET /api/health - Health & Status Check Endpoint', () => {
  it('should return 200 OK with server health diagnostic details', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'online');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('environment');
    expect(response.body).toHaveProperty('database');
    expect(response.body).toHaveProperty('memoryUsage');
    expect(response.body).toHaveProperty('endpoints');
  });

  it('should return 200 OK on alias root endpoint /api', async () => {
    const response = await request(app).get('/api');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('online');
  });
});
