const { db, models } = require('../database/db')
const Quiz = require('../models/Quiz')

// Get all quizzes for a module (returns array)
exports.getQuizzesByModule = async (req, res) => {
  try {
    const { moduleId } = req.params
    const quizzes = await models.quizzes.find({ moduleId }).lean()
    res.json({ success: true, quizzes })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get quiz by module (single - for learn page)
exports.getQuizByModule = async (req, res) => {
  try {
    const { moduleId } = req.params
    const quiz = await models.quizzes.findOne({ moduleId }).lean()
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' })
    }
    res.json({ success: true, quiz })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single quiz by ID
exports.getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params
    const quiz = await models.quizzes.findOne({ _id: quizId }).lean()
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' })
    }
    res.json({ success: true, quiz })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Submit quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params
    const { answers } = req.body

    const quiz = await models.quizzes.findOne({ _id: quizId }).lean()
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' })
    }

    let score = 0
    const results = []
    const totalPoints = (quiz.questions || []).reduce((sum, q) => sum + (q.points || 10), 0) || 100

    ;(quiz.questions || []).forEach((question, index) => {
      const userAnswer = answers[index]
      const isCorrect = userAnswer === question.correctAnswer

      if (isCorrect) {
        score += question.points || 10
      }

      results.push({
        questionId: question._id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation || ''
      })
    })

    const percentage = Math.round((score / totalPoints) * 100)
    const passed = percentage >= (quiz.passingScore || 70)

    res.json({
      success: true,
      score,
      totalPoints,
      percentage,
      passed,
      results
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Create quiz
exports.createQuiz = async (req, res) => {
  try {
    const totalPoints = (req.body.questions || []).reduce((sum, q) => sum + (q.points || 10), 0) || 100
    const quizData = { ...req.body, totalPoints }
    if (!quizData._id) {
      quizData._id = Date.now().toString() + Math.random().toString(36).slice(2, 11)
    }
    
    const newQuiz = await models.quizzes.create(quizData)
    if (db.data.quizzes) {
      db.data.quizzes.push(newQuiz)
    }
    
    res.status(201).json({ success: true, quiz: newQuiz })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params
    
    const existing = await models.quizzes.findOne({ _id: quizId }).lean()
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Quiz not found' })
    }
    
    const totalPoints = (req.body.questions || existing.questions || []).reduce((sum, q) => sum + (q.points || 10), 0) || 100
    
    const updated = await models.quizzes.findOneAndUpdate(
      { _id: quizId },
      { $set: { ...req.body, totalPoints, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean()
    
    if (db.data.quizzes) {
      const index = db.data.quizzes.findIndex(q => q._id === quizId)
      if (index !== -1) Object.assign(db.data.quizzes[index], updated)
    }
    
    res.json({ success: true, quiz: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params
    await models.quizzes.deleteOne({ _id: quizId })
    if (db.data.quizzes) {
      db.data.quizzes = db.data.quizzes.filter(q => q._id !== quizId)
    }
    res.json({ success: true, message: 'Quiz deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
