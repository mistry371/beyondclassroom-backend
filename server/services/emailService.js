const nodemailer = require('nodemailer');

// Create transporter with Gmail settings
const createTransporter = () => nodemailer.createTransport({
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
  },
  connectionTimeout: 5000,  // 5s to connect
  greetingTimeout: 5000,
  socketTimeout: 8000,      // 8s max per send
});

exports.sendEmail = async ({ to, subject, text, html }) => {
  // Race email send against a 10s timeout so OTP never hangs
  const sendPromise = (async () => {
    try {
      const transporter = createTransporter();
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
      return { success: false, error: error.message };
    }
  })();

  const timeoutPromise = new Promise(resolve =>
    setTimeout(() => {
      console.log('⚠️ Email send timed out — OTP still valid');
      resolve({ success: false, error: 'timeout' });
    }, 10000)
  );

  return Promise.race([sendPromise, timeoutPromise]);
};
