const request = require('supertest');
const app = require('../../src/server');

describe('Public API Endpoints (/api/public)', () => {
  it('GET /api/public/umkm - should return list of UMKMs with pagination metadata', async () => {
    const response = await request(app).get('/api/public/umkm');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body).toHaveProperty('totalCount');
    expect(response.body).toHaveProperty('totalPages');
    expect(response.body).toHaveProperty('currentPage');
  });

  it('GET /api/public/umkm with search filter - should return matching results', async () => {
    const response = await request(app).get('/api/public/umkm?search=Bandeng');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    if (response.body.data.length > 0) {
      expect(response.body.data[0].name.toLowerCase()).toContain('bandeng');
    }
  });

  it('GET /api/public/umkm/:id - should return specific UMKM detail by ID', async () => {
    const response = await request(app).get('/api/public/umkm/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id', 1);
    expect(response.body.data).toHaveProperty('name');
  });

  it('GET /api/public/umkm/:id - should return 404 for non-existent UMKM', async () => {
    const response = await request(app).get('/api/public/umkm/999999');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
  });

  it('GET /api/public/konten - should return dynamic site content', async () => {
    const response = await request(app).get('/api/public/konten');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('siteName');
  });

  it('POST /api/public/feedback - should submit public feedback successfully', async () => {
    const feedbackPayload = {
      name: 'Tes Warga Korowelang',
      email: 'warga.tes@example.com',
      message: 'Website portal desa ini sangat membantu UMKM lokal kami!',
    };

    const response = await request(app)
      .post('/api/public/feedback')
      .send(feedbackPayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('data');
  });

  it('POST /api/public/feedback - should reject invalid schema input (400 Bad Request)', async () => {
    const invalidPayload = {
      name: '',
      email: 'bukan-email',
      message: '',
    };

    const response = await request(app)
      .post('/api/public/feedback')
      .send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('errors');
  });
});
