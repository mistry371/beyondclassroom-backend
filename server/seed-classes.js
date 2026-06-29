const { db, initDB, models } = require('./database/db')
const mongoose = require('mongoose')

async function seedClasses() {
  try {
    await initDB()
    
    console.log('🌱 Starting Classes 1-8 data seeding...\n')
    
    // Create the Class 6 special demo course
    const class6DemoCourseId = 'course-class-6-demo'
    const class6DemoCourse = {
      _id: class6DemoCourseId,
      title: 'Class 6 Complete Demo (₹599)',
      description: 'Full featured demo course for Class 6 mathematics.',
      category: 'Mathematics',
      grade: 'Class 6',
      difficulty: 'Intermediate',
      price: 1999,
      discountPrice: 599,
      instructor: 'Beyond Classroom Experts',
      duration: '1 Year',
      topics: ['Number System', 'Algebra'],
      thumbnail: '',
      status: 'published',
      isFeatured: true,
      isFree: false,
      isDemo: true,
      enrolledCount: 420,
      rating: 4.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // New courses array starting with the demo course
    const newCoursesList = [class6DemoCourse]
    
    // Create Class 1 to 8 courses
    for (let i = 1; i <= 8; i++) {
      const courseId = `course-class-${i}`
      
      const newCourse = {
        _id: courseId,
        title: `Class ${i} Mathematics`,
        description: `Complete mathematics curriculum and practice for Class ${i}.`,
        category: 'Mathematics',
        grade: `Class ${i}`,
        difficulty: 'Intermediate',
        price: 999,
        discountPrice: 499,
        instructor: 'Beyond Classroom Experts',
        duration: '1 Year',
        topics: ['Numbers', 'Geometry'],
        thumbnail: '',
        status: 'published',
        isFeatured: true,
        isFree: false,
        isDemo: false,
        enrolledCount: Math.floor(Math.random() * 500) + 100,
        rating: 4.8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      newCoursesList.push(newCourse)
      console.log(`✅ Created Course: Class ${i} Mathematics`)
    }

    await models.courses.deleteMany({})
    await models.courses.insertMany(newCoursesList)

    console.log('\n🎉 Classes 1-8 data seeding finished successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding classes data:', error)
  } finally {
    await mongoose.disconnect()
  }
}

seedClasses()
