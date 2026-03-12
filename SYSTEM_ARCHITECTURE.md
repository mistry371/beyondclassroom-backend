# 🏗️ ELITE MATH PLATFORM - ENTERPRISE SYSTEM ARCHITECTURE
## CTO-Level Technical Design Document

**Version**: 2.0.0  
**Date**: March 11, 2026  
**Status**: Production Enhancement Phase  
**Target**: 10+ Year Scalability

---

## EXECUTIVE SUMMARY

### Current System Status
✅ **Functional MVP** with 25 courses, 21 users, admin panel, student dashboard  
✅ **Tech Stack**: MERN (Next.js, Express, JSON DB, Redux)  
✅ **Features**: OTP auth, 26 math tools, progress tracking, notifications  

### Enhancement Objective
Transform the existing MVP into an **enterprise-grade EdTech platform** capable of:
- Supporting 100,000+ concurrent users
- Scaling to 1,000+ courses
- Real-time learning analytics
- AI-powered personalization (future)
- Multi-tenant architecture (future)

---

## PHASE 1: PRODUCT ANALYSIS

### 1.1 Platform Purpose
**Mission**: Democratize mathematics education for students Grade 5-12 through structured, interactive, and personalized learning experiences.

### 1.2 User Types
1. **Students** (Primary Users)
   - Grade 5-8: Foundation mathematics
   - Grade 9-10: Board exam preparation
   - Grade 11-12: Advanced math + competitive exams (JEE/NEET)

2. **Super Admin** (Single Role)
   - Complete platform control
   - Content management
   - User management
   - Analytics & reporting
   - System configuration

### 1.3 Learning Hierarchy
```
Grade Level (5-12)
  └── Course (e.g., "Algebra Mastery")
      └── Module (e.g., "Linear Equations")
          └── Lesson (e.g., "Solving 2-Variable Equations")
              ├── Practice Questions (Interactive)
              └── Quiz (Assessment)
```

### 1.4 Core Learning Flows

#### Student Journey
```
Registration (OTP) → Browse Courses → Purchase → Study Modules → 
Practice Problems → Take Quizzes → Track Progress → Receive Certificates
```

#### Admin Journey
```
Login → Dashboard Analytics → Manage Content → Monitor Users → 
Configure Settings → View Reports → Send Notifications
```

---

## PHASE 2: SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Student │  │  Admin   │  │   Auth   │  │  Tools   │   │
│  │   Panel  │  │  Panel   │  │  System  │  │  (26)    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER (Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Course  │  │ Progress │  │  Admin   │   │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   OTP    │  │  Email   │  │  Notif   │  │Analytics │   │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Data Access
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER (MongoDB Atlas)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Courses  │  │ Progress │  │  Orders  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Modules  │  │ Lessons  │  │ Quizzes  │  │  Notifs  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack (Current + Enhancements)

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS + Framer Motion
- **Forms**: React Hook Form
- **Charts**: Recharts (for analytics)
- **Math Rendering**: KaTeX/MathJax

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas (migrate from JSON)
- **Authentication**: JWT + OTP (Email)
- **Email**: Nodemailer (Gmail SMTP)
- **Validation**: Express Validator
- **File Upload**: Multer (for images/videos)

#### Infrastructure
- **Current**: Local JSON DB
- **Target**: MongoDB Atlas Cloud
- **CDN**: Cloudflare (future)
- **Storage**: AWS S3 (future - videos/images)
- **Monitoring**: Winston Logger + Sentry (future)

---

## PHASE 3: DATABASE ARCHITECTURE

### 3.1 Migration Strategy: JSON → MongoDB

**Current State**: LowDB (JSON file-based)  
**Target State**: MongoDB Atlas (Cloud-hosted)  
**Migration Approach**: Dual-write pattern with gradual cutover

### 3.2 MongoDB Schema Design

#### Collection: `users`
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: ['student', 'super_admin']),
  status: String (enum: ['active', 'suspended', 'inactive']),
  profilePhoto: String (URL),
  phone: String,
  grade: Number (5-12),
  isEmailVerified: Boolean,
  purchasedCourses: [ObjectId] (ref: courses),
  favorites: [ObjectId] (ref: courses),
  learningStreak: Number,
  totalTimeSpent: Number (minutes),
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

