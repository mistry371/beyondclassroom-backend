class ExamAttempt {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36).slice(2, 11)
    this.examId = data.examId
    this.userId = data.userId
    this.courseId = data.courseId || null

    // Timing
    this.startedAt = data.startedAt || new Date()
    this.submittedAt = data.submittedAt || null
    this.timeSpent = data.timeSpent || 0   // seconds

    // Answers: { sectionId_questionId: { answer, markedForReview, visitedAt, answeredAt } }
    this.answers = data.answers || {}

    // Results (populated after submission)
    this.sectionResults = data.sectionResults || []
    this.totalScore = data.totalScore || 0
    this.totalMarks = data.totalMarks || 0
    this.percentage = data.percentage || 0
    this.passed = data.passed || false
    this.rank = data.rank || null

    // Status
    this.status = data.status || 'in_progress'  // in_progress | submitted | evaluated
    this.submittedBy = data.submittedBy || 'user'  // user | auto (timer expired)

    this.createdAt = data.createdAt || new Date()
  }
}

module.exports = ExamAttempt
