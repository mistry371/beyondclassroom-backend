const express = require('express')
const router = express.Router()
const lessonController = require('../controllers/lessonController')

router.get('/module/:moduleId', lessonController.getLessonsByModule)
router.get('/:lessonId', lessonController.getLesson)
router.post('/', lessonController.createLesson)
router.put('/:lessonId', lessonController.updateLesson)
router.delete('/:lessonId', lessonController.deleteLesson)

module.exports = router
