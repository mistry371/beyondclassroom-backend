const { db } = require('../database/db')
const Practice = require('../models/Practice')

// Get practice questions for a lesson
exports.getPracticeByLesson = async (req, res) => {
  try {
    await db.read()
    const { lessonId } = req.params
    
    const practices = db.data.practices?.filter(p => p.lessonId === lessonId) || []
    
    res.json({ success: true, practices })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single practice question
exports.getPractice = async (req, res) => {
  try {
    await db.read()
    const { practiceId } = req.params
    
    const practice = db.data.practices?.find(p => p._id === practiceId)
    
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
    await db.read()
    const { practiceId } = req.params
    const { answer } = req.body
    
    const practice = db.data.practices?.find(p => p._id === practiceId)
    
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
    await db.read()
    
    const newPractice = new Practice(req.body)
    
    db.data.practices = db.data.practices || []
    db.data.practices.push(newPractice)
    
    await db.write()
    
    res.status(201).json({ success: true, practice: newPractice })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
