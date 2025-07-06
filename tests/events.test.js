const request = require('supertest');
const express = require('express');
const eventsRouter = require('../routes/events');
const db = require('../db');
const uuid = require('uuid');

describe('POST /events', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/events', eventsRouter);
  });
  afterAll(done => {
    db.close(done);
  });
  it('должен принимать валидный пакет событий', async () => {
    const payload = {
      id: uuid.v4(),
      tid: 'TERM0001',
      sent_at: new Date().toISOString(),
      events: [
        {
          id: uuid.v4(),
          timestamp: Date.now(),
          type: 'TEST',
          data: { foo: 'bar' },
        },
      ],
    };
    const res = await request(app).post('/api/v1/events').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.packageId).toBe(payload.id);
    expect(res.body.data.eventsCount).toBe(1);
  });
}); 