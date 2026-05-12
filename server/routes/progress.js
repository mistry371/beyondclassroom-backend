const express = require('express')
const router = express.Router()
const progressController = require('../controllers/progressController')
const jwt = require('jsonwebtoken')
const { db } = require('../database/db')

// Auth middleware for progress routes
const protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return res.status(401).json({ message: 'Not authorized' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret')
    await db.read()
    req.user = db.data.users.find(u => u._id === decoded.id)
    if (!req.user) return res.status(401).json({ message: 'User not found' })
    next()
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' })
  }
}

router.get('/course/:courseId', protect, progressController.getCourseProgress)
router.get('/user', protect, progressController.getAllUserProgress)
router.put('/course/:courseId/lesson/:lessonId', protect, progressController.updateLessonProgress)
router.put('/course/:courseId/quiz/:quizId', protect, progressController.updateQuizProgress)

module.exports = router
