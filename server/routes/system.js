const express = require('express');
const router = express.Router();
const {
  checkPayments,
  razorpayDebug,
  fixCourses,
  checkUser,
  recoverMissingCourses,
  reseedDemo,
  healthCheck,
  zoomTest
} = require('../controllers/systemController');
const { protect } = require('../middleware/auth');

// Health check (public)
router.get('/health', healthCheck);

// System/recovery routes
router.get('/check-payments', checkPayments);
router.get('/razorpay-debug', razorpayDebug);
router.get('/fix-courses', fixCourses);
router.get('/check-user/:id', checkUser);
router.get('/recover-missing-courses', recoverMissingCourses);
router.post('/reseed-demo', reseedDemo);

// Zoom test (protected)
router.get('/zoom/test', protect, zoomTest);

module.exports = router;
