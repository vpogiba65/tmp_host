const express = require('express');
const db = require('../db');
const { validate, eventSchema } = require('../middleware/validation');
const router = express.Router();

/**
 * @api {post} /api/v1/events Submit Event Package
 * @apiName SubmitEvents
 * @apiGroup Events
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} id Package GUID
 * @apiParam {String} tid Terminal ID (8 chars, uppercase + digits)
 * @apiParam {String} sent_at ISO timestamp
 * @apiParam {Array} events Array of event objects
 * @apiParam {String} events.id Event GUID
 * @apiParam {Number} events.timestamp Unix timestamp (ms)
 * @apiParam {String} events.type Event type
 * @apiParam {Object} events.data Event data (JSON)
 * 
 * @apiSuccess {String} status Success status
 * @apiSuccess {String} packageId Package ID
 * @apiSuccess {Number} eventsCount Number of events processed
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "packageId": "uuid-here",
 *         "eventsCount": 1
 *       }
 *     }
 */
router.post('/', validate(eventSchema), (req, res, next) => {
  const { id, tid, sent_at, events } = req.body;
  
  db.serialize(() => {
    db.run(
      'INSERT INTO event_packages (id, tid, sent_at) VALUES (?, ?, ?)',
      [id, tid, sent_at],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({
              success: false,
              error: 'Package with this ID already exists',
              code: 'DUPLICATE_PACKAGE'
            });
          }
          return next(err);
        }

        const stmt = db.prepare(
          'INSERT INTO events (id, package_id, timestamp, type, data) VALUES (?, ?, ?, ?, ?)'
        );
        
        let insertedCount = 0;
        for (const ev of events) {
          stmt.run(ev.id, id, ev.timestamp, ev.type, JSON.stringify(ev.data), function(err) {
            if (err) {
              stmt.finalize();
              return next(err);
            }
            insertedCount++;
          });
        }
        
        stmt.finalize((err) => {
          if (err) return next(err);
          
          res.status(201).json({
            success: true,
            data: {
              packageId: id,
              eventsCount: insertedCount
            },
            meta: {
              timestamp: new Date().toISOString()
            }
          });
        });
      }
    );
  });
});

module.exports = router; 