const express = require('express')
const router = express.Router()
const lessonController = require('../controllers/lessonController')
const { protect, admin, optionalAuth } = require('../middleware/auth')

router.get('/module/:moduleId', optionalAuth, lessonController.getLessonsByModule)
router.get('/:lessonId', optionalAuth, lessonController.getLesson)
router.post('/', protect, admin, lessonController.createLesson)
router.put('/:lessonId', protect, admin, lessonController.updateLesson)
router.delete('/:lessonId', protect, admin, lessonController.deleteLesson)

module.exports = router
