const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMain');
const {
  getEras,
  getPeriods,
  getGeologyByFossil,
  setGeologyForFossil,
} = require('../controllers/geologyController');
const { createEra, createPeriod } = require('../controllers/geologyControllerMain');

router.get('/eras', getEras);
router.post('/eras', protect, createEra);
router.get('/periods', getPeriods);
router.post('/periods', protect, createPeriod);
router.get('/periods/era/:eraId', getPeriods);

router.get('/fossil/:fossilId', getGeologyByFossil);
router.post('/fossil/:fossilId', protect, setGeologyForFossil);
router.put('/fossil/:fossilId', protect, setGeologyForFossil);

module.exports = router;
