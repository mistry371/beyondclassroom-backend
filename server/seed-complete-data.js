const { db, initDB, models } = require('./database/db')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

async function seedCompleteData() {
  try {
    await initDB()
    await db.read()
    
    console.log('🌱 Starting complete data seeding...\n')
    
    // Initialize all collections
    db.data.users = db.data.users || []
    db.data.courses = db.data.courses || []
    db.data.modules = db.data.modules || []
    db.data.lessons = db.data.lessons || []
    db.data.practices = db.data.practices || []
    db.data.quizzes = db.data.quizzes || []
    db.data.orders = db.data.orders || []
    db.data.cart = db.data.cart || []
    db.data.notifications = db.data.notifications || []
    db.data.settings = db.data.settings || []
    db.data.activityLogs = db.data.activityLogs || []
    db.data.subscriptions = db.data.subscriptions || []
    db.data.progress = db.data.progress || []
    db.data.otps = db.data.otps || []
    
    // Clear existing data for fresh start
    db.data.users = []
    db.data.courses = []
    db.data.modules = []
    db.data.lessons = []
    db.data.practices = []
    db.data.quizzes = []
    db.data.orders = []
    db.data.cart = []
    db.data.notifications = []
    db.data.progress = []
    db.data.subscriptions = []
    
    const hashedPassword = await bcrypt.hash('password123', 12)
    const adminPassword = await bcrypt.hash('jenish@1019', 12)
    
    // Create users
    const users = [
      {
        _id: 'admin-1',
        name: 'Jenish Mistry',
        email: 'mistryjenish1003@gmail.com',
        password: adminPassword,
        role: 'admin',
        status: 'active',
        profilePhoto: '',
        isGuest: false,
        purchasedCourses: [],
        favorites: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date()
      }
    ]

    
    // Add 10 dummy users
    for (let i = 1; i <= 10; i++) {
      users.push({
        _id: `user-${i}`,
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        password: hashedPassword,
        role: 'user',
        status: i <= 8 ? 'active' : 'suspended',
        profilePhoto: '',
        isGuest: false,
        purchasedCourses: i <= 5 ? ['course-1', 'course-2'] : i <= 8 ? ['course-1'] : [],
        favorites: i <= 3 ? ['course-3', 'course-4'] : [],
        createdAt: new Date(2026, 0, i),
        updatedAt: new Date()
      })
    }
    
    db.data.users = users
    console.log('✅ Created 11 users (1 admin + 10 students)')
    
    // Create courses
    const courses = [
      {
        _id: 'course-1',
        title: 'Complete Algebra Mastery',
        description: 'Master algebra from fundamentals to advanced topics with interactive lessons and practice',
        category: 'Algebra',
        difficulty: 'Intermediate',
        price: 49.99,
        instructor: 'Prof. John Smith',
        duration: '8 weeks',
        topics: ['Linear Equations', 'Quadratic Equations', 'Functions', 'Polynomials'],
        thumbnail: '',
        isFeatured: true,
        enrolledCount: 125,
        rating: 4.8,
        status: 'published',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date()
      },
      {
        _id: 'course-2',
        title: 'Calculus Fundamentals',
        description: 'Learn calculus from basics to advanced concepts with real-world applications',
        category: 'Calculus',
        difficulty: 'Advanced',
        price: 79.99,
        instructor: 'Dr. Sarah Johnson',
        duration: '12 weeks',
        topics: ['Limits', 'Derivatives', 'Integrals', 'Applications'],
        thumbnail: '',
        isFeatured: true,
        enrolledCount: 89,
        rating: 4.9,
        status: 'published',
        createdAt: new Date('2026-01-05'),
        updatedAt: new Date()
      }
    ]

    
    for (let i = 3; i <= 8; i++) {
      courses.push({
        _id: `course-${i}`,
        title: `Mathematics Course ${i}`,
        description: `Comprehensive course covering essential mathematics topics for students`,
        category: ['Geometry', 'Statistics', 'Trigonometry', 'Algebra', 'Calculus', 'Geometry'][i - 3],
        difficulty: ['Beginner', 'Intermediate', 'Advanced'][i % 3],
        price: 39.99 + (i * 10),
        instructor: `Instructor ${i}`,
        duration: `${4 + i} weeks`,
        topics: ['Topic 1', 'Topic 2', 'Topic 3'],
        thumbnail: '',
        isFeatured: i <= 5,
        enrolledCount: 50 + (i * 10),
        rating: 4.5 + (i * 0.05),
        status: i <= 6 ? 'published' : 'draft',
        createdAt: new Date(2026, 0, i),
        updatedAt: new Date()
      })
    }
    
    db.data.courses = courses
    console.log('✅ Created 8 courses')
    
    // Create modules for course-1
    const modules = [
      {
        _id: 'module-1',
        courseId: 'course-1',
        title: 'Algebra Fundamentals',
        description: 'Master the basic concepts of algebra',
        order: 1,
        duration: '2 weeks',
        isLocked: false,
        createdAt: new Date('2026-01-01')
      },
      {
        _id: 'module-2',
        courseId: 'course-1',
        title: 'Linear Equations',
        description: 'Learn to solve linear equations and systems',
        order: 2,
        duration: '2 weeks',
        isLocked: false,
        createdAt: new Date('2026-01-01')
      },
      {
        _id: 'module-3',
        courseId: 'course-1',
        title: 'Quadratic Equations',
        description: 'Master quadratic equations and their applications',
        order: 3,
        duration: '2 weeks',
        isLocked: false,
        createdAt: new Date('2026-01-01')
      }
    ]
    
    db.data.modules = modules
    console.log('✅ Created 3 modules')

    
    // Create lessons
    const lessons = [
      {
        _id: 'lesson-1-1',
        moduleId: 'module-1',
        title: 'Introduction to Variables',
        description: 'Understanding variables and algebraic expressions',
        order: 1,
        duration: '30 minutes',
        type: 'lesson',
        content: {
          concept: '<h2>What are Variables?</h2><p>A variable is a symbol that represents a number.</p><h3>Key Points:</h3><ul><li>Variables can represent any number</li><li>We use letters like x, y, z</li><li>Variables help us write general rules</li></ul>',
          summary: 'Variables are symbols that represent unknown numbers.'
        },
        videoUrl: null,
        isLocked: false,
        createdAt: new Date('2026-01-01')
      },
      {
        _id: 'lesson-1-2',
        moduleId: 'module-1',
        title: 'Simplifying Expressions',
        description: 'Learn to combine like terms',
        order: 2,
        duration: '45 minutes',
        type: 'lesson',
        content: {
          concept: '<h2>Simplifying Expressions</h2><p>Combine like terms to simplify.</p><h3>Examples:</h3><p><strong>Example 1:</strong> 3x + 5x = 8x</p>',
          summary: 'Simplify by combining like terms.'
        },
        videoUrl: null,
        isLocked: false,
        createdAt: new Date('2026-01-01')
      }
    ]
    
    db.data.lessons = lessons
    console.log('✅ Created 2 lessons')
    
    // Create orders
    const orders = []
    for (let i = 1; i <= 5; i++) {
      orders.push({
        _id: `order-${i}`,
        user: `user-${i}`,
        courses: i <= 3 ? ['course-1', 'course-2'] : ['course-1'],
        totalAmount: i <= 3 ? 129.98 : 49.99,
        status: 'completed',
        createdAt: new Date(2026, 0, i + 5)
      })
    }
    
    db.data.orders = orders
    console.log('✅ Created 5 orders')
    
    // Create notifications
    const notifications = []
    for (let i = 1; i <= 5; i++) {
      notifications.push({
        _id: `notif-${i}`,
        user: `user-${i}`,
        title: 'Welcome to Elite Math Platform!',
        message: 'Start your learning journey today',
        type: 'info',
        isRead: i <= 2,
        createdAt: new Date(2026, 0, i)
      })
    }
    
    db.data.notifications = notifications
    console.log('✅ Created 5 notifications')

    
    // Create progress records
    const progressRecords = []
    for (let i = 1; i <= 5; i++) {
      progressRecords.push({
        _id: `progress-${i}`,
        userId: `user-${i}`,
        courseId: 'course-1',
        completionPercentage: 20 * i,
        lessonsCompleted: i >= 2 ? ['lesson-1-1'] : [],
        quizzesCompleted: [],
        lastAccessedAt: new Date(2026, 0, 10 + i),
        createdAt: new Date(2026, 0, i)
      })
    }
    
    db.data.progress = progressRecords
    console.log('✅ Created 5 progress records')
    
    // Create subscriptions
    const subscriptions = []
    for (let i = 1; i <= 5; i++) {
      const startDate = new Date(2026, 0, i)
      const endDate = new Date(2026, 3, i) // 3 months later
      subscriptions.push({
        _id: `sub-${i}`,
        userId: `user-${i}`,
        courseId: 'course-1',
        planName: 'Standard Access',
        startDate,
        endDate,
        durationDays: 90,
        status: i <= 4 ? 'active' : 'expired',
        autoRenew: i <= 3,
        price: 49.99,
        createdAt: startDate
      })
    }
    
    db.data.subscriptions = subscriptions
    console.log('✅ Created 5 subscriptions')
    
    // Initialize settings if not exist
    if (db.data.settings.length === 0) {
      db.data.settings = [
        {
          _id: 'setting-1',
          key: 'site_name',
          value: 'Elite Math Platform',
          type: 'string',
          category: 'general',
          displayName: 'Site Name',
          description: 'The name of your platform',
          isPublic: true,
          updatedAt: new Date()
        },
        {
          _id: 'setting-2',
          key: 'default_course_duration',
          value: '90',
          type: 'number',
          category: 'courses',
          displayName: 'Default Course Duration (days)',
          description: 'Default access duration for courses',
          isPublic: false,
          updatedAt: new Date()
        },
        {
          _id: 'setting-3',
          key: 'enable_notifications',
          value: 'true',
          type: 'boolean',
          category: 'features',
          displayName: 'Enable Notifications',
          description: 'Enable/disable notification system',
          isPublic: false,
          updatedAt: new Date()
        }
      ]
      console.log('✅ Initialized settings')
    }
    
    // Save to Mongoose
    await models.users.deleteMany({})
    await models.users.insertMany(users)

    await models.courses.deleteMany({})
    await models.courses.insertMany(courses)

    await models.modules.deleteMany({})
    await models.modules.insertMany(modules)

    await models.lessons.deleteMany({})
    await models.lessons.insertMany(lessons)

    await models.orders.deleteMany({})
    await models.orders.insertMany(orders)

    await models.notifications.deleteMany({})
    await models.notifications.insertMany(notifications)

    await models.progress.deleteMany({})
    await models.progress.insertMany(progressRecords)

    await models.subscriptions.deleteMany({})
    await models.subscriptions.insertMany(subscriptions)

    await models.settings.deleteMany({})
    await models.settings.insertMany(db.data.settings)

    await db.write()
    
    console.log('\n🎉 Complete data seeding finished!')
    console.log('\n📊 Summary:')
    console.log(`- Users: ${db.data.users.length}`)
    console.log(`- Courses: ${db.data.courses.length}`)
    console.log(`- Modules: ${db.data.modules.length}`)
    console.log(`- Lessons: ${db.data.lessons.length}`)
    console.log(`- Orders: ${db.data.orders.length}`)
    console.log(`- Notifications: ${db.data.notifications.length}`)
    console.log(`- Progress Records: ${db.data.progress.length}`)
    console.log(`- Subscriptions: ${db.data.subscriptions.length}`)
    
    console.log('\n🔑 Login Credentials:')
    console.log('Admin: mistryjenish1003@gmail.com / jenish@1019')
    console.log('Users: student1@example.com to student10@example.com / password123')
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
  } finally {
    await mongoose.disconnect()
  }
}

seedCompleteData()
