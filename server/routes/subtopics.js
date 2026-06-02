const express = require('express')
const router = express.Router()
const subtopicController = require('../controllers/subtopicController')
const jwt = require('jsonwebtoken')
const { db } = require('../database/db')

// Auth middleware (reuse pattern from server-simple.js)
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

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next()
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin only.' })
  }
}

// Public / student routes
router.get('/lesson/:lessonId', protect, subtopicController.getSubtopicsByLesson)
router.get('/:subtopicId', protect, subtopicController.getSubtopic)

// Admin routes
router.get('/', protect, isAdmin, subtopicController.getAllSubtopics)
router.post('/', protect, isAdmin, subtopicController.createSubtopic)
router.put('/:subtopicId', protect, isAdmin, subtopicController.updateSubtopic)
router.delete('/:subtopicId', protect, isAdmin, subtopicController.deleteSubtopic)

module.exports = router
