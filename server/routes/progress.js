const express = require('express')
const router = express.Router()
const progressController = require('../controllers/progressController')

// Temporarily remove protect middleware - will add back later
router.get('/course/:courseId', progressController.getCourseProgress)
router.get('/user', progressController.getAllUserProgress)
router.put('/course/:courseId/lesson/:lessonId', progressController.updateLessonProgress)
router.put('/course/:courseId/quiz/:quizId', progressController.updateQuizProgress)

module.exports = router
