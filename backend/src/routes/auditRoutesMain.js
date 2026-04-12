const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMain');
const c = require('../controllers/auditControllerMain');

router.get('/', protect, authorize('admin'), c.getAuditLogs);
router.get('/user/:userId', protect, authorize('admin'), c.getAuditByUser);
router.get('/table/:tableName', protect, authorize('admin'), c.getAuditByTable);
router.get('/:id', protect, authorize('admin'), c.getAuditById);

module.exports = router;
