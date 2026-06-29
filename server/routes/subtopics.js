const express = require('express')
const router = express.Router()
const subtopicController = require('../controllers/subtopicController')
const { protect, admin, optionalAuth } = require('../middleware/auth')

// Public / student routes
router.get('/lesson/:lessonId', optionalAuth, subtopicController.getSubtopicsByLesson)
router.get('/module/:moduleId', optionalAuth, subtopicController.getSubtopicsByModule)
router.get('/:subtopicId', optionalAuth, subtopicController.getSubtopic)

// Admin routes
router.get('/', protect, admin, subtopicController.getAllSubtopics)
router.post('/', protect, admin, subtopicController.createSubtopic)
router.put('/:subtopicId', protect, admin, subtopicController.updateSubtopic)
router.delete('/:subtopicId', protect, admin, subtopicController.deleteSubtopic)

module.exports = router
