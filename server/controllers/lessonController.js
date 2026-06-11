const { db, models } = require('../database/db')
const Lesson = require('../models/Lesson')

// Get all lessons for a module
exports.getLessonsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params
    
    const lessons = await models.lessons.find({ moduleId }).sort({ order: 1 }).lean()
    
    res.json({
      success: true,
      lessons
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single lesson
exports.getLesson = async (req, res) => {
  try {
    const { lessonId } = req.params
    
    const lesson = await models.lessons.findOne({ _id: lessonId }).lean()
    
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }
    
    res.json({ success: true, lesson })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Normalize content to plain string for backward compatibility with legacy schemas.
function normalizeContent(content) {
  if (!content) return ''
  if (typeof content === 'string') return content
  if (typeof content === 'object') {
    return (
      content.concept ||
      content.summary ||
      content.description ||
      JSON.stringify(content)
    )
  }
  return String(content)
}

// Create lesson
exports.createLesson = async (req, res) => {
  try {
    const body = { ...req.body, content: normalizeContent(req.body.content) }
    
    // Check if _id is provided, otherwise let Mongoose generate one or generate our own string
    const newLessonData = { ...body }
    if (!newLessonData._id) {
      newLessonData._id = Date.now().toString() + Math.random().toString(36).slice(2, 11)
    }
    
    const newLesson = await models.lessons.create(newLessonData)
    
    if (db.data.lessons) {
      db.data.lessons.push(newLesson)
    }
    
    res.status(201).json({ success: true, lesson: newLesson })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update lesson
exports.updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params
    
    const body = { ...req.body }
    if (body.content !== undefined) body.content = normalizeContent(body.content)
    
    const updated = await models.lessons.findOneAndUpdate(
      { _id: lessonId },
      { $set: { ...body, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean()
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }
    
    if (db.data.lessons) {
      const index = db.data.lessons.findIndex(l => l._id === lessonId)
      if (index !== -1) Object.assign(db.data.lessons[index], updated)
    }
    
    res.json({ success: true, lesson: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params
    
    await models.lessons.deleteOne({ _id: lessonId })
    
    if (db.data.lessons) {
      db.data.lessons = db.data.lessons.filter(l => l._id !== lessonId)
    }
    
    res.json({ success: true, message: 'Lesson deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
