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
    // Multi-document attachment (stored as base64 or URL)
    this.documents = Array.isArray(data.documents)
      ? data.documents
      : (data.document ? [data.document] : [])
    this.document = this.documents[0] || null
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}

module.exports = Subtopic
