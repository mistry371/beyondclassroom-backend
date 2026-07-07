const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./database/db');

dotenv.config();

const app = express();

// ── CORS Configuration ───────────────────────────────────────────────────────
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

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: true, limit: '250mb' }));

// ── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ── Import Route Files ───────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');
const notificationRoutes = require('./routes/notifications');
const moduleRoutes = require('./routes/modules');
const lessonRoutes = require('./routes/lessons');
const practiceRoutes = require('./routes/practices');
const quizRoutes = require('./routes/quizzes');
const progressRoutes = require('./routes/progress');
const adminRoutes = require('./routes/admin');
const announcementRoutes = require('./routes/announcements');
const testRoutes = require('./routes/test');
const otpRoutes = require('./routes/otp');
const paymentRoutes = require('./routes/payment');
const subtopicRoutes = require('./routes/subtopics');
const examRoutes = require('./routes/exams');
const customRequestRoutes = require('./routes/customRequests');
const promoterRoutes = require('./routes/promoters');
const teamRoutes = require('./routes/team');
const packageRoutes = require('./routes/packages');
const promoCodeRoutes = require('./routes/promoCodes');
const uploadRoutes = require('./routes/uploadRoutes');
const liveClassRoutes = require('./routes/liveClasses');
const trialRoutes = require('./routes/trial');
const systemRoutes = require('./routes/system');
const testimonialRoutes = require('./routes/testimonials');

// ── Auth Middleware ──────────────────────────────────────────────────────────
const { protect } = require('./middleware/auth');

// ── Mount Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/practices', practiceRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', protect, adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subtopics', subtopicRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/custom-requests', customRequestRoutes);
app.use('/api/promoters', promoterRoutes);
app.use('/api/test', testRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/admin/promo-codes', protect, promoCodeRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/trial', trialRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/testimonials', testimonialRoutes);

// ── Health Check (direct, also in system routes) ─────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ── Initialize Database & Start Server ───────────────────────────────────────
initDB().then(async () => {
  try {
    const { seedLaunchDemo } = require('./services/launchDemoSeed');
    await seedLaunchDemo();
  } catch (e) {
    console.warn('Launch demo seed skipped:', e.message);
  }
  console.log('✅ Database initialized');

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});
