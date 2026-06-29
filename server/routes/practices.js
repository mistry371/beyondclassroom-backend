const express = require('express')
const router = express.Router()
const practiceController = require('../controllers/practiceController')
const { protect, admin } = require('../middleware/auth')

router.get('/lesson/:lessonId', practiceController.getPracticeByLesson)
router.get('/:practiceId', practiceController.getPractice)
router.post('/:practiceId/submit', protect, practiceController.submitPracticeAnswer)
router.post('/', protect, admin, practiceController.createPractice)

module.exports = router
