const express = require('express');
const router = express.Router();
const { register, login, guestLogin, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/guest', guestLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
