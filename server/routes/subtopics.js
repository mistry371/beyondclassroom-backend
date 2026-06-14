const express = require('express')
const router = express.Router()
const subtopicController = require('../controllers/subtopicController')
const { protect, admin } = require('../middleware/auth')

// Public / student routes
router.get('/lesson/:lessonId', subtopicController.getSubtopicsByLesson)
router.get('/:subtopicId', subtopicController.getSubtopic)

// Admin routes
router.get('/', protect, admin, subtopicController.getAllSubtopics)
router.post('/', protect, admin, subtopicController.createSubtopic)
router.put('/:subtopicId', protect, admin, subtopicController.updateSubtopic)
router.delete('/:subtopicId', protect, admin, subtopicController.deleteSubtopic)

module.exports = router
