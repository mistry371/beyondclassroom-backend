const { db } = require('../database/db')

// Auto-enroll new users in free demo course
async function autoEnrollDemoCourse(userId) {
  try {
    await db.read()

    // Find the demo course — only match explicitly marked demo courses, NOT by price
    const demoCourse = db.data.courses?.find(c => c.isDemo === true)
    
    if (!demoCourse) {
      console.log('No demo course found for auto-enrollment')
      return
    }

    // Find the user
    const userIndex = db.data.users?.findIndex(u => u._id === userId)
    
    if (userIndex === -1) {
      console.log('User not found for auto-enrollment')
      return
    }

    const user = db.data.users[userIndex]

    // Check if already enrolled
    if (user.purchasedCourses?.includes(demoCourse._id)) {
      console.log('User already enrolled in demo course')
      return
    }

    // Enroll user
    if (!user.purchasedCourses) {
      user.purchasedCourses = []
    }
    user.purchasedCourses.push(demoCourse._id)

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
      lastAccessedAt: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      createdAt: new Date()
    }

    db.data.progress = db.data.progress || []
    db.data.progress.push(progressRecord)

    // Update user in database
    db.data.users[userIndex] = user

    await db.write()

    console.log(`✅ Auto-enrolled user ${user.email} in demo course: ${demoCourse.title}`)
    
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
