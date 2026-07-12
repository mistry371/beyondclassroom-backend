const { db, models } = require('../database/db')
const bcrypt = require('bcryptjs')

const staticPackages = [
  {
    _id: 'beta',
    name: 'Beta Package',
    description: 'Strong Start. Smart Practice. Bright Future.',
    popular: false,
    priceINR: 499,
    priceUSD: 5.5,
    validity: '365 Days',
    features: [
      { label: 'Valid for Classes 1 to 4', detail: 'Full access to early classes' },
      { label: 'Validity 365 Days', detail: 'Enjoy full access for 365 Days' },
      { label: '5 Practice Paper for Each Topic', detail: 'Comprehensive practice for every topic' },
      { label: '20 Questions in Each Practice Paper', detail: 'Well-structured papers for effective practice' },
      { label: 'Provided with Hint and Solved Example', detail: 'Learn better with hints and solved examples' },
      { label: 'PDF Download', detail: 'Download papers with your logo and name' },
      { label: 'Answer Key Included', detail: 'Check your answers and improve accuracy' },
      { label: 'Unlimited Customize Practice Paper', detail: 'Create unlimited practice papers as per your need' },
      { label: 'All Board Included', detail: 'CBSE, ICSE, State Board & All Other Boards' },
    ],
    active: true,
    courseIds: ['course-class-1', 'course-class-2', 'course-class-3', 'course-class-4'],
    customRequestLimit: -1,
    customRequestMaxMarks: -1,
    sortOrder: 0
  },
  {
    _id: 'basic',
    name: 'Basic Package',
    description: 'Build Concepts. Practice More. Score Better.',
    popular: false,
    priceINR: 699,
    priceUSD: 7.5,
    validity: '365 Days',
    features: [
      { label: 'Valid for Classes 5 to 8', detail: 'Access to middle school curriculum' },
      { label: 'Validity 365 Days', detail: 'Enjoy full access for 365 Days' },
      { label: '5 Practice Paper for Each Topic', detail: 'Comprehensive practice for every topic' },
      { label: '20 Questions in Each Practice Paper', detail: 'Well-structured papers for effective practice' },
      { label: 'Provided with Hint and Solved Example', detail: 'Learn better with hints and solved examples' },
      { label: 'PDF Download', detail: 'Download papers with your logo and name' },
      { label: 'Basic Type of Questions', detail: 'Covers all basic concepts clearly' },
      { label: 'Easy Level', detail: 'Designed for better understanding' },
      { label: 'Answer Key Included', detail: 'Check your answers and improve accuracy' },
      { label: 'Allowed 25 Customize Practice Paper (40 Marks)', detail: 'Create up to 25 papers of 40 marks each' },
      { label: 'All Board Included', detail: 'CBSE, ICSE, State Board & All Other Boards' },
    ],
    active: true,
    courseIds: ['course-class-5', 'course-class-6', 'course-class-7', 'course-class-8'],
    customRequestLimit: 25,
    customRequestMaxMarks: 40,
    sortOrder: 1
  },
  {
    _id: 'pro',
    name: 'Pro Package',
    description: 'Advanced Practice. Better Preparation. Excellent Results.',
    popular: true,
    priceINR: 999,
    priceUSD: 10.5,
    validity: '365 Days',
    features: [
      { label: 'Valid for Classes 5 to 8', detail: 'Access to middle school curriculum' },
      { label: 'Validity 365 Days', detail: 'Enjoy full access for 365 Days' },
      { label: 'Include Basic Package Also', detail: 'All Basic Package features included' },
      { label: '10 Practice Paper for Each Topic', detail: 'Comprehensive practice for every topic' },
      { label: '20 Questions in Each Practice Paper', detail: 'Well-structured papers for effective practice' },
      { label: 'Provided with Hint and Solved Example', detail: 'Learn better with hints and solved examples' },
      { label: 'PDF Download', detail: 'Download papers with your logo and name' },
      { label: 'Subjective and Competitive Type of Questions', detail: 'Covers both subjective and competitive questions' },
      { label: 'Hard, Competency Based and Case Based Level', detail: 'Advanced level questions for in-depth preparation' },
      { label: 'Answer Key with Solution Included', detail: 'Detailed solutions for better understanding' },
      { label: 'Allowed 50 Customize Practice Paper (80 Marks)', detail: 'Create up to 50 papers of 80 marks each' },
      { label: 'All Board Included', detail: 'CBSE, ICSE, State Board & All Other Boards' },
    ],
    active: true,
    courseIds: ['course-class-5', 'course-class-6', 'course-class-7', 'course-class-8'],
    customRequestLimit: 50,
    customRequestMaxMarks: 80,
    sortOrder: 2
  },
  {
    _id: 'teachers',
    name: 'Teachers Package',
    description: 'Smart Tools. Better Teaching. Brighter Results.',
    popular: false,
    priceINR: 1999,
    priceUSD: 21,
    validity: '365 Days',
    features: [
      { label: 'Valid for All Classes 1 to 8', detail: 'Full access to entire platform' },
      { label: 'Validity 365 Days', detail: 'Enjoy full access for 365 Days' },
      { label: 'Include Basic + Pro Package', detail: 'All Basic and Pro features included' },
      { label: 'PDF Download', detail: 'Download papers with your logo and name' },
      { label: 'Allowed 100 Customize Practice Paper', detail: 'Create up to 100 customize papers' },
      { label: 'All Board Included', detail: 'CBSE, ICSE, State Board & All Other Boards' },
    ],
    active: true,
    courseIds: ['course-class-1', 'course-class-2', 'course-class-3', 'course-class-4', 'course-class-5', 'course-class-6', 'course-class-7', 'course-class-8'],
    customRequestLimit: 100,
    customRequestMaxMarks: -1,
    sortOrder: 3
  },
  {
    _id: 'school',
    name: 'School or Institute Package',
    description: 'Complete Solution for Exam Excellence.',
    popular: false,
    priceINR: 9999,
    priceUSD: 105,
    validity: '365 Days',
    features: [
      { label: 'Valid for All Classes 1 to 8', detail: 'Full access to entire platform' },
      { label: 'Validity 365 Days', detail: 'Enjoy full access for 365 Days' },
      { label: 'Include Basic + Pro Package', detail: 'All Basic and Pro features included' },
      { label: 'PDF Download with Branding', detail: 'Download papers with your logo and name' },
      { label: 'Unlimited Customize Practice Paper', detail: 'Create unlimited papers' },
      { label: 'All Board Included', detail: 'CBSE, ICSE, State Board & All Other Boards' },
      { label: 'Priority Support', detail: 'Get faster response & dedicated support' },
    ],
    active: true,
    courseIds: ['course-class-1', 'course-class-2', 'course-class-3', 'course-class-4', 'course-class-5', 'course-class-6', 'course-class-7', 'course-class-8'],
    customRequestLimit: -1,
    customRequestMaxMarks: -1,
    sortOrder: 4
  },
]

