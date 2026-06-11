const { db, models } = require('../database/db')

const MAX_DOC_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_DOC_COUNT = 30

const normalizeDocuments = (body = {}) => {
  if (Array.isArray(body.documents)) return body.documents
  if (body.document) return [body.document]
  return []
}

const validateDocuments = (documents) => {
  if (documents.length > MAX_DOC_COUNT) return `Maximum ${MAX_DOC_COUNT} documents allowed`
  for (const doc of documents) {
    if (!doc?.data) continue
    const approxBytes = Math.ceil(doc.data.length * 0.75)
    if (approxBytes > MAX_DOC_SIZE) return 'Each document must be 5 MB or smaller'
  }
  return null
}

// Get all subtopics for a lesson
exports.getSubtopicsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params
    const subtopics = await models.subtopics.find({ lessonId }).sort({ order: 1 }).lean()
    res.json({ success: true, subtopics })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single subtopic
exports.getSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params
    const subtopic = await models.subtopics.findOne({ _id: subtopicId }).lean()
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
    const documents = normalizeDocuments(req.body)
    const validationError = validateDocuments(documents)
    if (validationError) return res.status(400).json({ success: false, message: validationError })

    const subtopicData = { ...req.body, documents }
    if (!subtopicData._id) {
      subtopicData._id = Date.now().toString() + Math.random().toString(36).slice(2, 11)
    }

    const newSubtopic = await models.subtopics.create(subtopicData)
    
    if (db.data.subtopics) {
      db.data.subtopics.push(newSubtopic)
    }

    res.status(201).json({ success: true, subtopic: newSubtopic })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update subtopic
exports.updateSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params
    const documents = normalizeDocuments(req.body)
    const validationError = validateDocuments(documents)
    if (validationError) return res.status(400).json({ success: false, message: validationError })

    const existing = await models.subtopics.findOne({ _id: subtopicId }).lean()
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Subtopic not found' })
    }

    const updated = await models.subtopics.findOneAndUpdate(
      { _id: subtopicId },
      { $set: {
        ...req.body,
        documents,
        document: documents[0] || null,
        updatedAt: new Date().toISOString(),
      }},
      { new: true }
    ).lean()

    if (db.data.subtopics) {
      const index = db.data.subtopics.findIndex(s => s._id === subtopicId)
      if (index !== -1) Object.assign(db.data.subtopics[index], updated)
    }

    res.json({ success: true, subtopic: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete subtopic
exports.deleteSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params
    await models.subtopics.deleteOne({ _id: subtopicId })
    
    if (db.data.subtopics) {
      db.data.subtopics = db.data.subtopics.filter(s => s._id !== subtopicId)
    }
    
    res.json({ success: true, message: 'Subtopic deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all subtopics (admin overview)
exports.getAllSubtopics = async (req, res) => {
  try {
    const subtopics = await models.subtopics.find().sort({ order: 1 }).lean()
    res.json({ success: true, subtopics })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
