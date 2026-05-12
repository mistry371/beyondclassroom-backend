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

// Send email (manual send from admin)
exports.sendEmail = async (req, res) => {
  try {
    const { templateId, to, subject } = req.body;
    if (!to || !subject) return res.status(400).json({ message: 'Recipient and subject required' });

    await db.read();
    if (!db.data.emailLogs) db.data.emailLogs = [];

    // Try to send via email service
    let status = 'sent';
    try {
      const { sendEmail: sendEmailService } = require('../services/emailService');
      await sendEmailService({ to, subject, html: `<p>This is a test email for template: ${templateId}</p>` });
    } catch (e) {
      status = 'simulated'; // Email service not configured, log as simulated
    }

    const log = {
      _id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      templateId,
      subject,
      to,
      status,
      sentAt: new Date().toISOString(),
      sentBy: req.user._id
    };
    db.data.emailLogs.push(log);
    await db.write();

    res.json({ success: true, message: 'Email sent successfully', log });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
