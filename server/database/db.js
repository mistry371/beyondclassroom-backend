const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { normalizeCourseCategory } = require('../constants/categories');

// ── MongoDB connection ────────────────────────────────────────────────────────
let isConnected = false;
let memoryServer = null;

async function connectMongo() {
  if (isConnected) return;

  let uri = process.env.MONGODB_URI;
  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('beyondclassroom');
    console.log('📦 Using in-memory MongoDB for local development');
  }

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to server/.env or set USE_MEMORY_DB=true');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,        // allow slower ops (large uploads) without killing the socket
    maxPoolSize: 15,               // bounded connection pool (Atlas-friendly, reused under load)
    minPoolSize: 2,                // keep warm connections to avoid per-request handshake latency
    maxIdleTimeMS: 60000,          // recycle idle connections after 1 min
  });
  isConnected = true;
  console.log('✅ MongoDB connected');
}

// ── Mongoose Schemas ──────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, sparse: true },
  password: String,
  role: { type: String, default: 'user' },
  status: { type: String, default: 'active' },
  profilePhoto: { type: String, default: '' },
  isGuest: { type: Boolean, default: false },
  purchasedCourses: [String],
  favorites: [String],
  emailVerified: { type: Boolean, default: false },
  trialStartedAt: String,
  trialEndsAt: String,
  trialExpired: { type: Boolean, default: false },
  referredByPromoterId: String,
  referralCode: String,
  passwordResetToken: String,
  passwordResetExpires: String,
  activeSessionId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false });

const courseSchema = new mongoose.Schema({
  _id: { type: String },
  title: String,
  description: String,
  category: String,
  grade: String,
  difficulty: String,
  price: Number,
  discountPrice: Number,
  instructor: String,
  duration: String,
  topics: [String],
  thumbnail: String,
  status: { type: String, default: 'draft' },
  isFeatured: { type: Boolean, default: false },
  isFree: { type: Boolean, default: false },
  isDemo: { type: Boolean, default: false },
  enrolledCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: String,
  items: [{ _id: String, course: String, addedAt: Date }],
}, { _id: false });
cartSchema.index({ user: 1 }, { unique: true });

