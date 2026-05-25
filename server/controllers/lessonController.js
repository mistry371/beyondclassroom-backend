const { db } = require('../database/db')
const Lesson = require('../models/Lesson')

// Get all lessons for a module
exports.getLessonsByModule = async (req, res) => {
  try {
    await db.read()
    const { moduleId } = req.params
    
    const lessons = db.data.lessons?.filter(l => l.moduleId === moduleId) || []
    
    res.json({
      success: true,
      lessons: lessons.sort((a, b) => a.order - b.order)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single lesson
exports.getLesson = async (req, res) => {
  try {
    await db.read()
    const { lessonId } = req.params
    
    const lesson = db.data.lessons?.find(l => l._id === lessonId)
    
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
    await db.read()
    
    const body = { ...req.body, content: normalizeContent(req.body.content) }
    const newLesson = new Lesson(body)
    
    db.data.lessons = db.data.lessons || []
    db.data.lessons.push(newLesson)
    
    await db.write()
    
    res.status(201).json({ success: true, lesson: newLesson })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update lesson
exports.updateLesson = async (req, res) => {
  try {
    await db.read()
    const { lessonId } = req.params
    
    const index = db.data.lessons?.findIndex(l => l._id === lessonId)
    
    if (index === -1 || index === undefined) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }
    
    const body = { ...req.body }
    if (body.content !== undefined) body.content = normalizeContent(body.content)
    db.data.lessons[index] = { ...db.data.lessons[index], ...body, updatedAt: new Date() }
    
    await db.write()
    
    res.json({ success: true, lesson: db.data.lessons[index] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    await db.read()
    const { lessonId } = req.params
    
    db.data.lessons = db.data.lessons?.filter(l => l._id !== lessonId) || []
    
    await db.write()
    
    res.json({ success: true, message: 'Lesson deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
