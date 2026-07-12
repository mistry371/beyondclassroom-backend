const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { db, models } = require('../database/db')
const referralService = require('../services/referralService')
const { sendEmail } = require('../services/emailService')
const promoterEmails = require('../services/emailTemplates')
const normalizePhone = (value) => String(value || '').replace(/\D/g, '')

// Fire-and-forget promoter email — never blocks or fails the API response.
const notifyPromoter = (to, subject, html) => {
  if (!to) return
  Promise.resolve().then(() => sendEmail({ to, subject, html })).catch(() => {})
}

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
    const amt = Number(amount)

    // No minimum withdrawal limit (#6) — any positive amount up to the balance.
    if (!amt || amt <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid withdrawal amount',
      })
    }

    const promoter = await models.promoters.findOne({ _id: req.promoter._id }).lean()
    if (!promoter) {
      return res.status(404).json({ success: false, message: 'Promoter not found' })
    }

    if (amt > (promoter.pendingPayout || 0)) {
      return res.status(400).json({ success: false, message: 'Insufficient balance for this withdrawal amount' })
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

    notifyPromoter(
      promoter.email,
      'Withdrawal request received',
      promoterEmails.promoterWithdrawalRequestedTemplate(promoter.name, amt, updatedPromoter.pendingPayout)
    )

    res.json({
      success: true,
      message: 'Your withdrawal request has been submitted successfully. The amount will be credited to your registered bank account within 24 hours after verification.',
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

    if (promoter) {
      notifyPromoter(
        promoter.email,
        status === 'rejected' ? 'Withdrawal update' : 'Withdrawal paid',
        promoterEmails.promoterWithdrawalProcessedTemplate(promoter.name, payout.amount, status, note)
      )
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
    const promoters = await models.promoters.find({ _id: { $in: promoterIds } })
      .select('name email _id kyc pendingPayout earnings').lean()

    const mapped = payouts.map((p) => {
        const promoter = promoters.find((pr) => pr._id === p.promoterId)
        return {
          ...p,
          promoterName: promoter?.name,
          promoterEmail: promoter?.email,
          kycStatus: promoter?.kyc?.status || 'pending',
          promoterBalance: promoter?.pendingPayout || 0,
        }
      })

    res.json({ success: true, payouts: mapped })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Full detail for one withdrawal request (#8): promoter, bank, KYC, earnings,
// remaining balance, transaction history, student purchases, performance.
exports.adminGetPayoutDetail = async (req, res) => {
  try {
    const payout = await models.promoterPayouts.findOne({ _id: req.params.id }).lean()
    if (!payout) return res.status(404).json({ success: false, message: 'Withdrawal request not found' })

    const promoter = await models.promoters.findOne({ _id: payout.promoterId }).lean()
    if (!promoter) return res.status(404).json({ success: false, message: 'Promoter not found' })

    const [referrals, payoutHistory] = await Promise.all([
      models.referrals.find({ promoterId: promoter._id }).sort({ createdAt: -1 }).limit(500).lean(),
      models.promoterPayouts.find({ promoterId: promoter._id }).sort({ createdAt: -1 }).lean(),
    ])

    // Student purchases that generated commission through this promoter.
    const studentPurchases = referrals
      .filter((r) => (r.commissionAmount || 0) > 0)
      .map((r) => ({
        userName: r.userName,
        userEmail: r.userEmail,
        source: r.source || 'referral',
        promoCode: r.promoCode || null,
        orderAmount: r.orderAmount || 0,
        commissionAmount: r.commissionAmount || 0,
        date: r.convertedAt || r.createdAt,
      }))

    const totalPaidOut = promoter.totalPaidOut || 0
    const performance = {
      referrals: promoter.referrals || 0,
      studentsJoined: promoter.studentsJoined || 0,
      totalCommissionEntries: studentPurchases.length,
      rank: promoter.rank || 'Bronze',
      commissionRate: promoter.commissionRate ?? 0.2,
      memberSince: promoter.createdAt,
      lastLoginAt: promoter.lastLoginAt,
    }

    res.json({
      success: true,
      detail: {
        payout,
        promoter: referralService.sanitizePromoter(promoter),
        bankDetails: promoter.bankDetails || {},
        kyc: promoter.kyc || { status: 'pending' },
        totalEarnings: promoter.earnings || 0,
        totalPaidOut,
        withdrawalAmount: payout.amount,
        remainingBalance: promoter.pendingPayout || 0,
        payoutHistory,
        studentPurchases,
        performance,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin: list all KYC submissions, optionally filtered by status (#1).
exports.adminListKyc = async (req, res) => {
  try {
    const { status } = req.query
    const query = {}
    if (status && status !== 'all') query['kyc.status'] = status
    else query['kyc.status'] = { $in: ['submitted', 'verified', 'rejected', 'resubmit'] }

    const promoters = await models.promoters.find(query).sort({ 'kyc.submittedAt': -1, updatedAt: -1 }).limit(500).lean()
    const items = promoters.map((p) => ({
      promoterId: p._id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      referralCode: p.referralCode,
      kyc: p.kyc || { status: 'pending' },
      bankDetails: p.bankDetails || {},
    }))
    res.json({ success: true, kyc: items })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Admin verifies, rejects, or requests re-submission of a promoter's KYC (#1).
exports.adminReviewKyc = async (req, res) => {
  try {
    const { status, reason } = req.body // 'verified' | 'rejected' | 'resubmit'
    if (!['verified', 'rejected', 'resubmit'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be verified, rejected, or resubmit' })
    }
    const promoter = await models.promoters.findOne({ _id: req.params.id }).lean()
    if (!promoter) return res.status(404).json({ success: false, message: 'Promoter not found' })

    const note = status === 'verified' ? '' : (reason || (status === 'resubmit' ? 'Please re-upload clearer documents' : 'Documents could not be verified'))
    const kyc = {
      ...(promoter.kyc || {}),
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user?._id || 'admin',
      rejectionReason: note,
      history: [...(promoter.kyc?.history || []), { status, note, at: new Date().toISOString(), by: 'admin' }],
    }
    const updated = await models.promoters.findOneAndUpdate(
      { _id: promoter._id },
      { $set: { kyc, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean()

    const subjectMap = { verified: 'KYC verified', rejected: 'KYC needs attention', resubmit: 'KYC document re-submission requested' }
    notifyPromoter(
      updated.email,
      subjectMap[status],
      promoterEmails.promoterKycStatusTemplate(updated.name, status, note)
    )

    res.json({ success: true, message: `KYC ${status}`, promoter: referralService.sanitizePromoter(updated) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, city, state, pincode } = req.body
    let updates = { updatedAt: new Date().toISOString() }

    if (name) updates.name = name.trim()
    if (email) updates.email = String(email).toLowerCase().trim()
    if (phone) {
      const phoneNorm = normalizePhone(phone)
      if (phoneNorm.length < 10) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' })
      }
      updates.phone = phoneNorm
    }
    if (address !== undefined) updates.address = address
    if (city !== undefined) updates.city = city
    if (state !== undefined) updates.state = state
    if (pincode !== undefined) updates.pincode = pincode

    const promoter = await models.promoters.findOneAndUpdate(
      { _id: req.promoter._id },
      { $set: updates },
      { new: true }
    ).lean()

    if (!promoter) return res.status(404).json({ success: false, message: 'Promoter not found' })

    res.json({ success: true, promoter: referralService.sanitizePromoter(promoter) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Save bank account details for payouts (#7)
exports.updateBankDetails = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, ifsc, bankName, upiId } = req.body
    const bankDetails = {
      accountHolderName: (accountHolderName || '').trim(),
      accountNumber: (accountNumber || '').trim(),
      ifsc: (ifsc || '').trim().toUpperCase(),
      bankName: (bankName || '').trim(),
      upiId: (upiId || '').trim(),
    }
    const hasBank = bankDetails.accountNumber && bankDetails.ifsc && bankDetails.accountHolderName
    if (!hasBank && !bankDetails.upiId) {
      return res.status(400).json({ success: false, message: 'Provide full bank details (account holder, number, IFSC) or a UPI ID' })
    }
    const promoter = await models.promoters.findOneAndUpdate(
      { _id: req.promoter._id },
      { $set: { bankDetails, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean()
    if (!promoter) return res.status(404).json({ success: false, message: 'Promoter not found' })
    res.json({ success: true, message: 'Bank details saved', promoter: referralService.sanitizePromoter(promoter) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Submit KYC documents for verification (#7)
exports.submitKyc = async (req, res) => {
  try {
    const { panNumber, panDocUrl, aadhaarNumber, aadhaarDocUrl, passbookDocUrl } = req.body
    const current = await models.promoters.findById(req.promoter._id).lean()
    if (!current) return res.status(404).json({ success: false, message: 'Promoter not found' })

    const kyc = {
      ...(current.kyc || {}),
      panNumber: panNumber !== undefined ? String(panNumber).trim().toUpperCase() : current.kyc?.panNumber,
      panDocUrl: panDocUrl !== undefined ? panDocUrl : current.kyc?.panDocUrl,
      aadhaarNumber: aadhaarNumber !== undefined ? String(aadhaarNumber).replace(/\s/g, '') : current.kyc?.aadhaarNumber,
      aadhaarDocUrl: aadhaarDocUrl !== undefined ? aadhaarDocUrl : current.kyc?.aadhaarDocUrl,
      passbookDocUrl: passbookDocUrl !== undefined ? passbookDocUrl : current.kyc?.passbookDocUrl,
    }
    // Mark as submitted once the core documents are present, resetting any prior rejection.
    const wasSubmitted = kyc.status
    if (kyc.panDocUrl && kyc.aadhaarDocUrl) {
      kyc.status = 'submitted'
      kyc.submittedAt = new Date().toISOString()
      kyc.rejectionReason = ''
      kyc.history = [...(current.kyc?.history || []), { status: 'submitted', note: 'Documents submitted by promoter', at: new Date().toISOString(), by: 'promoter' }]
    } else {
      kyc.status = current.kyc?.status === 'verified' ? 'verified' : 'pending'
    }

    const promoter = await models.promoters.findOneAndUpdate(
      { _id: req.promoter._id },
      { $set: { kyc, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean()

    // Notify admins of a new/updated KYC submission (#1).
    if (kyc.status === 'submitted' && wasSubmitted !== 'submitted') {
      try {
        await models.adminNotifications.create({
          _id: generateId(),
          title: 'New KYC submission',
          message: `${promoter.name} submitted KYC documents for verification.`,
          type: 'kyc',
          createdAt: new Date().toISOString(),
        })
      } catch (_) {}
    }

    res.json({ success: true, message: 'KYC submitted for verification', promoter: referralService.sanitizePromoter(promoter) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete a single KYC document (#7) — only allowed before verification.
exports.deleteKycDoc = async (req, res) => {
  try {
    const { field } = req.body // 'panDocUrl' | 'aadhaarDocUrl' | 'passbookDocUrl'
    const allowed = ['panDocUrl', 'aadhaarDocUrl', 'passbookDocUrl']
    if (!allowed.includes(field)) return res.status(400).json({ success: false, message: 'Invalid document field' })

    const current = await models.promoters.findById(req.promoter._id).lean()
    if (!current) return res.status(404).json({ success: false, message: 'Promoter not found' })
    if (current.kyc?.status === 'verified') {
      return res.status(400).json({ success: false, message: 'Verified documents cannot be deleted' })
    }

    const kyc = { ...(current.kyc || {}), [field]: '' }
    // Removing a required doc drops the record back to pending.
    if (!kyc.panDocUrl || !kyc.aadhaarDocUrl) kyc.status = 'pending'

    const promoter = await models.promoters.findOneAndUpdate(
      { _id: req.promoter._id },
      { $set: { kyc, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean()
    res.json({ success: true, message: 'Document removed', promoter: referralService.sanitizePromoter(promoter) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' })
    }

    const promoter = await models.promoters.findById(req.promoter._id).lean()
    if (!promoter) {
      return res.status(404).json({ success: false, message: 'Promoter not found' })
    }

    if (!(await bcrypt.compare(currentPassword, promoter.password))) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' })
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12)
    await models.promoters.updateOne(
      { _id: promoter._id },
      { $set: { password: newHashedPassword, updatedAt: new Date().toISOString() } }
    )

    res.json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ── Forgot / reset password (#6) — OTP based ──────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const emailNorm = String(req.body.email || '').toLowerCase().trim()
    if (!emailNorm) return res.status(400).json({ success: false, message: 'Email is required' })

    const promoter = await models.promoters.findOne({ email: emailNorm }).lean()
    // Always respond success to avoid leaking which emails are registered.
    if (!promoter) return res.json({ success: true, message: 'If that email is registered, an OTP has been sent.' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    await models.promoters.updateOne({ _id: promoter._id }, { $set: { passwordResetToken: otp, passwordResetExpires: expires } })

    const { sendEmail } = require('../services/emailService')
    const { otpEmailTemplate } = require('../services/emailTemplates')
    const result = await sendEmail({
      to: promoter.email,
      subject: 'Password Reset OTP - Beyond Classroom Promoter',
      html: otpEmailTemplate(otp, 'password_reset', '15 minutes'),
    })
    if (!result.success) {
      console.error('Promoter reset email not delivered:', result.error)
      return res.status(500).json({ success: false, message: 'We could not send the reset email right now. Please try again shortly.' })
    }
    res.json({ success: true, message: 'If that email is registered, an OTP has been sent.' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    const emailNorm = String(email || '').toLowerCase().trim()
    if (!emailNorm || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' })
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }
    const promoter = await models.promoters.findOne({ email: emailNorm }).lean()
    if (!promoter || !promoter.passwordResetToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' })
    }
    if (String(promoter.passwordResetToken) !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' })
    }
    if (!promoter.passwordResetExpires || new Date(promoter.passwordResetExpires) < new Date()) {
      return res.status(400).json({ success: false, message: 'This OTP has expired. Please request a new one.' })
    }

    const hash = await bcrypt.hash(newPassword, 12)
    await models.promoters.updateOne(
      { _id: promoter._id },
      { $set: { password: hash, updatedAt: new Date().toISOString() }, $unset: { passwordResetToken: '', passwordResetExpires: '' } }
    )
    res.json({ success: true, message: 'Password reset successfully. You can now log in.' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
