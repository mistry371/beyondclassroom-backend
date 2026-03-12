class Quiz {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36)
    this.moduleId = data.moduleId
    this.title = data.title
    this.description = data.description
    this.timeLimit = data.timeLimit || 30 // minutes
    this.passingScore = data.passingScore || 70 // percentage
    this.questions = data.questions || []
    this.totalPoints = data.totalPoints || 100
    this.createdAt = data.createdAt || new Date()
  }
}

module.exports = Quiz
