const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/customCourseController')
const { protect, admin } = require('../middleware/auth')

// Student routes
router.post('/', protect, ctrl.createRequest)
router.get('/my', protect, ctrl.getMyRequests)

// Admin routes
router.get('/admin/all', protect, admin, ctrl.getAllRequests)
router.put('/admin/:id', protect, admin, ctrl.updateRequest)
router.delete('/admin/:id', protect, admin, ctrl.deleteRequest)

module.exports = router
