const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

exports.sendEmail = async ({ to, subject, text, html }) => {
  const sendPromise = (async () => {
    try {
      const transporter = createTransporter();
      const info = await transporter.sendMail({
        from: `"Beyond Classroom" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
      console.log('✅ Email sent via Gmail SMTP:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      return { success: false, error: error.message };
    }
  })();

  const timeoutPromise = new Promise(resolve =>
    setTimeout(() => {
      console.warn('⚠️ Email send timed out after 20s');
      resolve({ success: false, error: 'timeout' });
    }, 20000)
  );

  return Promise.race([sendPromise, timeoutPromise]);
};