#### Collection: `courses`
```javascript
{
  _id: ObjectId,
  title: String (indexed),
  slug: String (unique, indexed),
  description: String,
  category: String (indexed),
  grade: [Number] (5-12),
  difficulty: String (enum: ['Beginner', 'Intermediate', 'Advanced']),
  price: Number,
  discountPrice: Number,
  instructor: {
    name: String,
    bio: String,
    photo: String
  },
  duration: String,
  totalLessons: Number,
  totalQuizzes: Number,
  topics: [String],
  thumbnail: String (URL),
  previewVideo: String (URL),
  status: String (enum: ['draft', 'published', 'archived']),
  isFeatured: Boolean,
  enrolledCount: Number,
  rating: Number,
  reviews: [{
    userId: ObjectId,
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  expiryDays: Number (course access duration),
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date
}
```

#### Collection: `modules`
```javascript
{
  _id: ObjectId,
  courseId: ObjectId (ref: courses, indexed),
  title: String,
  description: String,
  order: Number (indexed),
  duration: String,
  isLocked: Boolean,
  unlockCondition: {
    type: String (enum: ['none', 'previous_module', 'quiz_score']),
    value: Mixed
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Collection: `lessons`
```javascript
{
  _id: ObjectId,
  moduleId: ObjectId (ref: modules, indexed),
  courseId: ObjectId (ref: courses, indexed),
  title: String,
  description: String,
  order: Number (indexed),
  type: String (enum: ['theory', 'video', 'practice', 'quiz']),
  duration: String,
  content: {
    concept: String (Markdown/HTML),
    examples: [{
      title: String,
      problem: String,
      solution: String,
      steps: [String]
    }],
    keyPoints: [String],
    formulas: [String],
    diagrams: [String] (URLs)
  },
  videoUrl: String,
  resources: [{
    title: String,
    type: String,
    url: String
  }],
  isLocked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Collection: `practice_questions`
```javascript
{
  _id: ObjectId,
  lessonId: ObjectId (ref: lessons, indexed),
  moduleId: ObjectId (ref: modules),
  courseId: ObjectId (ref: courses),
  question: String,
  questionType: String (enum: ['mcq', 'numerical', 'subjective']),
  options: [String] (for MCQ),
  correctAnswer: Mixed,
  explanation: String,
  difficulty: String (enum: ['easy', 'medium', 'hard']),
  hints: [String],
  tags: [String],
  order: Number,
  createdAt: Date
}
```

#### Collection: `quizzes`
```javascript
{
  _id: ObjectId,
  moduleId: ObjectId (ref: modules, indexed),
  courseId: ObjectId (ref: courses, indexed),
  title: String,
  description: String,
  duration: Number (minutes),
  totalMarks: Number,
  passingMarks: Number,
  questions: [{
    questionId: ObjectId (ref: practice_questions),
    marks: Number
  }],
  attempts: Number (max attempts allowed),
  isLocked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Collection: `progress`
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, indexed),
  courseId: ObjectId (ref: courses, indexed),
  enrolledAt: Date,
  expiresAt: Date,
  status: String (enum: ['active', 'completed', 'expired']),
  completionPercentage: Number,
  modulesCompleted: [ObjectId],
  lessonsCompleted: [{
    lessonId: ObjectId,
    completedAt: Date,
    timeSpent: Number
  }],
  quizzesAttempted: [{
    quizId: ObjectId,
    attemptNumber: Number,
    score: Number,
    totalMarks: Number,
    percentage: Number,
    answers: [Mixed],
    attemptedAt: Date
  }],
  practiceAccuracy: Number,
  totalTimeSpent: Number (minutes),
  lastAccessedAt: Date,
  certificateIssued: Boolean,
  certificateUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Collection: `notifications`
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, indexed),
  type: String (enum: ['course_expiry', 'new_course', 'achievement', 'reminder', 'system']),
  title: String,
  message: String,
  link: String,
  isRead: Boolean,
  priority: String (enum: ['low', 'medium', 'high']),
  createdAt: Date,
  expiresAt: Date
}
```

#### Collection: `orders`
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, indexed),
  courseId: ObjectId (ref: courses, indexed),
  amount: Number,
  discount: Number,
  finalAmount: Number,
  paymentMethod: String,
  paymentStatus: String (enum: ['pending', 'completed', 'failed', 'refunded']),
  transactionId: String,
  purchasedAt: Date,
  expiresAt: Date
}
```

#### Collection: `subscriptions`
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, indexed),
  plan: String (enum: ['monthly', 'quarterly', 'yearly']),
  status: String (enum: ['active', 'cancelled', 'expired']),
  startDate: Date,
  endDate: Date,
  amount: Number,
  autoRenew: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Collection: `activity_logs`
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users, indexed),
  action: String,
  entity: String,
  entityId: ObjectId,
  details: Mixed,
  ipAddress: String,
  userAgent: String,
  createdAt: Date (indexed)
}
```

