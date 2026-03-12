const express = require('express')
const router = express.Router()
const quizController = require('../controllers/quizController')

router.get('/module/:moduleId', quizController.getQuizByModule)
router.get('/:quizId', quizController.getQuiz)
router.post('/:quizId/submit', quizController.submitQuiz)
router.post('/', quizController.createQuiz)

module.exports = router
