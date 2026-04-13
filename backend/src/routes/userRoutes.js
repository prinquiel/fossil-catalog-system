const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMain');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  activateUser,
  deactivateUser,
  getUserStats,
} = require('../controllers/userController');

router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/stats', protect, authorize('admin'), getUserStats);
router.post('/', protect, authorize('admin'), createUser);
router.patch('/:id/role', protect, authorize('admin'), changeUserRole);
router.patch('/:id/activate', protect, authorize('admin'), activateUser);
router.patch('/:id/deactivate', protect, authorize('admin'), deactivateUser);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
