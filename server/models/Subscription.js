class Subscription {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
    this.userId = data.userId
    this.courseId = data.courseId
    this.planName = data.planName
    this.startDate = data.startDate || new Date()
    this.endDate = data.endDate
    this.durationDays = data.durationDays
    this.status = data.status || 'active' // active, expired, cancelled
    this.autoRenew = data.autoRenew || false
    this.price = data.price
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}

module.exports = Subscription
