const { models } = require('../database/db')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

// GET /api/quizzes/module/:moduleId
exports.getByModule = async (req, res) => {
  try {
    const quizzes = await models.quizzes.find({ moduleId: req.params.moduleId }).sort({ createdAt: -1 }).lean()
    res.json({ success: true, quizzes })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/quizzes/:id
exports.getOne = async (req, res) => {
  try {
    const quiz = await models.quizzes.findOne({ _id: req.params.id }).lean()
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' })
    res.json({ success: true, quiz })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/quizzes
exports.create = async (req, res) => {
  try {
    const { title, description, moduleId, questions, passingScore, timeLimit, isPublished } = req.body
    if (!title || !moduleId) return res.status(400).json({ success: false, message: 'Title and module are required' })

    // Link to the course the module belongs to.
    const moduleDoc = await models.modules.findOne({ _id: moduleId }).lean()

    const quiz = {
      _id: generateId(),
      moduleId,
      courseId: moduleDoc?.courseId || null,
      title,
      description: description || '',
      questions: Array.isArray(questions) ? questions : [],
      passingScore: passingScore != null ? Number(passingScore) : 70,
      timeLimit: timeLimit != null ? Number(timeLimit) : 30,
      isPublished: isPublished !== false,
      createdAt: new Date().toISOString(),
    }
    await models.quizzes.create(quiz)
    res.status(201).json({ success: true, quiz })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/quizzes/:id
exports.update = async (req, res) => {
  try {
    const { title, description, moduleId, questions, passingScore, timeLimit, isPublished } = req.body
    const updates = { updatedAt: new Date().toISOString() }
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (moduleId !== undefined) updates.moduleId = moduleId
    if (questions !== undefined) updates.questions = questions
    if (passingScore !== undefined) updates.passingScore = Number(passingScore)
    if (timeLimit !== undefined) updates.timeLimit = Number(timeLimit)
    if (isPublished !== undefined) updates.isPublished = isPublished

    const quiz = await models.quizzes.findOneAndUpdate({ _id: req.params.id }, { $set: updates }, { new: true }).lean()
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' })
    res.json({ success: true, quiz })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /api/quizzes/:id
exports.remove = async (req, res) => {
  try {
    const result = await models.quizzes.deleteOne({ _id: req.params.id })
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Quiz not found' })
    res.json({ success: true, message: 'Quiz deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
