const express = require('express');
const dayjs = require('dayjs');
const router = express.Router();

let counter = 1;

// В реальном приложении ASN загружались бы из БД или конфига
const ASN_LIST = [
  '0107003900002300',
  '0107003900004100',
  '0107003900015700',
];

/**
 * @api {get} /api/v1/registry Get ASN Registry
 * @apiName GetRegistry
 * @apiGroup Registry
 * @apiVersion 1.0.0
 * 
 * @apiSuccess {String} registryId Unique registry identifier (NNNNN.YYMMDDhhmm)
 * @apiSuccess {Array} asn List of ASN card numbers
 * @apiSuccess {String} generatedAt ISO timestamp
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "registryId": "00001.2507061927",
 *       "asn": ["0107003900002300", "0107003900004100"],
 *       "generatedAt": "2024-01-01T12:00:00.000Z"
 *     }
 */
router.get('/', (req, res, next) => {
  try {
    const now = dayjs();
    const serial = String(counter).padStart(5, '0');
    const suffix = now.format('YYMMDDHHmm');
    const registryId = `${serial}.${suffix}`;
    counter++;

    res.json({
      success: true,
      data: {
        registryId,
        asn: ASN_LIST,
        generatedAt: now.toISOString()
      },
      meta: {
        count: ASN_LIST.length,
        version: '1.0.0'
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 