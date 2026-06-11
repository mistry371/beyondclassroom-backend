const express = require('express')
const router = express.Router()
const examController = require('../controllers/examController')
const { protect, admin } = require('../middleware/auth')

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/admin/all',          protect, admin, examController.getAllExams)
router.get('/admin/:examId/analytics', protect, admin, examController.getExamAnalytics)
router.post('/admin',             protect, admin, examController.createExam)
router.put('/admin/:examId',      protect, admin, examController.updateExam)
router.delete('/admin/:examId',   protect, admin, examController.deleteExam)

// ── Student routes ────────────────────────────────────────────────────────────
router.get('/',                              protect, examController.getPublishedExams)
router.get('/:examId',                       protect, examController.getExam)
router.post('/:examId/start',                protect, examController.startExam)
router.put('/attempt/:attemptId/answer',     protect, examController.saveAnswer)
router.post('/attempt/:attemptId/submit',    protect, examController.submitExam)
router.get('/attempt/:attemptId/result',     protect, examController.getAttemptResult)
router.get('/:examId/my-attempts',           protect, examController.getMyAttempts)

module.exports = router
