const express = require('express')
const router = express.Router()
const quizController = require('../controllers/quizController')
const { protect, admin } = require('../middleware/auth')

// Public/enrolled read
router.get('/module/:moduleId', quizController.getByModule)
router.get('/:id', quizController.getOne)

// Admin write
router.post('/', protect, admin, quizController.create)
router.put('/:id', protect, admin, quizController.update)
router.delete('/:id', protect, admin, quizController.remove)

module.exports = router
