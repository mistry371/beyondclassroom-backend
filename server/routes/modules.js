const express = require('express')
const router = express.Router()
const moduleController = require('../controllers/moduleController')
const { protect, admin, optionalAuth } = require('../middleware/auth')

router.get('/', optionalAuth, moduleController.getAllModules)
router.get('/course/:courseId', optionalAuth, moduleController.getModulesByCourse)
router.get('/:moduleId', optionalAuth, moduleController.getModule)
router.post('/', protect, admin, moduleController.createModule)
router.put('/:moduleId', protect, admin, moduleController.updateModule)
router.delete('/:moduleId', protect, admin, moduleController.deleteModule)

module.exports = router
