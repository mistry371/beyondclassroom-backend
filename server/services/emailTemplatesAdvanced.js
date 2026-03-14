// ============================================
// BEYOND CLASSROOM - ADVANCED EMAIL TEMPLATES
// Complete Email Communication System
// ============================================

const getEmailHeader = (title = 'Beyond Classroom') => `
  <div style="background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">${title}</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Excellence in Mathematics Education</p>
  </div>
`

const getEmailFooter = () => `
  <div style="background: #1f2937; padding: 30px 20px; text-align: center; margin-top: 40px;">
    <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
      © 2026 Beyond Classroom. All rights reserved.
    </p>
    <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 12px;">
      Need help? Contact us at support@beyondclassroom.com
    </p>
    <div style="margin-top: 20px;">
      <a href="http://localhost:3000" style="color: #22d3ee; text-decoration: none; margin: 0 10px;">Home</a>
      <a href="http://localhost:3000/courses" style="color: #22d3ee; text-decoration: none; margin: 0 10px;">Courses</a>
      <a href="http://localhost:3000/tools" style="color: #22d3ee; text-decoration: none; margin: 0 10px;">Tools</a>
      <a href="http://localhost:3000/contact" style="color: #22d3ee; text-decoration: none; margin: 0 10px;">Contact</a>
    </div>
    <div style="margin-top: 20px;">
      <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://img.icons8.com/color/32/000000/facebook.png" alt="Facebook" style="width: 24px; height: 24px;"/></a>
      <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://img.icons8.com/color/32/000000/twitter.png" alt="Twitter" style="width: 24px; height: 24px;"/></a>
      <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://img.icons8.com/color/32/000000/instagram-new.png" alt="Instagram" style="width: 24px; height: 24px;"/></a>
    </div>
  </div>
`

const getBaseTemplate = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
      ${content}
    </div>
  </body>
  </html>
