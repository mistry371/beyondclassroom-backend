const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const adminUserController = require('../controllers/adminUserController')
const adminCourseController = require('../controllers/adminCourseController')
const adminSettingsController = require('../controllers/adminSettingsController')
const adminEmailController = require('../controllers/adminEmailController')
const adminNotificationController = require('../controllers/adminNotificationController')
const adminAnalyticsController = require('../controllers/adminAnalyticsController')
const adminMediaController = require('../controllers/adminMediaController')
const adminProgressController = require('../controllers/adminProgressController')
const adminSecurityController = require('../controllers/adminSecurityController')
const adminContentController = require('../controllers/adminContentController')
const adminAnnouncementController = require('../controllers/adminAnnouncementController')
const adminToolController = require('../controllers/adminToolController')
const adminCertificateController = require('../controllers/adminCertificateController')
const adminBadgeController = require('../controllers/adminBadgeController')
const adminLogController = require('../controllers/adminLogController')

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
router.get('/analytics', isAdmin, adminAnalyticsController.getAnalytics)
router.get('/analytics/export', isAdmin, adminAnalyticsController.exportAnalytics)
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

// Email Management
router.get('/emails/logs', isAdmin, adminEmailController.getEmailLogs)
router.get('/emails/templates', isAdmin, adminEmailController.getEmailTemplates)

// Notification Management
router.get('/notifications', isAdmin, adminNotificationController.getNotifications)
router.post('/notifications', isAdmin, adminNotificationController.sendNotification)
router.delete('/notifications/:id', isAdmin, adminNotificationController.deleteNotification)

// Media Management
router.get('/media', isAdmin, adminMediaController.getMedia)
router.post('/media/upload', isAdmin, adminMediaController.uploadMedia)
router.delete('/media/:id', isAdmin, adminMediaController.deleteMedia)

// Progress Tracking
router.get('/progress', isAdmin, adminProgressController.getProgress)

// Security Management
router.get('/security', isAdmin, adminSecurityController.getSecurityData)
router.post('/security/block-ip', isAdmin, adminSecurityController.blockIP)
router.post('/security/unblock-ip', isAdmin, adminSecurityController.unblockIP)

// Content Management
router.get('/content', isAdmin, adminContentController.getContent)
router.put('/content', isAdmin, adminContentController.updateContent)

// Announcement Management
router.get('/announcements', isAdmin, adminAnnouncementController.getAnnouncements)
router.post('/announcements', isAdmin, adminAnnouncementController.createAnnouncement)
router.delete('/announcements/:id', isAdmin, adminAnnouncementController.deleteAnnouncement)

// Tool Management
router.get('/tools', isAdmin, adminToolController.getTools)
router.put('/tools/:id', isAdmin, adminToolController.updateTool)

// Certificate Management
router.get('/certificates', isAdmin, adminCertificateController.getCertificates)
router.post('/certificates/generate', isAdmin, adminCertificateController.generateCertificate)

// Badge Management
router.get('/badges', isAdmin, adminBadgeController.getBadges)
router.post('/badges', isAdmin, adminBadgeController.createBadge)
router.delete('/badges/:id', isAdmin, adminBadgeController.deleteBadge)

// Activity Logs
router.get('/logs', isAdmin, adminLogController.getLogs)

// Orders Management (using existing orderController)
router.get('/orders', isAdmin, async (req, res) => {
  try {
    const { db } = require('../database/db')
    await db.read()
    
    const { status = 'all' } = req.query
    let orders = db.data.orders || []
    
    if (status !== 'all') {
      orders = orders.filter(o => o.status === status)
    }
    
    // Populate user and course data
    orders = orders.map(order => ({
      ...order,
      user: db.data.users.find(u => u._id === order.userId),
      courses: order.courses?.map(cId => db.data.courses?.find(c => c._id === cId)).filter(Boolean)
    }))
    
    res.json({ orders })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/orders/:id/refund', isAdmin, async (req, res) => {
  try {
    const { db } = require('../database/db')
    await db.read()
    
    const order = db.data.orders?.find(o => o._id === req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    order.status = 'refunded'
    order.refundedAt = new Date().toISOString()
    await db.write()
    
    res.json({ message: 'Refund processed successfully', order })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/orders/export', isAdmin, async (req, res) => {
  try {
    const csvData = 'OrderID,User,Amount,Status,Date\n1,John,1000,completed,2024-01-01'
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv')
    res.send(csvData)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
