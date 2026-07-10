const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { db, models } = require('../database/db')
const referralService = require('../services/referralService')
const normalizePhone = (value) => String(value || '').replace(/\D/g, '')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

const generatePromoterToken = (id) =>
  jwt.sign({ id, type: 'promoter' }, process.env.JWT_SECRET || 'beyond-classroom-fallback-secret-change-in-production', { expiresIn: '30d' })

const ensureUniqueCode = async (name) => {
  let code = referralService.generateReferralCode(name)
  let attempts = 0
  let exists = await models.promoters.findOne({ referralCode: code }).lean()
  while (exists && attempts < 10) {
    code = referralService.generateReferralCode(name)
    exists = await models.promoters.findOne({ referralCode: code }).lean()
    attempts++
  }
  return code
}

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body
    const phoneNorm = normalizePhone(phone)
    const emailNorm = email ? String(email).toLowerCase().trim() : ''
    if (!name || !phoneNorm || !password) {
      return res.status(400).json({ success: false, message: 'Name, mobile number and password are required' })
    }
    if (phoneNorm.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid mobile number' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const existingPhonePromoter = await models.promoters.findOne({ phone: phoneNorm }).lean()
    if (existingPhonePromoter) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered as promoter' })
    }
    const existingPhoneUser = await models.users.findOne({ phone: phoneNorm }).lean()
    if (existingPhoneUser) {
      return res.status(400).json({ success: false, message: 'Mobile number already used for student account' })
    }
    if (emailNorm) {
      const existingEmailPromoter = await models.promoters.findOne({ email: emailNorm }).lean()
      if (existingEmailPromoter) {
        return res.status(400).json({ success: false, message: 'Email already registered as promoter' })
      }
      const existingEmailUser = await models.users.findOne({ email: emailNorm }).lean()
      if (existingEmailUser) {
        return res.status(400).json({ success: false, message: 'Email already used for student account' })
      }
    }

    const referralCode = await ensureUniqueCode(name)
    const promoter = {
      _id: generateId(),
      name: name.trim(),
      email: emailNorm || null,
      phone: phoneNorm,
      password: await bcrypt.hash(password, 12),
      referralCode,
      status: 'active',
      commissionRate: 0.2,
      referrals: 0,
      studentsJoined: 0,
      earnings: 0,
      pendingPayout: 0,
      totalPaidOut: 0,
      streak: 0,
      rank: 'Bronze',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }

    await models.promoters.create(promoter)
    
    if (db.data.promoters) {
      db.data.promoters.push(promoter)
    }

    const token = generatePromoterToken(promoter._id)
    res.status(201).json({
      success: true,
      token,
      promoter: referralService.sanitizePromoter(promoter),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { phone, mobileNumber, email, password } = req.body
    const phoneNorm = normalizePhone(phone || mobileNumber)
    const emailNorm = email ? String(email).toLowerCase().trim() : ''
    if ((!phoneNorm && !emailNorm) || !password) {
      return res.status(400).json({ success: false, message: 'Mobile number and password required' })
    }

    let promoter = null
    if (phoneNorm) {
      promoter = await models.promoters.findOne({ phone: phoneNorm }).lean()
    }
    if (!promoter && emailNorm) {
      promoter = await models.promoters.findOne({ email: emailNorm }).lean()
    }
    if (!promoter) {
      let userAccount = null
      if (phoneNorm) {
        userAccount = await models.users.findOne({ phone: phoneNorm }).lean()
      }
      if (!userAccount && emailNorm) {
        userAccount = await models.users.findOne({ email: emailNorm }).lean()
      }
      if (userAccount) {
        return res.status(400).json({
          success: false,
          message: 'This email belongs to student/admin panel. Please use the correct login panel.',
        })
      }
    }
    if (!promoter || !(await bcrypt.compare(password, promoter.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }
    if (promoter.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended' })
    }

    await models.promoters.updateOne(
      { _id: promoter._id },
      { $set: { lastLoginAt: new Date().toISOString() } }
    )
    
    if (db.data.promoters) {
      const idx = db.data.promoters.findIndex((p) => p._id === promoter._id)
      if (idx !== -1) {
        db.data.promoters[idx].lastLoginAt = new Date().toISOString()
      }
    }

    res.json({
      success: true,
      token: generatePromoterToken(promoter._id),
      promoter: referralService.sanitizePromoter(promoter),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getDashboard = async (req, res) => {
  try {
    const data = await referralService.getPromoterDashboard(req.promoter._id)
    if (!data) return res.status(404).json({ success: false, message: 'Promoter not found' })
    res.json({ success: true, ...data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getReferrals = async (req, res) => {
  try {
    const referrals = await models.referrals.find({ promoterId: req.promoter._id }).sort({ createdAt: -1 }).limit(500).lean()
    res.json({ success: true, referrals })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body
    const amt = parseInt(amount, 10)
    const MIN_WITHDRAWAL = 500

    if (!amt || amt < MIN_WITHDRAWAL) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal is ₹${MIN_WITHDRAWAL}`,
      })
    }

    const promoter = await models.promoters.findOne({ _id: req.promoter._id }).lean()
    if (!promoter) {
      return res.status(404).json({ success: false, message: 'Promoter not found' })
    }

    if (amt > (promoter.pendingPayout || 0)) {
      return res.status(400).json({ success: false, message: 'Insufficient pending balance' })
    }

    const payout = {
      _id: generateId(),
      promoterId: promoter._id,
      amount: amt,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    
    await models.promoterPayouts.create(payout)

    const updatedPromoter = await models.promoters.findOneAndUpdate(
      { _id: promoter._id },
      { 
        $set: { 
          pendingPayout: (promoter.pendingPayout || 0) - amt,
          updatedAt: new Date().toISOString()
        } 
      },
      { new: true }
    ).lean()
    
    if (db.data.promoterPayouts) db.data.promoterPayouts.push(payout)
    
    if (db.data.promoters) {
      const idx = db.data.promoters.findIndex((p) => p._id === promoter._id)
      if (idx !== -1) {
        Object.assign(db.data.promoters[idx], updatedPromoter)
      }
    }

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      payout,
      pendingPayout: updatedPromoter.pendingPayout,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.validateCode = async (req, res) => {
  try {
    const promoter = await referralService.findPromoterByCode(req.params.code)
    if (!promoter) {
      return res.status(404).json({ success: false, message: 'Invalid referral code' })
    }
    res.json({
      success: true,
      valid: true,
      promoterName: promoter.name,
      code: promoter.referralCode,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10
    const leaderboard = await referralService.getLeaderboard(limit)
    res.json({ success: true, leaderboard })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.trackClick = async (req, res) => {
  try {
    const { code } = req.body
    const promoter = await referralService.findPromoterByCode(code)
    if (!promoter) {
      return res.status(404).json({ success: false, message: 'Invalid code' })
    }
    res.json({ success: true, referralLink: referralService.sanitizePromoter(promoter).referralLink })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin: list promoters
exports.adminListPromoters = async (req, res) => {
  try {
    const promoters = await models.promoters.find().sort({ createdAt: -1 }).limit(500).lean()
    const mapped = promoters.map((p) => ({
      ...referralService.sanitizePromoter(p),
      createdAt: p.createdAt,
    }))
    res.json({ success: true, promoters: mapped })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin: process payout
exports.adminProcessPayout = async (req, res) => {
  try {
    const { status, note } = req.body
    const allowed = ['approved', 'rejected', 'paid']
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const payout = await models.promoterPayouts.findOne({ _id: req.params.id }).lean()
    
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout not found' })
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Payout already processed' })
    }

    const updatedPayout = await models.promoterPayouts.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status, note: note || '', processedAt: new Date().toISOString() } },
      { new: true }
    ).lean()

    const promoter = await models.promoters.findOne({ _id: payout.promoterId }).lean()
    
    if (promoter) {
      const updates = {}
      if (status === 'rejected') {
        updates.pendingPayout = (promoter.pendingPayout || 0) + payout.amount
      } else if (status === 'approved' || status === 'paid') {
        updates.totalPaidOut = (promoter.totalPaidOut || 0) + payout.amount
      }
      
      if (Object.keys(updates).length > 0) {
        const updatedPromoter = await models.promoters.findOneAndUpdate(
          { _id: promoter._id },
          { $set: updates },
          { new: true }
        ).lean()
        
        if (db.data.promoters) {
          const promIdx = db.data.promoters.findIndex((p) => p._id === promoter._id)
          if (promIdx !== -1) Object.assign(db.data.promoters[promIdx], updatedPromoter)
        }
      }
    }
    
    if (db.data.promoterPayouts) {
      const pIdx = db.data.promoterPayouts.findIndex((p) => p._id === req.params.id)
      if (pIdx !== -1) Object.assign(db.data.promoterPayouts[pIdx], updatedPayout)
    }

    res.json({ success: true, payout: updatedPayout })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.adminListPayouts = async (req, res) => {
  try {
    const payouts = await models.promoterPayouts.find().sort({ createdAt: -1 }).limit(500).lean()
    const promoterIds = [...new Set(payouts.map(p => p.promoterId).filter(Boolean))]
    const promoters = await models.promoters.find({ _id: { $in: promoterIds } }).select('name email _id').lean()
    
    const mapped = payouts.map((p) => {
        const promoter = promoters.find((pr) => pr._id === p.promoterId)
        return { ...p, promoterName: promoter?.name, promoterEmail: promoter?.email }
      })
      
    res.json({ success: true, payouts: mapped })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
