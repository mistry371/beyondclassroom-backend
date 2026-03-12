const { db, initDB } = require('./database/db')
const bcrypt = require('bcryptjs')

async function seedAdmin() {
  try {
    await initDB()
    await db.read()
    
    // Initialize collections if they don't exist
    db.data.users = db.data.users || []
    db.data.settings = db.data.settings || []
    db.data.activityLogs = db.data.activityLogs || []
    db.data.subscriptions = db.data.subscriptions || []
    
    // Create admin user
    const adminEmail = 'mistryjenish1003@gmail.com'
    const existingAdmin = db.data.users.find(u => u.email === adminEmail)
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('jenish@1019', 12)
      
      const adminUser = {
        _id: 'admin-' + Date.now(),
        name: 'Jenish Mistry',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        profilePhoto: '',
        isGuest: false,
        purchasedCourses: [],
        favorites: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      db.data.users.push(adminUser)
      console.log('✅ Admin user created:', adminEmail)
    } else {
      console.log('ℹ️  Admin user already exists')
    }
    
    // Create dummy user
    const dummyEmail = 'user@example.com'
    const existingDummy = db.data.users.find(u => u.email === dummyEmail)
    
    if (!existingDummy) {
      const hashedPassword = await bcrypt.hash('password123', 12)
      
      const dummyUser = {
        _id: 'user-' + Date.now(),
        name: 'Test User',
        email: dummyEmail,
        password: hashedPassword,
        role: 'user',
        status: 'active',
        profilePhoto: '',
        isGuest: false,
        purchasedCourses: ['test-course-1'],
        favorites: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      db.data.users.push(dummyUser)
      console.log('✅ Dummy user created:', dummyEmail)
    } else {
      console.log('ℹ️  Dummy user already exists')
    }
    
    // Initialize default settings
    const defaultSettings = [
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
        key: 'site_description',
        value: 'Advanced Mathematics Learning Platform',
        type: 'string',
        category: 'general',
        displayName: 'Site Description',
        description: 'Short description of your platform',
        isPublic: true,
        updatedAt: new Date()
      },
      {
        _id: 'setting-3',
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
        _id: 'setting-4',
        key: 'enable_notifications',
        value: 'true',
        type: 'boolean',
        category: 'features',
        displayName: 'Enable Notifications',
        description: 'Enable/disable notification system',
        isPublic: false,
        updatedAt: new Date()
      },
      {
        _id: 'setting-5',
        key: 'enable_ai_tutor',
        value: 'false',
        type: 'boolean',
        category: 'features',
        displayName: 'Enable AI Tutor',
        description: 'Enable/disable AI tutor feature',
        isPublic: false,
        updatedAt: new Date()
      },
      {
        _id: 'setting-6',
        key: 'enable_leaderboard',
        value: 'true',
        type: 'boolean',
        category: 'features',
        displayName: 'Enable Leaderboard',
        description: 'Enable/disable leaderboard feature',
        isPublic: false,
        updatedAt: new Date()
      },
      {
        _id: 'setting-7',
        key: 'email_from',
        value: 'noreply@elitemath.com',
        type: 'string',
        category: 'email',
        displayName: 'Email From Address',
        description: 'Default sender email address',
        isPublic: false,
        updatedAt: new Date()
      },
      {
        _id: 'setting-8',
        key: 'primary_color',
        value: '#22d3ee',
        type: 'string',
        category: 'theme',
        displayName: 'Primary Color',
        description: 'Primary brand color (cyan)',
        isPublic: true,
        updatedAt: new Date()
      },
      {
        _id: 'setting-9',
        key: 'secondary_color',
        value: '#a855f7',
        type: 'string',
        category: 'theme',
        displayName: 'Secondary Color',
        description: 'Secondary brand color (purple)',
        isPublic: true,
        updatedAt: new Date()
      }
    ]
    
    // Add settings if they don't exist
    defaultSettings.forEach(setting => {
      const exists = db.data.settings.find(s => s.key === setting.key)
      if (!exists) {
        db.data.settings.push(setting)
      }
    })
    
    console.log('✅ Default settings initialized')
    
    await db.write()
    
    console.log('\n🎉 Admin seeding completed successfully!')
    console.log('\n📝 Login Credentials:')
    console.log('Admin:')
    console.log('  Email: mistryjenish1003@gmail.com')
    console.log('  Password: jenish@1019')
    console.log('\nDummy User:')
    console.log('  Email: user@example.com')
    console.log('  Password: password123')
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error)
  }
}

seedAdmin()
