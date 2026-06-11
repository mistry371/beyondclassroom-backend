const { db, models } = require('../database/db')
const Practice = require('../models/Practice')

// Get practice questions for a lesson
exports.getPracticeByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params
    
    const practices = await models.practices.find({ lessonId }).lean()
    
    res.json({ success: true, practices })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single practice question
exports.getPractice = async (req, res) => {
  try {
    const { practiceId } = req.params
    
    const practice = await models.practices.findOne({ _id: practiceId }).lean()
    
    if (!practice) {
      return res.status(404).json({ success: false, message: 'Practice not found' })
    }
    
    res.json({ success: true, practice })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Submit practice answer
exports.submitPracticeAnswer = async (req, res) => {
  try {
    const { practiceId } = req.params
    const { answer } = req.body
    
    const practice = await models.practices.findOne({ _id: practiceId }).lean()
    
    if (!practice) {
      return res.status(404).json({ success: false, message: 'Practice not found' })
    }
    
    const isCorrect = answer.toString().trim().toLowerCase() === practice.answer.toString().trim().toLowerCase()
    
    res.json({
      success: true,
      isCorrect,
      correctAnswer: practice.answer,
      solution: practice.solution,
      points: isCorrect ? practice.points : 0
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Create practice question
exports.createPractice = async (req, res) => {
  try {
    const newPracticeData = { ...req.body }
    if (!newPracticeData._id) {
      newPracticeData._id = Date.now().toString() + Math.random().toString(36).slice(2, 11)
    }
    
    const newPractice = await models.practices.create(newPracticeData)
    
    if (db.data.practices) {
      db.data.practices.push(newPractice)
    }
    
    res.status(201).json({ success: true, practice: newPractice })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
