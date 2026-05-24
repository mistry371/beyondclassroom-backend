const nodemailer = require('nodemailer');

// ── Resend via SMTP (works on Render) ────────────────────────────────────────
// Resend provides an SMTP relay that works on all hosting platforms
// Set RESEND_API_KEY in environment variables
// Get free API key at https://resend.com (3000 emails/month free)

const createTransporter = () => {
  // If Resend API key is available, use Resend SMTP
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  // Fallback: Gmail SMTP (works locally)
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || 'beyondclassroom247@gmail.com',
      pass: process.env.EMAIL_PASS || 'ffuz tfxf esbh dhje',
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

// From address — Resend requires verified domain or use onboarding@resend.dev for testing
const getFromAddress = () => {
  if (process.env.RESEND_API_KEY) {
    // Use verified domain if set, otherwise Resend's test address
    return process.env.EMAIL_FROM || 'Beyond Classroom <onboarding@resend.dev>';
  }
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
    }, 20000)
  );

  return Promise.race([sendPromise, timeoutPromise]);
};
