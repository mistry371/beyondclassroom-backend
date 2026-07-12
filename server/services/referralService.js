const { db, models } = require('../database/db')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

const RANK_THRESHOLDS = [
  { rank: 'Platinum', referrals: 50 },
  { rank: 'Gold', referrals: 25 },
  { rank: 'Silver', referrals: 10 },
  { rank: 'Bronze', referrals: 0 },
]

function computeRank(referrals) {
  for (const t of RANK_THRESHOLDS) {
    if (referrals >= t.referrals) return t.rank
  }
  return 'Bronze'
}

function getMilestones(promoter) {
  return [
    { label: '5 Referrals', target: 5, current: promoter.referrals || 0 },
    { label: '₹10K Earnings', target: 10000, current: promoter.earnings || 0 },
    { label: '20 Students', target: 20, current: promoter.studentsJoined || 0 },
  ]
}

exports.generateReferralCode = (name) => {
  const base = (name || 'BC').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'BC'
  return `${base}${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

exports.findPromoterByCode = async (code) => {
  if (!code) return null
  const normalized = String(code).trim().toUpperCase()
  return await models.promoters.findOne({
    referralCode: new RegExp(`^${normalized}$`, 'i'),
    status: 'active'
  }).lean() || null
}

exports.recordReferralSignup = async (referralCode, user) => {
  const promoter = await exports.findPromoterByCode(referralCode)
  if (!promoter) return null

  const existing = await models.referrals.findOne({ userId: user._id }).lean()
  if (existing) return existing

  const referral = {
    _id: generateId(),
    promoterId: promoter._id,
    referralCode: promoter.referralCode,
    userId: user._id,
    userEmail: user.email,
    userName: user.name,
    status: 'registered',
    commissionAmount: 0,
    createdAt: new Date(),
  }
  
  await models.referrals.create(referral)
  if (db.data.referrals) db.data.referrals.push(referral)

  const newReferrals = (promoter.referrals || 0) + 1
  const newStudentsJoined = (promoter.studentsJoined || 0) + 1
  const newRank = computeRank(newReferrals)

  await models.promoters.updateOne(
    { _id: promoter._id },
    { $set: { referrals: newReferrals, studentsJoined: newStudentsJoined, rank: newRank, updatedAt: new Date() } }
  )
  if (db.data.promoters) {
    const pIdx = db.data.promoters.findIndex((p) => p._id === promoter._id)
    if (pIdx !== -1) {
      db.data.promoters[pIdx].referrals = newReferrals
      db.data.promoters[pIdx].studentsJoined = newStudentsJoined
      db.data.promoters[pIdx].rank = newRank
      db.data.promoters[pIdx].updatedAt = new Date()
    }
  }

  await models.users.updateOne(
    { _id: user._id },
    { $set: { referredByPromoterId: promoter._id, referralCode: promoter.referralCode } }
  )
  if (db.data.users) {
    const uIdx = db.data.users.findIndex((u) => u._id === user._id)
    if (uIdx !== -1) {
      db.data.users[uIdx].referredByPromoterId = promoter._id
      db.data.users[uIdx].referralCode = promoter.referralCode
    }
  }

  return referral
}

exports.recordReferralCommission = async (userId, orderAmount, orderId, paymentId) => {
  const user = await models.users.findOne({ _id: userId }).lean()
  if (!user?.referredByPromoterId) return null

  let referral = await models.referrals.findOne({
    userId: userId,
    promoterId: user.referredByPromoterId
  }).lean()
  
  if (!referral) return null
  if (referral.status === 'paid') return referral

  const promoter = await models.promoters.findOne({ _id: user.referredByPromoterId }).lean()
  if (!promoter) return null

  const rate = promoter.commissionRate ?? 0.2
  const commission = Math.round(orderAmount * rate)

  const updatedReferral = await models.referrals.findOneAndUpdate(
    { _id: referral._id },
    { 
      $set: {
        status: 'paid',
        orderId,
        paymentId,
        orderAmount,
        commissionAmount: commission,
        convertedAt: new Date()
      }
    },
    { new: true }
  ).lean()

  if (db.data.referrals) {
    const rIdx = db.data.referrals.findIndex((r) => r._id === referral._id)
    if (rIdx !== -1) Object.assign(db.data.referrals[rIdx], updatedReferral)
  }

  const newEarnings = (promoter.earnings || 0) + commission
  const newPendingPayout = (promoter.pendingPayout || 0) + commission
  const newRank = computeRank(promoter.referrals || 0)

  await models.promoters.updateOne(
    { _id: promoter._id },
    { 
      $set: {
        earnings: newEarnings,
        pendingPayout: newPendingPayout,
        rank: newRank,
        updatedAt: new Date()
      }
    }
  )

  if (db.data.promoters) {
    const pIdx = db.data.promoters.findIndex((p) => p._id === promoter._id)
    if (pIdx !== -1) {
      db.data.promoters[pIdx].earnings = newEarnings
      db.data.promoters[pIdx].pendingPayout = newPendingPayout
      db.data.promoters[pIdx].rank = newRank
      db.data.promoters[pIdx].updatedAt = new Date()
    }
  }

  return updatedReferral
}

// Credit the promoter who owns a promo code when a student purchases using it.
// Unlike recordReferralCommission (one-time, keyed to signup referral), this fires
// on EVERY purchase that uses the code, creating one commission record per order.
//
// Business rule (#5): the promoter's commission IS the discount the student received
// (e.g. 10% off ₹1000 → ₹100 discount → ₹100 commission). `amounts` carries both the
// final orderAmount (for reporting) and the discountAmount (the commission value).
exports.recordPromoCodeCommission = async (promoCode, userId, amounts, orderId, paymentId) => {
  if (!promoCode) return null
  const { orderAmount = 0, discountAmount = 0 } = (typeof amounts === 'object' && amounts) ? amounts : { orderAmount: amounts }

  const promo = await models.promoCodes.findOne({
    code: String(promoCode).trim().toUpperCase()
  }).lean()
  if (!promo || !promo.assignedTo) return null // code not tied to any promoter

  const promoter = await models.promoters.findOne({ _id: promo.assignedTo }).lean()
  if (!promoter || promoter.status !== 'active') return null

  // Idempotency guard — never credit the same order twice (e.g. on re-verify).
  const already = await models.referrals.findOne({ orderId, promoterId: promoter._id, source: 'promo' }).lean()
  if (already) return already

  const user = await models.users.findOne({ _id: userId }).lean()

  // Commission = discount given to the student. Fall back to rate*order only if the
  // discount wasn't recorded (older orders), so no commission is silently lost.
  const commission = discountAmount > 0
    ? Math.round(discountAmount)
    : Math.round((orderAmount || 0) * (promoter.commissionRate ?? 0.2))

  const referral = {
    _id: generateId(),
    promoterId: promoter._id,
    referralCode: promoter.referralCode,
    userId,
    userEmail: user?.email || '',
    userName: user?.name || 'Customer',
    status: 'paid',
    source: 'promo',
    promoCode: promo.code,
    orderId,
    paymentId,
    orderAmount,
    commissionAmount: commission,
    createdAt: new Date(),
    convertedAt: new Date(),
  }
  await models.referrals.create(referral)
  if (db.data.referrals) db.data.referrals.push(referral)

  const newReferrals = (promoter.referrals || 0) + 1
  const newStudentsJoined = (promoter.studentsJoined || 0) + 1
  const newEarnings = (promoter.earnings || 0) + commission
  const newPendingPayout = (promoter.pendingPayout || 0) + commission
  const newRank = computeRank(newReferrals)

  await models.promoters.updateOne(
    { _id: promoter._id },
    { $set: {
      referrals: newReferrals,
      studentsJoined: newStudentsJoined,
      earnings: newEarnings,
      pendingPayout: newPendingPayout,
      rank: newRank,
      updatedAt: new Date(),
    }}
  )
  if (db.data.promoters) {
    const pIdx = db.data.promoters.findIndex((p) => p._id === promoter._id)
    if (pIdx !== -1) {
      Object.assign(db.data.promoters[pIdx], {
        referrals: newReferrals,
        studentsJoined: newStudentsJoined,
        earnings: newEarnings,
        pendingPayout: newPendingPayout,
        rank: newRank,
      })
    }
  }

  return referral
}

exports.getLeaderboard = async (limit = 10) => {
  const promoters = await models.promoters.find({ status: 'active' })
    .sort({ earnings: -1 })
    .limit(limit)
    .lean()
    
  return promoters.map((p, i) => ({
    rank: i + 1,
    name: p.name?.split(' ')[0] + ' ' + (p.name?.split(' ')[1]?.[0] || '') + '.',
    referrals: p.referrals || 0,
    earnings: `₹${(p.earnings || 0).toLocaleString('en-IN')}`,
  }))
}

exports.sanitizePromoter = (p) => ({
  id: p._id,
  name: p.name,
  email: p.email,
  phone: p.phone,
  address: p.address || '',
  city: p.city || '',
  state: p.state || '',
  pincode: p.pincode || '',
  referralCode: p.referralCode,
  referralLink: `${process.env.FRONTEND_URL || 'https://beyondclassroom.netlify.app'}/auth/register?ref=${p.referralCode}`,
  status: p.status,
  commissionRate: p.commissionRate,
  referrals: p.referrals || 0,
  studentsJoined: p.studentsJoined || 0,
  earnings: p.earnings || 0,
  pendingPayout: p.pendingPayout || 0,
  totalPaidOut: p.totalPaidOut || 0,
  streak: p.streak || 0,
  rank: p.rank || 'Bronze',
  bankDetails: p.bankDetails || {},
  kyc: p.kyc || { status: 'pending' },
  milestones: getMilestones(p),
})

exports.getPromoterDashboard = async (promoterId) => {
  const promoter = await models.promoters.findOne({ _id: promoterId }).lean()
  if (!promoter) return null

  const referrals = await models.referrals.find({ promoterId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  const payouts = await models.promoterPayouts.find({ promoterId })
    .sort({ createdAt: -1 })
    .lean()

  const history = [
    ...payouts.map((p) => ({
      type: 'withdrawal',
      amount: p.amount,
      date: p.createdAt,
      status: p.status,
    })),
    ...referrals
      .filter((r) => r.commissionAmount > 0)
      .map((r) => ({
        type: 'commission',
        amount: r.commissionAmount,
        date: r.convertedAt || r.createdAt,
        status: 'completed',
        userName: r.userName,
      })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30)

  const weeklyPerformance = [0, 0, 0, 0, 0, 0, 0]
  const now = new Date()
  referrals.forEach((r) => {
    const d = new Date(r.createdAt)
    const daysAgo = Math.floor((now - d) / (24 * 60 * 60 * 1000))
    if (daysAgo >= 0 && daysAgo < 7) weeklyPerformance[6 - daysAgo] += 1
  })
  const max = Math.max(...weeklyPerformance, 1)
  const chartBars = weeklyPerformance.map((v) => Math.round((v / max) * 100))

  const totalReferrals = referrals.length
  const converted = referrals.filter((r) => r.status === 'paid').length
  const conversionRate = totalReferrals ? Math.round((converted / totalReferrals) * 100) : 0

  const badges = []
  if ((promoter.referrals || 0) >= 1) badges.push({ id: 'first', label: 'First Referral', icon: '🎯' })
  if ((promoter.referrals || 0) >= 10) badges.push({ id: 'ten', label: '10 Referrals', icon: '🔥' })
  if ((promoter.earnings || 0) >= 10000) badges.push({ id: 'earner', label: '₹10K Earner', icon: '💰' })
  if ((promoter.streak || 0) >= 7) badges.push({ id: 'streak', label: '7-Day Streak', icon: '⚡' })

  return {
    promoter: exports.sanitizePromoter(promoter),
    referrals,
    payouts,
    history,
    chartBars,
    conversionRate,
    badges,
  }
}

exports.computeRank = computeRank
exports.getMilestones = getMilestones
