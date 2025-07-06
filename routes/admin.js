const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * @api {get} /api/v1/admin/stats Get Statistics
 * @apiName GetStats
 * @apiGroup Admin
 */
router.get('/stats', (req, res, next) => {
    db.get('SELECT COUNT(*) as packages FROM event_packages', (err, packagesResult) => {
        if (err) return next(err);
        
        db.get('SELECT COUNT(*) as events FROM events', (err, eventsResult) => {
            if (err) return next(err);
            
            res.json({
                success: true,
                data: {
                    packages: packagesResult.packages,
                    events: eventsResult.events
                }
            });
        });
    });
});

/**
 * @api {get} /api/v1/admin/events Get All Event Packages
 * @apiName GetAllEvents
 * @apiGroup Admin
 */
router.get('/events', (req, res, next) => {
    const query = `
        SELECT 
            ep.id,
            ep.tid,
            ep.sent_at,
            COUNT(e.id) as events_count
        FROM event_packages ep
        LEFT JOIN events e ON ep.id = e.package_id
        GROUP BY ep.id
        ORDER BY ep.sent_at DESC
    `;
    
    db.all(query, (err, rows) => {
        if (err) return next(err);
        
        res.json({
            success: true,
            data: rows,
            stats: {
                packages: rows.length,
                events: rows.reduce((sum, row) => sum + row.events_count, 0)
            }
        });
    });
});

/**
 * @api {get} /api/v1/admin/events/:id Get Event Package Details
 * @apiName GetEventDetails
 * @apiGroup Admin
 */
router.get('/events/:id', (req, res, next) => {
    const packageId = req.params.id;
    
    db.get('SELECT * FROM event_packages WHERE id = ?', [packageId], (err, packageData) => {
        if (err) return next(err);
        if (!packageData) {
            return res.status(404).json({
                success: false,
                error: 'Package not found',
                code: 'PACKAGE_NOT_FOUND'
            });
        }
        
        db.all('SELECT * FROM events WHERE package_id = ? ORDER BY timestamp', [packageId], (err, events) => {
            if (err) return next(err);
            
            res.json({
                success: true,
                data: {
                    ...packageData,
                    events: events.map(event => ({
                        ...event,
                        data: JSON.parse(event.data)
                    }))
                }
            });
        });
    });
});

/**
 * @api {get} /api/v1/admin/asn Get ASN List
 * @apiName GetASNList
 * @apiGroup Admin
 */
router.get('/asn', (req, res) => {
    // В реальном приложении ASN хранились бы в БД
    const asnList = [
        '0107003900002300',
        '0107003900004100',
        '0107003900015700'
    ];
    
    res.json({
        success: true,
        data: asnList
    });
});

/**
 * @api {post} /api/v1/admin/asn Update ASN List
 * @apiName UpdateASNList
 * @apiGroup Admin
 */
router.post('/asn', (req, res) => {
    const { asnList } = req.body;
    
    if (!Array.isArray(asnList)) {
        return res.status(400).json({
            success: false,
            error: 'ASN list must be an array',
            code: 'VALIDATION_ERROR'
        });
    }
    
    // В реальном приложении сохраняли бы в БД
    res.json({
        success: true,
        data: { message: 'ASN list updated' }
    });
});

module.exports = router; 