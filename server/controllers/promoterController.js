const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { db } = require('../database/db')
const referralService = require('../services/referralService')
const normalizePhone = (value) => String(value || '').replace(/\D/g, '')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

const generatePromoterToken = (id) =>
  jwt.sign({ id, type: 'promoter' }, process.env.JWT_SECRET || 'beyond-classroom-fallback-secret-change-in-production', { expiresIn: '30d' })

const ensureUniqueCode = async (name) => {
  await db.read()
  let code = referralService.generateReferralCode(name)
  let attempts = 0
  while (db.data.promoters?.some((p) => p.referralCode === code) && attempts < 10) {
    code = referralService.generateReferralCode(name)
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

    await db.read()
    if (db.data.promoters?.some((p) => normalizePhone(p.phone) === phoneNorm)) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered as promoter' })
    }
    if (db.data.users?.some((u) => normalizePhone(u.phone) === phoneNorm)) {
      return res.status(400).json({ success: false, message: 'Mobile number already used for student account' })
    }
    if (emailNorm && db.data.promoters?.some((p) => p.email === emailNorm)) {
      return res.status(400).json({ success: false, message: 'Email already registered as promoter' })
    }
    if (emailNorm && db.data.users?.some((u) => u.email === emailNorm)) {
      return res.status(400).json({ success: false, message: 'Email already used for student account' })
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
      createdAt: new Date(),
      lastLoginAt: new Date(),
    }

    db.data.promoters = db.data.promoters || []
    db.data.promoters.push(promoter)
    await db.write()

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

    await db.read()
    let promoter = null
    if (phoneNorm) {
      promoter = db.data.promoters?.find((p) => normalizePhone(p.phone) === phoneNorm)
    }
    if (!promoter && emailNorm) {
      promoter = db.data.promoters?.find((p) => p.email === emailNorm)
    }
    if (!promoter) {
      const userAccount = db.data.users?.find((u) =>
        (phoneNorm && normalizePhone(u.phone) === phoneNorm) ||
        (emailNorm && u.email?.toLowerCase().trim() === emailNorm)
      )
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

    const idx = db.data.promoters.findIndex((p) => p._id === promoter._id)
    db.data.promoters[idx].lastLoginAt = new Date()
    await db.write()

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
    await db.read()
    const referrals = (db.data.referrals || [])
      .filter((r) => r.promoterId === req.promoter._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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

    await db.read()
    const idx = db.data.promoters.findIndex((p) => p._id === req.promoter._id)
    const promoter = db.data.promoters[idx]

    if (amt > (promoter.pendingPayout || 0)) {
      return res.status(400).json({ success: false, message: 'Insufficient pending balance' })
    }

    db.data.promoterPayouts = db.data.promoterPayouts || []
    const payout = {
      _id: generateId(),
      promoterId: promoter._id,
      amount: amt,
      status: 'pending',
      createdAt: new Date(),
    }
    db.data.promoterPayouts.push(payout)

    db.data.promoters[idx].pendingPayout = (promoter.pendingPayout || 0) - amt
    db.data.promoters[idx].updatedAt = new Date()
    await db.write()

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      payout,
      pendingPayout: db.data.promoters[idx].pendingPayout,
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
    await db.read()
    const promoters = (db.data.promoters || []).map((p) => ({
      ...referralService.sanitizePromoter(p),
      createdAt: p.createdAt,
    }))
    res.json({ success: true, promoters })
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

    await db.read()
    const pIdx = db.data.promoterPayouts?.findIndex((p) => p._id === req.params.id)
    if (pIdx === -1) {
      return res.status(404).json({ success: false, message: 'Payout not found' })
    }

    const payout = db.data.promoterPayouts[pIdx]
    if (payout.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Payout already processed' })
    }

    db.data.promoterPayouts[pIdx].status = status
    db.data.promoterPayouts[pIdx].note = note || ''
    db.data.promoterPayouts[pIdx].processedAt = new Date()

    const promIdx = db.data.promoters.findIndex((p) => p._id === payout.promoterId)
    if (promIdx !== -1 && status === 'rejected') {
      db.data.promoters[promIdx].pendingPayout = (db.data.promoters[promIdx].pendingPayout || 0) + payout.amount
    }
    if (promIdx !== -1 && (status === 'approved' || status === 'paid')) {
      db.data.promoters[promIdx].totalPaidOut = (db.data.promoters[promIdx].totalPaidOut || 0) + payout.amount
    }

    await db.write()
    res.json({ success: true, payout: db.data.promoterPayouts[pIdx] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.adminListPayouts = async (req, res) => {
  try {
    await db.read()
    const payouts = (db.data.promoterPayouts || [])
      .map((p) => {
        const promoter = db.data.promoters?.find((pr) => pr._id === p.promoterId)
        return { ...p, promoterName: promoter?.name, promoterEmail: promoter?.email }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json({ success: true, payouts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
