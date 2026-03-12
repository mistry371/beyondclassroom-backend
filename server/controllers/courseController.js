const Course = require('../models/Course');

exports.getAllCourses = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(query).sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeaturedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isFeatured: true }).limit(6);
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
