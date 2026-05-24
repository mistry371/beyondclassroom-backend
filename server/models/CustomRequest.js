class CustomRequest {
  constructor(data) {
    this._id = data._id || Date.now().toString(36) + Math.random().toString(36).slice(2,9)
    this.userId = data.userId
    this.userName = data.userName
    this.userEmail = data.userEmail
    this.title = data.title || 'Custom Study Plan'
    this.description = data.description || ''
    this.selectedTopics = data.selectedTopics || []  // [{ courseId, courseTitle, moduleId, moduleTitle }]
    this.deliverable = data.deliverable || 'question_paper'  // question_paper | study_notes | both
    this.difficulty = data.difficulty || 'medium'
    this.deadline = data.deadline || null
    this.budget = data.budget || null
    this.status = data.status || 'pending'  // pending | reviewing | quoted | accepted | completed | rejected
    this.adminNote = data.adminNote || ''
    this.quotedPrice = data.quotedPrice || null
    this.paymentId = data.paymentId || null
    this.paidAt = data.paidAt || null
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}
module.exports = CustomRequest
