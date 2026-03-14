# Beyond Classroom — Backend API

> RESTful API server for the Beyond Classroom mathematics learning platform.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** LowDB (JSON-based, file storage)
- **Auth:** JWT (JSON Web Tokens)
- **Email:** Nodemailer
- **Payment:** Razorpay

## Project Structure

```
server/
├── controllers/          # Route handlers
│   ├── adminController.js
│   ├── adminUserController.js
│   ├── adminCourseController.js
│   ├── adminAnalyticsController.js
│   ├── adminNotificationController.js
│   ├── adminMediaController.js
│   ├── adminSecurityController.js
│   ├── adminBadgeController.js
│   ├── adminCertificateController.js
│   ├── adminLogController.js
│   ├── authController.js
│   ├── courseController.js
│   ├── lessonController.js
│   ├── moduleController.js
│   ├── quizController.js
│   ├── progressController.js
│   ├── orderController.js
│   └── paymentController.js
├── routes/               # Express routers
│   ├── admin.js
│   ├── auth.js
│   ├── courses.js
│   ├── modules.js
│   ├── lessons.js
│   ├── quizzes.js
│   ├── progress.js
│   ├── payment.js
│   └── otp.js
├── middleware/           # Custom middleware
│   └── autoEnrollDemo.js
├── services/             # Business logic & integrations
│   ├── emailService.js
│   ├── emailTemplates.js
│   ├── notificationService.js
│   └── otpService.js
├── database/
│   └── db.js             # LowDB setup
├── .env.example
├── package.json
└── server-simple.js      # Entry point
```

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/beyond-classroom-backend.git
cd beyond-classroom-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values
```

### Environment Variables

```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Run

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/otp/send` | Send OTP to email |
| POST | `/api/otp/verify` | Verify OTP |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:id` | Get course by ID |
| GET | `/api/modules/course/:courseId` | Get modules for course |
| GET | `/api/lessons/module/:moduleId` | Get lessons for module |
| GET | `/api/quizzes/module/:moduleId` | Get quizzes for module |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Dashboard statistics |
| GET | `/api/admin/analytics` | Platform analytics |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/orders` | All orders |
| GET | `/api/admin/notifications` | Notifications |
| POST | `/api/admin/notifications` | Send notification |
| GET | `/api/admin/security` | Security data |
| GET | `/api/admin/logs` | Activity logs |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify payment |

## Database

Uses LowDB with JSON file storage at `database/db.json`.

Collections:
- `users` — registered users
- `courses` — course catalog
- `modules` — course modules
- `lessons` — lesson content
- `quizzes` — quiz data
- `orders` — purchase orders
- `otps` — OTP records
- `notifications` — user notifications
- `announcements` — platform announcements
- `badges` — achievement badges
- `certificates` — issued certificates
- `activityLogs` — system logs

## License

Private — All rights reserved © Beyond Classroom
