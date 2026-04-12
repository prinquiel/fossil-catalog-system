const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMain');
const c = require('../controllers/studyControllerMain');

router.get('/', c.getStudies);
router.get('/fossil/:fossilId', c.getStudiesByFossil);
router.get('/:id', c.getStudyById);
router.post('/', protect, c.createStudy);
router.put('/:id', protect, c.updateStudy);
router.delete('/:id', protect, c.deleteStudy);

module.exports = router;
