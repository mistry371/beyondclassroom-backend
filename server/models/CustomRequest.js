class CustomRequest {
  constructor(data) {
    this._id = data._id || Date.now().toString(36) + Math.random().toString(36).slice(2,9)
    this.userId = data.userId
    this.userName = data.userName
    this.userEmail = data.userEmail
    this.courseId = data.courseId || null
    this.packageId = data.packageId || null
    this.title = data.title || 'Custom Study Plan'
    this.description = data.description || ''
    this.selectedTopics = data.selectedTopics || []  // [{ courseId, courseTitle, moduleId, moduleTitle }]
    this.selectedModules = data.selectedModules || []
    this.selectedLessons = data.selectedLessons || []
    this.selectedSubtopics = data.selectedSubtopics || []
    this.selectedPdfs = data.selectedPdfs || []
    this.preferences = data.preferences || {}
    this.roadmap = data.roadmap || []
    this.estimatedDuration = data.estimatedDuration || ''
    this.finalRoadmap = data.finalRoadmap || ''
    this.finalDuration = data.finalDuration || ''
    this.finalPrice = data.finalPrice || null
    this.packageSummary = data.packageSummary || ''
    this.deliverable = data.deliverable || 'question_paper'  // question_paper | study_notes | both
    this.difficulty = data.difficulty || 'medium'
    this.deadline = data.deadline || null
    this.budget = data.budget || null
    this.status = data.status || 'pending'  // pending | reviewing | quoted | accepted | completed | rejected
    this.adminNote = data.adminNote || ''
    this.quotedPrice = data.quotedPrice || null
    this.paymentStatus = data.paymentStatus || 'unpaid'
    this.paymentId = data.paymentId || null
    this.paidAt = data.paidAt || null
    this.assignedToUserId = data.assignedToUserId || this.userId
    this.assignedToUserName = data.assignedToUserName || this.userName
    this.deliveryItems = data.deliveryItems || []
    this.studentMessages = data.studentMessages || []
    this.studentAttachedFile = data.studentAttachedFile || null
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}
module.exports = CustomRequest
