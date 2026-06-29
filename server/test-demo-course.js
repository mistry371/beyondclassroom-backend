const { db, initDB, models } = require('./database/db')
const mongoose = require('mongoose')

async function setupTestUser() {
  try {
    await initDB()

    console.log('🔧 Setting up test user for demo course...')

    // Find the demo course
    const demoCourse = await models.courses.findOne({ title: /Complete Algebra Mastery/i }).lean()
    
    if (!demoCourse) {
      console.error('❌ Demo course not found. Please run seed-demo-course.js first.')
      return
    }

    console.log(`✅ Found demo course: ${demoCourse.title}`)
    console.log(`   Course ID: ${demoCourse._id}`)

    // Find or create a test user
    let testUser = await models.users.findOne({ email: 'test@demo.com' }).lean()
    
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
        createdAt: new Date().toISOString()
      }
      
      await models.users.create(testUser)
      console.log('✅ Created test user: test@demo.com / test123')
    } else {
      console.log('✅ Found existing test user: test@demo.com')
    }

    // Add course to user's purchased courses if not already added
    if (!(testUser.purchasedCourses || []).includes(demoCourse._id)) {
      await models.users.updateOne(
        { _id: testUser._id },
        { $addToSet: { purchasedCourses: demoCourse._id } }
      )
      console.log('✅ Added demo course to test user')
    } else {
      console.log('ℹ️  Test user already has access to demo course')
    }

    // Create initial progress record
    const existingProgress = await models.progress.findOne({
      userId: testUser._id,
      courseId: demoCourse._id
    }).lean()

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
        lastAccessedAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        createdAt: new Date().toISOString()
      }

      await models.progress.create(progressRecord)
      console.log('✅ Created progress tracking record')
    } else {
      console.log('ℹ️  Progress record already exists')
    }

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
  } finally {
    await mongoose.disconnect()
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
