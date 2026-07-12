const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use TLS
    auth: {
      user: process.env.EMAIL_USER || 'beyondclassroom247@gmail.com',
      pass: process.env.EMAIL_PASS || 'cvgp jxor pign ihhd',
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

const getFromAddress = () => {
  return `"Beyond Classroom" <${process.env.EMAIL_USER || 'beyondclassroom247@gmail.com'}>`;
};

exports.sendEmail = async ({ to, subject, text, html }) => {
  const sendPromise = (async () => {
    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: getFromAddress(),
        to,
        subject,
        text,
        html,
      };
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent via Gmail SMTP successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      return { success: false, error: error.message };
    }
  })();

  const timeoutPromise = new Promise(resolve =>
    setTimeout(() => {
      console.log('⚠️ Email send timed out');
      resolve({ success: false, error: 'timeout' });
    }, 20000)
  );

  return Promise.race([sendPromise, timeoutPromise]);
};
