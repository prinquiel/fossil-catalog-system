const express = require('express');
const router = express.Router();
const { protect, protectOptional, authorize } = require('../middleware/authMain');
const uploadStudyComposition = require('../middleware/uploadStudyComposition');
const c = require('../controllers/studyControllerMain');

function studyMultipart(req, res, next) {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    return uploadStudyComposition.single('composition_image')(req, res, next);
  }
  next();
}

// Lecturas públicas (catálogo sin cuenta) — rutas específicas antes de /public/:id
router.get('/public/fossil/:fossilId', c.getPublicStudiesByFossil);
router.get('/public', c.getPublicStudiesCatalog);
router.get('/public/:id', c.getPublicStudyById);

router.get('/admin/pending', protect, authorize('admin'), c.getPendingStudies);

router.post('/', protect, authorize('researcher', 'admin'), studyMultipart, c.createStudy);
router.patch('/:id/publish', protect, authorize('admin'), c.publishStudy);
router.patch('/:id/reject', protect, authorize('admin'), c.rejectStudy);
router.put('/:id', protect, authorize('researcher', 'admin'), studyMultipart, c.updateStudy);
router.delete('/:id', protect, authorize('researcher', 'admin'), c.deleteStudy);

router.get('/', protect, c.getStudies);
router.get('/fossil/:fossilId', protect, c.getStudiesByFossil);
router.get('/:id', protectOptional, c.getStudyById);

module.exports = router;
