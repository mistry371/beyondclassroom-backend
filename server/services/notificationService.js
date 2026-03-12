const { db } = require('../database/db')
const { sendEmail } = require('./emailService')
const { welcomeEmailTemplate, courseEnrollmentEmailTemplate, courseExpiryReminderEmailTemplate } = require('./emailTemplates')

// Create notification
exports.createNotification = async (userId, title, message, type = 'info') => {
  try {
    await db.read()
    
    const notification = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      user: userId,
      title,
      message,
      type, // info, success, warning, error
      isRead: false,
      createdAt: new Date()
    }
    
    db.data.notifications = db.data.notifications || []
    db.data.notifications.push(notification)
    
    await db.write()
    
    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

// Send welcome notification
exports.sendWelcomeNotification = async (userId, userName, userEmail) => {
  try {
    // Create in-app notification
    await this.createNotification(
      userId,
      'Welcome to Elite Math Platform! 🎉',
      `Hi ${userName}! We're excited to have you here. Start exploring our courses and begin your learning journey today.`,
      'success'
    )
    
    // Send professional welcome email
    try {
      await sendEmail({
        to: userEmail,
        subject: 'Welcome to Elite Math Platform! 🎉',
        html: welcomeEmailTemplate(userName, userEmail)
      })
    } catch (emailError) {
      console.log('Email sending failed (optional):', emailError.message)
    }
    
    return true
  } catch (error) {
    console.error('Failed to send welcome notification:', error)
    return false
  }
}

// Send course enrollment notification
exports.sendEnrollmentNotification = async (userId, userName, userEmail, courseName) => {
  try {
    // Create in-app notification
    await this.createNotification(
      userId,
      'Course Enrollment Successful! 📚',
      `You've successfully enrolled in "${courseName}". Start learning now!`,
      'success'
    )
    
    // Send enrollment email
    try {
      await sendEmail({
        to: userEmail,
        subject: `Enrollment Confirmed: ${courseName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22d3ee;">Enrollment Confirmed! 🎓</h1>
            <p>Hi ${userName},</p>
            <p>Great news! You've successfully enrolled in:</p>
            <h2 style="color: #a855f7;">${courseName}</h2>
            <p>Your learning journey begins now. Access your course anytime from your dashboard.</p>
            <p><strong>Course Access:</strong> 90 days from enrollment</p>
            <p>Happy Learning!</p>
            <p><strong>The Elite Math Team</strong></p>
          </div>
        `
      })
    } catch (emailError) {
      console.log('Email sending failed (optional):', emailError.message)
    }
    
    return true
  } catch (error) {
    console.error('Failed to send enrollment notification:', error)
    return false
  }
}

// Send course expiry reminder
exports.sendExpiryReminder = async (userId, userName, userEmail, courseName, daysRemaining) => {
  try {
    // Create in-app notification
    await this.createNotification(
      userId,
      'Course Expiring Soon! ⏰',
      `Your access to "${courseName}" will expire in ${daysRemaining} days. Complete your learning or renew your subscription.`,
      'warning'
    )
    
    // Send expiry email
    try {
      await sendEmail({
        to: userEmail,
        subject: `Course Expiring Soon: ${courseName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Course Expiring Soon! ⏰</h1>
            <p>Hi ${userName},</p>
            <p>This is a friendly reminder that your access to:</p>
            <h2 style="color: #a855f7;">${courseName}</h2>
            <p>Will expire in <strong>${daysRemaining} days</strong>.</p>
            <p>Don't lose your progress! Consider renewing your subscription to continue learning.</p>
            <p><strong>The Elite Math Team</strong></p>
          </div>
        `
      })
    } catch (emailError) {
      console.log('Email sending failed (optional):', emailError.message)
    }
    
    return true
  } catch (error) {
    console.error('Failed to send expiry reminder:', error)
    return false
  }
}

// Send admin action notification
exports.sendAdminActionNotification = async (userId, userName, userEmail, action, details) => {
  try {
    // Create in-app notification
    await this.createNotification(
      userId,
      `Account ${action}`,
      details,
      action === 'suspended' ? 'error' : 'info'
    )
    
    // Send email
    try {
      await sendEmail({
        to: userEmail,
        subject: `Account ${action}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22d3ee;">Account Update</h1>
            <p>Hi ${userName},</p>
            <p>${details}</p>
            <p>If you have any questions, please contact our support team.</p>
            <p><strong>The Elite Math Team</strong></p>
          </div>
        `
      })
    } catch (emailError) {
      console.log('Email sending failed (optional):', emailError.message)
    }
    
    return true
  } catch (error) {
    console.error('Failed to send admin action notification:', error)
    return false
  }
}
