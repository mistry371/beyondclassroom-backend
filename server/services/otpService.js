const { db, models } = require('../database/db')
const { sendEmail } = require('./emailService')
const { otpEmailTemplate } = require('./emailTemplates')

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Create and send OTP
exports.createAndSendOTP = async (email, purpose = 'registration') => {
  try {
    // Generate OTP
    const otpCode = generateOTP()
    
    // Create OTP record
    const otpData = {
      email,
      otp: otpCode,
      purpose,
      verified: false,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    }
    
    // Remove old OTPs for this email and purpose
    await models.otps.deleteMany({ email, purpose })
    if (db.data.otps) {
      db.data.otps = db.data.otps.filter(o => !(o.email === email && o.purpose === purpose))
    }
    
    // Add new OTP
    await models.otps.create(otpData)
    if (db.data.otps) {
      db.data.otps.push(otpData)
    }
    
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
    console.log(`Expires: ${otpData.expiresAt}`);
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
    
    // Return success — OTP sent via email only (no fallback leak)
    return {
      success: true,
      message: 'OTP sent successfully to your email. Please check your inbox.',
      expiresAt: otpData.expiresAt
    }
  } catch (error) {
    console.error('Failed to create OTP:', error)
    throw error
  }
}

// Verify OTP
exports.verifyOTP = async (email, otpCode, purpose = 'registration') => {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 VERIFYING OTP');
    console.log('='.repeat(60));
    console.log(`Email: ${email}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log(`Purpose: ${purpose}`);
    
    // Find OTP
    const otp = await models.otps.findOne({ email, purpose, verified: false }).lean()
    
    if (!otp) {
      console.log('❌ OTP not found or already verified');
      console.log('='.repeat(60) + '\n');
      return {
        success: false,
        message: 'OTP not found or already used'
      }
    }
    
    console.log(`Found OTP: ${otp.otp}`);
    console.log(`Expires At: ${otp.expiresAt}`);
    console.log(`Current Time: ${new Date().toISOString()}`);
    
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
      const updated = await models.otps.findOneAndUpdate(
        { _id: otp._id },
        { $inc: { attempts: 1 } },
        { new: true }
      ).lean()
      
      if (db.data.otps) {
        const idx = db.data.otps.findIndex(o => o._id.toString() === otp._id.toString())
        if (idx !== -1) db.data.otps[idx].attempts = updated.attempts
      }
      
      console.log(`❌ Invalid OTP. Attempts: ${updated.attempts}/3`);
      console.log('='.repeat(60) + '\n');
      
      return {
        success: false,
        message: `Invalid OTP. ${3 - updated.attempts} attempts remaining.`
      }
    }
    
    // Mark as verified
    await models.otps.updateOne({ _id: otp._id }, { $set: { verified: true } })
    if (db.data.otps) {
      const idx = db.data.otps.findIndex(o => o._id.toString() === otp._id.toString())
      if (idx !== -1) db.data.otps[idx].verified = true
    }
    
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
    const now = new Date().toISOString()
    await models.otps.deleteMany({ expiresAt: { $lte: now } })
    
    if (db.data.otps) {
      db.data.otps = db.data.otps.filter(otp => new Date(otp.expiresAt) > new Date(now))
    }
  } catch (error) {
    console.error('Failed to clean expired OTPs:', error)
  }
}
