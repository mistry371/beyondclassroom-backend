const express = require('express');
const router = express.Router();
const { getLiveClasses } = require('../controllers/liveClassController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getLiveClasses);

module.exports = router;
