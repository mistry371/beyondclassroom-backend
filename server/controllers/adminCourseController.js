const { db } = require('../database/db')
const Course = require('../models/Course')
const { logActivity } = require('./adminController')

// Get all courses for admin
exports.getAllCourses = async (req, res) => {
  try {
    await db.read()
    const { page = 1, limit = 20, search, category, status } = req.query
    
    let courses = db.data.courses || []
    
    if (search) {
      courses = courses.filter(c => 
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    if (category) {
      courses = courses.filter(c => c.category === category)
    }
    
    if (status) {
      courses = courses.filter(c => c.status === status)
    }
    
    const startIndex = (page - 1) * limit
    const paginatedCourses = courses.slice(startIndex, startIndex + parseInt(limit))
    
    res.json({
      success: true,
      courses: paginatedCourses,
      total: courses.length,
      page: parseInt(page),
      totalPages: Math.ceil(courses.length / limit)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Create course
exports.createCourse = async (req, res) => {
  try {
    await db.read()
    
    const newCourse = new Course({
      ...req.body,
      status: req.body.status || 'draft',
      enrolledCount: 0,
      rating: 0
    })
    
    db.data.courses = db.data.courses || []
    db.data.courses.push(newCourse)
    await db.write()
    
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
    await db.read()
    
    const courseIndex = db.data.courses?.findIndex(c => c._id === req.params.id)
    if (courseIndex === -1) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    const updatedCourse = {
      ...db.data.courses[courseIndex],
      ...req.body,
      updatedAt: new Date()
    }
    
    db.data.courses[courseIndex] = updatedCourse
    await db.write()
    
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
    await db.read()
    
    const course = db.data.courses?.find(c => c._id === req.params.id)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    // Delete related modules, lessons, practices, quizzes
    const moduleIds = db.data.modules?.filter(m => m.courseId === req.params.id).map(m => m._id) || []
    db.data.lessons = db.data.lessons?.filter(l => !moduleIds.includes(l.moduleId)) || []
    db.data.practices = db.data.practices?.filter(p => {
      const lesson = db.data.lessons?.find(l => l._id === p.lessonId)
      return lesson !== undefined
    }) || []
    db.data.quizzes = db.data.quizzes?.filter(q => !moduleIds.includes(q.moduleId)) || []
    db.data.modules = db.data.modules?.filter(m => m.courseId !== req.params.id) || []
    
    db.data.courses = db.data.courses.filter(c => c._id !== req.params.id)
    await db.write()
    
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
    await db.read()
    
    const courseIndex = db.data.courses?.findIndex(c => c._id === req.params.id)
    if (courseIndex === -1) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    const currentStatus = db.data.courses[courseIndex].status || 'draft'
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    
    db.data.courses[courseIndex].status = newStatus
    db.data.courses[courseIndex].updatedAt = new Date()
    
    await db.write()
    
    await logActivity(
      req.user._id,
      req.user.name,
      'toggle_status',
      'courses',
      `${newStatus === 'published' ? 'Published' : 'Unpublished'} course: ${db.data.courses[courseIndex].title}`,
      { courseId: db.data.courses[courseIndex]._id, newStatus }
    )
    
    res.json({ success: true, course: db.data.courses[courseIndex] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get course with full details (modules, lessons, etc.)
exports.getCourseDetails = async (req, res) => {
  try {
    await db.read()
    
    const course = db.data.courses?.find(c => c._id === req.params.id)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    
    const modules = db.data.modules?.filter(m => m.courseId === req.params.id) || []
    const moduleIds = modules.map(m => m._id)
    const lessons = db.data.lessons?.filter(l => moduleIds.includes(l.moduleId)) || []
    const lessonIds = lessons.map(l => l._id)
    const practices = db.data.practices?.filter(p => lessonIds.includes(p.lessonId)) || []
    const quizzes = db.data.quizzes?.filter(q => moduleIds.includes(q.moduleId)) || []
    
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
