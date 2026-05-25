const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { db, initDB } = require('./database/db');
const { normalizeCourseCategory } = require('./constants/categories');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://beyondclassroom.netlify.app',
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    await db.read();
    req.user = db.data.users.find(u => u._id === decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
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
    
    await db.read();
    
    const phoneExists = db.data.users.find(u => normalizePhone(u.phone) === phoneNorm);
    if (phoneExists) {
      return res.status(400).json({ message: 'Mobile number already registered' });
    }

    if (emailNorm) {
      const emailExists = db.data.users.find(u => u.email?.toLowerCase().trim() === emailNorm);
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

    db.data.users.push(user);
    await db.write();

    const token = generateToken(user._id);

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

    await db.read()
    const emailNorm = String(email).toLowerCase().trim()
    const userIdx = db.data.users.findIndex(u => u.email?.toLowerCase().trim() === emailNorm)
    if (userIdx === -1) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    db.data.users[userIdx].passwordResetToken = resetToken
    db.data.users[userIdx].passwordResetExpires = resetExpires
    await db.write()

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
    await db.read()

    const userIdx = db.data.users.findIndex(u =>
      u.passwordResetToken === token &&
      u.passwordResetExpires &&
      new Date(u.passwordResetExpires) > new Date()
    )
    if (userIdx === -1) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' })
    }

    db.data.users[userIdx].password = await bcrypt.hash(newPassword, 12)
    db.data.users[userIdx].updatedAt = new Date()
    delete db.data.users[userIdx].passwordResetToken
    delete db.data.users[userIdx].passwordResetExpires
    await db.write()

    res.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, mobileNumber, email, password } = req.body;
    const phoneNorm = normalizePhone(phone || mobileNumber);
    const emailNorm = email ? String(email).toLowerCase().trim() : '';
    
    if ((!phoneNorm && !emailNorm) || !password) {
      return res.status(400).json({ message: 'Please provide mobile number and password' });
    }

    await db.read();
    let user = null;
    if (phoneNorm) {
      user = db.data.users.find(u => normalizePhone(u.phone) === phoneNorm);
    }
    if (!user && emailNorm) {
      user = db.data.users.find(u => u.email?.toLowerCase().trim() === emailNorm);
    }
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    const token = generateToken(user._id);

    // Write activity log async (do not block login response)
    setImmediate(async () => {
      try {
        const ActivityLog = require('./models/ActivityLog');
        db.data.activityLogs = db.data.activityLogs || [];
        db.data.activityLogs.push(new ActivityLog({ userId: user._id, userName: user.name, action: 'login', module: 'user', description: `User logged in: ${user.email || user.phone}` }));
        await db.write();
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
    await db.read();
    
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

    db.data.users.push(guestUser);
    await db.write();

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
    await db.read();
    let courses = db.data.courses;

    const { category, difficulty, search } = req.query;
    
    if (category) {
      courses = courses.filter(c => c.category === category);
    }
    if (difficulty) {
      courses = courses.filter(c => c.difficulty === difficulty);
    }
    if (search) {
      courses = courses.filter(c => 
        c.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    courses = courses.map(c => ({ ...c, category: normalizeCourseCategory(c.category) }));

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/courses/featured', async (req, res) => {
  try {
    await db.read();
    const courses = db.data.courses.filter(c => c.isFeatured).slice(0, 6);
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    await db.read();
    const course = db.data.courses.find(c => c._id === req.params.id);
    
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
    await db.read();
    let cart = db.data.cart.find(c => c.user === req.user._id);
    
    if (!cart) {
      cart = { user: req.user._id, items: [] };
      db.data.cart.push(cart);
      await db.write();
    }

    // Populate course details
    cart.items = cart.items.map(item => ({
      ...item,
      course: db.data.courses.find(c => c._id === item.course)
    }));

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/cart', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    
    await db.read();
    let cart = db.data.cart.find(c => c.user === req.user._id);
    
    if (!cart) {
      cart = { user: req.user._id, items: [] };
      db.data.cart.push(cart);
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
    
    await db.write();

    // Populate course details
    cart.items = cart.items.map(item => ({
      ...item,
      course: db.data.courses.find(c => c._id === item.course)
    }));

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/cart/:courseId', protect, async (req, res) => {
  try {
    await db.read();
    const cart = db.data.cart.find(c => c.user === req.user._id);
    
    if (cart) {
      cart.items = cart.items.filter(item => item.course !== req.params.courseId);
      await db.write();
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ORDERS ROUTES
app.post('/api/orders', protect, async (req, res) => {
  try {
    await db.read();
    const cart = db.data.cart.find(c => c.user === req.user._id);
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const courses = cart.items.map(item => item.course);

    // Block direct order for paid courses — must go through Razorpay payment
    const paidCourses = courses.filter(courseId => {
      const course = db.data.courses.find(c => c._id === courseId);
      return course && course.price > 0 && !course.isFree && !course.isDemo;
    });

    if (paidCourses.length > 0) {
      const paidTitles = paidCourses.map(courseId => {
        const course = db.data.courses.find(c => c._id === courseId);
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
      courses,
      totalAmount,
      status: 'completed',
      createdAt: new Date()
    };

    db.data.orders.push(order);

    // Add courses to user's purchased courses
    const user = db.data.users.find(u => u._id === req.user._id);
    if (user) {
      user.purchasedCourses = [...new Set([...user.purchasedCourses, ...courses])];
    }

    // Clear cart
    cart.items = [];

    await db.write();
    
    // Send enrollment notifications for each course
    const notificationService = require('./services/notificationService');
    for (const courseId of courses) {
      const course = db.data.courses.find(c => c._id === courseId);
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
    await db.read();
    const user = db.data.users.find(u => u._id === req.user._id);
    
    if (user) {
      const populatedCourses = (user.purchasedCourses || []).map(courseId => 
        db.data.courses.find(c => c._id === courseId)
      ).filter(Boolean);
      
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
    await db.read();
    const { name, email, profilePhoto } = req.body;
    const userIndex = db.data.users.findIndex(u => u._id === req.user._id);
    
    if (userIndex === -1) return res.status(404).json({ message: 'User not found' });
    
    if (name) db.data.users[userIndex].name = name;
    if (email) db.data.users[userIndex].email = email;
    if (profilePhoto !== undefined) db.data.users[userIndex].profilePhoto = profilePhoto;
    db.data.users[userIndex].updatedAt = new Date();
    
    await db.write();
    
    const { password, ...userWithoutPassword } = db.data.users[userIndex];
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NOTIFICATIONS ROUTES
app.get('/api/notifications', protect, async (req, res) => {
  try {
    await db.read();
    const notifications = db.data.notifications
      .filter(n => n.user === req.user._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/mark-all-read', protect, async (req, res) => {
  try {
    await db.read();
    db.data.notifications
      .filter(n => n.user === req.user._id)
      .forEach(n => { n.isRead = true; });
    await db.write();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/:id/read', protect, async (req, res) => {
  try {
    await db.read();
    const notification = db.data.notifications.find(n => n._id === req.params.id);
    
    if (notification) {
      notification.isRead = true;
      await db.write();
    }

    res.json({ success: true, notification });
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
    await db.read();
    db.data.liveClasses = db.data.liveClasses || [];
    const user = db.data.users.find(u => u._id === req.user._id);
    const purchased = user?.purchasedCourses || [];

    // Admin sees all classes
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      return res.json({ success: true, liveClasses: db.data.liveClasses });
    }

    // Students only see classes if they have at least one purchased course
    if (purchased.length === 0) {
      return res.json({ success: true, liveClasses: [], locked: true, message: 'Purchase a course to access live classes' });
    }

    res.json({ success: true, liveClasses: db.data.liveClasses, locked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TRIAL STATUS ROUTE
app.get('/api/trial/status', protect, async (req, res) => {
  try {
    await db.read();
    const user = db.data.users.find(u => u._id === req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const trialActive = trialEndsAt && now < trialEndsAt;
    const trialExpired = trialEndsAt && now >= trialEndsAt;
    const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24))) : 0;
    const hoursLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60))) : 0;

    // Auto-mark expired
    if (trialExpired && !user.trialExpired) {
      user.trialExpired = true;
      await db.write();
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
app.use('/api/custom-requests', customRequestRoutes);
app.use('/api/promoters', promoterRoutes);
