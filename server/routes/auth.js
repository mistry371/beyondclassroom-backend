const express = require('express');
const router = express.Router();
const { register, login, guestLogin, forgotPassword, verifyOTP, resetPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/guest', guestLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);

module.exports = router;
