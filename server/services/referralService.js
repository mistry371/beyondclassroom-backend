const { db } = require('../database/db')

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
  await db.read()
  const normalized = String(code).trim().toUpperCase()
  return db.data.promoters?.find(
    (p) => p.referralCode?.toUpperCase() === normalized && p.status === 'active'
  ) || null
}

exports.recordReferralSignup = async (referralCode, user) => {
  const promoter = await exports.findPromoterByCode(referralCode)
  if (!promoter) return null

  await db.read()

  const existing = db.data.referrals?.find((r) => r.userId === user._id)
  if (existing) return existing

  db.data.referrals = db.data.referrals || []
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
  db.data.referrals.push(referral)

  const pIdx = db.data.promoters.findIndex((p) => p._id === promoter._id)
  if (pIdx !== -1) {
    db.data.promoters[pIdx].referrals = (db.data.promoters[pIdx].referrals || 0) + 1
    db.data.promoters[pIdx].studentsJoined = (db.data.promoters[pIdx].studentsJoined || 0) + 1
    db.data.promoters[pIdx].rank = computeRank(db.data.promoters[pIdx].referrals)
    db.data.promoters[pIdx].updatedAt = new Date()
  }

  const uIdx = db.data.users.findIndex((u) => u._id === user._id)
  if (uIdx !== -1) {
    db.data.users[uIdx].referredByPromoterId = promoter._id
    db.data.users[uIdx].referralCode = promoter.referralCode
  }

  await db.write()
  return referral
}

exports.recordReferralCommission = async (userId, orderAmount, orderId, paymentId) => {
  await db.read()
  const user = db.data.users?.find((u) => u._id === userId)
  if (!user?.referredByPromoterId) return null

  let referral = db.data.referrals?.find(
    (r) => r.userId === userId && r.promoterId === user.referredByPromoterId
  )
  if (!referral) return null

  if (referral.status === 'paid') return referral

  const pIdx = db.data.promoters.findIndex((p) => p._id === user.referredByPromoterId)
  if (pIdx === -1) return null

  const promoter = db.data.promoters[pIdx]
  const rate = promoter.commissionRate ?? 0.2
  const commission = Math.round(orderAmount * rate)

  const rIdx = db.data.referrals.findIndex((r) => r._id === referral._id)
  db.data.referrals[rIdx].status = 'paid'
  db.data.referrals[rIdx].orderId = orderId
  db.data.referrals[rIdx].paymentId = paymentId
  db.data.referrals[rIdx].orderAmount = orderAmount
  db.data.referrals[rIdx].commissionAmount = commission
  db.data.referrals[rIdx].convertedAt = new Date()

  db.data.promoters[pIdx].earnings = (promoter.earnings || 0) + commission
  db.data.promoters[pIdx].pendingPayout = (promoter.pendingPayout || 0) + commission
  db.data.promoters[pIdx].rank = computeRank(db.data.promoters[pIdx].referrals || 0)
  db.data.promoters[pIdx].updatedAt = new Date()

  await db.write()
  return db.data.referrals[rIdx]
}

exports.getLeaderboard = async (limit = 10) => {
  await db.read()
  const promoters = (db.data.promoters || [])
    .filter((p) => p.status === 'active')
    .sort((a, b) => (b.earnings || 0) - (a.earnings || 0))
    .slice(0, limit)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name?.split(' ')[0] + ' ' + (p.name?.split(' ')[1]?.[0] || '') + '.',
      referrals: p.referrals || 0,
      earnings: `₹${(p.earnings || 0).toLocaleString('en-IN')}`,
    }))
  return promoters
}

exports.sanitizePromoter = (p) => ({
  id: p._id,
  name: p.name,
  email: p.email,
  phone: p.phone,
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
  milestones: getMilestones(p),
})

exports.getPromoterDashboard = async (promoterId) => {
  await db.read()
  const promoter = db.data.promoters?.find((p) => p._id === promoterId)
  if (!promoter) return null

  const referrals = (db.data.referrals || [])
    .filter((r) => r.promoterId === promoterId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 50)

  const payouts = (db.data.promoterPayouts || [])
    .filter((p) => p.promoterId === promoterId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

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

  return {
    promoter: exports.sanitizePromoter(promoter),
    referrals,
    payouts,
    history,
    chartBars,
  }
}

exports.computeRank = computeRank
exports.getMilestones = getMilestones
