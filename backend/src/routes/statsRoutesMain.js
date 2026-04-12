const express = require('express');
const router = express.Router();
const c = require('../controllers/statsControllerMain');

router.get('/overview', c.getOverviewStats);
router.get('/fossils', c.getFossilStats);
router.get('/users', c.getUserStats);
router.get('/categories', c.getCategoryStats);
router.get('/timeline', c.getTimelineStats);

module.exports = router;
