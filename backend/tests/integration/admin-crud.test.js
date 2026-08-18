const request = require('supertest');
const app = require('../../src/server');

describe('Admin CRUD Operations (UMKM, Products, Feedback)', () => {
  let authToken = '';
  let testUmkmId = null;
  let testProductId = null;

  beforeAll(async () => {
    // Login to get token
    const loginPayload = {
      email: 'admin@korowelangkulon.desa.id',
      password: 'admin123',
    };
    const res = await request(app).post('/api/admin/login').send(loginPayload);
    authToken = res.body.token;
  });

  describe('UMKM CRUD', () => {
    it('should create a new UMKM', async () => {
      const umkmPayload = {
        name: 'UMKM Test Automation',
        owner: 'Tester',
        category: 'Kuliner',
        address: 'Jl. Test No. 1',
        phone: '081234567890',
        description: 'Testing description'
      };

      const res = await request(app)
        .post('/api/admin/umkm')
        .set('Authorization', `Bearer ${authToken}`)
        .send(umkmPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe(umkmPayload.name);
      testUmkmId = res.body.data.id;
    });

    it('should update an existing UMKM', async () => {
      const updatePayload = {
        name: 'UMKM Test Automation Updated'
      };

      const res = await request(app)
        .put(`/api/admin/umkm/${testUmkmId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(updatePayload.name);
    });
  });

  describe('Product CRUD', () => {
    it('should create a new Product', async () => {
      const productPayload = {
        umkmId: testUmkmId,
        name: 'Produk Test Automation',
        price: 15000,
        unit: 'pcs',
        description: 'Produk untuk testing'
      };

      const res = await request(app)
        .post('/api/admin/produk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe(productPayload.name);
      testProductId = res.body.data.id;
    });

    it('should update an existing Product', async () => {
      const updatePayload = {
        price: 20000
      };

      const res = await request(app)
        .put(`/api/admin/produk/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(updatePayload.price);
    });
  });

  describe('Delete Operations', () => {
    it('should delete the Product', async () => {
      const res = await request(app)
        .delete(`/api/admin/produk/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should delete the UMKM', async () => {
      const res = await request(app)
        .delete(`/api/admin/umkm/${testUmkmId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('User Feedback', () => {
    let feedbackId = null;

    it('should submit public feedback (user input)', async () => {
      const feedbackPayload = {
        name: 'User Tester',
        email: 'user@test.com',
        message: 'Ini feedback test'
      };

      const res = await request(app)
        .post('/api/public/feedback')
        .send(feedbackPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      feedbackId = res.body.data.id;
    });

    it('should view all feedbacks (admin)', async () => {
      const res = await request(app)
        .get('/api/admin/feedback')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      
      const foundFeedback = res.body.data.find(f => f.id === feedbackId);
      expect(foundFeedback).toBeDefined();
    });
  });
});
