const { db, models } = require('../database/db')

// Auto-enroll new users in free demo course
async function autoEnrollDemoCourse(userId) {
  try {
    // Find the demo course — only match explicitly marked demo courses, NOT by price
    const demoCourse = await models.courses.findOne({ isDemo: true }).lean()
    
    if (!demoCourse) {
      console.log('No demo course found for auto-enrollment')
      return
    }

    // Find the user
    const user = await models.users.findOne({ _id: userId }).lean()
    
    if (!user) {
      console.log('User not found for auto-enrollment')
      return
    }

    // Check if already enrolled
    if (user.purchasedCourses?.includes(demoCourse._id)) {
      console.log('User already enrolled in demo course')
      return
    }

    // Enroll user
    await models.users.updateOne(
      { _id: userId },
      { $addToSet: { purchasedCourses: demoCourse._id } }
    )

    // Create progress record
    const progressRecord = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: user._id,
      courseId: demoCourse._id,
      completionPercentage: 0,
      lessonsCompleted: [],
      quizzesCompleted: [],
      practiceAccuracy: 0,
      quizScores: [],
      timeSpent: 0,
      lastAccessedAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      createdAt: new Date().toISOString()
    }

    await models.progress.create(progressRecord)

    if (db.data.users) {
      const uIdx = db.data.users.findIndex(u => u._id === userId)
      if (uIdx !== -1) {
        db.data.users[uIdx].purchasedCourses = db.data.users[uIdx].purchasedCourses || []
        if (!db.data.users[uIdx].purchasedCourses.includes(demoCourse._id)) {
          db.data.users[uIdx].purchasedCourses.push(demoCourse._id)
        }
      }
    }
    
    if (db.data.progress) {
      db.data.progress.push(progressRecord)
    }

    console.log(\`✅ Auto-enrolled user \${user.email} in demo course: \${demoCourse.title}\`)
    
    return {
      success: true,
      course: demoCourse,
      message: 'Successfully enrolled in free demo course'
    }
  } catch (error) {
    console.error('Error auto-enrolling in demo course:', error)
    return {
      success: false,
      message: 'Failed to auto-enroll in demo course'
    }
  }
}

module.exports = { autoEnrollDemoCourse }
