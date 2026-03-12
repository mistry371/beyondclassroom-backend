class Setting {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
    this.key = data.key
    this.value = data.value
    this.type = data.type // string, number, boolean, json
    this.category = data.category // general, email, payment, features, etc
    this.displayName = data.displayName
    this.description = data.description
    this.isPublic = data.isPublic || false
    this.updatedAt = data.updatedAt || new Date()
    this.updatedBy = data.updatedBy
  }
}

module.exports = Setting
