const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const adminUserController = require('../controllers/adminUserController')
const adminCourseController = require('../controllers/adminCourseController')
const adminSettingsController = require('../controllers/adminSettingsController')

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next()
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin only.' })
  }
}

// Dashboard & Analytics
router.get('/dashboard/stats', isAdmin, adminController.getDashboardStats)
router.get('/analytics', isAdmin, adminController.getAnalytics)
router.get('/activity-logs', isAdmin, adminController.getActivityLogs)

// User Management
router.get('/users', isAdmin, adminUserController.getAllUsers)
router.get('/users/:id', isAdmin, adminUserController.getUser)
router.post('/users', isAdmin, adminUserController.createUser)
router.put('/users/:id', isAdmin, adminUserController.updateUser)
router.delete('/users/:id', isAdmin, adminUserController.deleteUser)
router.post('/users/:id/reset-password', isAdmin, adminUserController.resetPassword)
router.post('/users/:id/toggle-status', isAdmin, adminUserController.toggleUserStatus)

// Course Management
router.get('/courses', isAdmin, adminCourseController.getAllCourses)
router.get('/courses/:id', isAdmin, adminCourseController.getCourseDetails)
router.post('/courses', isAdmin, adminCourseController.createCourse)
router.put('/courses/:id', isAdmin, adminCourseController.updateCourse)
router.delete('/courses/:id', isAdmin, adminCourseController.deleteCourse)
router.post('/courses/:id/toggle-status', isAdmin, adminCourseController.toggleCourseStatus)

// Settings Management
router.get('/settings', isAdmin, adminSettingsController.getAllSettings)
router.put('/settings', isAdmin, adminSettingsController.updateSetting)
router.post('/settings/bulk', isAdmin, adminSettingsController.bulkUpdateSettings)

module.exports = router
