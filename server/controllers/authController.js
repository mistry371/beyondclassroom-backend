const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { models } = require('../database/db');

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11);
const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

const generateToken = (id, sid) => {
  return jwt.sign({ id, sid }, process.env.JWT_SECRET || 'beyond-classroom-fallback-secret-change-in-production', {
    expiresIn: '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, referralCode } = req.body;
    const phoneNorm = normalizePhone(phone);
    const emailNorm = email ? String(email).toLowerCase().trim() : '';

    if (!name || !phoneNorm || !password) {
      return res.status(400).json({ message: 'Please provide name, mobile number and password' });
    }

    if (phoneNorm.length < 10) {
      return res.status(400).json({ message: 'Please provide a valid mobile number' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (emailNorm) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailNorm)) {
        return res.status(400).json({ message: 'Please provide a valid email' });
      }
    }

    let phoneQuery = [{ phone: phoneNorm }];
    if (phoneNorm.startsWith('91') && phoneNorm.length > 10) {
      phoneQuery.push({ phone: phoneNorm.replace(/^91/, '') });
    }
    const phoneExists = await models.users.findOne({ $or: phoneQuery }).lean();
    if (phoneExists) {
      return res.status(400).json({ message: 'Mobile number already registered' });
    }

    if (emailNorm) {
      const emailExists = await models.users.findOne({ email: emailNorm }).lean();
      if (emailExists) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const trialStartedAt = new Date();
    const trialEndsAt = new Date(trialStartedAt.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    const user = {
      _id: generateId(),
      name,
      email: emailNorm || undefined,
      phone: phoneNorm,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      profilePhoto: '',
      isGuest: false,
      purchasedCourses: [],
      favorites: [],
      emailVerified: true,
      trialStartedAt: trialStartedAt.toISOString(),
      trialEndsAt: trialEndsAt.toISOString(),
      trialExpired: false,
      createdAt: new Date()
    };
    if (!emailNorm) delete user.email;

    user.activeSessionId = generateId();
    await models.users.create(user);

    const token = generateToken(user._id, user.activeSessionId);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || null,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });

    // Run heavy tasks after response to keep signup fast
    setImmediate(async () => {
      if (referralCode) {
        try {
          const referralService = require('../services/referralService');
          await referralService.recordReferralSignup(referralCode, user);
        } catch (refErr) {
          console.error('Referral tracking failed:', refErr.message);
        }
      }

      try {
        const { autoEnrollDemoCourse } = require('../middleware/autoEnrollDemo');
        await autoEnrollDemoCourse(user._id);
      } catch (enrollErr) {
        console.error('Auto-enroll failed:', enrollErr.message);
      }

      try {
        const notificationService = require('../services/notificationService');
        await notificationService.sendWelcomeNotification(user._id, user.name, user.email);
      } catch (notifyErr) {
        console.error('Welcome notification failed:', notifyErr.message);
      }

      try {
        const { adminNewUserEmailTemplate } = require('../services/emailTemplates');
        const { sendEmail } = require('../services/emailService');
        await sendEmail({
          to: process.env.EMAIL_USER || 'beyondclassroom247@gmail.com',
          subject: `New User Registered: ${user.name}`,
          html: adminNewUserEmailTemplate(user.name, user.email, new Date().toLocaleString('en-IN'))
        });
      } catch (emailErr) {
        console.error('Admin notify email failed:', emailErr.message);
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, mobileNumber, email, password, force } = req.body;
    const phoneNorm = normalizePhone(phone || mobileNumber);
    const emailNorm = email ? String(email).toLowerCase().trim() : '';

    if ((!phoneNorm && !emailNorm) || !password) {
      return res.status(400).json({ message: 'Please provide mobile number and password' });
    }

    let user = null;
    if (phoneNorm) {
      let phoneQuery = [{ phone: phoneNorm }];
      if (phoneNorm.startsWith('91') && phoneNorm.length > 10) {
        phoneQuery.push({ phone: phoneNorm.replace(/^91/, '') });
      }
      user = await models.users.findOne({ $or: phoneQuery }).lean();
    }
    if (!user && emailNorm) {
      user = await models.users.findOne({ email: emailNorm }).lean();
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    if (user.activeSessionId && !force) {
      return res.status(409).json({ message: 'already_logged_in', prompt: 'You are already logged in on another device. Do you want to logout from there and login here?' });
    }

    user.activeSessionId = generateId();
    await models.users.updateOne({ _id: user._id }, { $set: { activeSessionId: user.activeSessionId } });
    const token = generateToken(user._id, user.activeSessionId);

    // Write activity log async (do not block login response)
    setImmediate(async () => {
      try {
        await models.activityLogs.create({ _id: generateId(), userId: user._id, userName: user.name, action: 'login', module: 'user', description: `User logged in: ${user.email || user.phone}` });
      } catch (err) {}
    });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email || null,
        phone: user.phone,
        role: user.role,
        trialEndsAt: user.trialEndsAt || null,
        trialExpired: user.trialExpired || false,
        purchasedCourses: user.purchasedCourses || []
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.guestLogin = async (req, res) => {
  try {
    const guestUser = {
      _id: generateId(),
      name: `Guest_${Date.now()}`,
      email: `guest_${Date.now()}@temp.com`,
      password: await bcrypt.hash(Math.random().toString(36), 12),
      isGuest: true,
      role: 'user',
      purchasedCourses: [],
      favorites: [],
      createdAt: new Date()
    };

    await models.users.create(guestUser);

    const token = generateToken(guestUser._id);

    res.json({
      success: true,
      token,
      user: {
        id: guestUser._id,
        name: guestUser.name,
        isGuest: true
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailNorm = String(email).toLowerCase().trim();
    const user = await models.users.findOne({ email: emailNorm });
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    await models.users.updateOne(
      { _id: user._id },
      { $set: { passwordResetToken: otp, passwordResetExpires: resetExpires } }
    );

    const { sendEmail } = require('../services/emailService');
    const { otpEmailTemplate } = require('../services/emailTemplates');
    const emailHtml = otpEmailTemplate(otp, 'password_reset', '15 minutes');
    // sendEmail never throws — it returns { success }. Check it so a failed
    // delivery surfaces as an error instead of a silent "OTP sent".
    const result = await sendEmail({
      to: email,
      subject: 'Password Reset OTP - Beyond Classroom',
      html: emailHtml
    });
    if (!result.success) {
      console.error('Password reset email not delivered:', result.error);
      return res.status(500).json({ message: 'We could not send the reset email right now. Please try again in a moment.' });
    }

    res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const emailNorm = String(email).toLowerCase().trim();
    const user = await models.users.findOne({ email: emailNorm });
    
    if (!user || user.passwordResetToken !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (!user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const emailNorm = String(email).toLowerCase().trim();
    const user = await models.users.findOne({ email: emailNorm });

    if (!user || user.passwordResetToken !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (!user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    await models.users.updateOne(
      { _id: user._id },
      {
        $set: { password: newHashedPassword, updatedAt: new Date() },
        $unset: { passwordResetToken: 1, passwordResetExpires: 1 }
      }
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await models.users.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    await models.users.updateOne(
      { _id: user._id },
      { $set: { password: newHashedPassword, updatedAt: new Date() } }
    );

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
