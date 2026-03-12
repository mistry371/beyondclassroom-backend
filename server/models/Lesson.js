class Lesson {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36)
    this.moduleId = data.moduleId
    this.title = data.title
    this.description = data.description
    this.order = data.order || 0
    this.duration = data.duration
    this.type = data.type || 'lesson' // lesson, video, practice, quiz
    this.content = data.content || {
      concept: '',
      examples: [],
      practice: [],
      summary: ''
    }
    this.videoUrl = data.videoUrl || null
    this.isLocked = data.isLocked || false
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}

module.exports = Lesson
