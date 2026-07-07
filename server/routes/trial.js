const express = require('express');
const router = express.Router();
const { getTrialStatus } = require('../controllers/trialController');
const { protect } = require('../middleware/auth');

router.get('/status', protect, getTrialStatus);

module.exports = router;
