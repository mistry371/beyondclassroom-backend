class Subtopic {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36).slice(2, 11)
    this.lessonId = data.lessonId
    this.moduleId = data.moduleId || ''
    this.courseId = data.courseId || ''
    this.title = data.title
    this.content = data.content || ''
    this.order = data.order || 0
    this.isPublished = data.isPublished !== false
    // Document attachment (stored as base64 or URL)
    this.document = data.document || null  // { name, size, type, data (base64) }
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}

module.exports = Subtopic