`

// ============================================
// CATEGORY 1: AUTHENTICATION EMAILS
// ============================================


// 1.1 OTP Verification Email
exports.otpVerificationEmail = (userName, otpCode, purpose = 'login', expiresIn = '10 minutes') => {
  const purposeText = {
    'registration': 'Registration',
    'login': 'Login',
    'password_reset': 'Password Reset',
    'email_verification': 'Email Verification'
  }[purpose] || 'Verification'

  const content = `
    ${getEmailHeader('Verify Your Identity')}
    <div style="padding: 40px 30px;">
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${userName}! 👋</h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        You requested a one-time password (OTP) for ${purposeText.toLowerCase()}. Please use the code below to proceed:
      </p>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%); border: 3px dashed #22d3ee; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
        <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
        <h1 style="color: #22d3ee; font-size: 56px; margin: 0; letter-spacing: 12px; font-weight: 700;">${otpCode}</h1>
        <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">Valid for ${expiresIn}</p>
      </div>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          <strong>⏰ Important:</strong> This OTP will expire in ${expiresIn}. Please use it before it expires.
        </p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">🔒 Security Tips:</h3>
        <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Never share your OTP with anyone</li>
          <li>Our team will never ask for your OTP</li>
          <li>If you didn't request this, please ignore this email</li>
          <li>Contact support immediately if you notice suspicious activity</li>
        </ul>
      </div>
    </div>
    ${getEmailFooter()}
  `
  return getBaseTemplate(content)
}


// 1.2 Registration Confirmation Email
exports.registrationConfirmationEmail = (userName, userEmail) => {
  const content = `
    ${getEmailHeader('Welcome to Beyond Classroom')}
    <div style="padding: 40px 30px;">
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px;">Welcome, ${userName}! 🎉</h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        We're thrilled to have you join the Beyond Classroom community! You've taken the first step towards mastering mathematics and achieving academic excellence.
      </p>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%); padding: 30px; border-radius: 12px; margin: 30px 0;">
        <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">🚀 What's Next?</h3>
        <div style="margin-bottom: 15px;">
          <div style="display: inline-block; background: #22d3ee; color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; margin-right: 10px; vertical-align: middle;">1</div>
          <span style="color: #4b5563; font-size: 16px; vertical-align: middle;">Explore our 40+ comprehensive courses</span>
        </div>
        <div style="margin-bottom: 15px;">
          <div style="display: inline-block; background: #a855f7; color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; margin-right: 10px; vertical-align: middle;">2</div>
          <span style="color: #4b5563; font-size: 16px; vertical-align: middle;">Try our 40 interactive math tools</span>
        </div>
        <div style="margin-bottom: 15px;">
          <div style="display: inline-block; background: #22d3ee; color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; margin-right: 10px; vertical-align: middle;">3</div>
          <span style="color: #4b5563; font-size: 16px; vertical-align: middle;">Start learning and track your progress</span>
        </div>
      </div>
      
      <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📋 Your Account Details:</h3>
        <p style="color: #6b7280; margin: 5px 0; font-size: 14px;"><strong>Email:</strong> ${userEmail}</p>
        <p style="color: #6b7280; margin: 5px 0; font-size: 14px;"><strong>Registration Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p style="color: #6b7280; margin: 5px 0; font-size: 14px;"><strong>Account Type:</strong> Student</p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="http://localhost:3000/dashboard" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin: 0 5px 10px 5px;">
          Go to Dashboard
        </a>
        <a href="http://localhost:3000/courses" style="display: inline-block; background: white; color: #22d3ee; border: 2px solid #22d3ee; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin: 0 5px 10px 5px;">
          Browse Courses
        </a>
      </div>
      
      <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #065f46; margin: 0; font-size: 14px;">
          <strong>💡 Pro Tip:</strong> Start with our FREE demo course to explore all platform features!
        </p>
      </div>
    </div>
    ${getEmailFooter()}
  `
  return getBaseTemplate(content)
}

// 1.3 Password Reset Email
exports.passwordResetEmail = (userName, resetLink, expiryTime = '1 hour') => {
  const content = `
    ${getEmailHeader('Password Reset Request')}
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
          <strong>⏰ Important:</strong> This link will expire in ${expiryTime} for security reasons.
        </p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
        If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
      </p>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="color: #6b7280; margin: 0; font-size: 12px;">
          <strong>Alternative:</strong> If the button doesn't work, copy and paste this link into your browser:<br/>
          <span style="color: #22d3ee; word-break: break-all;">${resetLink}</span>
        </p>
      </div>
    </div>
    ${getEmailFooter()}
  `
  return getBaseTemplate(content)
}

// 1.4 New Login Alert Email
exports.newLoginAlertEmail = (userName, device, location, loginTime, ipAddress) => {
  const content = `
    ${getEmailHeader('New Login Detected')}
    <div style="padding: 40px 30px;">
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">🔐 New Login Detected</h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hi ${userName},
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        We detected a new login to your Beyond Classroom account. If this was you, you can safely ignore this email.
      </p>
      
      <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0; border: 2px solid #e5e7eb;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Login Details:</h3>
        <p style="color: #6b7280; margin: 8px 0; font-size: 14px;"><strong>Device:</strong> ${device}</p>
        <p style="color: #6b7280; margin: 8px 0; font-size: 14px;"><strong>Location:</strong> ${location}</p>
        <p style="color: #6b7280; margin: 8px 0; font-size: 14px;"><strong>Time:</strong> ${loginTime}</p>
        <p style="color: #6b7280; margin: 8px 0; font-size: 14px;"><strong>IP Address:</strong> ${ipAddress}</p>
      </div>
      
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #991b1b; margin: 0 0 15px 0; font-size: 14px;">
          <strong>⚠️ Wasn't you?</strong> If you don't recognize this login, your account may be compromised.
        </p>
        <a href="http://localhost:3000/profile/security" style="display: inline-block; background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
          Secure My Account
        </a>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">🔒 Security Tips:</h3>
        <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Use a strong, unique password</li>
          <li>Enable two-factor authentication</li>
          <li>Never share your password</li>
          <li>Log out from shared devices</li>
        </ul>
      </div>
    </div>
    ${getEmailFooter()}
  `
  return getBaseTemplate(content)
}

// ============================================
// CATEGORY 2: COURSE & LEARNING EMAILS
// ============================================

// 2.1 Course Enrollment Confirmation
exports.courseEnrollmentEmail = (userName, courseName, coursePrice, courseId) => {
  const content = `
    ${getEmailHeader('Enrollment Successful')}
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
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📚 What's Included:</h3>
        <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 2;">
          <li>Lifetime access to course content</li>
          <li>Interactive practice exercises</li>
          <li>Quizzes and assessments</li>
          <li>Progress tracking</li>
          <li>Certificate of completion</li>
          <li>24/7 support</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="http://localhost:3000/learn/${courseId}" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
          Start Learning Now
        </a>
      </div>
      
      <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #065f46; margin: 0; font-size: 14px;">
          <strong>📧 Receipt:</strong> A detailed receipt has been sent to your email address.
        </p>
      </div>
    </div>
    ${getEmailFooter()}
  `
  return getBaseTemplate(content)
}

module.exports = {
  otpVerificationEmail: exports.otpVerificationEmail,
  registrationConfirmationEmail: exports.registrationConfirmationEmail,
  passwordResetEmail: exports.passwordResetEmail,
  newLoginAlertEmail: exports.newLoginAlertEmail,
  courseEnrollmentEmail: exports.courseEnrollmentEmail
}
