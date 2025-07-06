const request = require('supertest');
const express = require('express');
const adminRouter = require('../routes/admin');
const db = require('../db');
const uuid = require('uuid');

describe('Admin API', () => {
  let app;
  
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/admin', adminRouter);
  });
  
  afterAll(done => {
    db.close(done);
  });

  describe('GET /admin/stats', () => {
    it('должен возвращать статистику', async () => {
      const res = await request(app).get('/api/v1/admin/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('packages');
      expect(res.body.data).toHaveProperty('events');
    });
  });

  describe('GET /admin/events', () => {
    it('должен возвращать список пакетов событий', async () => {
      const res = await request(app).get('/api/v1/admin/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('stats');
    });
  });

  describe('GET /admin/events/:id', () => {
    it('должен возвращать 404 для несуществующего пакета', async () => {
      const res = await request(app).get(`/api/v1/admin/events/${uuid.v4()}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /admin/asn', () => {
    it('должен возвращать список ASN', async () => {
      const res = await request(app).get('/api/v1/admin/asn');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
}); 