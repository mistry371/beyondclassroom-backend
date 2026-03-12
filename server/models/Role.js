class Role {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
    this.name = data.name
    this.displayName = data.displayName
    this.description = data.description
    this.permissions = data.permissions || []
    this.isActive = data.isActive !== undefined ? data.isActive : true
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }
}

module.exports = Role
