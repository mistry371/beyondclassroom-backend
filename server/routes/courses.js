const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getFeaturedCourses
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllCourses);
router.get('/featured', getFeaturedCourses);
router.get('/:id', getCourseById);
router.post('/', protect, admin, createCourse);
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

module.exports = router;
