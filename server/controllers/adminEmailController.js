const { db } = require('../database/db');

// Get email logs
exports.getEmailLogs = async (req, res) => {
  try {
    await db.read();
    
    if (!db.data.emailLogs) {
      db.data.emailLogs = [
        {
          _id: Date.now().toString() + '1',
          subject: 'Welcome to Beyond Classroom',
          to: 'student@example.com',
          status: 'sent',
          sentAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: Date.now().toString() + '2',
          subject: 'Course Enrollment Confirmation',
          to: 'student2@example.com',
          status: 'sent',
          sentAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          _id: Date.now().toString() + '3',
          subject: 'Password Reset Request',
          to: 'student3@example.com',
          status: 'failed',
          sentAt: new Date(Date.now() - 259200000).toISOString()
        }
      ];
      await db.write();
    }

    res.json({ emails: db.data.emailLogs });
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get email templates
exports.getEmailTemplates = async (req, res) => {
  try {
    const templates = [
      {
        _id: '1',
        name: 'Welcome Email',
        description: 'Sent to new users after registration',
        subject: 'Welcome to Beyond Classroom'
      },
      {
        _id: '2',
        name: 'Course Enrollment',
        description: 'Sent when user enrolls in a course',
        subject: 'Course Enrollment Confirmation'
      },
      {
        _id: '3',
        name: 'Password Reset',
        description: 'Sent when user requests password reset',
        subject: 'Reset Your Password'
      },
      {
        _id: '4',
        name: 'Quiz Results',
        description: 'Sent after completing a quiz',
        subject: 'Your Quiz Results'
      }
    ];

    res.json({ templates });
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
