const { db } = require('./database/db')

async function setupTestUser() {
  try {
    await db.read()

    console.log('🔧 Setting up test user for demo course...')

    // Find the demo course
    const demoCourse = db.data.courses.find(c => c.title.includes('Complete Algebra Mastery - Demo'))
    
    if (!demoCourse) {
      console.error('❌ Demo course not found. Please run seed-demo-course.js first.')
      return
    }

    console.log(`✅ Found demo course: ${demoCourse.title}`)
    console.log(`   Course ID: ${demoCourse._id}`)

    // Find or create a test user
    let testUser = db.data.users.find(u => u.email === 'test@demo.com')
    
    if (!testUser) {
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('test123', 10)
      
      testUser = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: 'Demo Student',
        email: 'test@demo.com',
        password: hashedPassword,
        role: 'student',
        purchasedCourses: [],
        createdAt: new Date()
      }
      
      db.data.users.push(testUser)
      console.log('✅ Created test user: test@demo.com / test123')
    } else {
      console.log('✅ Found existing test user: test@demo.com')
    }

    // Add course to user's purchased courses if not already added
    if (!testUser.purchasedCourses.includes(demoCourse._id)) {
      testUser.purchasedCourses.push(demoCourse._id)
      console.log('✅ Added demo course to test user')
    } else {
      console.log('ℹ️  Test user already has access to demo course')
    }

    // Create initial progress record
    const existingProgress = db.data.progress?.find(
      p => p.userId === testUser._id && p.courseId === demoCourse._id
    )

    if (!existingProgress) {
      const progressRecord = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: testUser._id,
        courseId: demoCourse._id,
        completionPercentage: 0,
        lessonsCompleted: [],
        quizzesCompleted: [],
        practiceAccuracy: 0,
        quizScores: [],
        timeSpent: 0,
        lastAccessedAt: new Date(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        createdAt: new Date()
      }

      db.data.progress = db.data.progress || []
      db.data.progress.push(progressRecord)
      console.log('✅ Created progress tracking record')
    } else {
      console.log('ℹ️  Progress record already exists')
    }

    await db.write()

    console.log('\n🎉 Setup complete!')
    console.log('\n📝 Test Credentials:')
    console.log('   Email: test@demo.com')
    console.log('   Password: test123')
    console.log('\n🚀 Next Steps:')
    console.log('   1. Start the server: node server-simple.js')
    console.log('   2. Start the client: npm run dev (in client folder)')
    console.log('   3. Login with test credentials')
    console.log('   4. Go to Dashboard → My Courses')
    console.log('   5. Click "Continue Learning" on the demo course')
    console.log('   6. Test the complete workflow:')
    console.log('      - View modules')
    console.log('      - Complete lessons')
    console.log('      - Solve practice problems')
    console.log('      - Take quizzes')
    console.log('      - Track progress')

  } catch (error) {
    console.error('❌ Error setting up test user:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  setupTestUser()
    .then(() => {
      console.log('\n✅ Setup complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error)
      process.exit(1)
    })
}

module.exports = { setupTestUser }
