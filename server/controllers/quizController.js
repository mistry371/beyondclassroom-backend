const { db } = require('../database/db')
const Quiz = require('../models/Quiz')

// Get all quizzes for a module (returns array)
exports.getQuizzesByModule = async (req, res) => {
  try {
    await db.read()
    const { moduleId } = req.params
    const quizzes = db.data.quizzes?.filter(q => q.moduleId === moduleId) || []
    res.json({ success: true, quizzes })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get quiz by module (single - for learn page)
exports.getQuizByModule = async (req, res) => {
  try {
    await db.read()
    const { moduleId } = req.params
    const quiz = db.data.quizzes?.find(q => q.moduleId === moduleId)
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
    await db.read()
    const { quizId } = req.params
    const quiz = db.data.quizzes?.find(q => q._id === quizId)
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
    await db.read()
    const { quizId } = req.params
    const { answers } = req.body

    const quiz = db.data.quizzes?.find(q => q._id === quizId)
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' })
    }

    let score = 0
    const results = []
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0) || 100

    quiz.questions.forEach((question, index) => {
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
    await db.read()
    const totalPoints = (req.body.questions || []).reduce((sum, q) => sum + (q.points || 10), 0) || 100
    const newQuiz = new Quiz({ ...req.body, totalPoints })
    db.data.quizzes = db.data.quizzes || []
    db.data.quizzes.push(newQuiz)
    await db.write()
    res.status(201).json({ success: true, quiz: newQuiz })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    await db.read()
    const { quizId } = req.params
    const index = db.data.quizzes?.findIndex(q => q._id === quizId)
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Quiz not found' })
    }
    const totalPoints = (req.body.questions || db.data.quizzes[index].questions || []).reduce((sum, q) => sum + (q.points || 10), 0) || 100
    db.data.quizzes[index] = { ...db.data.quizzes[index], ...req.body, totalPoints, updatedAt: new Date() }
    await db.write()
    res.json({ success: true, quiz: db.data.quizzes[index] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    await db.read()
    const { quizId } = req.params
    db.data.quizzes = db.data.quizzes?.filter(q => q._id !== quizId) || []
    await db.write()
    res.json({ success: true, message: 'Quiz deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