#### Collection: `settings`
```javascript
{
  _id: ObjectId,
  key: String (unique, indexed),
  value: Mixed,
  category: String,
  description: String,
  updatedBy: ObjectId (ref: users),
  updatedAt: Date
}
```

### 3.3 Indexing Strategy
```javascript
// Performance-critical indexes
users: { email: 1 }, { role: 1, status: 1 }
courses: { slug: 1 }, { category: 1, status: 1 }, { grade: 1 }
modules: { courseId: 1, order: 1 }
lessons: { moduleId: 1, order: 1 }, { courseId: 1 }
progress: { userId: 1, courseId: 1 }, { expiresAt: 1 }
notifications: { userId: 1, isRead: 1, createdAt: -1 }
activity_logs: { userId: 1, createdAt: -1 }
```

---

## PHASE 4: BACKEND API ARCHITECTURE

### 4.1 API Structure

```
/api/v1/
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh-token
│   ├── POST   /forgot-password
│   └── POST   /reset-password
│
├── /otp
│   ├── POST   /send
│   └── POST   /verify
│
├── /courses
│   ├── GET    /
│   ├── GET    /:id
│   ├── GET    /featured
│   ├── GET    /by-grade/:grade
│   ├── GET    /by-category/:category
│   └── POST   /enroll/:id
│
├── /modules
│   ├── GET    /course/:courseId
│   └── GET    /:id
│
├── /lessons
│   ├── GET    /module/:moduleId
│   ├── GET    /:id
│   └── POST   /:id/complete
│
├── /practice
│   ├── GET    /lesson/:lessonId
│   ├── POST   /submit
│   └── GET    /results/:id
│
├── /quizzes
│   ├── GET    /module/:moduleId
│   ├── GET    /:id
│   ├── POST   /:id/attempt
│   └── POST   /:id/submit
│
├── /progress
│   ├── GET    /my-courses
│   ├── GET    /course/:courseId
│   └── GET    /analytics
│
├── /notifications
│   ├── GET    /
│   ├── PUT    /:id/read
│   └── DELETE /:id
│
├── /profile
│   ├── GET    /
│   ├── PUT    /
│   └── PUT    /password
│
└── /admin
    ├── /dashboard
    │   └── GET    /stats
    │
    ├── /users
    │   ├── GET    /
    │   ├── GET    /:id
    │   ├── PUT    /:id
    │   ├── DELETE /:id
    │   └── PUT    /:id/status
    │
    ├── /courses
    │   ├── GET    /
    │   ├── POST   /
    │   ├── GET    /:id
    │   ├── PUT    /:id
    │   ├── DELETE /:id
    │   └── PUT    /:id/publish
    │
    ├── /modules
    │   ├── POST   /
    │   ├── PUT    /:id
    │   └── DELETE /:id
    │
    ├── /lessons
    │   ├── POST   /
    │   ├── PUT    /:id
    │   └── DELETE /:id
    │
    ├── /practice
    │   ├── POST   /
    │   ├── PUT    /:id
    │   └── DELETE /:id
    │
    ├── /quizzes
    │   ├── POST   /
    │   ├── PUT    /:id
    │   └── DELETE /:id
    │
    ├── /analytics
    │   ├── GET    /users
    │   ├── GET    /courses
    │   ├── GET    /revenue
    │   └── GET    /engagement
    │
    └── /settings
        ├── GET    /
        └── PUT    /
```

