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
  updateUserRoles,
  activateUser,
  deactivateUser,
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
  getUserStats,
} = require('../controllers/userController');

// Rutas fijas antes de `GET /` y `/:id` para evitar colisiones con parámetros.
router.get('/stats', protect, authorize('admin'), getUserStats);
router.get('/pending', protect, authorize('admin'), getPendingRegistrations);
router.get('/', protect, authorize('admin'), getAllUsers);
router.post('/', protect, authorize('admin'), createUser);
router.patch('/:id/role', protect, authorize('admin'), changeUserRole);
router.patch('/:id/roles', protect, authorize('admin'), updateUserRoles);
router.patch('/:id/activate', protect, authorize('admin'), activateUser);
router.patch('/:id/deactivate', protect, authorize('admin'), deactivateUser);
router.patch('/:id/approve-registration', protect, authorize('admin'), approveRegistration);
router.patch('/:id/reject-registration', protect, authorize('admin'), rejectRegistration);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
