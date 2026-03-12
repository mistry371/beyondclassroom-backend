// Professional Email Templates for Elite Math Platform

const getEmailHeader = () => `
  <div style="background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">Elite Math Platform</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Excellence in Mathematics Education</p>
  </div>
`

const getEmailFooter = () => `
  <div style="background: #1f2937; padding: 30px 20px; text-align: center; margin-top: 40px;">
    <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
      © 2026 Elite Math Platform. All rights reserved.
    </p>
    <p style="color: #6b7280; margin: 0; font-size: 12px;">
      This email was sent to you because you registered on our platform.
    </p>
    <div style="margin-top: 20px;">
      <a href="http://localhost:3000" style="color: #22d3ee; text-decoration: none; margin: 0 10px;">Home</a>
      <a href="http://localhost:3000/courses" style="color: #22d3ee; text-decoration: none; margin: 0 10px;">Courses</a>
      <a href="http://localhost:3000/contact" style="color: #22d3ee; text-decoration: none; margin: 0 10px;">Contact</a>
    </div>
  </div>
`

// OTP Email Template
exports.otpEmailTemplate = (otpCode, purpose, expiresIn = '10 minutes') => {
  const purposeText = {
    'registration': 'Registration',
    'login': 'Login',
    'password_reset': 'Password Reset'
  }[purpose] || 'Verification'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your ${purposeText} OTP</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        ${getEmailHeader()}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Your ${purposeText} OTP</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Hello! You requested a one-time password (OTP) to complete your ${purpose}. Please use the code below:
          </p>
          
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%); border: 3px dashed #22d3ee; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
            <h1 style="color: #22d3ee; font-size: 56px; margin: 0; letter-spacing: 12px; font-weight: 700;">${otpCode}</h1>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⏰ Important:</strong> This OTP will expire in ${expiresIn}. Please use it before it expires.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Security Tips:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Never share your OTP with anyone</li>
              <li>Our team will never ask for your OTP</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Contact support if you notice suspicious activity</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/contact" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Contact Support
            </a>
          </div>
        </div>
        
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `
}

// Welcome Email Template
exports.welcomeEmailTemplate = (userName, userEmail) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Elite Math Platform</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        ${getEmailHeader()}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px;">Welcome, ${userName}! 🎉</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            We're thrilled to have you join the Elite Math Platform community! You've taken the first step towards mastering mathematics and achieving academic excellence.
          </p>
          
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%); padding: 30px; border-radius: 12px; margin: 30px 0;">
            <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">What's Next?</h3>
            <div style="margin-bottom: 15px;">
              <div style="display: inline-block; background: #22d3ee; color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; margin-right: 10px;">1</div>
              <span style="color: #4b5563; font-size: 16px;">Explore our 25+ comprehensive courses</span>
            </div>
            <div style="margin-bottom: 15px;">
              <div style="display: inline-block; background: #a855f7; color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; margin-right: 10px;">2</div>
              <span style="color: #4b5563; font-size: 16px;">Try our 26 interactive math tools</span>
            </div>
            <div style="margin-bottom: 15px;">
              <div style="display: inline-block; background: #22d3ee; color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; margin-right: 10px;">3</div>
              <span style="color: #4b5563; font-size: 16px;">Start learning and track your progress</span>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Your Account Details:</h3>
            <p style="color: #6b7280; margin: 5px 0; font-size: 14px;"><strong>Email:</strong> ${userEmail}</p>
            <p style="color: #6b7280; margin: 5px 0; font-size: 14px;"><strong>Registration Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin-right: 10px;">
              Go to Dashboard
            </a>
            <a href="http://localhost:3000/courses" style="display: inline-block; background: white; color: #22d3ee; border: 2px solid #22d3ee; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
              Browse Courses
            </a>
          </div>
          
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
            <p style="color: #065f46; margin: 0; font-size: 14px;">
              <strong>💡 Pro Tip:</strong> Complete your profile and set your learning goals to get personalized course recommendations!
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
            Need help getting started? Check out our <a href="http://localhost:3000/about" style="color: #22d3ee; text-decoration: none;">Getting Started Guide</a> or contact our support team.
          </p>
        </div>
        
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `
}

// Course Enrollment Email Template
exports.courseEnrollmentEmailTemplate = (userName, courseName, coursePrice) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Course Enrollment Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        ${getEmailHeader()}
        
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: #10b981; color: white; width: 80px; height: 80px; border-radius: 50%; text-align: center; line-height: 80px; font-size: 40px;">
              ✓
            </div>
          </div>
          
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px; text-align: center;">Enrollment Successful!</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
            Congratulations, ${userName}! You've successfully enrolled in:
          </p>
          
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">${courseName}</h3>
            <p style="color: #6b7280; margin: 0; font-size: 18px;">₹${coursePrice}</p>
          </div>
          
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What's Included:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 2;">
              <li>Lifetime access to course content</li>
              <li>Interactive practice exercises</li>
              <li>Quizzes and assessments</li>
              <li>Certificate of completion</li>
              <li>24/7 support</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
              Start Learning Now
            </a>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>📧 Receipt:</strong> A detailed receipt has been sent to your email address.
            </p>
          </div>
        </div>
        
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `
}

// Course Expiry Reminder Email Template
exports.courseExpiryReminderEmailTemplate = (userName, courseName, daysRemaining) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Course Expiry Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        ${getEmailHeader()}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Course Access Expiring Soon</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${userName},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            This is a friendly reminder that your access to <strong>${courseName}</strong> will expire in <strong>${daysRemaining} days</strong>.
          </p>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="color: #991b1b; margin: 0; font-size: 16px;">
              <strong>⚠️ Action Required:</strong> Complete your remaining lessons before access expires!
            </p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
              Continue Learning
            </a>
          </div>
        </div>
        
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `
}

// Password Reset Email Template
exports.passwordResetEmailTemplate = (userName, resetLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        ${getEmailHeader()}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${userName},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
              Reset Password
            </a>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `
}

module.exports = {
  otpEmailTemplate: exports.otpEmailTemplate,
  welcomeEmailTemplate: exports.welcomeEmailTemplate,
  courseEnrollmentEmailTemplate: exports.courseEnrollmentEmailTemplate,
  courseExpiryReminderEmailTemplate: exports.courseExpiryReminderEmailTemplate,
  passwordResetEmailTemplate: exports.passwordResetEmailTemplate
}
