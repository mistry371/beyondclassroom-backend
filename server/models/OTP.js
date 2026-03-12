class OTP {
  constructor(data) {
    this._id = data._id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
    this.email = data.email
    this.otp = data.otp
    this.purpose = data.purpose // 'registration', 'login', 'password_reset'
    this.expiresAt = data.expiresAt || new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    this.verified = data.verified || false
    this.attempts = data.attempts || 0
    this.createdAt = data.createdAt || new Date()
  }
}

module.exports = OTP
