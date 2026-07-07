const Razorpay = require('razorpay')
const crypto = require('crypto')
const { db, models } = require('../database/db')
const User = require('../models/User')

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
    const { courseId, packageId, amount: requestedAmount, selectedCourseIds, promoCode } = req.body
    const userId = req.user._id

    let originalAmount = 0;
    if (packageId) {
      const pkg = await models.packages.findOne({ _id: packageId }).lean();
      if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
      
      const basePrice = pkg.priceINR || 0;
      if (selectedCourseIds && Array.isArray(selectedCourseIds) && selectedCourseIds.length > 0) {
        originalAmount = basePrice * selectedCourseIds.length;
      } else {
        originalAmount = basePrice;
      }
    } else if (courseId) {
      const course = await models.courses.findOne({ _id: courseId }).lean();
      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
      originalAmount = course.price || 0;
    } else {
      return res.status(400).json({ success: false, message: 'Course or Package ID required' });
    }

    let finalAmount = originalAmount;
    let appliedPromo = null;

    if (promoCode) {
      const promo = await models.promoCodes.findOne({ code: promoCode.toUpperCase().trim() }).lean();
      if (promo && promo.active !== false && (!promo.expiryDate || new Date(promo.expiryDate) >= new Date()) && (!promo.usageLimit || promo.usedCount < promo.usageLimit)) {
        const rawDiscount = (originalAmount * promo.discountPercent) / 100;
        const discountAmount = Number(rawDiscount.toFixed(2));
        finalAmount = Number(Math.max(0, originalAmount - discountAmount).toFixed(2));
        appliedPromo = promo.code;
      }
    }

    let order;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (finalAmount === 0 || !keyId || !keySecret || keyId === 'your_razorpay_key_id') {
      // Mock order for free courses, local development, or missing keys
      order = {
        id: `order_mock_${Date.now()}`,
        amount: Math.round(finalAmount * 100),
        currency: 'INR'
      }
    } else {
      try {
        const razorpay = getRazorpay()
        const options = {
          amount: Math.round(finalAmount * 100), // amount in paise, rounded to integer
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            courseId: courseId || '',
            packageId: packageId || '',
            userId: userId.toString(),
            selectedCourseIds: Array.isArray(selectedCourseIds) ? selectedCourseIds.join(',') : ''
          }
        }
        order = await razorpay.orders.create(options)
      } catch (rzpErr) {
        console.warn('Razorpay API failed, falling back to mock order:', rzpErr.message);
        order = {
          id: `order_mock_${Date.now()}`,
          amount: Math.round(finalAmount * 100),
          currency: 'INR'
        }
      }
    }

    const payment = {
      _id: `payment-${Date.now()}`,
      userId,
      courseId,
      packageId,
      selectedCourseIds: Array.isArray(selectedCourseIds) ? selectedCourseIds : [],
      amount: finalAmount,
      promoCode: appliedPromo,
      currency: 'INR',
      razorpayOrderId: order.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    await models.payments.create(payment)

    if (db.data.payments) {
      db.data.payments.push(payment)
    }

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

    // Fetch payment record first to check for 100% discount (0 amount) mock orders
    const payment = await models.payments.findOne({ razorpayOrderId: razorpay_order_id }).lean()

    // Verify signature (bypass if amount is 0 and it's a mock order)
    if (process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id') {
      const isFreeMockOrder = payment && payment.amount === 0 && razorpay_order_id.startsWith('order_mock_')
      
      if (!isFreeMockOrder) {
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
      }
    }

    // Payment verified - Update database

    let purchasedCourseIds = [courseId].filter(Boolean)
    let packageId = null

    if (payment) {
      await models.payments.updateOne(
        { _id: payment._id },
        { $set: {
          status: 'success',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          updatedAt: new Date().toISOString()
        }}
      )
      
      if (db.data.payments) {
        const pIdx = db.data.payments.findIndex(p => p._id === payment._id)
        if (pIdx !== -1) {
          db.data.payments[pIdx].status = 'success'
          db.data.payments[pIdx].razorpayPaymentId = razorpay_payment_id
          db.data.payments[pIdx].razorpaySignature = razorpay_signature
          db.data.payments[pIdx].updatedAt = new Date().toISOString()
        }
      }
      
      packageId = payment.packageId
      
      // Increment promo code usage if applicable
      if (payment.promoCode) {
        const updatedPromo = await models.promoCodes.findOneAndUpdate(
          { code: payment.promoCode },
          { $inc: { usedCount: 1 } },
          { new: true }
        ).lean();
        
        if (db.data.promoCodes && updatedPromo) {
          const promoIdx = db.data.promoCodes.findIndex(p => p.code === payment.promoCode);
          if (promoIdx !== -1) {
            db.data.promoCodes[promoIdx].usedCount = updatedPromo.usedCount;
          }
        }
      }
    }

    // If a package was purchased, process it
    if (packageId) {
      const pkg = await models.packages.findById(packageId).lean()
      if (pkg) {
        // Only grant access to the specifically selected courses if provided, else all pkg courses (fallback)
        const coursesToGrant = (payment && payment.selectedCourseIds && payment.selectedCourseIds.length > 0)
          ? payment.selectedCourseIds
          : (pkg.courseIds || [])
          
        purchasedCourseIds = [...new Set([...purchasedCourseIds, ...coursesToGrant])]
        
        // Also add the package name/ID to purchasedCourses so customRequest limits work
        // getUserPackageLimits checks for 'beta', 'school', 'teachers', 'pro', 'basic' in purchasedCourses.
        purchasedCourseIds.push(pkg._id)
      }
    }

    // Grant course access - Add to user's purchasedCourses
    await models.users.updateOne(
      { _id: userId },
      { $addToSet: { purchasedCourses: { $each: purchasedCourseIds } } }
    )
    
    if (db.data.users) {
      const userIndex = db.data.users.findIndex(u => u._id === userId)
      if (userIndex !== -1) {
        db.data.users[userIndex].purchasedCourses = db.data.users[userIndex].purchasedCourses || []
        purchasedCourseIds.forEach(id => {
          if (!db.data.users[userIndex].purchasedCourses.includes(id)) {
            db.data.users[userIndex].purchasedCourses.push(id)
          }
        })
      }
    }

    // Create order record
    const orderRecord = {
      _id: `order-${Date.now()}`,
      userId,
      courses: purchasedCourseIds,
      packageId,
      totalAmount: payment ? payment.amount : 0,
      paymentId: razorpay_payment_id,
      status: 'completed',
      createdAt: new Date().toISOString()
    }
    
    await models.orders.create(orderRecord)
    if (db.data.orders) db.data.orders.push(orderRecord)

    // Initialize progress tracking for all purchased courses
    const progressPromises = purchasedCourseIds.map(async id => {
      const existingProgress = await models.progress.findOne({ userId, courseId: id }).lean()
      if (!existingProgress) {
        const prog = {
          _id: `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          courseId: id,
          completionPercentage: 0,
          lessonsCompleted: [],
          lastAccessedAt: new Date().toISOString(),
          enrolledAt: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        }
        await models.progress.create(prog)
        if (db.data.progress) db.data.progress.push(prog)
      }
    })
    
    await Promise.all(progressPromises)

    const paymentAmount = payment ? payment.amount : 0
    try {
      const referralService = require('../services/referralService')
      await referralService.recordReferralCommission(
        userId,
        paymentAmount,
        orderRecord._id,
        razorpay_payment_id
      )
    } catch (refErr) {
      console.error('Referral commission failed:', refErr.message)
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: orderRecord._id
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

    const payments = await models.payments.find({ userId }).sort({ createdAt: -1 }).lean()

    const courseIds = [...new Set(payments.flatMap(p => [p.courseId, ...(p.selectedCourseIds || [])]).filter(Boolean))]
    const packageIds = [...new Set(payments.map(p => p.packageId).filter(Boolean))]

    const courses = await models.courses.find({ _id: { $in: courseIds } }).select('title thumbnail _id').lean()
    const packages = await models.packages.find({ _id: { $in: packageIds } }).select('name _id').lean()

    // Populate course and package details
    const populatedPayments = payments.map(payment => {
      let courseDetails = null;
      let packageDetails = null;
      let selectedCoursesDetails = [];

      if (payment.courseId) {
        const c = courses.find(c => c._id === payment.courseId)
        if (c) courseDetails = { _id: c._id, title: c.title, thumbnail: c.thumbnail }
      }

      if (payment.packageId) {
        const pkg = packages.find(p => p._id === payment.packageId)
        if (pkg) packageDetails = { _id: pkg._id, name: pkg.name }
        
        if (payment.selectedCourseIds && payment.selectedCourseIds.length > 0) {
          selectedCoursesDetails = payment.selectedCourseIds.map(id => {
            const c = courses.find(c => c._id === id)
            return c ? { _id: c._id, title: c.title } : { _id: id, title: 'Unknown Course' }
          })
        }
      }

      return {
        ...payment,
        course: courseDetails,
        package: packageDetails,
        selectedCourses: selectedCoursesDetails
      }
    })

    res.json({
      success: true,
      payments: populatedPayments
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

    // Check if user has purchased the course
    const user = await models.users.findOne({ _id: userId }).lean()
    const hasAccess = user?.purchasedCourses?.includes(courseId) || false

    // Check if trial is active
    const trial = await models.trials.findOne({
      userId,
      courseId,
      isActive: true
    }).lean()

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

    // Check if trial already exists
    const existingTrial = await models.trials.findOne({ userId, courseId }).lean()

    if (existingTrial) {
      return res.status(400).json({
        success: false,
        message: 'Trial already used for this course'
      })
    }

    // Check if user already purchased
    const user = await models.users.findOne({ _id: userId }).lean()
    if (user?.purchasedCourses?.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'You already have access to this course'
      })
    }

    // Create trial
    const trial = {
      _id: `trial-${Date.now()}`,
      userId,
      courseId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      isActive: true,
      accessedLessons: [],
      createdAt: new Date().toISOString()
    }

    await models.trials.create(trial)
    if (db.data.trials) db.data.trials.push(trial)

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
