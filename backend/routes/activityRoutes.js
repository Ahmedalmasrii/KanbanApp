const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAuditTrail } = require('../controllers/activityController');

// Route för audit trail – korrekt endpoint
router.get('/logs', auth, getAuditTrail);

module.exports = router;
