class Practice {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36)
    this.lessonId = data.lessonId
    this.question = data.question
    this.type = data.type || 'solve' // solve, multiple-choice, fill-blank
    this.difficulty = data.difficulty || 'medium' // easy, medium, hard
    this.options = data.options || [] // for multiple choice
    this.answer = data.answer
    this.solution = data.solution // step-by-step solution
    this.hints = data.hints || []
    this.points = data.points || 10
    this.createdAt = data.createdAt || new Date()
  }
}

module.exports = Practice
