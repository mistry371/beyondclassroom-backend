class CustomCourseRequest {
  constructor(data) {
    this._id = data._id || Date.now().toString(36) + Math.random().toString(36).slice(2,9)
    this.userId = data.userId
    this.userName = data.userName
    this.userEmail = data.userEmail
    this.title = data.title || 'Custom Course Request'
    this.selectedTopics = data.selectedTopics || []  // [{ courseId, courseTitle, moduleId, moduleTitle }]
    this.description = data.description || ''
    this.purpose = data.purpose || ''
    this.preferredFormat = data.preferredFormat || 'question_paper'
    this.status = data.status || 'pending'  // pending | reviewing | quoted | accepted | rejected | completed
    this.adminNote = data.adminNote || ''
    this.quotedPrice = data.quotedPrice || null
    this.paymentStatus = data.paymentStatus || 'unpaid'  // unpaid | paid
    this.paymentId = data.paymentId || null
    this.assignedToUserId = data.assignedToUserId || this.userId
    this.assignedToUserName = data.assignedToUserName || this.userName
    this.deliveryItems = data.deliveryItems || [] // [{title,type,url,note}]
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}
module.exports = CustomCourseRequest
