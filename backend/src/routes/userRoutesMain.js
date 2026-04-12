const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMain');
const c = require('../controllers/userControllerMain');

router.get('/', protect, authorize('admin'), c.getUsers);
router.get('/:id', protect, c.getUserById);
router.post('/', protect, authorize('admin'), c.createUser);
router.put('/:id', protect, c.updateUser);
router.delete('/:id', protect, authorize('admin'), c.deleteUser);
router.patch('/:id/role', protect, authorize('admin'), c.updateUserRole);
router.patch('/:id/activate', protect, authorize('admin'), c.activateUser);
router.patch('/:id/deactivate', protect, authorize('admin'), c.deactivateUser);

module.exports = router;
