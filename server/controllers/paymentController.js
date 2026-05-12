const Razorpay = require('razorpay')
const crypto = require('crypto')
const { db } = require('../database/db')

// Lazy init — only create instance when keys are available
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.')
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  })
}

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { courseId, amount } = req.body
    const userId = req.user._id

    // Create Razorpay order
    const razorpay = getRazorpay()
    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        courseId,
        userId
      }
    }

    const order = await razorpay.orders.create(options)

    // Save order to database
    await db.read()
    db.data.payments = db.data.payments || []
    
    const payment = {
      _id: `payment-${Date.now()}`,
      userId,
      courseId,
      amount,
      currency: 'INR',
      razorpayOrderId: order.id,
      status: 'pending',
      createdAt: new Date()
    }

    db.data.payments.push(payment)
    await db.write()

    res.json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    })
  }
}

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId
    } = req.body

    const userId = req.user._id

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex')

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      })
    }

    // Payment verified - Update database
    await db.read()

    // Update payment status
    const paymentIndex = db.data.payments.findIndex(
      p => p.razorpayOrderId === razorpay_order_id
    )

    if (paymentIndex !== -1) {
      db.data.payments[paymentIndex].status = 'success'
      db.data.payments[paymentIndex].razorpayPaymentId = razorpay_payment_id
      db.data.payments[paymentIndex].razorpaySignature = razorpay_signature
      db.data.payments[paymentIndex].updatedAt = new Date()
    }

    // Grant course access - Add to user's purchasedCourses (consistent with rest of app)
    const userIndex = db.data.users.findIndex(u => u._id === userId)
    if (userIndex !== -1) {
      db.data.users[userIndex].purchasedCourses = db.data.users[userIndex].purchasedCourses || []
      if (!db.data.users[userIndex].purchasedCourses.includes(courseId)) {
        db.data.users[userIndex].purchasedCourses.push(courseId)
      }
    }

    // Create order record
    db.data.orders = db.data.orders || []
    const order = {
      _id: `order-${Date.now()}`,
      userId,
      courses: [courseId],
      totalAmount: db.data.payments[paymentIndex].amount,
      paymentId: razorpay_payment_id,
      status: 'completed',
      createdAt: new Date()
    }
    db.data.orders.push(order)

    // Initialize progress tracking
    db.data.progress = db.data.progress || []
    const progress = {
      _id: `progress-${Date.now()}`,
      userId,
      courseId,
      completionPercentage: 0,
      lessonsCompleted: [],
      lastAccessedAt: new Date(),
      enrolledAt: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
    db.data.progress.push(progress)

    await db.write()

    res.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order._id
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    })
  }
}

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id

    await db.read()
    const payments = db.data.payments?.filter(p => p.userId === userId) || []

    // Populate course details
    const paymentsWithCourses = payments.map(payment => {
      const course = db.data.courses?.find(c => c._id === payment.courseId)
      return {
        ...payment,
        course: course ? {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail
        } : null
      }
    })

    res.json({
      success: true,
      payments: paymentsWithCourses
    })
  } catch (error) {
    console.error('Get payment history error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    })
  }
}

// Check Course Access
exports.checkCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user._id

    await db.read()

    // Check if user has purchased the course
    const user = db.data.users?.find(u => u._id === userId)
    const hasAccess = user?.purchasedCourses?.includes(courseId) || false

    // Check if trial is active
    const trial = db.data.trials?.find(
      t => t.userId === userId && t.courseId === courseId && t.isActive
    )

    const isTrialActive = trial && new Date(trial.endDate) > new Date()

    res.json({
      success: true,
      hasAccess: hasAccess || isTrialActive,
      isTrial: isTrialActive && !hasAccess,
      trialEndsAt: trial?.endDate
    })
  } catch (error) {
    console.error('Check course access error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check course access',
      error: error.message
    })
  }
}

// Start Free Trial
exports.startFreeTrial = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user._id

    await db.read()

    // Check if trial already exists
    const existingTrial = db.data.trials?.find(
      t => t.userId === userId && t.courseId === courseId
    )

    if (existingTrial) {
      return res.status(400).json({
        success: false,
        message: 'Trial already used for this course'
      })
    }

    // Check if user already purchased
    const user = db.data.users?.find(u => u._id === userId)
    if (user?.purchasedCourses?.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'You already have access to this course'
      })
    }

    // Create trial
    db.data.trials = db.data.trials || []
    const trial = {
      _id: `trial-${Date.now()}`,
      userId,
      courseId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      isActive: true,
      accessedLessons: [],
      createdAt: new Date()
    }

    db.data.trials.push(trial)
    await db.write()

    res.json({
      success: true,
      message: 'Free trial activated',
      trial
    })
  } catch (error) {
    console.error('Start trial error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to start trial',
      error: error.message
    })
  }
}
