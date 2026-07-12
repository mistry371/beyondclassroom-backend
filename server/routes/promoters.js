const express = require('express')
const router = express.Router()
const promoterController = require('../controllers/promoterController')
const { protectPromoter } = require('../middleware/promoterAuth')
const { admin, protect } = require('../middleware/auth')

// Public
router.get('/leaderboard', promoterController.getLeaderboard)
router.get('/validate/:code', promoterController.validateCode)
router.post('/track-click', promoterController.trackClick)

// Promoter auth
router.post('/register', promoterController.register)
router.post('/login', promoterController.login)
router.post('/forgot-password', promoterController.forgotPassword)
router.post('/reset-password', promoterController.resetPassword)

// Promoter dashboard (protected)
router.get('/dashboard', protectPromoter, promoterController.getDashboard)
router.get('/referrals', protectPromoter, promoterController.getReferrals)
router.post('/withdraw', protectPromoter, promoterController.requestWithdrawal)
router.put('/profile', protectPromoter, promoterController.updateProfile)
router.put('/bank-details', protectPromoter, promoterController.updateBankDetails)
router.put('/kyc', protectPromoter, promoterController.submitKyc)
router.put('/kyc-doc/delete', protectPromoter, promoterController.deleteKycDoc)
router.put('/change-password', protectPromoter, promoterController.changePassword)

// Admin
router.get('/admin/list', protect, admin, promoterController.adminListPromoters)
router.get('/admin/promoter/:id', protect, admin, promoterController.adminGetPromoterDetail)
router.get('/admin/payouts', protect, admin, promoterController.adminListPayouts)
router.get('/admin/payouts/:id', protect, admin, promoterController.adminGetPayoutDetail)
router.put('/admin/payouts/:id', protect, admin, promoterController.adminProcessPayout)
router.get('/admin/kyc', protect, admin, promoterController.adminListKyc)
router.put('/admin/:id/kyc', protect, admin, promoterController.adminReviewKyc)

module.exports = router
