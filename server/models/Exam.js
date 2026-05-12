class Exam {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36).slice(2, 11)
    this.title = data.title
    this.description = data.description || ''
    this.courseId = data.courseId || null
    this.instructions = data.instructions || ''

    // Exam configuration
    this.duration = data.duration || 60           // minutes
    this.totalMarks = data.totalMarks || 100
    this.passingMarks = data.passingMarks || 35
    this.negativeMarking = data.negativeMarking !== false ? data.negativeMarking : false
    this.negativeMarkValue = data.negativeMarkValue || 0.25  // marks deducted per wrong answer
    this.shuffleQuestions = data.shuffleQuestions || false
    this.shuffleOptions = data.shuffleOptions || false
    this.showResultImmediately = data.showResultImmediately !== false
    this.allowReview = data.allowReview !== false
    this.maxAttempts = data.maxAttempts || 1

    // Sections (e.g. Physics, Chemistry, Maths for JEE)
    this.sections = data.sections || []
    // Each section: { _id, name, description, questions[], marksPerQuestion, negativeMarks, timeLimit? }

    this.isPublished = data.isPublished !== false
    this.startDate = data.startDate || null
    this.endDate = data.endDate || null
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}

module.exports = Exam
