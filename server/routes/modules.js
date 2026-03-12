const express = require('express')
const router = express.Router()
const moduleController = require('../controllers/moduleController')

router.get('/course/:courseId', moduleController.getModulesByCourse)
router.get('/:moduleId', moduleController.getModule)
router.post('/', moduleController.createModule)
router.put('/:moduleId', moduleController.updateModule)
router.delete('/:moduleId', moduleController.deleteModule)

module.exports = router
