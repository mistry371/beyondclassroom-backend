const express = require('express')
const router = express.Router()
const examController = require('../controllers/examController')
const jwt = require('jsonwebtoken')
const { db } = require('../database/db')

const protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return res.status(401).json({ message: 'Not authorized' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret')
    await db.read()
    req.user = db.data.users.find(u => u._id === decoded.id)
    if (!req.user) return res.status(401).json({ message: 'User not found' })
    next()
  } catch {
    res.status(401).json({ message: 'Not authorized' })
  }
}

const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'super_admin') return next()
  res.status(403).json({ success: false, message: 'Admin only' })
}

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/admin/all',          protect, isAdmin, examController.getAllExams)
router.get('/admin/:examId/analytics', protect, isAdmin, examController.getExamAnalytics)
router.post('/admin',             protect, isAdmin, examController.createExam)
router.put('/admin/:examId',      protect, isAdmin, examController.updateExam)
router.delete('/admin/:examId',   protect, isAdmin, examController.deleteExam)

// ── Student routes ────────────────────────────────────────────────────────────
router.get('/',                              protect, examController.getPublishedExams)
router.get('/:examId',                       protect, examController.getExam)
router.post('/:examId/start',                protect, examController.startExam)
router.put('/attempt/:attemptId/answer',     protect, examController.saveAnswer)
router.post('/attempt/:attemptId/submit',    protect, examController.submitExam)
router.get('/attempt/:attemptId/result',     protect, examController.getAttemptResult)
router.get('/:examId/my-attempts',           protect, examController.getMyAttempts)

module.exports = router
