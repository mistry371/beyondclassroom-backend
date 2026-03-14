const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  checkCourseAccess,
  startFreeTrial
} = require('../controllers/paymentController')

// All routes require authentication
router.use(protect)

// Create Razorpay order
router.post('/create-order', createOrder)

// Verify payment
router.post('/verify', verifyPayment)

// Get payment history
router.get('/history', getPaymentHistory)

// Check course access
router.get('/access/:courseId', checkCourseAccess)

// Start free trial
router.post('/trial', startFreeTrial)

module.exports = router
