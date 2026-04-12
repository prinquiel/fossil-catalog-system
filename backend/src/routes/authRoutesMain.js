const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMain');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authControllerMain');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
