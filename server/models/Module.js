class Module {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36)
    this.courseId = data.courseId
    this.title = data.title
    this.description = data.description
    this.order = data.order || 0
    this.duration = data.duration
    this.lessons = data.lessons || []
    this.quiz = data.quiz || null
    this.isLocked = data.isLocked || false
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}

module.exports = Module
