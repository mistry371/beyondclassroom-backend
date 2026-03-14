const nodemailer = require('nodemailer');

// Create transporter with Gmail settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'mistryjenish1003@gmail.com',
    pass: process.env.EMAIL_PASS || 'xhxt sgan geyy dtbi'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

exports.sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"Beyond Classroom" <${process.env.EMAIL_USER || 'mistryjenish1003@gmail.com'}>`,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    // Don't throw error, just log it so OTP can still be shown in console
    return { success: false, error: error.message };
  }
};
