const express = require('express');
const router = express.Router();
const { register, login, guestLogin, forgotPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/guest', guestLogin);
router.post('/forgot-password', forgotPassword);

module.exports = router;
