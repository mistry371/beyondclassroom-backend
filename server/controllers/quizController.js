const { db } = require('../database/db')
const Quiz = require('../models/Quiz')

// Get quiz by module
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

// Get single quiz
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
        explanation: question.explanation
      })
    })
    
    const percentage = Math.round((score / quiz.totalPoints) * 100)
    const passed = percentage >= quiz.passingScore
    
    res.json({
      success: true,
      score,
      totalPoints: quiz.totalPoints,
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
    
    const newQuiz = new Quiz(req.body)
    
    db.data.quizzes = db.data.quizzes || []
    db.data.quizzes.push(newQuiz)
    
    await db.write()
    
    res.status(201).json({ success: true, quiz: newQuiz })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