const orderSchema = new mongoose.Schema({
  _id: { type: String },
  user: String,
  userId: String,
  courses: [String],
  totalAmount: Number,
  status: { type: String, default: 'completed' },
  paymentId: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const notificationSchema = new mongoose.Schema({
  _id: { type: String },
  user: String,
  title: String,
  message: String,
  type: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  _id: { type: String },
  courseId: { type: String, index: true },
  title: String,
  description: String,
  order: Number,
  duration: String,
  isLocked: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false });

const lessonSchema = new mongoose.Schema({
  _id: { type: String },
  moduleId: { type: String, index: true },
  courseId: { type: String, index: true },
  title: String,
  content: mongoose.Schema.Types.Mixed,
  videoUrl: String,
  duration: String,
  order: Number,
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false });

const subtopicSchema = new mongoose.Schema({
  _id: { type: String },
  lessonId: { type: String, index: true },
  moduleId: { type: String, index: true },
  courseId: { type: String, index: true },
  title: String,
  content: String,
  order: Number,
  isPublished: { type: Boolean, default: true },
  isPreview: { type: Boolean, default: false }, // viewable (not downloadable) without login/purchase (#1)
  document: mongoose.Schema.Types.Mixed,
  documents: [mongoose.Schema.Types.Mixed],
  packageIds: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false });

const practiceSchema = new mongoose.Schema({
  _id: { type: String },
  lessonId: { type: String, index: true },
  moduleId: { type: String, index: true },
  courseId: { type: String, index: true },
  question: String,
  options: [String],
  correctAnswer: mongoose.Schema.Types.Mixed,
  explanation: String,
  type: String,
  difficulty: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const quizSchema = new mongoose.Schema({
  _id: { type: String },
  moduleId: { type: String, index: true },
  courseId: { type: String, index: true },
  title: String,
  description: String,
  questions: mongoose.Schema.Types.Mixed,
  passingScore: Number,
  timeLimit: Number,
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false });

const progressSchema = new mongoose.Schema({
  _id: { type: String },
  userId: String,
  courseId: String,
  completionPercentage: { type: Number, default: 0 },
  lessonsCompleted: [String],
  lastAccessedAt: Date,
  enrolledAt: Date,
  expiryDate: Date,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const otpSchema = new mongoose.Schema({
  _id: { type: String },
  email: String,
  otp: String,
  purpose: String,
  verified: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  _id: { type: String },
  userId: String,
  courseId: String,
  packageId: String,
  selectedCourseIds: [String],
  promoCode: String,
  amount: Number,
  currency: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false, strict: false });

const toolSchema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  description: String,
  category: String,
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const activityLogSchema = new mongoose.Schema({
  _id: { type: String },
  userId: String,
  userName: String,
  action: String,
  module: String,
  description: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const announcementSchema = new mongoose.Schema({
  _id: { type: String },
  title: String,
  content: String,
  type: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const liveClassSchema = new mongoose.Schema({
  _id: { type: String },
  title: String,
  description: String,
  date: String,
  time: String,
  duration: String,
  zoomLink: String,
  meetingId: String,
  topic: String,
  courseId: String,
  status: { type: String, default: 'scheduled' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const settingSchema = new mongoose.Schema({
  _id: { type: String },
  key: { type: String, unique: true },
  value: String,
  type: String,
  category: String,
  displayName: String,
  description: String,
  isPublic: Boolean,
}, { _id: false });

const examSchema = new mongoose.Schema({
  _id: { type: String },
  title: String,
  description: String,
  courseId: String,
  sections: mongoose.Schema.Types.Mixed,
  isPublished: { type: Boolean, default: false },
  startDate: Date,
  endDate: Date,
  duration: Number,
  totalMarks: Number,
  passingMarks: Number,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const examAttemptSchema = new mongoose.Schema({
  _id: { type: String },
  examId: String,
  userId: String,
  answers: mongoose.Schema.Types.Mixed,
  score: Number,
  status: String,
  startedAt: Date,
  submittedAt: Date,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const customRequestSchema = new mongoose.Schema({
  _id: { type: String },
  userId: String,
  userName: String,
  userEmail: String,
  courseId: String,
  packageId: String,
  subject: String,
  title: String,
  description: String,
  selectedTopics: mongoose.Schema.Types.Mixed,
  selectedModules: mongoose.Schema.Types.Mixed,
  selectedLessons: mongoose.Schema.Types.Mixed,
  selectedSubtopics: mongoose.Schema.Types.Mixed,
  selectedPdfs: mongoose.Schema.Types.Mixed,
  preferences: mongoose.Schema.Types.Mixed,
  roadmap: mongoose.Schema.Types.Mixed,
  estimatedDuration: String,
  finalRoadmap: String,
  finalDuration: String,
  finalPrice: Number,
  packageSummary: String,
  deliverable: String,
  difficulty: String,
  deadline: String,
  budget: mongoose.Schema.Types.Mixed,
  status: { type: String, default: 'pending' },
  adminNote: String,
  quotedPrice: Number,
  paymentStatus: { type: String, default: 'unpaid' },
  paymentId: String,
  paidAt: Date,
  assignedToUserId: String,
  assignedToUserName: String,
  deliveryItems: mongoose.Schema.Types.Mixed,
  studentMessages: mongoose.Schema.Types.Mixed,
  marks: Number,
  studentAttachedFile: String,
  assignedPdf: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false });

const mediaSchema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  url: String,
  type: String,
  size: Number,
  uploadedBy: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const certificateSchema = new mongoose.Schema({
  _id: { type: String },
  userId: String,
  courseId: String,
  issuedAt: Date,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const badgeSchema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  description: String,
  icon: String,
  condition: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const emailLogSchema = new mongoose.Schema({
  _id: { type: String },
  to: String,
  subject: String,
  status: String,
  templateId: String,
  sentAt: Date,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const adminNotificationSchema = new mongoose.Schema({
  _id: { type: String },
  title: String,
  message: String,
  type: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const siteContentSchema = new mongoose.Schema({
  _id: { type: String, default: 'site-content' },
  data: mongoose.Schema.Types.Mixed,
  updatedAt: Date,
}, { _id: false });

const blockedIPSchema = new mongoose.Schema({
  _id: { type: String },
  ip: String,
  reason: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const promoterSchema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  email: { type: String, unique: true, sparse: true },
  phone: String,
  password: String,
  referralCode: { type: String, unique: true, sparse: true },
  status: { type: String, default: 'active' },
  commissionRate: { type: Number, default: 0.2 },
  referrals: { type: Number, default: 0 },
  studentsJoined: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  pendingPayout: { type: Number, default: 0 },
  totalPaidOut: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  rank: { type: String, default: 'Bronze' },
  // Profile (#7)
  address: String,
  city: String,
  state: String,
  pincode: String,
  // Bank details for payouts (#7)
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifsc: String,
    bankName: String,
    upiId: String,
  },
  // KYC documents + verification status (#7):
  // pending → submitted → verified | rejected | resubmit
  kyc: {
    status: { type: String, default: 'pending' },
    panNumber: String,
    panDocUrl: String,
    aadhaarNumber: String,
    aadhaarDocUrl: String,
    passbookDocUrl: String,
    submittedAt: Date,
    reviewedAt: Date,
    rejectionReason: String,
    reviewedBy: String,
    history: { type: [mongoose.Schema.Types.Mixed], default: [] }, // { status, note, at, by }
  },
  passwordResetToken: String,
  passwordResetExpires: String,
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false });

const referralSchema = new mongoose.Schema({
  _id: { type: String },
  promoterId: String,
  referralCode: String,
  userId: String,
  userEmail: String,
  userName: String,
  status: { type: String, default: 'registered' },
  source: { type: String, default: 'referral' }, // 'referral' (signup link) | 'promo' (promo code at checkout)
  promoCode: String,
  orderId: String,
  paymentId: String,
  orderAmount: Number,
  commissionAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  convertedAt: Date,
}, { _id: false });

const promoterPayoutSchema = new mongoose.Schema({
  _id: { type: String },
  promoterId: String,
  amount: Number,
  status: { type: String, default: 'pending' },
  note: String,
  createdAt: { type: Date, default: Date.now },
  processedAt: Date,
}, { _id: false });

const promoCodeSchema = new mongoose.Schema({
  _id: { type: String },
  code: { type: String, unique: true },
  discountPercent: Number,
  expiryDate: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  assignedTo: String,
  // Applicability (#9): 'all' = any package/course; 'packages' = only the listed
  // packages; 'courses' = only purchases that include one of the listed courses.
  applicableType: { type: String, default: 'all' },
  applicablePackageIds: { type: [String], default: [] },
  applicableCourseIds: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false });

const packageSchema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  description: String,
  features: [mongoose.Schema.Types.Mixed],
  priceINR: Number,
  priceUSD: Number,
  validity: String,
  image: String,
  active: { type: Boolean, default: true },
  popular: { type: Boolean, default: false },
  courseIds: [String],
  sortOrder: Number,
  customRequestLimit: { type: Number, default: 0 },
  customRequestMaxMarks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false });

const testimonialSchema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  grade: String,
  image: String,
  content: String,
  rating: { type: Number, default: 5 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { _id: false });

// ── Indexes for Performance Optimization ──────────────────────────────────────
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ userId: 1 });
progressSchema.index({ createdAt: -1 });
progressSchema.index({ userId: 1 });
customRequestSchema.index({ createdAt: -1 });
customRequestSchema.index({ userId: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ status: 1 });
courseSchema.index({ category: 1 });
promoterSchema.index({ createdAt: -1 });
referralSchema.index({ createdAt: -1 });
referralSchema.index({ promoterId: 1 });
referralSchema.index({ userId: 1 });
referralSchema.index({ orderId: 1 });
promoterPayoutSchema.index({ promoterId: 1 });
promoCodeSchema.index({ assignedTo: 1 });
userSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1 });
activityLogSchema.index({ createdAt: -1 });
examAttemptSchema.index({ examId: 1 });
quizSchema.index({ moduleId: 1 });
// Additional hot-path indexes (perf pass)
notificationSchema.index({ user: 1, createdAt: -1 });   // notification bell / polling
paymentSchema.index({ razorpayOrderId: 1 });            // payment-verify hot path
progressSchema.index({ userId: 1, courseId: 1 });       // every lesson/quiz view + update
announcementSchema.index({ isActive: 1, createdAt: -1 });
promoterSchema.index({ phone: 1 });                     // promoter login/register lookup
activityLogSchema.index({ userId: 1 });                 // log joins/filters
examAttemptSchema.index({ userId: 1 });
otpSchema.index({ email: 1, purpose: 1 });

// ── Models ────────────────────────────────────────────────────────────────────
const models = {
  packages:           mongoose.models.DbPackage           || mongoose.model('DbPackage',           packageSchema,           'packages'),
  users:              mongoose.models.DbUser              || mongoose.model('DbUser',              userSchema,              'users'),
  courses:            mongoose.models.DbCourse            || mongoose.model('DbCourse',            courseSchema,            'courses'),
  cart:               mongoose.models.DbCart              || mongoose.model('DbCart',              cartSchema,              'cart'),
  orders:             mongoose.models.DbOrder             || mongoose.model('DbOrder',             orderSchema,             'orders'),
  notifications:      mongoose.models.DbNotification      || mongoose.model('DbNotification',      notificationSchema,      'notifications'),
  modules:            mongoose.models.DbModule            || mongoose.model('DbModule',            moduleSchema,            'modules'),
  lessons:            mongoose.models.DbLesson            || mongoose.model('DbLesson',            lessonSchema,            'lessons'),
  subtopics:          mongoose.models.DbSubtopic          || mongoose.model('DbSubtopic',          subtopicSchema,          'subtopics'),
  practices:          mongoose.models.DbPractice          || mongoose.model('DbPractice',          practiceSchema,          'practices'),
  quizzes:            mongoose.models.DbQuiz              || mongoose.model('DbQuiz',              quizSchema,              'quizzes'),
  progress:           mongoose.models.DbProgress          || mongoose.model('DbProgress',          progressSchema,          'progress'),
  otps:               mongoose.models.DbOTP               || mongoose.model('DbOTP',               otpSchema,               'otps'),
  payments:           mongoose.models.DbPayment           || mongoose.model('DbPayment',           paymentSchema,           'payments'),
  activityLogs:       mongoose.models.DbActivityLog       || mongoose.model('DbActivityLog',       activityLogSchema,       'activityLogs'),
  announcements:      mongoose.models.DbAnnouncement      || mongoose.model('DbAnnouncement',      announcementSchema,      'announcements'),
  liveClasses:        mongoose.models.DbLiveClass         || mongoose.model('DbLiveClass',         liveClassSchema,         'liveClasses'),
  settings:           mongoose.models.DbSetting           || mongoose.model('DbSetting',           settingSchema,           'settings'),
  exams:              mongoose.models.DbExam              || mongoose.model('DbExam',              examSchema,              'exams'),
  examAttempts:       mongoose.models.DbExamAttempt       || mongoose.model('DbExamAttempt',       examAttemptSchema,       'examAttempts'),
  customRequests:     mongoose.models.DbCustomRequest     || mongoose.model('DbCustomRequest',     customRequestSchema,     'customRequests'),
  media:              mongoose.models.DbMedia             || mongoose.model('DbMedia',             mediaSchema,             'media'),
  certificates:       mongoose.models.DbCertificate       || mongoose.model('DbCertificate',       certificateSchema,       'certificates'),
  badges:             mongoose.models.DbBadge             || mongoose.model('DbBadge',             badgeSchema,             'badges'),
  emailLogs:          mongoose.models.DbEmailLog          || mongoose.model('DbEmailLog',          emailLogSchema,          'emailLogs'),
  adminNotifications: mongoose.models.DbAdminNotification || mongoose.model('DbAdminNotification', adminNotificationSchema, 'adminNotifications'),
  siteContents:       mongoose.models.DbSiteContent       || mongoose.model('DbSiteContent',       siteContentSchema,       'siteContents'),
  blockedIPs:         mongoose.models.DbBlockedIP         || mongoose.model('DbBlockedIP',         blockedIPSchema,         'blockedIPs'),
  promoters:          mongoose.models.DbPromoter          || mongoose.model('DbPromoter',          promoterSchema,          'promoters'),
  referrals:          mongoose.models.DbReferral          || mongoose.model('DbReferral',          referralSchema,          'referrals'),
  promoterPayouts:    mongoose.models.DbPromoterPayout    || mongoose.model('DbPromoterPayout',    promoterPayoutSchema,    'promoterPayouts'),
  promoCodes:         mongoose.models.DbPromoCode         || mongoose.model('DbPromoCode',         promoCodeSchema,         'promoCodes'),
  testimonials:       mongoose.models.DbTestimonial       || mongoose.model('DbTestimonial',       testimonialSchema,       'testimonials'),
  tools:              mongoose.models.DbTool              || mongoose.model('DbTool',              toolSchema,              'tools'),
};

// ── db object — backward compatibility for admin controllers that still use db.data ──
// This is a minimal compatibility shim. Controllers should migrate to use `models` directly.
const db = {
  _data: {},

  get data() {
    return this._data;
  },
  set data(val) {
    this._data = val;
  }
};

// ── initDB — connect + seed admin ─────────────────────────────────────────────
const INIT_VERSION = 'v2026.07';

async function initDB() {
  await connectMongo();

  // One-time bootstrap flag: index reconciliation and the category migration
  // only need to run once, not on every (cold) start.
  const initFlag = await models.settings.findOne({ _id: 'schema_init' }).lean().catch(() => null);
  const alreadyInit = initFlag && initFlag.value === INIT_VERSION;

  if (!alreadyInit) {
    const usersCollection = mongoose.connection.collection('users');
    try { await usersCollection.dropIndex('email_1'); } catch (_) {}
    try { await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true, partialFilterExpression: { email: { $type: 'string', $ne: '' } } }); } catch (_) {}
    try { await usersCollection.createIndex({ phone: 1 }, { unique: true, sparse: true, partialFilterExpression: { phone: { $type: 'string', $ne: '' } } }); } catch (_) {}
  }

  // Ensure settings exist
  const settingsCount = await models.settings.countDocuments();
  if (settingsCount === 0) {
    const defaultSettings = [
      { _id: '1',  key: 'site_name',        value: 'Beyond Classroom',                       type: 'string',  category: 'general',  displayName: 'Site Name',          description: 'The name of your platform',          isPublic: true  },
      { _id: '2',  key: 'site_description', value: 'Advanced Mathematics Learning Platform', type: 'string',  category: 'general',  displayName: 'Site Description',   description: 'Brief description of your platform', isPublic: true  },
      { _id: '3',  key: 'contact_email',    value: 'admin@beyondclassroom.com',               type: 'string',  category: 'general',  displayName: 'Contact Email',      description: 'Primary contact email',              isPublic: true  },
      { _id: '4',  key: 'allow_registration', value: 'true',                                 type: 'boolean', category: 'general',  displayName: 'Allow Registration', description: 'Allow new user registrations',       isPublic: false },
      { _id: '5',  key: 'maintenance_mode', value: 'false',                                  type: 'boolean', category: 'general',  displayName: 'Maintenance Mode',   description: 'Put site in maintenance mode',       isPublic: false },
      { _id: '6',  key: 'smtp_host',        value: '',                                       type: 'string',  category: 'email',    displayName: 'SMTP Host',          description: 'Email server hostname',              isPublic: false },
      { _id: '7',  key: 'smtp_port',        value: '587',                                    type: 'number',  category: 'email',    displayName: 'SMTP Port',          description: 'Email server port',                  isPublic: false },
      { _id: '8',  key: 'smtp_user',        value: '',                                       type: 'string',  category: 'email',    displayName: 'SMTP Username',      description: 'Email server username',              isPublic: false },
      { _id: '9',  key: 'enable_tools',     value: 'true',                                   type: 'boolean', category: 'features', displayName: 'Enable Math Tools',  description: 'Show math tools section',            isPublic: false },
      { _id: '10', key: 'enable_quizzes',   value: 'true',                                   type: 'boolean', category: 'features', displayName: 'Enable Quizzes',     description: 'Allow quiz functionality',           isPublic: false },
      { _id: '11', key: 'primary_color',    value: '#6366f1',                                type: 'color',   category: 'theme',    displayName: 'Primary Color',      description: 'Main brand color',                   isPublic: true  },
      { _id: '12', key: 'secondary_color',  value: '#8b5cf6',                                type: 'color',   category: 'theme',    displayName: 'Secondary Color',    description: 'Secondary brand color',              isPublic: true  },
    ];
    for (const s of defaultSettings) {
      await models.settings.findOneAndUpdate({ _id: s._id }, { $set: s }, { upsert: true });
    }
    console.log('✅ Default settings seeded');
  }

  // Admin user
  const adminEmail = 'mistryjenish1003@gmail.com';
  const adminPassword = 'Jenish@1019';

  const existingAdmin = await models.users.findById('admin-default').lean();
  if (existingAdmin && existingAdmin.password) {
    // Already provisioned — just ensure role/status without an expensive re-hash
    // on every (cold) start. (bcrypt cost-12 ≈ 300ms of event-loop-blocking CPU.)
    if (existingAdmin.role !== 'admin' || existingAdmin.status !== 'active' || existingAdmin.email !== adminEmail) {
      await models.users.updateOne({ _id: 'admin-default' }, { $set: { email: adminEmail, role: 'admin', status: 'active' } });
    }
  } else {
    // First provision (or password missing): hash once and remove dup emails.
    const adminHash = await bcrypt.hash(adminPassword, 12);
    await models.users.deleteMany({ email: adminEmail, _id: { $ne: 'admin-default' } });
    await models.users.findOneAndUpdate({ _id: 'admin-default' }, { $set: {
      _id: 'admin-default', name: 'Jenish Mistry', email: adminEmail, password: adminHash,
      role: 'admin', status: 'active', profilePhoto: '', isGuest: false,
      purchasedCourses: [], favorites: [], emailVerified: true, createdAt: new Date(),
    } }, { upsert: true });
  }
  console.log('✅ Admin user ready:', adminEmail);

  // Normalize legacy course categories → Mathematics (one-time)
  let migrated = 0;
  const courses = alreadyInit ? [] : await models.courses.find().lean();
  for (const course of courses) {
    const next = normalizeCourseCategory(course.category);
    if (course.category !== next) {
      migrated++;
      await models.courses.findOneAndUpdate(
        { _id: course._id },
        { $set: { category: next } },
        { upsert: false }
      );
    }
  }
  if (migrated) console.log(`✅ Migrated ${migrated} course(s) to Mathematics category`);

  // Seed default testimonials if empty
  const existingTestimonials = await models.testimonials.countDocuments();
  if (existingTestimonials === 0) {
    const initialTestimonials = [
      {
        _id: "testi-1",
        name: "Aarav Sharma",
        grade: "Grade 6 Student",
        image: "/testimonials/student_aarav.png",
        content: "Beyond Classroom has completely changed how I look at math. The practice resources are so engaging, and I actually look forward to solving problems now. My scores have improved significantly!",
        rating: 5,
        active: true,
        createdAt: new Date()
      },
      {
        _id: "testi-2",
        name: "Priya Patel",
        grade: "Parent of Grade 4 Student",
        image: "/testimonials/parent_priya.png",
        content: "As a parent, finding the right math resources was tough. This platform provides structured, reliable content that perfectly aligns with what my daughter needs. The progress tracking is a game-changer.",
        rating: 5,
        active: true,
        createdAt: new Date()
      },
      {
        _id: "testi-3",
        name: "Rahul Verma",
        grade: "Grade 8 Student",
        image: "/testimonials/student_rahul.png",
        content: "The advanced math challenges here are exactly what I needed to prepare for my competitive exams. The explanations are clear, and the platform is so easy to use.",
        rating: 5,
        active: true,
        createdAt: new Date()
      },
      {
        _id: "testi-4",
        name: "Neha Gupta",
        grade: "Math Educator",
        image: "/testimonials/teacher_neha.png",
        content: "I recommend Beyond Classroom to all my students. It's a fantastic supplementary tool that reinforces the concepts we cover in class. Truly a world-class educational platform.",
        rating: 5,
        active: true,
        createdAt: new Date()
      }
    ];
    await models.testimonials.insertMany(initialTestimonials);
    console.log('✅ Seeded initial testimonials');
  }

  // Mark one-time bootstrap done so future (cold) starts skip index churn +
  // the category migration.
  if (!alreadyInit) {
    try { await models.settings.updateOne({ _id: 'schema_init' }, { $set: { _id: 'schema_init', key: 'schema_init', value: INIT_VERSION } }, { upsert: true }); } catch (_) {}
  }

  return db;
}

module.exports = { db, initDB, models };
