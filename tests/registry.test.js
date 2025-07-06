const request = require('supertest');
const express = require('express');
const registryRouter = require('../routes/registry');

describe('GET /registry', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use('/api/v1/registry', registryRouter);
  });
  it('должен возвращать реестр с уникальным номером и ASN', async () => {
    const res1 = await request(app).get('/api/v1/registry');
    const res2 = await request(app).get('/api/v1/registry');
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body.data.registryId).not.toBe(res2.body.data.registryId);
    expect(Array.isArray(res1.body.data.asn)).toBe(true);
    expect(res1.body.data.asn.length).toBeGreaterThan(0);
    expect(res1.body.success).toBe(true);
  });
}); 