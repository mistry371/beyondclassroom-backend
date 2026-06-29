const express = require('express')
const router = express.Router()
const quizController = require('../controllers/quizController')
const { protect, admin, optionalAuth } = require('../middleware/auth')

router.get('/module/:moduleId', optionalAuth, quizController.getQuizzesByModule)
router.get('/:quizId', optionalAuth, quizController.getQuiz)
router.post('/:quizId/submit', protect, quizController.submitQuiz)
router.post('/', protect, admin, quizController.createQuiz)
router.put('/:quizId', protect, admin, quizController.updateQuiz)
router.delete('/:quizId', protect, admin, quizController.deleteQuiz)

module.exports = router
