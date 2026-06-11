const express = require('express')
const router = express.Router()
const progressController = require('../controllers/progressController')
const { protect } = require('../middleware/auth')

router.get('/course/:courseId', protect, progressController.getCourseProgress)
router.get('/user', protect, progressController.getAllUserProgress)
router.put('/course/:courseId/lesson/:lessonId', protect, progressController.updateLessonProgress)
router.put('/course/:courseId/quiz/:quizId', protect, progressController.updateQuizProgress)

module.exports = router
