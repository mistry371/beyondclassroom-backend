const express = require('express')
const router = express.Router()
const quizController = require('../controllers/quizController')
const jwt = require('jsonwebtoken')
const { db } = require('../database/db')

// Auth middleware for quiz submission
const protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return res.status(401).json({ message: 'Not authorized' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'beyond-classroom-fallback-secret-change-in-production')
    await db.read()
    req.user = db.data.users.find(u => u._id === decoded.id)
    if (!req.user) return res.status(401).json({ message: 'User not found' })
    next()
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' })
  }
}

router.get('/module/:moduleId', quizController.getQuizzesByModule)
router.get('/:quizId', quizController.getQuiz)
router.post('/:quizId/submit', protect, quizController.submitQuiz)
router.post('/', quizController.createQuiz)
router.put('/:quizId', quizController.updateQuiz)
router.delete('/:quizId', quizController.deleteQuiz)

module.exports = router