### 4.2 API Response Standards

```javascript
// Success Response
{
  success: true,
  data: { ... },
  message: "Operation successful",
  timestamp: "2026-03-11T10:30:00Z"
}

// Error Response
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid input data",
    details: [ ... ]
  },
  timestamp: "2026-03-11T10:30:00Z"
}

// Paginated Response
{
  success: true,
  data: [ ... ],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    pages: 8
  }
}
```

---

## PHASE 5: SUPER ADMIN CONTROL SYSTEM

### 5.1 Dashboard Analytics

**Real-time Metrics**:
- Total Users (Active/Suspended)
- Total Courses (Published/Draft)
- Total Revenue (Today/Month/Year)
- Active Learners (Online now)
- Course Completion Rate
- Average Quiz Score
- Popular Courses
- Recent Activity

**Charts**:
- User Growth (Line chart)
- Revenue Trends (Bar chart)
- Course Enrollment (Pie chart)
- Learning Hours (Area chart)

### 5.2 User Management

**Capabilities**:
- View all users (paginated, searchable)
- Filter by role, status, grade
- View user details & learning history
- Suspend/Activate accounts
- Reset passwords
- Send notifications
- Export user data

### 5.3 Course Builder

**Visual Interface**:
```
Course Creation Wizard
├── Step 1: Basic Info (Title, Description, Price)
├── Step 2: Instructor Details
├── Step 3: Add Modules
│   └── For each module:
│       ├── Add Lessons
│       ├── Add Practice Questions
│       └── Create Quiz
├── Step 4: Preview
└── Step 5: Publish
```

**Features**:
- Drag-and-drop module ordering
- Rich text editor for content
- Math equation editor (LaTeX)
- Image/video upload
- Bulk import questions (CSV)
- Course cloning
- Version control

### 5.4 Content Management

**Lesson Editor**:
- Markdown/WYSIWYG editor
- Math formula support (KaTeX)
- Code syntax highlighting
- Image gallery
- Video embedding
- Interactive examples

**Question Bank**:
- MCQ builder
- Numerical answer type
- Subjective questions
- Difficulty tagging
- Topic tagging
- Bulk operations

### 5.5 Platform Settings

**Configurable Settings**:
- Email templates
- Notification rules
- Course expiry defaults
- Payment gateway config
- Discount codes
- Maintenance mode
- Feature flags

---

## PHASE 6: STUDENT LEARNING SYSTEM

### 6.1 Learning Dashboard

**Widgets**:
- My Courses (with progress bars)
- Continue Learning (last accessed)
- Upcoming Quizzes
- Learning Streak
- Achievements
- Notifications
- Recommended Courses

### 6.2 Course Player

**Interface**:
```
┌─────────────────────────────────────────────────────┐
│  Course: Algebra Mastery                            │
├──────────────┬──────────────────────────────────────┤
│  Modules     │  Lesson Content                      │
│  Sidebar     │                                      │
│              │  [Theory/Video/Practice/Quiz]        │
│  ✓ Module 1  │                                      │
│  → Module 2  │  [Interactive Content Area]          │
│    Module 3  │                                      │
│              │  [Previous] [Mark Complete] [Next]   │
└──────────────┴──────────────────────────────────────┘
```

**Features**:
- Auto-save progress
- Bookmark lessons
- Take notes
- Ask doubts (future)
- Download resources
- Offline mode (future)

### 6.3 Practice System

**Interactive Practice**:
- Instant feedback
- Step-by-step solutions
- Hints system
- Difficulty progression
- Spaced repetition
- Performance analytics

### 6.4 Quiz System

**Features**:
- Timed quizzes
- Multiple attempts
- Detailed results
- Answer explanations
- Performance comparison
- Certificate generation

---

## PHASE 7: SECURITY ARCHITECTURE

### 7.1 Authentication & Authorization

**JWT Strategy**:
```javascript
// Access Token: 15 minutes
// Refresh Token: 7 days
// Stored in httpOnly cookies
```

