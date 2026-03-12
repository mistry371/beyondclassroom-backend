class Permission {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
    this.name = data.name
    this.displayName = data.displayName
    this.description = data.description
    this.module = data.module
    this.action = data.action
    this.createdAt = data.createdAt || new Date()
  }
}

module.exports = Permission
