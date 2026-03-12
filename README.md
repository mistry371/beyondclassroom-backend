# 🎓 Elite Mathematics Learning Platform

<div align="center">

![Mathematics Platform](https://img.shields.io/badge/Mathematics-Learning%20Platform-D4AF37?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-D4AF37?style=for-the-badge)

**A premium, full-stack EdTech platform for mathematics education from Grade 5 to Grade 12**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

Elite Mathematics Learning Platform is a comprehensive, production-ready EdTech solution designed to revolutionize mathematics education. Built with modern technologies and featuring a premium charcoal black & light golden theme, this platform provides an immersive learning experience for students from Grade 5 to Grade 12.

### 🎯 Key Highlights

- **25+ Structured Courses** covering all mathematics topics
- **20+ Professional Calculator Tools** for instant problem-solving
- **AI-Powered Learning Paths** with adaptive content
- **Real-time Progress Tracking** and analytics
- **Email OTP Authentication** for secure access
- **Responsive Design** optimized for all devices
- **Premium Dark Theme** with golden accents

---

## ✨ Features

### 🎓 Learning Management
- **Comprehensive Course Catalog**: 25+ courses from basic arithmetic to advanced calculus
- **Structured Learning Path**: Grade-wise organization (Grade 5-12, JEE, Board Exams)
- **Module-Based Content**: Organized lessons with practice problems and quizzes
- **Progress Tracking**: Real-time monitoring of course completion
- **Interactive Lessons**: Rich content with mathematical notation support
- **Practice Problems**: Extensive problem sets with solutions
- **Quiz System**: Automated assessments with instant feedback

### 🧮 Mathematical Tools (20+ Calculators)
- **Basic Calculator**: Standard arithmetic operations
- **Scientific Calculators**: Trigonometry, logarithms, exponents
- **Algebra Tools**: Quadratic solver, linear equations, matrices
- **Calculus Tools**: Derivatives, integrals, limits
- **Geometry Tools**: Area, volume, graphing calculator
- **Statistics Tools**: Mean, median, mode, standard deviation
- **Advanced Tools**: Complex numbers, vectors, sequences

### 👤 User Management
- **Email OTP Authentication**: Secure registration and login
- **User Profiles**: Personalized dashboards with learning history
- **Course Enrollment**: Easy purchase and enrollment system
- **Shopping Cart**: Multi-course purchase capability
- **Notifications**: Real-time updates and reminders
- **Course Expiry Management**: Automatic expiry tracking

### 🔐 Admin Panel
- **User Management**: View, edit, and manage all users
- **Course Management**: Create, update, and delete courses
- **Content Management**: Manage modules, lessons, and quizzes
- **Analytics Dashboard**: Platform statistics and insights
- **Settings Control**: Platform-wide configuration
- **Activity Logs**: Track all system activities

### 🎨 Design & UX
- **Premium Dark Theme**: Charcoal black (#0A0A0A) with light golden (#D4AF37) accents
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: WCAG compliant components
- **Modern UI**: Glass-morphism effects and gradients
- **Fast Performance**: Optimized loading and rendering

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS 3.4
- **State Management**: Redux Toolkit
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Math Rendering**: KaTeX

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT + Email OTP
- **Email Service**: Nodemailer (Gmail SMTP)
- **Validation**: Express Validator
- **Security**: bcryptjs, CORS

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint
- **API Testing**: Postman
- **Deployment**: Vercel (Frontend), Railway/Render (Backend)

---

## 📁 Project Structure

```
mathplatform/
├── client/                      # Next.js Frontend
│   ├── app/                     # App Router Pages
│   │   ├── admin/              # Admin Panel Pages
│   │   ├── auth/               # Authentication Pages
│   │   ├── blogs/              # Blog Pages
│   │   ├── courses/            # Course Pages
│   │   ├── dashboard/          # User Dashboard
│   │   ├── learn/              # Learning Interface
│   │   ├── tools/              # Calculator Tools
│   │   ├── layout.js           # Root Layout
│   │   ├── page.js             # Homepage
│   │   └── globals.css         # Global Styles
│   ├── components/             # React Components
│   │   ├── tools/              # Calculator Components
│   │   ├── Navbar.js           # Navigation Bar
│   │   ├── Hero.js             # Hero Section
│   │   └── ...
│   ├── store/                  # Redux Store
│   │   ├── slices/             # Redux Slices
│   │   └── store.js            # Store Configuration
│   ├── utils/                  # Utility Functions
│   ├── public/                 # Static Assets
│   ├── tailwind.config.js      # Tailwind Configuration
│   ├── next.config.js          # Next.js Configuration
│   └── package.json            # Frontend Dependencies
│
├── server/                      # Express.js Backend
│   ├── controllers/            # Route Controllers
│   ├── models/                 # Database Models
│   ├── routes/                 # API Routes
│   ├── middleware/             # Custom Middleware
│   ├── services/               # Business Logic
│   ├── database/               # Database Configuration
│   ├── server-simple.js        # Server Entry Point
│   └── package.json            # Backend Dependencies
│
├── docs/                        # Documentation
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── MONGODB_MIGRATION_PLAN.md
│   ├── CTO_IMPLEMENTATION_SUMMARY.md
│   └── ...
│
├── .gitignore                  # Git Ignore Rules
├── README.md                   # This File
└── LICENSE                     # MIT License
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Gmail account for email service
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/mistry371/elite-math-platform.git
cd elite-math-platform
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 3: Environment Configuration

#### Backend (.env)
Create `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://admin:admin@cluster0.iqoanfx.mongodb.net/elite-digital-card

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_USER=mistryjenish1003@gmail.com
EMAIL_PASS=xhxt sgan geyy dtbi
EMAIL_FROM=Elite Math Platform <mistryjenish1003@gmail.com>

# OTP Configuration
OTP_EXPIRY=10
OTP_LENGTH=6

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 4: Start Development Servers

```bash
# Terminal 1 - Start Backend
cd server
node server-simple.js

# Terminal 2 - Start Frontend
cd client
npm run dev
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:3000/admin

### Default Credentials

**Admin Account:**
- Email: mistryjenish1003@gmail.com
- Password: jenish@1019

**Student Accounts:**
- Email: student1@example.com to student20@example.com
- Password: password123

---

## ⚙️ Configuration

### Database Setup

1. **MongoDB Atlas**:
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string
   - Update `MONGODB_URI` in `server/.env`

2. **Seed Data** (Optional):
```bash
cd server
node seed-complete-data.js
```

### Email Service Setup

1. **Gmail App Password**:
   - Enable 2-Factor Authentication on your Gmail
   - Generate an App Password
   - Update `EMAIL_USER` and `EMAIL_PASS` in `server/.env`

### Theme Customization

Colors are defined in `client/tailwind.config.js`:

```javascript
colors: {
  primary: '#D4AF37',    // Light Golden
  secondary: '#FFD700',  // Bright Gold
  accent: '#C5A572',     // Muted Gold
  dark: {
    DEFAULT: '#0A0A0A',  // Charcoal Black
    100: '#1A1A1A',
    200: '#2A2A2A',
    300: '#3A3A3A',
  }
}
```

---

## 📖 Usage

### For Students

1. **Register**: Create account with email OTP verification
2. **Browse Courses**: Explore 25+ mathematics courses
3. **Enroll**: Add courses to cart and purchase
4. **Learn**: Access structured lessons and modules
5. **Practice**: Solve problems and take quizzes
6. **Track Progress**: Monitor your learning journey
7. **Use Tools**: Access 20+ calculator tools anytime

### For Administrators

1. **Login**: Access admin panel with admin credentials
2. **Manage Users**: View and manage all registered users
3. **Manage Courses**: Create, edit, and delete courses
4. **Manage Content**: Add modules, lessons, and quizzes
5. **View Analytics**: Monitor platform statistics
6. **Configure Settings**: Adjust platform-wide settings

---

## 🔌 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          # Register new user
POST   /api/auth/verify-otp        # Verify OTP
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
GET    /api/auth/me                # Get current user
```

### Course Endpoints

```
GET    /api/courses                # Get all courses
GET    /api/courses/:id            # Get course by ID
POST   /api/courses                # Create course (Admin)
PUT    /api/courses/:id            # Update course (Admin)
DELETE /api/courses/:id            # Delete course (Admin)
```

### User Endpoints

```
GET    /api/profile                # Get user profile
PUT    /api/profile                # Update profile
GET    /api/progress/course/:id   # Get course progress
POST   /api/progress               # Update progress
```

### Cart & Orders

```
GET    /api/cart                   # Get user cart
POST   /api/cart                   # Add to cart
DELETE /api/cart/:id               # Remove from cart
POST   /api/orders                 # Create order
GET    /api/orders                 # Get user orders
```

For complete API documentation, see [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

---

## 📸 Screenshots

### Homepage
![Homepage](docs/screenshots/homepage.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Course Detail
![Course Detail](docs/screenshots/course-detail.png)

### Calculator Tools
![Calculator Tools](docs/screenshots/calculator-tools.png)

### Admin Panel
![Admin Panel](docs/screenshots/admin-panel.png)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Jenish Mistry**

- GitHub: [@mistry371](https://github.com/mistry371)
- Email: mistryjenish1003@gmail.com

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the database solution
- All open-source contributors

---

## 📞 Support

For support, email mistryjenish1003@gmail.com or open an issue on GitHub.

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] AI-powered personalized learning paths
- [ ] Live video classes integration
- [ ] Peer-to-peer discussion forums
- [ ] Gamification with badges and leaderboards
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Payment gateway integration (Razorpay/Stripe)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Jenish Mistry](https://github.com/mistry371)

</div>
