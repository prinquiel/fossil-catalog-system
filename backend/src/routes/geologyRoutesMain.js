const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMain');
const c = require('../controllers/geologyControllerMain');

router.get('/eras', c.getEras);
router.get('/eras/:id', c.getEraById);
router.post('/eras', protect, c.createEra);

router.get('/periods', c.getPeriods);
router.get('/periods/era/:id', c.getPeriodsByEra);
router.post('/periods', protect, c.createPeriod);

router.post('/fossil/:fossilId', protect, c.createFossilGeology);
router.get('/fossil/:fossilId', c.getFossilGeology);
router.put('/fossil/:fossilId', protect, c.updateFossilGeology);

module.exports = router;
