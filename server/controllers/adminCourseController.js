const { db, models } = require('../database/db')
const Course = require('../models/Course') // legacy if needed
const { logActivity } = require('./adminController')
const { COURSE_CATEGORIES, normalizeCourseCategory } = require('../constants/categories')

function assertValidCategory(category) {
  const normalized = normalizeCourseCategory(category)
  if (!COURSE_CATEGORIES.includes(normalized)) {
    const err = new Error('Category must be Mathematics or French')
    err.statusCode = 400
    throw err
  }
  return normalized
}

// Get all courses for admin
exports.getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query
    
    let query = {}
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (category) {
      query.category = category
    }
    
    if (status) {
      query.status = status
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const courses = await models.courses.find(query).skip(skip).limit(parseInt(limit)).lean()
    const total = await models.courses.countDocuments(query)
    
    res.json({
      success: true,
      courses,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Create course
exports.createCourse = async (req, res) => {
  try {
    const category = assertValidCategory(req.body.category)
    const newCourseObj = new Course({
      ...req.body,
      category,
      status: req.body.status || 'draft',
      enrolledCount: 0,
      rating: 0
    })
    // To plain object for custom ID support if any
    const newCourse = newCourseObj.toObject ? newCourseObj.toObject() : newCourseObj;
    if (!newCourse._id) {
      newCourse._id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }

    await models.courses.create(newCourse)
    
    if (db.data.courses) {
      db.data.courses.push(newCourse)
    }
    
    await logActivity(
      req.user._id,
      req.user.name,
      'create',
      'courses',
      `Created course: ${newCourse.title}`,
      { courseId: newCourse._id }
    )
    
    res.status(201).json({ success: true, course: newCourse })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const existingCourse = await models.courses.findOne({ _id: req.params.id }).lean()
    if (!existingCourse) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    const category = req.body.category
      ? assertValidCategory(req.body.category)
      : existingCourse.category
      
    const updates = {
      ...req.body,
      category,
      updatedAt: new Date()
    }
    
    const updatedCourse = await models.courses.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updates },
      { new: true }
    ).lean()
    
    if (db.data.courses) {
      const cIdx = db.data.courses.findIndex(c => c._id === req.params.id)
      if (cIdx !== -1) Object.assign(db.data.courses[cIdx], updates)
    }
    
    await logActivity(
      req.user._id,
      req.user.name,
      'update',
      'courses',
      `Updated course: ${updatedCourse.title}`,
      { courseId: updatedCourse._id }
    )
    
    res.json({ success: true, course: updatedCourse })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await models.courses.findOneAndDelete({ _id: req.params.id }).lean()
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    if (db.data.courses) {
      db.data.courses = db.data.courses.filter(c => c._id !== req.params.id)
    }

    // Attempt to delete related items from DB directly
    const modules = await models.modules.find({ courseId: req.params.id }).lean()
    const moduleIds = modules.map(m => m._id)
    
    await models.modules.deleteMany({ courseId: req.params.id })
    if (db.data.modules) {
      db.data.modules = db.data.modules.filter(m => m.courseId !== req.params.id)
    }

    if (moduleIds.length > 0) {
      const lessons = await models.lessons.find({ moduleId: { $in: moduleIds } }).lean()
      const lessonIds = lessons.map(l => l._id)

      await models.lessons.deleteMany({ moduleId: { $in: moduleIds } })
      if (db.data.lessons) {
        db.data.lessons = db.data.lessons.filter(l => !moduleIds.includes(l.moduleId))
      }

      await models.quizzes.deleteMany({ moduleId: { $in: moduleIds } })
      if (db.data.quizzes) {
        db.data.quizzes = db.data.quizzes.filter(q => !moduleIds.includes(q.moduleId))
      }

      if (lessonIds.length > 0) {
        await models.practices.deleteMany({ lessonId: { $in: lessonIds } })
        if (db.data.practices) {
          db.data.practices = db.data.practices.filter(p => !lessonIds.includes(p.lessonId))
        }
      }
    }
    
    await logActivity(
      req.user._id,
      req.user.name,
      'delete',
      'courses',
      `Deleted course: ${course.title}`,
      { courseId: course._id }
    )
    
    res.json({ success: true, message: 'Course and related content deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Publish/Unpublish course
exports.toggleCourseStatus = async (req, res) => {
  try {
    const course = await models.courses.findOne({ _id: req.params.id }).lean()
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    const currentStatus = course.status || 'draft'
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    
    const updatedCourse = await models.courses.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: newStatus, updatedAt: new Date() } },
      { new: true }
    ).lean()
    
    if (db.data.courses) {
      const cIdx = db.data.courses.findIndex(c => c._id === req.params.id)
      if (cIdx !== -1) {
        db.data.courses[cIdx].status = newStatus
        db.data.courses[cIdx].updatedAt = new Date()
      }
    }
    
    await logActivity(
      req.user._id,
      req.user.name,
      'toggle_status',
      'courses',
      `${newStatus === 'published' ? 'Published' : 'Unpublished'} course: ${updatedCourse.title}`,
      { courseId: updatedCourse._id, newStatus }
    )
    
    res.json({ success: true, course: updatedCourse })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get course with full details (modules, lessons, etc.)
exports.getCourseDetails = async (req, res) => {
  try {
    const course = await models.courses.findOne({ _id: req.params.id }).lean()
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    const modules = await models.modules.find({ courseId: req.params.id }).lean()
    const moduleIds = modules.map(m => m._id)
    
    let lessons = []
    let quizzes = []
    let practices = []

    if (moduleIds.length > 0) {
      lessons = await models.lessons.find({ moduleId: { $in: moduleIds } }).lean()
      quizzes = await models.quizzes.find({ moduleId: { $in: moduleIds } }).lean()
      
      const lessonIds = lessons.map(l => l._id)
      if (lessonIds.length > 0) {
        practices = await models.practices.find({ lessonId: { $in: lessonIds } }).lean()
      }
    }
    
    res.json({
      success: true,
      course,
      modules,
      lessons,
      practices,
      quizzes,
      stats: {
        totalModules: modules.length,
        totalLessons: lessons.length,
        totalPractices: practices.length,
        totalQuizzes: quizzes.length
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
