const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, initDB } = require('./database/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initDB().then(() => {
  console.log('Database initialized');
});

// Helper functions
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

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
    const { name, email, password, otp } = req.body;
    
    console.log('\n' + '='.repeat(60));
    console.log('📝 REGISTRATION REQUEST');
    console.log('='.repeat(60));
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`OTP Provided: ${otp}`);
    console.log('='.repeat(60) + '\n');
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }
    
    await db.read();
    
    const userExists = db.data.users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // OTP is REQUIRED for registration
    if (!otp) {
      return res.status(400).json({ message: 'OTP verification is required. Please verify your email first.' });
    }
    
    // Check if OTP was verified (MANDATORY)
    const otpRecord = db.data.otps?.find(o => 
      o.email === email && 
      o.purpose === 'registration' && 
      o.otp === otp &&
      o.verified === true &&
      new Date(o.expiresAt) > new Date()
    );
    
    console.log(`OTP Record Found: ${otpRecord ? 'YES' : 'NO'}`);
    if (otpRecord) {
      console.log(`OTP Match: ${otpRecord.otp === otp}`);
      console.log(`OTP Verified: ${otpRecord.verified}`);
      console.log(`OTP Expired: ${new Date(otpRecord.expiresAt) <= new Date()}`);
    }
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please verify your email first.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      _id: generateId(),
      name,
      email,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      profilePhoto: '',
      isGuest: false,
      purchasedCourses: [],
      favorites: [],
      emailVerified: true,
      createdAt: new Date()
    };

    db.data.users.push(user);
    await db.write();
    
    // Auto-enroll in free demo course
    const { autoEnrollDemoCourse } = require('./middleware/autoEnrollDemo');
    await autoEnrollDemoCourse(user._id);
    
    // Clean up used OTP
    db.data.otps = db.data.otps?.filter(o => 
      !(o.email === email && o.purpose === 'registration' && o.otp === otp)
    ) || [];
    await db.write();
    
    // Send welcome notification
    const notificationService = require('./services/notificationService');
    await notificationService.sendWelcomeNotification(user._id, user.name, user.email);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    await db.read();
    const user = db.data.users.find(u => u.email === email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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
    const totalAmount = cart.items.reduce((sum, item) => {
      const course = db.data.courses.find(c => c._id === item.course);
      return sum + (course?.price || 0);
    }, 0);

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
          req.user._id,
          req.user.name,
          req.user.email,
          course.title
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
      user.purchasedCourses = user.purchasedCourses.map(courseId => 
        db.data.courses.find(c => c._id === courseId)
      ).filter(Boolean);
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
    await db.read();
    const notifications = db.data.notifications
      .filter(n => n.user === req.user._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ success: true, notifications });
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
  res.json({ status: 'OK', message: 'Server is running with local database' });
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

// Use new routes
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/practices', practiceRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', protect, adminRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} with local database`));
