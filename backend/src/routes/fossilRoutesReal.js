const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMain');
const {
  getFossils,
  getFossilById,
  createFossil,
  updateFossil,
  deleteFossil,
  getPendingFossils,
  approveFossil,
  rejectFossil,
  getFossilsMap,
} = require('../controllers/fossilControllerMain');

router.get('/', getFossils);
router.get('/map', getFossilsMap);
router.get('/admin/pending', protect, authorize('admin'), getPendingFossils);
router.patch('/:id/approve', protect, authorize('admin'), approveFossil);
router.patch('/:id/reject', protect, authorize('admin'), rejectFossil);
router.get('/:id', getFossilById);
router.post('/', protect, authorize('explorer', 'admin'), createFossil);
router.put('/:id', protect, authorize('explorer', 'admin'), updateFossil);
router.delete('/:id', protect, authorize('admin'), deleteFossil);

module.exports = router;