**Role-Based Access Control (RBAC)**:
```javascript
Permissions = {
  student: ['read:courses', 'read:own_progress', 'write:own_profile'],
  super_admin: ['*'] // All permissions
}
```

### 7.2 Security Measures

**Implemented**:
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ JWT authentication
- ✅ OTP email verification
- ✅ CORS configuration
- ✅ Input validation

**To Implement**:
- Rate limiting (express-rate-limit)
- SQL injection prevention (parameterized queries)
- XSS protection (helmet.js)
- CSRF tokens
- API key authentication (for integrations)
- Audit logging
- Data encryption at rest

### 7.3 Data Privacy

**Compliance**:
- GDPR-ready (data export/deletion)
- Minimal data collection
- Secure password reset
- Session management
- Activity logging

---

## PHASE 8: SCALABILITY PLANNING

### 8.1 Current Capacity
- Users: 21
- Courses: 25
- Database: JSON file (single-threaded)
- Server: Single instance

### 8.2 Target Capacity (Year 1)
- Users: 100,000+
- Courses: 1,000+
- Concurrent Users: 10,000+
- Database: MongoDB Atlas (M10 cluster)
- Server: Load-balanced (3+ instances)

### 8.3 Scaling Strategy

**Horizontal Scaling**:
```
Load Balancer (Nginx)
├── App Server 1
├── App Server 2
└── App Server 3
```

**Database Scaling**:
- MongoDB Atlas auto-scaling
- Read replicas for analytics
- Sharding by userId (future)

**Caching Layer**:
- Redis for session storage
- CDN for static assets
- API response caching

**Async Processing**:
- Bull Queue for email sending
- Background jobs for analytics
- Scheduled tasks (cron)

---

## PHASE 9: FUTURE ENHANCEMENTS

### 9.1 AI-Powered Features (Year 2-3)

**Adaptive Learning**:
- Personalized learning paths
- Difficulty adjustment
- Content recommendations

**AI Tutor**:
- Natural language Q&A
- Step-by-step problem solving
- Concept explanations

**Analytics**:
- Predictive performance
- Learning pattern analysis
- Dropout prediction

### 9.2 Advanced Features

**Live Classes**:
- Video conferencing integration
- Interactive whiteboard
- Recording & playback

**Gamification**:
- Points & badges
- Leaderboards
- Challenges & competitions

**Social Learning**:
- Discussion forums
- Peer-to-peer help
- Study groups

**Mobile Apps**:
- React Native apps
- Offline learning
- Push notifications

---

## PHASE 10: MIGRATION ROADMAP

### 10.1 JSON to MongoDB Migration

**Week 1-2**: Setup & Testing
- Provision MongoDB Atlas cluster
- Create collections & indexes
- Write migration scripts
- Test data integrity

**Week 3**: Dual-Write Phase
- Write to both JSON & MongoDB
- Compare data consistency
- Monitor performance

**Week 4**: Cutover
- Switch reads to MongoDB
- Deprecate JSON writes
- Backup & archive JSON data

### 10.2 Feature Rollout

**Month 1**: Foundation
- ✅ Complete MongoDB migration
- ✅ Enhanced admin dashboard
- ✅ Course builder v2
- ✅ Analytics system

**Month 2**: Student Experience
- ✅ Improved course player
- ✅ Interactive practice
- ✅ Quiz system v2
- ✅ Progress tracking v2

**Month 3**: Scale & Optimize
- ✅ Performance optimization
- ✅ Caching layer
- ✅ Load testing
- ✅ Production deployment

---

## CONCLUSION

This architecture provides a **solid foundation** for the next 10 years of growth. The system is designed to:

✅ **Scale horizontally** to millions of users  
✅ **Maintain performance** under high load  
✅ **Support new features** without major refactoring  
✅ **Ensure security** and data privacy  
✅ **Enable AI integration** for personalized learning  

**Next Steps**: Begin Phase 11 (MongoDB Migration) immediately.

---

**Document Owner**: CTO  
**Last Updated**: March 11, 2026  
**Next Review**: April 11, 2026
