const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedPhone = String(phone || '').replace(/\D/g, '');
    const normalizedEmail = email ? String(email).toLowerCase().trim() : '';

    if (!name || !normalizedPhone || !password) {
      return res.status(400).json({ message: 'Name, mobile number and password are required' });
    }
    if (normalizedPhone.length < 10) {
      return res.status(400).json({ message: 'Please enter a valid mobile number' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({
      $or: [
        { phone: normalizedPhone },
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
      ],
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this mobile/email' });
    }

    const user = await User.create({ name, phone: normalizedPhone, email: normalizedEmail || undefined, password });
    
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone, mobileNumber, password } = req.body;
    const normalizedPhone = String(phone || mobileNumber || '').replace(/\D/g, '');
    const normalizedEmail = email ? String(email).toLowerCase().trim() : '';

    if ((!normalizedPhone && !normalizedEmail) || !password) {
      return res.status(400).json({ message: 'Mobile/email and password are required' });
    }

    const user = await User.findOne(
      normalizedPhone ? { phone: normalizedPhone } : { email: normalizedEmail }
    );
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.guestLogin = async (req, res) => {
  try {
    const guestUser = await User.create({
      name: `Guest_${Date.now()}`,
      email: `guest_${Date.now()}@temp.com`,
      password: Math.random().toString(36),
      isGuest: true
    });

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
    const crypto = require('crypto');
    const { passwordResetEmailTemplate } = require('../services/emailTemplates');
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'https://beyondclassroom.netlify.app';
    const resetLink = `${frontendUrl}/auth/forgot-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'Reset Your Password - Beyond Classroom',
      html: passwordResetEmailTemplate(user.name, resetLink)
    });

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

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
