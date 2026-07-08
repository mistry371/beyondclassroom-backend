const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// ── Resend via API (Bypasses Render Port Blocks) ─────────────────────────────
// Get free API key at https://resend.com (3000 emails/month free)

const createTransporter = () => {
  // Fallback: Gmail SMTP (works locally, but Render blocks outbound 465/587 on free tier)

  // Fallback: Gmail SMTP (works locally and on some platforms)
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
      // If Resend API key exists, use Resend SDK (HTTPS port 443 - never blocked)
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
          from: getFromAddress(),
          to,
          subject,
          text: text || '',
          html,
        });

        if (!error && data?.id) {
          console.log('✅ Email sent via Resend API successfully:', data.id);
          return { success: true, messageId: data.id };
        } else {
          console.error('⚠️ Resend failed (falling back to SMTP):', error?.message || 'Unknown Resend Error');
        }
      }

      // Fallback to Nodemailer (Gmail SMTP)
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
      console.log('⚠️ Email send timed out — OTP still valid');
      resolve({ success: false, error: 'timeout' });
    }, 20000)
  );

  return Promise.race([sendPromise, timeoutPromise]);
};
