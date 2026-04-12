const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMain');
const {
  getEras,
  getPeriods,
  getGeologyByFossil,
  setGeologyForFossil,
} = require('../controllers/geologyController');

router.get('/eras', getEras);
router.get('/periods', getPeriods);
router.get('/periods/era/:eraId', getPeriods);

router.get('/fossil/:fossilId', getGeologyByFossil);
router.post('/fossil/:fossilId', protect, setGeologyForFossil);
router.put('/fossil/:fossilId', protect, setGeologyForFossil);

module.exports = router;
