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

    const phoneExists = await models.users.findOne({ phone: phoneNorm }).lean();
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
      user = await models.users.findOne({ phone: phoneNorm }).lean();
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

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await models.users.updateOne(
      { _id: user._id },
      { $set: { passwordResetToken: resetToken, passwordResetExpires: resetExpires } }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'https://beyondclassroom.netlify.app';
    const resetLink = `${frontendUrl}/auth/forgot-password?token=${resetToken}`;

    try {
      const { passwordResetEmailTemplate } = require('../services/emailTemplates');
      const { sendEmail } = require('../services/emailService');
      await sendEmail({
        to: email,
        subject: 'Reset Your Password - Beyond Classroom',
        html: passwordResetEmailTemplate(user.name, resetLink)
      });
    } catch (emailErr) {
      console.error('Password reset email failed:', emailErr.message);
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await models.users.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gte: new Date().toISOString() }
    });

    // Manual check because stored dates might be strings
    if (!user || !user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
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
