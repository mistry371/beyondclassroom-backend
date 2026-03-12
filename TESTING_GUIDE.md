# Testing Guide - Advanced Course Module System

## ✅ SERVERS RUNNING

### Backend Server
- **Port**: 5000
- **Status**: ✅ Running
- **Process ID**: Terminal 24
- **Command**: `node server-simple.js`

### Frontend Server
- **Port**: 3001
- **Status**: ✅ Running
- **Process ID**: Terminal 17
- **Command**: `node node_modules/next/dist/bin/next dev`

## ✅ API ENDPOINTS WORKING

### Test Module API
```bash
curl http://localhost:5000/api/modules/course/test-course-1
```

**Response**: Returns 3 modules ✅
- Module 1: Algebra Fundamentals
- Module 2: Linear Equations
- Module 3: Quadratic Equations

### Test Lessons API
```bash
curl http://localhost:5000/api/lessons/module/module-1
```

**Response**: Returns 2 lessons for Module 1 ✅
- Lesson 1-1: Introduction to Variables
- Lesson 1-2: Simplifying Expressions

## ✅ DUMMY COURSE DATA

**Course ID**: `test-course-1`
**Course Title**: Complete Algebra Mastery

### Structure:
- **3 Modules** with lessons
- **5 Lessons** with full HTML content
- **5 Practice Problems** with solutions
- **2 Quizzes** with multiple-choice questions

## 🌐 HOW TO TEST

### 1. Access the Advanced Learning Page
Open your browser and go to:
```
http://localhost:3001/learn/test-course-1/advanced
```

### 2. What You Should See:
- Course header with "Complete Algebra Mastery"
- Sidebar with 3 modules listed
- Main content area with lessons
- Progress tracking (0% if not logged in)

### 3. Test Navigation:
- Click on different modules in the sidebar
- Click on lessons to view content
- Check if lesson content displays properly

## 📊 DATABASE LOCATION

The dummy data is stored in:
```
server/database/db.json
```

## 🔧 TROUBLESHOOTING

### If modules don't appear:
1. Check browser console for errors (F12)
2. Verify API is responding: `http://localhost:5000/api/modules/course/test-course-1`
3. Check if frontend is calling the correct API endpoint

### If server crashes:
1. Stop all processes
2. Restart backend: `cd server && node server-simple.js`
3. Restart frontend: `cd client && node node_modules/next/dist/bin/next dev`

## ✅ FIXED ISSUES

1. ✅ Created missing `moduleController.js` file
2. ✅ Fixed route imports in `server-simple.js`
3. ✅ Verified all 5 controllers are working
4. ✅ Tested API endpoints successfully
5. ✅ Confirmed dummy data exists in database

## 🎯 NEXT STEPS

1. Open browser at `http://localhost:3001/learn/test-course-1/advanced`
2. Verify modules and lessons display correctly
3. Test clicking through different modules
4. Check if lesson content renders properly

---

**Status**: Ready for testing! 🚀
**Last Updated**: March 10, 2026
