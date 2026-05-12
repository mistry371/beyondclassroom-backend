const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')
const path = require('path')
const bcrypt = require('bcryptjs')

// Initialize database
const file = path.join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter, {})

// Initialize default data
async function initDB() {
  await db.read()
  db.data = db.data || {}

  // Ensure all collections exist (empty by default)
  db.data.users              = db.data.users              || []
  db.data.courses            = db.data.courses            || []
  db.data.cart               = db.data.cart               || []
  db.data.orders             = db.data.orders             || []
  db.data.notifications      = db.data.notifications      || []
  db.data.modules            = db.data.modules            || []
  db.data.lessons            = db.data.lessons            || []
  db.data.subtopics          = db.data.subtopics          || []
  db.data.exams              = db.data.exams              || []
  db.data.examAttempts       = db.data.examAttempts       || []
  db.data.practices          = db.data.practices          || []
  db.data.quizzes            = db.data.quizzes            || []
  db.data.progress           = db.data.progress           || []
  db.data.otps               = db.data.otps               || []
  db.data.activityLogs       = db.data.activityLogs       || []
  db.data.announcements      = db.data.announcements      || []
  db.data.media              = db.data.media              || []
  db.data.liveClasses        = db.data.liveClasses        || []
  db.data.certificates       = db.data.certificates       || []
  db.data.badges             = db.data.badges             || []
  db.data.blockedIPs         = db.data.blockedIPs         || []
  db.data.content            = db.data.content            || {}
  db.data.siteContent        = db.data.siteContent        || null
  db.data.emailLogs          = db.data.emailLogs          || []
  db.data.adminNotifications = db.data.adminNotifications || []

  // Default platform settings (only set once)
  if (!db.data.settings || db.data.settings.length === 0) {
    db.data.settings = [
      { _id: '1',  key: 'site_name',        value: 'Beyond Classroom',                       type: 'string',  category: 'general', displayName: 'Site Name',          description: 'The name of your platform',          isPublic: true  },
      { _id: '2',  key: 'site_description', value: 'Advanced Mathematics Learning Platform', type: 'string',  category: 'general', displayName: 'Site Description',   description: 'Brief description of your platform', isPublic: true  },
      { _id: '3',  key: 'contact_email',    value: 'admin@beyondclassroom.com',               type: 'string',  category: 'general', displayName: 'Contact Email',      description: 'Primary contact email',              isPublic: true  },
      { _id: '4',  key: 'allow_registration', value: 'true',                                 type: 'boolean', category: 'general', displayName: 'Allow Registration', description: 'Allow new user registrations',       isPublic: false },
      { _id: '5',  key: 'maintenance_mode', value: 'false',                                  type: 'boolean', category: 'general', displayName: 'Maintenance Mode',   description: 'Put site in maintenance mode',       isPublic: false },
      { _id: '6',  key: 'smtp_host',        value: '',                                       type: 'string',  category: 'email',   displayName: 'SMTP Host',          description: 'Email server hostname',              isPublic: false },
      { _id: '7',  key: 'smtp_port',        value: '587',                                    type: 'number',  category: 'email',   displayName: 'SMTP Port',          description: 'Email server port',                  isPublic: false },
      { _id: '8',  key: 'smtp_user',        value: '',                                       type: 'string',  category: 'email',   displayName: 'SMTP Username',      description: 'Email server username',              isPublic: false },
      { _id: '9',  key: 'enable_tools',     value: 'true',                                   type: 'boolean', category: 'features', displayName: 'Enable Math Tools', description: 'Show math tools section',            isPublic: false },
      { _id: '10', key: 'enable_quizzes',   value: 'true',                                   type: 'boolean', category: 'features', displayName: 'Enable Quizzes',   description: 'Allow quiz functionality',           isPublic: false },
      { _id: '11', key: 'primary_color',    value: '#6366f1',                                type: 'color',   category: 'theme',   displayName: 'Primary Color',      description: 'Main brand color',                   isPublic: true  },
      { _id: '12', key: 'secondary_color',  value: '#8b5cf6',                                type: 'color',   category: 'theme',   displayName: 'Secondary Color',    description: 'Secondary brand color',              isPublic: true  },
    ]
  }

  // ── Admin user — create only if missing, never overwrite password ────────
  const adminEmail = 'mistryjenish1003@gmail.com'

  // Remove any duplicate admin accounts with the same email
  db.data.users = db.data.users.filter(u => !(u.email === adminEmail && u._id !== 'admin-default'))

  const adminIdx = db.data.users.findIndex(u => u._id === 'admin-default')
  if (adminIdx >= 0) {
    // Keep existing password — only ensure role/email are correct
    db.data.users[adminIdx].email = adminEmail
    db.data.users[adminIdx].role  = 'admin'
  } else {
    const hashedPassword = await bcrypt.hash('Jenish@1019', 12)
    db.data.users.push({
      _id:              'admin-default',
      name:             'Jenish Mistry',
      email:            adminEmail,
      password:         hashedPassword,
      role:             'admin',
      status:           'active',
      profilePhoto:     '',
      isGuest:          false,
      purchasedCourses: [],
      favorites:        [],
      emailVerified:    true,
      createdAt:        new Date(),
    })
  }
  console.log('✅ Admin user ready:', adminEmail)

  await db.write()
  return db
}

module.exports = { db, initDB }
