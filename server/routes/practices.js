const express = require('express')
const router = express.Router()
const practiceController = require('../controllers/practiceController')

router.get('/lesson/:lessonId', practiceController.getPracticeByLesson)
router.get('/:practiceId', practiceController.getPractice)
router.post('/:practiceId/submit', practiceController.submitPracticeAnswer)
router.post('/', practiceController.createPractice)

module.exports = router
