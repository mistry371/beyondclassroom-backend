const express = require('express')
const router = express.Router()
const promoterController = require('../controllers/promoterController')
const { protectPromoter } = require('../middleware/promoterAuth')
const jwt = require('jsonwebtoken')
const { db } = require('../database/db')

const adminOnly = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return res.status(401).json({ message: 'Not authorized' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret')
    await db.read()
    req.user = db.data.users.find((u) => u._id === decoded.id)
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin only' })
    }
    next()
  } catch {
    res.status(401).json({ message: 'Not authorized' })
  }
}

// Public
router.get('/leaderboard', promoterController.getLeaderboard)
router.get('/validate/:code', promoterController.validateCode)
router.post('/track-click', promoterController.trackClick)

// Promoter auth
router.post('/register', promoterController.register)
router.post('/login', promoterController.login)

// Promoter dashboard (protected)
router.get('/dashboard', protectPromoter, promoterController.getDashboard)
router.get('/referrals', protectPromoter, promoterController.getReferrals)
router.post('/withdraw', protectPromoter, promoterController.requestWithdrawal)

// Admin
router.get('/admin/list', adminOnly, promoterController.adminListPromoters)
router.get('/admin/payouts', adminOnly, promoterController.adminListPayouts)
router.put('/admin/payouts/:id', adminOnly, promoterController.adminProcessPayout)

module.exports = router
