const { db } = require('../database/db')
const Progress = require('../models/Progress')

// Get user progress for a course
exports.getCourseProgress = async (req, res) => {
  try {
    await db.read()
    const { courseId } = req.params
    const userId = req.user?._id || req.user?.id || 'guest'
    
    let progress = db.data.progress?.find(p => p.userId === userId && p.courseId === courseId)
    
    if (!progress) {
      // Create new progress record
      progress = new Progress({ userId, courseId, expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) })
      db.data.progress = db.data.progress || []
      db.data.progress.push(progress)
      await db.write()
    }
    
    // Check expiry
    if (progress.checkExpiry) {
      progress.checkExpiry()
    }
    
    res.json({ success: true, progress })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update lesson progress
exports.updateLessonProgress = async (req, res) => {
  try {
    await db.read()
    const { courseId, lessonId } = req.params
    const userId = req.user?._id || req.user?.id || 'guest'
    
    let progressIndex = db.data.progress?.findIndex(p => p.userId === userId && p.courseId === courseId)
    
    // Auto-create progress if not found
    if (progressIndex === -1 || progressIndex === undefined) {
      const newProgress = new Progress({ userId, courseId, expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) })
      db.data.progress = db.data.progress || []
      db.data.progress.push(newProgress)
      progressIndex = db.data.progress.length - 1
    }
    
    const progress = db.data.progress[progressIndex]
    
    if (!progress.lessonsCompleted.includes(lessonId)) {
      progress.lessonsCompleted.push(lessonId)
    }
    
    // Calculate completion percentage based on total lessons in course
    const courseLessons = db.data.lessons?.filter(l => {
      const module = db.data.modules?.find(m => m._id === l.moduleId)
      return module?.courseId === courseId
    }) || []
    
    const totalLessons = courseLessons.length || 1
    progress.completionPercentage = Math.round((progress.lessonsCompleted.length / totalLessons) * 100)
    progress.lastAccessedAt = new Date()
    
    db.data.progress[progressIndex] = progress
    await db.write()
    
    res.json({ success: true, progress })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update quiz progress
exports.updateQuizProgress = async (req, res) => {
  try {
    await db.read()
    const { courseId, quizId } = req.params
    const { score } = req.body
    const userId = req.user?._id || req.user?.id || 'guest'
    
    let progressIndex = db.data.progress?.findIndex(p => p.userId === userId && p.courseId === courseId)
    
    // Auto-create progress if not found
    if (progressIndex === -1 || progressIndex === undefined) {
      const newProgress = new Progress({ userId, courseId, expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) })
      db.data.progress = db.data.progress || []
      db.data.progress.push(newProgress)
      progressIndex = db.data.progress.length - 1
    }
    
    const progress = db.data.progress[progressIndex]
    
    if (!progress.quizzesCompleted.includes(quizId)) {
      progress.quizzesCompleted.push(quizId)
    }
    
    progress.quizScores.push({ quizId, score, completedAt: new Date() })
    progress.lastAccessedAt = new Date()
    if (progress.calculateProgress) {
      progress.calculateProgress()
    }
    
    db.data.progress[progressIndex] = progress
    await db.write()
    
    res.json({ success: true, progress })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all user progress
exports.getAllUserProgress = async (req, res) => {
  try {
    await db.read()
    const userId = req.user?._id || req.user?.id || 'guest'
    
    const userProgress = db.data.progress?.filter(p => p.userId === userId) || []
    
    // Check expiry for all courses
    userProgress.forEach(p => {
      if (p.checkExpiry) {
        p.checkExpiry()
      }
    })
    
    res.json({ success: true, progress: userProgress })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
