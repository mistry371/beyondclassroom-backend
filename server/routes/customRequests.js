const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/customRequestController')
const { protect, admin } = require('../middleware/auth')

router.post('/', protect, ctrl.createRequest)
router.get('/my/limits', protect, ctrl.getMyLimits)
router.get('/my', protect, ctrl.getMyRequests)
router.put('/my/:id', protect, ctrl.studentAction)
router.get('/admin', protect, admin, ctrl.getAllRequests)
router.put('/admin/:id', protect, admin, ctrl.updateRequest)
router.put('/admin/:id/assign-pdf', protect, admin, ctrl.assignPdf)
router.delete('/admin/:id', protect, admin, ctrl.deleteRequest)

module.exports = router
