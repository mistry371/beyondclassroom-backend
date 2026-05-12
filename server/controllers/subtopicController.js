const { db } = require('../database/db')
const Subtopic = require('../models/Subtopic')

const MAX_DOC_SIZE = 2 * 1024 * 1024 // 2 MB in bytes

// Get all subtopics for a lesson
exports.getSubtopicsByLesson = async (req, res) => {
  try {
    await db.read()
    const { lessonId } = req.params
    const subtopics = (db.data.subtopics || [])
      .filter(s => s.lessonId === lessonId)
      .sort((a, b) => a.order - b.order)
    res.json({ success: true, subtopics })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single subtopic
exports.getSubtopic = async (req, res) => {
  try {
    await db.read()
    const { subtopicId } = req.params
    const subtopic = (db.data.subtopics || []).find(s => s._id === subtopicId)
    if (!subtopic) {
      return res.status(404).json({ success: false, message: 'Subtopic not found' })
    }
    res.json({ success: true, subtopic })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Create subtopic
exports.createSubtopic = async (req, res) => {
  try {
    await db.read()

    // Validate document size if provided
    if (req.body.document?.data) {
      // base64 string length * 0.75 ≈ actual byte size
      const approxBytes = Math.ceil(req.body.document.data.length * 0.75)
      if (approxBytes > MAX_DOC_SIZE) {
        return res.status(400).json({ success: false, message: 'Document exceeds 2 MB limit' })
      }
    }

    const newSubtopic = new Subtopic(req.body)
    db.data.subtopics = db.data.subtopics || []
    db.data.subtopics.push(newSubtopic)
    await db.write()

    res.status(201).json({ success: true, subtopic: newSubtopic })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update subtopic
exports.updateSubtopic = async (req, res) => {
  try {
    await db.read()
    const { subtopicId } = req.params

    // Validate document size if provided
    if (req.body.document?.data) {
      const approxBytes = Math.ceil(req.body.document.data.length * 0.75)
      if (approxBytes > MAX_DOC_SIZE) {
        return res.status(400).json({ success: false, message: 'Document exceeds 2 MB limit' })
      }
    }

    const index = (db.data.subtopics || []).findIndex(s => s._id === subtopicId)
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Subtopic not found' })
    }

    db.data.subtopics[index] = {
      ...db.data.subtopics[index],
      ...req.body,
      updatedAt: new Date()
    }
    await db.write()

    res.json({ success: true, subtopic: db.data.subtopics[index] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete subtopic
exports.deleteSubtopic = async (req, res) => {
  try {
    await db.read()
    const { subtopicId } = req.params
    db.data.subtopics = (db.data.subtopics || []).filter(s => s._id !== subtopicId)
    await db.write()
    res.json({ success: true, message: 'Subtopic deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all subtopics (admin overview)
exports.getAllSubtopics = async (req, res) => {
  try {
    await db.read()
    const subtopics = (db.data.subtopics || []).sort((a, b) => a.order - b.order)
    res.json({ success: true, subtopics })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
