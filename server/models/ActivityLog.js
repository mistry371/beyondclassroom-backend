class ActivityLog {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
    this.userId = data.userId
    this.userName = data.userName
    this.action = data.action
    this.module = data.module
    this.description = data.description
    this.metadata = data.metadata || {}
    this.ipAddress = data.ipAddress
    this.userAgent = data.userAgent
    this.timestamp = data.timestamp || new Date()
  }
}

module.exports = ActivityLog
