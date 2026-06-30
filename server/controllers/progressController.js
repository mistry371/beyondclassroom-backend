const { db, models } = require('../database/db')

// Get user progress for a course
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user?._id || req.user?.id || 'guest'
    
    let progress = await models.progress.findOne({ userId, courseId }).lean()
    
    if (!progress) {
      // Create new progress record
      progress = { 
        _id: `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId, 
        courseId, 
        completionPercentage: 0,
        lessonsCompleted: [],
        quizzesCompleted: [],
        quizScores: [],
        enrolledAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
      await models.progress.create(progress)
      
      if (db.data.progress) {
        db.data.progress.push(progress)
      }
    }
    
    res.json({ success: true, progress })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update lesson progress
exports.updateLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params
    const userId = req.user?._id || req.user?.id || 'guest'
    
    let progress = await models.progress.findOne({ userId, courseId }).lean()
    
    if (!progress) {
      progress = { 
        _id: `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId, 
        courseId, 
        completionPercentage: 0,
        lessonsCompleted: [],
        quizzesCompleted: [],
        quizScores: [],
        enrolledAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
      await models.progress.create(progress)
      if (db.data.progress) db.data.progress.push(progress)
    }
    
    const lessonsCompleted = [...new Set([...(progress.lessonsCompleted || []), lessonId])]
    
    // Calculate completion percentage based on total lessons in course
    const modules = await models.modules.find({ courseId }).lean()
    const moduleIds = modules.map(m => m._id)
    
    let courseLessons = await models.lessons.find({ moduleId: { $in: moduleIds } }).lean()
    
    // If the course uses direct subtopics instead of lessons (like the Demo course)
    if (courseLessons.length === 0) {
      courseLessons = await models.subtopics.find({ moduleId: { $in: moduleIds } }).lean()
    }
    
    const totalLessons = courseLessons.length || 1
    const completionPercentage = Math.round((lessonsCompleted.length / totalLessons) * 100)
    
    const updated = await models.progress.findOneAndUpdate(
      { userId, courseId },
      { 
        $set: { 
          lessonsCompleted,
          completionPercentage,
          lastAccessedAt: new Date().toISOString()
        }
      },
      { new: true }
    ).lean()
    
    if (db.data.progress) {
      const idx = db.data.progress.findIndex(p => p.userId === userId && p.courseId === courseId)
      if (idx !== -1) Object.assign(db.data.progress[idx], updated)
    }
    
    res.json({ success: true, progress: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update quiz progress
exports.updateQuizProgress = async (req, res) => {
  try {
    const { courseId, quizId } = req.params
    const { score } = req.body
    const userId = req.user?._id || req.user?.id || 'guest'
    
    let progress = await models.progress.findOne({ userId, courseId }).lean()
    
    if (!progress) {
      progress = { 
        _id: `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId, 
        courseId, 
        completionPercentage: 0,
        lessonsCompleted: [],
        quizzesCompleted: [],
        quizScores: [],
        enrolledAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
      await models.progress.create(progress)
      if (db.data.progress) db.data.progress.push(progress)
    }
    
    const quizzesCompleted = [...new Set([...(progress.quizzesCompleted || []), quizId])]
    
    const updated = await models.progress.findOneAndUpdate(
      { userId, courseId },
      { 
        $set: { 
          quizzesCompleted,
          lastAccessedAt: new Date().toISOString()
        },
        $push: {
          quizScores: { quizId, score, completedAt: new Date().toISOString() }
        }
      },
      { new: true }
    ).lean()
    
    if (db.data.progress) {
      const idx = db.data.progress.findIndex(p => p.userId === userId && p.courseId === courseId)
      if (idx !== -1) Object.assign(db.data.progress[idx], updated)
    }
    
    res.json({ success: true, progress: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all user progress
exports.getAllUserProgress = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || 'guest'
    
    const userProgress = await models.progress.find({ userId }).lean()
    
    res.json({ success: true, progress: userProgress })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
