const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/customCourseController')
const jwt = require('jsonwebtoken')
const { db } = require('../database/db')

const protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'beyond-classroom-fallback-secret-change-in-production')
    await db.read()
    req.user = db.data.users.find(u => u._id === decoded.id)
    if (!req.user) return res.status(401).json({ message: 'User not found' })
    next()
  } catch { res.status(401).json({ message: 'Not authorized' }) }
}

const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'super_admin') return next()
  res.status(403).json({ message: 'Admin only' })
}

// Student routes
router.post('/', protect, ctrl.createRequest)
router.get('/my', protect, ctrl.getMyRequests)

// Admin routes
router.get('/admin/all', protect, isAdmin, ctrl.getAllRequests)
router.put('/admin/:id', protect, isAdmin, ctrl.updateRequest)
router.delete('/admin/:id', protect, isAdmin, ctrl.deleteRequest)

module.exports = router
