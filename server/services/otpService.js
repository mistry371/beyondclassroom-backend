const { db } = require('../database/db')
const { sendEmail } = require('./emailService')
const { otpEmailTemplate } = require('./emailTemplates')
const OTP = require('../models/OTP')

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Create and send OTP
exports.createAndSendOTP = async (email, purpose = 'registration') => {
  try {
    await db.read()
    
    // Generate OTP
    const otpCode = generateOTP()
    
    // Create OTP record
    const otp = new OTP({
      email,
      otp: otpCode,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    })
    
    // Initialize OTP collection
    db.data.otps = db.data.otps || []
    
    // Remove old OTPs for this email and purpose
    db.data.otps = db.data.otps.filter(o => 
      !(o.email === email && o.purpose === purpose)
    )
    
    // Add new OTP
    db.data.otps.push(otp)
    await db.write()
    
    // Send OTP via email
    const purposeText = {
      'registration': 'Registration',
      'login': 'Login',
      'password_reset': 'Password Reset'
    }[purpose] || 'Verification'
    
    console.log('\n' + '='.repeat(60));
    console.log('🔐 OTP GENERATED');
    console.log('='.repeat(60));
    console.log(`Email: ${email}`);
    console.log(`OTP: ${otpCode}`);
    console.log(`Purpose: ${purposeText}`);
    console.log(`Expires: ${otp.expiresAt}`);
    console.log('='.repeat(60) + '\n');
    
    try {
      const emailResult = await sendEmail({
        to: email,
        subject: `Your ${purposeText} OTP - Beyond Classroom`,
        html: otpEmailTemplate(otpCode, purpose, '10 minutes')
      })
      
      if (emailResult.success) {
        console.log(`✅ OTP email sent successfully to ${email}`);
      } else {
        console.log(`⚠️ Email failed but OTP created: ${otpCode}`);
      }
    } catch (emailError) {
      console.log(`⚠️ Email error but OTP created: ${otpCode}`);
      console.error('Email error details:', emailError.message);
    }
    
    // Return success message (OTP removed from response for security)
    return {
      success: true,
      message: 'OTP sent successfully to your email. Please check your inbox.',
      // otp: otpCode, // Removed for security - only in email
      expiresAt: otp.expiresAt
    }
  } catch (error) {
    console.error('Failed to create OTP:', error)
    throw error
  }
}

// Verify OTP
exports.verifyOTP = async (email, otpCode, purpose = 'registration') => {
  try {
    await db.read()
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 VERIFYING OTP');
    console.log('='.repeat(60));
    console.log(`Email: ${email}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`Total OTPs in DB: ${db.data.otps?.length || 0}`);
    
    // Find OTP
    const otpIndex = db.data.otps?.findIndex(o => 
      o.email === email && 
      o.purpose === purpose && 
      !o.verified
    )
    
    console.log(`OTP Index Found: ${otpIndex}`);
    
    if (otpIndex === -1) {
      console.log('❌ OTP not found or already verified');
      console.log('='.repeat(60) + '\n');
      return {
        success: false,
        message: 'OTP not found or already used'
      }
    }
    
    const otp = db.data.otps[otpIndex]
    console.log(`Found OTP: ${otp.otp}`);
    console.log(`Expires At: ${otp.expiresAt}`);
    console.log(`Current Time: ${new Date()}`);
    
    // Check expiration
    if (new Date() > new Date(otp.expiresAt)) {
      console.log('❌ OTP expired');
      console.log('='.repeat(60) + '\n');
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      }
    }
    
    // Check attempts
    if (otp.attempts >= 3) {
      console.log('❌ Too many attempts');
      console.log('='.repeat(60) + '\n');
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      }
    }
    
    // Verify OTP
    if (otp.otp !== otpCode) {
      // Increment attempts
      db.data.otps[otpIndex].attempts += 1
      await db.write()
      
      console.log(`❌ Invalid OTP. Attempts: ${db.data.otps[otpIndex].attempts}/3`);
      console.log('='.repeat(60) + '\n');
      
      return {
        success: false,
        message: `Invalid OTP. ${3 - db.data.otps[otpIndex].attempts} attempts remaining.`
      }
    }
    
    // Mark as verified
    db.data.otps[otpIndex].verified = true
    await db.write()
    
    console.log('✅ OTP verified successfully');
    console.log('='.repeat(60) + '\n');
    
    return {
      success: true,
      message: 'OTP verified successfully'
    }
  } catch (error) {
    console.error('Failed to verify OTP:', error)
    throw error
  }
}

// Clean expired OTPs (run periodically)
exports.cleanExpiredOTPs = async () => {
  try {
    await db.read()
    
    const now = new Date()
    db.data.otps = db.data.otps?.filter(otp => 
      new Date(otp.expiresAt) > now
    ) || []
    
    await db.write()
  } catch (error) {
    console.error('Failed to clean expired OTPs:', error)
  }
}
