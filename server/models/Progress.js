class Progress {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36)
    this.userId = data.userId
    this.courseId = data.courseId
    this.moduleId = data.moduleId || null
    this.lessonId = data.lessonId || null
    this.status = data.status || 'not_started' // not_started, in_progress, completed
    this.completionPercentage = data.completionPercentage || 0
    this.lessonsCompleted = data.lessonsCompleted || []
    this.quizzesCompleted = data.quizzesCompleted || []
    this.practiceAccuracy = data.practiceAccuracy || 0
    this.quizScores = data.quizScores || []
    this.timeSpent = data.timeSpent || 0 // minutes
    this.lastAccessedAt = data.lastAccessedAt || new Date()
    this.startedAt = data.startedAt || new Date()
    this.completedAt = data.completedAt || null
    this.expiryDate = data.expiryDate || null
    this.daysRemaining = data.daysRemaining || null
  }

  calculateProgress() {
    // Calculate overall progress based on completed lessons and quizzes
    const totalItems = this.lessonsCompleted.length + this.quizzesCompleted.length
    this.completionPercentage = totalItems > 0 ? Math.round((totalItems / 100) * 100) : 0
  }

  checkExpiry() {
    if (this.expiryDate) {
      const now = new Date()
      const expiry = new Date(this.expiryDate)
      const diffTime = expiry - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      this.daysRemaining = diffDays > 0 ? diffDays : 0
      return diffDays
    }
    return null
  }
}

module.exports = Progress
