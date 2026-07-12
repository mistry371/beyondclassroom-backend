const nodemailer = require('nodemailer');

// ── Why two transports ────────────────────────────────────────────────────────
// Many cloud hosts (Render free/hobby, etc.) BLOCK outbound SMTP ports (25/465/
// 587). That makes Gmail SMTP silently time out in production even though it works
// locally — the classic "emails work in dev but never arrive in prod" symptom.
// Resend sends over HTTPS (443), which is never blocked, so we prefer it when a
// RESEND_API_KEY is configured and fall back to SMTP otherwise.

const FROM = process.env.EMAIL_FROM || `Beyond Classroom <${process.env.EMAIL_USER || 'onboarding@resend.dev'}>`;

let resendClient = null;
const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const sendViaResend = async ({ to, subject, text, html }) => {
  const resend = getResend();
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, text, html });
  if (error) throw new Error(error.message || 'Resend send failed');
  console.log('✅ Email sent via Resend:', data?.id);
  return { success: true, messageId: data?.id, provider: 'resend' };
};

const sendViaSmtp = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('SMTP not configured (EMAIL_USER/EMAIL_PASS missing)');
  }
  const transporter = createTransporter();
  const info = await transporter.sendMail({ from: FROM, to, subject, text, html });
  console.log('✅ Email sent via Gmail SMTP:', info.messageId);
  return { success: true, messageId: info.messageId, provider: 'smtp' };
};

// Returns { success, messageId?, provider?, error? }. Never throws — but callers
// SHOULD check `success` (do not assume the email was delivered).
exports.sendEmail = async ({ to, subject, text, html }) => {
  const send = async () => {
    try {
      // Prefer Resend when configured; fall back to SMTP if it errors.
      if (getResend()) {
        try {
          return await sendViaResend({ to, subject, text, html });
        } catch (resendErr) {
          console.warn('⚠️ Resend failed, trying SMTP:', resendErr.message);
        }
      }
      return await sendViaSmtp({ to, subject, text, html });
    } catch (error) {
      console.error(`❌ Email send failed to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  };

  const timeout = new Promise((resolve) =>
    setTimeout(() => {
      console.warn(`⚠️ Email send timed out (25s) to ${to}`);
      resolve({ success: false, error: 'timeout' });
    }, 25000)
  );

  return Promise.race([send(), timeout]);
};
