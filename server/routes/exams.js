const express = require('express')
const router = express.Router()
const examController = require('../controllers/examController')
const { protect, admin } = require('../middleware/auth')

// Student
router.get('/published', examController.listPublished)

// Admin
router.get('/admin/all', protect, admin, examController.adminGetAll)
router.post('/admin', protect, admin, examController.create)
router.get('/admin/:examId/analytics', protect, admin, examController.analytics)
router.put('/admin/:id', protect, admin, examController.update)
router.delete('/admin/:id', protect, admin, examController.remove)

module.exports = router