async function seedLaunchDemo() {
  // NOTE: Do NOT delete demo courses on restart — this overwrites admin price changes.
  // Only clean up orphaned demo courses that have no valid data.

  // Seed Class 1-8 courses (only if they don't already exist)
  for (let i = 1; i <= 8; i++) {
    const courseId = `course-class-${i}`
    let existing = await models.courses.findOne({ _id: courseId }).lean()
    if (!existing) {
      const courseData = {
        _id: courseId,
        title: `Class ${i}`,
        description: `Complete mathematics curriculum and practice for Class ${i}.`,
        category: 'Mathematics',
        grade: `Class ${i}`,
        difficulty: 'Intermediate',
        price: 999,
        discountPrice: 499,
        instructor: 'Beyond Classroom Experts',
        duration: '1 Year',
        topics: ['Number System', 'Algebra', 'Geometry'],
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
      await models.courses.create(courseData)
      if (db.data.courses) db.data.courses.push(courseData)
    }
  }

  // Add the specific demo class course (only if it doesn't already exist)
  const demoExists = await models.courses.findOne({ _id: 'course-class-6-demo' }).lean()
  if (!demoExists) {
    const demoData = {
      _id: 'course-class-6-demo',
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
    await models.courses.create(demoData)
    if (db.data.courses) db.data.courses.push(demoData)
  }

  // Seed packages only if none exist
  const packageCount = await models.packages.countDocuments()
  if (packageCount === 0) {
    await models.packages.insertMany(staticPackages)
    if (db.data) db.data.packages = staticPackages
  }

  // Seed admin user (only hash when the admin is missing — avoid a cost-12
  // bcrypt on every boot; initDB already ensures the admin exists).
  const adminEmail = 'mistryjenish1003@gmail.com'
  const adminUser = await models.users.findOne({ $or: [{ _id: 'admin-default' }, { email: adminEmail }] }).lean()

  if (adminUser) {
    if (adminUser.role !== 'admin' || adminUser.status !== 'active' || adminUser.email !== adminEmail) {
      await models.users.updateOne({ _id: adminUser._id }, { $set: { email: adminEmail, role: 'admin', status: 'active' } })
    }
  } else {
    const adminHash = await bcrypt.hash('Jenish@1019', 12)
    await models.users.create({
      _id: 'admin-default', name: 'Jenish Mistry', email: adminEmail, password: adminHash,
      role: 'admin', status: 'active', profilePhoto: '', isGuest: false,
      purchasedCourses: [], favorites: [], emailVerified: true, createdAt: new Date().toISOString(),
    })
  }

  console.log('✅ Launch demo data seeded (classes, packages, admin)')
}

module.exports = { seedLaunchDemo }
