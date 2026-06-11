const express = require('express')
const router = express.Router()
const quizController = require('../controllers/quizController')
const { protect } = require('../middleware/auth')

router.get('/module/:moduleId', quizController.getQuizzesByModule)
router.get('/:quizId', quizController.getQuiz)
router.post('/:quizId/submit', protect, quizController.submitQuiz)
router.post('/', quizController.createQuiz)
router.put('/:quizId', quizController.updateQuiz)
router.delete('/:quizId', quizController.deleteQuiz)

module.exports = router
