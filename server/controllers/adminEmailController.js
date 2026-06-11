const { db, models } = require('../database/db');

// Get email logs
exports.getEmailLogs = async (req, res) => {
  try {
    let logs = await models.emailLogs.find().lean()
    
    if (!logs || logs.length === 0) {
      const defaultLogs = [
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
      await models.emailLogs.insertMany(defaultLogs)
      if (db.data.emailLogs) db.data.emailLogs.push(...defaultLogs)
      logs = defaultLogs
    }

    res.json({ emails: logs });
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get email templates
exports.getEmailTemplates = async (req, res) => {
  try {
    const templates = [
      { _id: '1', name: 'OTP Verification',         description: 'Sent for login, registration, and password reset OTPs', subject: 'Your OTP - Beyond Classroom' },
      { _id: '2', name: 'Welcome Email',             description: 'Sent to new users after registration',                   subject: 'Welcome to Beyond Classroom! 🎉' },
      { _id: '3', name: 'Course Enrollment',         description: 'Sent when a user enrolls in a course',                  subject: 'Enrollment Confirmed' },
      { _id: '4', name: 'Course Expiry Reminder',    description: 'Sent when course access is about to expire',            subject: 'Course Access Expiring Soon' },
      { _id: '5', name: 'Password Reset',            description: 'Sent when user requests a password reset',              subject: 'Password Reset Request' },
      { _id: '6', name: 'Admin: New User',           description: 'Notifies admin when a new user registers',              subject: 'New User Registered' },
      { _id: '7', name: 'Admin: New Order',          description: 'Notifies admin when a new order is placed',             subject: 'New Order Received' },
      { _id: '8', name: 'Admin: Custom Request',     description: 'Notifies admin of a new custom course request',         subject: 'New Custom Course Request' },
      { _id: '9', name: 'Custom Request Quoted',     description: 'Sent to student when their request is quoted',          subject: 'Your Custom Request Has Been Quoted' },
      { _id: '10', name: 'Custom Request Status',    description: 'Sent to student when request status changes',           subject: 'Custom Course Request Update' },
      { _id: '11', name: 'Quiz Results',             description: 'Sent to student after completing a quiz',               subject: 'Your Quiz Results' },
      { _id: '12', name: 'Account Action',           description: 'Sent when account is suspended, restored, or warned',   subject: 'Account Update' },
      { _id: '13', name: 'Payment Receipt',          description: 'Sent to student after successful payment',              subject: 'Payment Receipt - Beyond Classroom' },
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

    // Build HTML from the real template matching templateId
    const {
      welcomeEmailTemplate,
      otpEmailTemplate,
      courseEnrollmentEmailTemplate,
      courseExpiryReminderEmailTemplate,
      passwordResetEmailTemplate,
      quizResultsEmailTemplate,
      accountActionEmailTemplate,
      paymentReceiptEmailTemplate,
      adminCustomRequestEmailTemplate,
      studentCustomRequestQuotedTemplate,
      studentCustomRequestStatusTemplate,
    } = require('../services/emailTemplates');

    const templateMap = {
      '1':  () => otpEmailTemplate('123456', 'login', '10 minutes'),
      '2':  () => welcomeEmailTemplate('Test User', to),
      '3':  () => courseEnrollmentEmailTemplate('Test User', 'Sample Course', '999'),
      '4':  () => courseExpiryReminderEmailTemplate('Test User', 'Sample Course', 7),
      '5':  () => passwordResetEmailTemplate('Test User', 'https://beyondclassroom.netlify.app/auth/forgot-password'),
      '6':  () => require('../services/emailTemplates').adminNewUserEmailTemplate('Test User', to, new Date().toLocaleString('en-IN')),
      '7':  () => require('../services/emailTemplates').adminNewOrderEmailTemplate('Test User', to, 'Sample Course', 999, 'ORD-TEST-001'),
      '8':  () => adminCustomRequestEmailTemplate('Test User', to, 'Sample Request', 'Notes', 'Mathematics, French', '500'),
      '9':  () => studentCustomRequestQuotedTemplate('Test User', 'Sample Request', '1500', 'Looks good!'),
      '10': () => studentCustomRequestStatusTemplate('Test User', 'Sample Request', 'accepted', 'Your request has been accepted!'),
      '11': () => quizResultsEmailTemplate('Test User', 'Mathematics Quiz', 8, 10, 80, true),
      '12': () => accountActionEmailTemplate('Test User', 'warning', 'Please review our community guidelines.'),
      '13': () => paymentReceiptEmailTemplate('Test User', 'Sample Course', 999, 'ORD-TEST-001', new Date().toLocaleDateString('en-IN')),
    };

    const htmlFn = templateMap[templateId];
    const html = htmlFn ? htmlFn() : `<p>Test email for template ID: ${templateId}</p>`;

    let status = 'sent';
    try {
      const { sendEmail: sendEmailService } = require('../services/emailService');
      await sendEmailService({ to, subject, html });
    } catch (e) {
      status = 'failed';
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
    
    await models.emailLogs.create(log)
    if (db.data.emailLogs) db.data.emailLogs.push(log);

    res.json({ success: true, message: status === 'sent' ? 'Email sent successfully' : 'Email failed to send', log });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
