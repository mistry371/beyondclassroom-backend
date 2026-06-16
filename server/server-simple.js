const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { db, initDB, models } = require('./database/db');
const { normalizeCourseCategory } = require('./constants/categories');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3005',
  'https://beyondclassroom.netlify.app',
  'https://beyondclassroom.co.in',
  'https://www.beyondclassroom.co.in',
  'https://beyondclassroom-backend.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: true, limit: '250mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Upload routes
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

// Public Testimonials route
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await models.testimonials.find({ active: true }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Initialize database then start server
app.post('/api/system/reseed-demo', async (req, res) => {
  try {
    const key = process.env.DEMO_RESEED_KEY || 'beyondclassroom-reseed';
    if (req.body?.key !== key && req.query?.key !== key) {
      return res.status(403).json({ success: false, message: 'Invalid reseed key' });
    }
    const { seedLaunchDemo } = require('./services/launchDemoSeed');
    await seedLaunchDemo();
    res.json({
      success: true,
      message: 'Demo accounts updated (student, promoter passwords reset)',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

initDB().then(async () => {
  try {
    const { seedLaunchDemo } = require('./services/launchDemoSeed');
    await seedLaunchDemo();
  } catch (e) {
    console.warn('Launch demo seed skipped:', e.message);
  }
  console.log('Finished seeding courses');
  console.log('Database initialized');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT} with local database`));
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Helper functions
const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11);
const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

const generateToken = (id, sid) => {
  return jwt.sign({ id, sid }, process.env.JWT_SECRET || 'beyond-classroom-fallback-secret-change-in-production', {
    expiresIn: '7d'
  });
};

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'beyond-classroom-fallback-secret-change-in-production');
    req.user = await models.users.findOne({ _id: decoded.id }).lean();
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Block suspended users
    if (req.user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    if (!req.user.activeSessionId || decoded.sid !== req.user.activeSessionId) {
      return res.status(401).json({ message: 'Session expired. Logged in from another device.' });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    }
    res.status(401).json({ message: 'Not authorized' });
  }
};

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
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
    if (db.data.users) db.data.users.push(user);

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
          const referralService = require('./services/referralService');
          await referralService.recordReferralSignup(referralCode, user);
        } catch (refErr) {
          console.error('Referral tracking failed:', refErr.message);
        }
      }

      try {
        const { autoEnrollDemoCourse } = require('./middleware/autoEnrollDemo');
        await autoEnrollDemoCourse(user._id);
      } catch (enrollErr) {
        console.error('Auto-enroll failed:', enrollErr.message);
      }

      try {
        const notificationService = require('./services/notificationService');
        await notificationService.sendWelcomeNotification(user._id, user.name, user.email);
      } catch (notifyErr) {
        console.error('Welcome notification failed:', notifyErr.message);
      }

      try {
        const { adminNewUserEmailTemplate } = require('./services/emailTemplates');
        const { sendEmail } = require('./services/emailService');
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
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const emailNorm = String(email).toLowerCase().trim()
    const user = await models.users.findOne({ email: emailNorm })
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    await models.users.updateOne(
      { _id: user._id },
      { $set: { passwordResetToken: resetToken, passwordResetExpires: resetExpires } }
    )
    if (db.data.users) {
      const u = db.data.users.find(u => u._id === user._id)
      if (u) Object.assign(u, { passwordResetToken: resetToken, passwordResetExpires: resetExpires })
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://beyondclassroom.netlify.app'
    const resetLink = `${frontendUrl}/auth/forgot-password?token=${resetToken}`

    try {
      const { passwordResetEmailTemplate } = require('./services/emailTemplates')
      const { sendEmail } = require('./services/emailService')
      await sendEmail({
        to: email,
        subject: 'Reset Your Password - Beyond Classroom',
        html: passwordResetEmailTemplate(db.data.users[userIdx].name, resetLink)
      })
    } catch (emailErr) {
      console.error('Password reset email failed:', emailErr.message)
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    const user = await models.users.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gte: new Date().toISOString() } // simplified check
    })
    
    // We do a manual check because stored dates might be strings
    if (!user || !user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' })
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12)
    await models.users.updateOne(
      { _id: user._id },
      { 
        $set: { password: newHashedPassword, updatedAt: new Date() },
        $unset: { passwordResetToken: 1, passwordResetExpires: 1 }
      }
    )
    if (db.data.users) {
      const u = db.data.users.find(u => u._id === user._id)
      if (u) {
        u.password = newHashedPassword
        u.updatedAt = new Date()
        delete u.passwordResetToken
        delete u.passwordResetExpires
      }
    }

    res.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
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

    user.activeSessionId = generateId()
    await models.users.updateOne({ _id: user._id }, { $set: { activeSessionId: user.activeSessionId } });
    if (db.data.users) {
      const u = db.data.users.find(u => u._id === user._id)
      if (u) u.activeSessionId = user.activeSessionId
    }
    const token = generateToken(user._id, user.activeSessionId);

    // Write activity log async (do not block login response)
    setImmediate(async () => {
      try {
        await models.activityLogs.create({ _id: generateId(), userId: user._id, userName: user.name, action: 'login', module: 'user', description: `User logged in: ${user.email || user.phone}` });
      } catch (_) {}
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
});

app.post('/api/auth/guest', async (req, res) => {
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
    if (db.data.users) db.data.users.push(guestUser);

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
});

// COURSES ROUTES
app.get('/api/courses', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.title = { $regex: search, $options: 'i' };

    let courses = await models.courses.find(query).lean();
    courses = courses.map(c => ({ ...c, category: normalizeCourseCategory(c.category) }));

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/courses/featured', async (req, res) => {
  try {
    const courses = await models.courses.find({ isFeatured: true }).limit(6).lean();
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await models.courses.findOne({ _id: req.params.id }).lean();
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CART ROUTES
app.get('/api/cart', protect, async (req, res) => {
  try {
    let cart = await models.cart.findOne({ user: req.user._id }).lean();
    
    if (!cart) {
      cart = { user: req.user._id, items: [] };
      await models.cart.create(cart);
      if (db.data.cart) db.data.cart.push(cart);
    }

    // Populate course details
    const courseIds = cart.items.map(i => i.course);
    const courses = await models.courses.find({ _id: { $in: courseIds } }).lean();
    
    cart.items = cart.items.map(item => ({
      ...item,
      course: courses.find(c => c._id === item.course)
    }));

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/cart', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    let cart = await models.cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = await models.cart.create({ user: req.user._id, items: [] });
      if (db.data.cart) db.data.cart.push(cart);
    }

    const itemExists = cart.items.find(item => item.course === courseId);
    if (itemExists) {
      return res.status(400).json({ message: 'Course already in cart' });
    }

    cart.items.push({ 
      _id: generateId(),
      course: courseId, 
      addedAt: new Date() 
    });
    
    await models.cart.updateOne({ user: req.user._id }, { $set: { items: cart.items } });
    if (db.data.cart) {
      const legacyCart = db.data.cart.find(c => c.user === req.user._id);
      if (legacyCart) legacyCart.items = cart.items;
    }

    // Populate course details
    const courseIds = cart.items.map(i => i.course);
    const courses = await models.courses.find({ _id: { $in: courseIds } }).lean();
    
    const populatedCart = {
      ...cart.toObject ? cart.toObject() : cart,
      items: cart.items.map(item => ({
        ...item.toObject ? item.toObject() : item,
        course: courses.find(c => c._id === item.course)
      }))
    };

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/cart/:courseId', protect, async (req, res) => {
  try {
    const cart = await models.cart.findOne({ user: req.user._id });
    
    if (cart) {
      cart.items = cart.items.filter(item => item.course !== req.params.courseId);
      await models.cart.updateOne({ user: req.user._id }, { $set: { items: cart.items } });
      
      if (db.data.cart) {
        const legacyCart = db.data.cart.find(c => c.user === req.user._id);
        if (legacyCart) legacyCart.items = cart.items;
      }
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ORDERS ROUTES
app.post('/api/orders', protect, async (req, res) => {
  try {
    const cart = await models.cart.findOne({ user: req.user._id }).lean();
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const courseIds = cart.items.map(item => item.course);
    const coursesObj = await models.courses.find({ _id: { $in: courseIds } }).lean();

    // Block direct order for paid courses — must go through Razorpay payment
    const paidCourses = courseIds.filter(courseId => {
      const course = coursesObj.find(c => c._id === courseId);
      return course && course.price > 0 && !course.isFree && !course.isDemo;
    });

    if (paidCourses.length > 0) {
      const paidTitles = paidCourses.map(courseId => {
        const course = coursesObj.find(c => c._id === courseId);
        return course?.title || courseId;
      });
      return res.status(403).json({
        message: 'Paid courses require payment. Please complete payment via the course page.',
        paidCourses: paidTitles
      });
    }

    // Only free/demo courses allowed here
    const totalAmount = 0;

    const order = {
      _id: generateId(),
      user: req.user._id,
      courses: courseIds,
      totalAmount,
      status: 'completed',
      createdAt: new Date()
    };

    await models.orders.create(order);
    if (db.data.orders) db.data.orders.push(order);

    // Add courses to user's purchased courses
    const user = await models.users.findOne({ _id: req.user._id });
    if (user) {
      const newCourses = [...new Set([...(user.purchasedCourses || []), ...courseIds])];
      await models.users.updateOne({ _id: req.user._id }, { $set: { purchasedCourses: newCourses } });
      if (db.data.users) {
        const legacyUser = db.data.users.find(u => u._id === req.user._id);
        if (legacyUser) legacyUser.purchasedCourses = newCourses;
      }
    }

    // Clear cart
    await models.cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
    if (db.data.cart) {
      const legacyCart = db.data.cart.find(c => c.user === req.user._id);
      if (legacyCart) legacyCart.items = [];
    }

    // Send enrollment notifications for each course
    const notificationService = require('./services/notificationService');
    for (const courseId of courseIds) {
      const course = coursesObj.find(c => c._id === courseId);
      if (course) {
        await notificationService.sendEnrollmentNotification(
          req.user._id, req.user.name, req.user.email, course.title
        );
      }
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PROFILE ROUTES
app.get('/api/profile', protect, async (req, res) => {
  try {
    const user = await models.users.findOne({ _id: req.user._id }).lean();
    
    if (user) {
      const populatedCourses = await models.courses.find({ _id: { $in: user.purchasedCourses || [] } }).lean();
      
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: { 
        ...userWithoutPassword, 
        purchasedCourses: populatedCourses,
        trialEndsAt: user.trialEndsAt || null,
        trialExpired: user.trialExpired || false
      } });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/profile', protect, async (req, res) => {
  try {
    const { name, email, profilePhoto } = req.body;
    let updates = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;

    const user = await models.users.findOneAndUpdate(
      { _id: req.user._id },
      { $set: updates },
      { new: true }
    ).lean();
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (db.data.users) {
      const legacyUser = db.data.users.find(u => u._id === req.user._id);
      if (legacyUser) Object.assign(legacyUser, updates);
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NOTIFICATIONS ROUTES
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const notifications = await models.notifications.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/mark-all-read', protect, async (req, res) => {
  try {
    await models.notifications.updateMany({ user: req.user._id }, { $set: { isRead: true } });
    if (db.data.notifications) {
      db.data.notifications.filter(n => n.user === req.user._id).forEach(n => n.isRead = true);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/:id/read', protect, async (req, res) => {
  try {
    await models.notifications.updateOne({ _id: req.params.id }, { $set: { isRead: true } });
    if (db.data.notifications) {
      const n = db.data.notifications.find(n => n._id === req.params.id);
      if (n) n.isRead = true;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Zoom test endpoint (admin only — remove in production)
app.get('/api/zoom/test', protect, async (req, res) => {
  try {
    const zoomService = require('./services/zoomService');
    const mode = zoomService.isApiConfigured() ? 'api' : zoomService.isPmiConfigured() ? 'pmi' : 'none';
    if (mode === 'none') {
      return res.json({ success: false, mode, message: 'Zoom not configured. Set ZOOM_PMI_LINK or Server-to-Server OAuth credentials in .env' });
    }
    const result = await zoomService.createMeeting({
      title: 'Test Meeting - Beyond Classroom',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: '30',
      topic: 'Test'
    });
    res.json({ success: result.success, mode: result.mode, message: result.message, zoomLink: result.zoomLink, meetingId: result.meetingId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Live classes endpoint — only for enrolled/purchased users
app.get('/api/live-classes', protect, async (req, res) => {
  try {
    const user = await models.users.findOne({ _id: req.user._id }).lean();
    const purchased = user?.purchasedCourses || [];
    const liveClasses = await models.liveClasses.find().lean();

    // Admin sees all classes
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      return res.json({ success: true, liveClasses });
    }

    // Students only see classes if they have at least one purchased course
    if (purchased.length === 0) {
      return res.json({ success: true, liveClasses: [], locked: true, message: 'Purchase a course to access live classes' });
    }

    res.json({ success: true, liveClasses, locked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TRIAL STATUS ROUTE
app.get('/api/trial/status', protect, async (req, res) => {
  try {
    const user = await models.users.findOne({ _id: req.user._id }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const trialActive = trialEndsAt && now < trialEndsAt;
    const trialExpired = trialEndsAt && now >= trialEndsAt;
    const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24))) : 0;
    const hoursLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60))) : 0;

    // Auto-mark expired
    if (trialExpired && !user.trialExpired) {
      await models.users.updateOne({ _id: req.user._id }, { $set: { trialExpired: true } });
      if (db.data.users) {
        const legacyUser = db.data.users.find(u => u._id === req.user._id);
        if (legacyUser) legacyUser.trialExpired = true;
      }
    }

    res.json({
      success: true,
      trialActive,
      trialExpired: trialExpired || user.trialExpired || false,
      trialEndsAt: user.trialEndsAt || null,
      daysLeft,
      hoursLeft,
      hasPurchasedCourses: (user.purchasedCourses || []).length > 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Import new routes
const moduleRoutes = require('./routes/modules');
const lessonRoutes = require('./routes/lessons');
const practiceRoutes = require('./routes/practices');
const quizRoutes = require('./routes/quizzes');
const progressRoutes = require('./routes/progress');
const adminRoutes = require('./routes/admin');
const otpRoutes = require('./routes/otp');
const paymentRoutes = require('./routes/payment');
const subtopicRoutes = require('./routes/subtopics');
const examRoutes = require('./routes/exams');

// Use new routes
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/practices', practiceRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', protect, adminRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subtopics', subtopicRoutes);
app.use('/api/exams', examRoutes);
const customRequestRoutes = require('./routes/customRequests');
const promoterRoutes = require('./routes/promoters');
const teamRoutes = require('./routes/team');
const packageRoutes = require('./routes/packages');
const promoCodeRoutes = require('./routes/promoCodes');
app.use('/api/custom-requests', customRequestRoutes);
app.use('/api/promoters', promoterRoutes);
app.use('/api/team', teamRoutes);
// Packages — public GET at /api/packages, admin routes at /api/packages/admin/* (require auth)
app.get('/api/packages', async (req, res) => {
  try {
    const packages = await models.packages.find({ active: true }).sort({ sortOrder: 1 }).lean();
    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/api/packages/:id', async (req, res, next) => {
  if (req.params.id === 'admin') return next();
  try {
    const pkg = await models.packages.findById(req.params.id).lean();
    if (!pkg || pkg.active === false) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.use('/api/packages', protect, packageRoutes);
// Promo codes — admin CRUD under /api/admin/promo-codes, public validate/apply
app.use('/api/admin/promo-codes', protect, promoCodeRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
