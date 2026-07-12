// Professional, consistent email templates for Beyond Classroom.
// All templates render through a single shared layout so every email shares
// the same branding, spacing, and mobile-friendly, email-client-safe markup.

const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://beyondclassroom.netlify.app').replace(/\/$/, '')

const BRAND = {
  name: 'Beyond Classroom',
  tagline: 'Excellence in Mathematics Education',
  primary: '#4f46e5',
  accent: '#7c3aed',
  ink: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  line: '#e5e7eb',
  bg: '#f1f5f9',
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const esc = (v) => String(v == null ? '' : v)

// ── Reusable building blocks ──────────────────────────────────────────────────
const button = (label, href) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
    <tr><td style="border-radius:10px;background:linear-gradient(135deg,${BRAND.primary},${BRAND.accent});">
      <a href="${href}" style="display:inline-block;padding:14px 34px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:10px;">${label}</a>
    </td></tr>
  </table>`

const panel = (html, tone = 'info') => {
  const tones = {
    info: { bg: '#eef2ff', bar: BRAND.primary, text: '#3730a3' },
    success: { bg: '#ecfdf5', bar: '#10b981', text: '#065f46' },
    warning: { bg: '#fffbeb', bar: '#f59e0b', text: '#92400e' },
    danger: { bg: '#fef2f2', bar: '#ef4444', text: '#991b1b' },
  }
  const t = tones[tone] || tones.info
  return `<div style="background:${t.bg};border-left:4px solid ${t.bar};padding:14px 18px;border-radius:6px;margin:22px 0;">
    <p style="color:${t.text};margin:0;font-size:14px;line-height:1.6;">${html}</p></div>`
}

const rows = (pairs) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0;">
    ${pairs.filter(Boolean).map(([k, v], i, arr) => `
      <tr style="${i < arr.length - 1 ? `border-bottom:1px solid ${BRAND.line};` : ''}">
        <td style="padding:11px 0;color:${BRAND.muted};font-size:14px;">${k}</td>
        <td style="padding:11px 0;color:${BRAND.ink};font-size:14px;font-weight:600;text-align:right;">${v}</td>
      </tr>`).join('')}
  </table>`

const h2 = (text) => `<h2 style="color:${BRAND.ink};margin:0 0 16px 0;font-size:22px;font-weight:700;">${text}</h2>`
const p = (text) => `<p style="color:${BRAND.body};font-size:15px;line-height:1.65;margin:0 0 16px 0;">${text}</p>`
const hero = (value, caption, tone = BRAND.primary) => `
  <div style="text-align:center;background:${BRAND.bg};border-radius:12px;padding:28px;margin:24px 0;">
    <div style="font-size:40px;font-weight:800;color:${tone};line-height:1;">${value}</div>
    <div style="color:${BRAND.muted};font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-top:8px;">${caption}</div>
  </div>`

// ── Shared layout ─────────────────────────────────────────────────────────────
const renderEmail = ({ title, preheader = '', body }) => `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:${BRAND.font};">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,${BRAND.primary},${BRAND.accent});padding:32px 24px;text-align:center;">
          <div style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">${BRAND.name}</div>
          <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:4px;">${BRAND.tagline}</div>
        </td></tr>
        <tr><td style="padding:36px 32px;">${body}</td></tr>
        <tr><td style="background:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid ${BRAND.line};">
          <div style="margin-bottom:12px;">
            <a href="${FRONTEND_URL}" style="color:${BRAND.muted};text-decoration:none;font-size:13px;margin:0 10px;">Home</a>
            <a href="${FRONTEND_URL}/courses" style="color:${BRAND.muted};text-decoration:none;font-size:13px;margin:0 10px;">Courses</a>
            <a href="${FRONTEND_URL}/contact" style="color:${BRAND.muted};text-decoration:none;font-size:13px;margin:0 10px;">Contact</a>
          </div>
          <p style="color:#94a3b8;margin:0;font-size:12px;line-height:1.6;">© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.<br>You received this email because you have an account with us.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

// ══════════════════════════════════════════════════════════════════════════════
// Templates (signatures preserved for backward compatibility)
// ══════════════════════════════════════════════════════════════════════════════

exports.otpEmailTemplate = (otpCode, purpose, expiresIn = '10 minutes') => {
  const label = { registration: 'Registration', login: 'Login', password_reset: 'Password Reset' }[purpose] || 'Verification'
  return renderEmail({
    title: `Your ${label} Code`,
    preheader: `${otpCode} is your ${label.toLowerCase()} code. It expires in ${expiresIn}.`,
    body: `${h2(`${label} code`)}
      ${p('Use the one-time code below to continue. For your security, never share it with anyone.')}
      <div style="text-align:center;background:${BRAND.bg};border-radius:12px;padding:24px;margin:24px 0;">
        <div style="font-size:40px;font-weight:800;letter-spacing:10px;color:${BRAND.primary};">${otpCode}</div>
      </div>
      ${panel(`This code expires in <strong>${expiresIn}</strong>. Our team will never ask you for it.`, 'warning')}
      ${p('If you didn\'t request this, you can safely ignore this email.')}`,
  })
}

exports.welcomeEmailTemplate = (userName, userEmail) => renderEmail({
  title: 'Welcome to Beyond Classroom',
  preheader: 'Your account is ready — start learning today.',
  body: `${h2(`Welcome, ${esc(userName)}!`)}
    ${p('Your account is ready. Beyond Classroom gives you structured courses, interactive tools, and progress tracking to help you master mathematics.')}
    ${rows([['Email', esc(userEmail)], ['Joined', new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })]])}
    ${button('Go to Dashboard', `${FRONTEND_URL}/dashboard`)}
    ${p(`Not sure where to begin? <a href="${FRONTEND_URL}/courses" style="color:${BRAND.primary};text-decoration:none;">Browse our courses</a> to find the right fit.`)}`,
})

exports.courseEnrollmentEmailTemplate = (userName, courseName, coursePrice) => renderEmail({
  title: 'Enrollment Confirmed',
  preheader: `You're enrolled in ${courseName}.`,
  body: `${h2('Enrollment confirmed')}
    ${p(`Congratulations, ${esc(userName)} — you now have access to:`)}
    ${hero(esc(courseName), `₹${esc(coursePrice)}`)}
    ${p('Your enrollment includes full course content, practice exercises, quizzes, and a certificate on completion.')}
    ${button('Start Learning', `${FRONTEND_URL}/dashboard`)}`,
})

exports.courseExpiryReminderEmailTemplate = (userName, courseName, daysRemaining) => renderEmail({
  title: 'Course Access Expiring Soon',
  preheader: `${courseName} access ends in ${daysRemaining} days.`,
  body: `${h2('Your access is expiring soon')}
    ${p(`Hi ${esc(userName)}, your access to <strong>${esc(courseName)}</strong> ends in <strong>${esc(daysRemaining)} days</strong>.`)}
    ${panel('Finish your remaining lessons before access expires to make the most of your enrollment.', 'warning')}
    ${button('Continue Learning', `${FRONTEND_URL}/dashboard`)}`,
})

exports.passwordResetEmailTemplate = (userName, resetLink) => renderEmail({
  title: 'Reset Your Password',
  preheader: 'Reset your Beyond Classroom password. Link valid for 1 hour.',
  body: `${h2('Password reset request')}
    ${p(`Hi ${esc(userName)}, we received a request to reset your password. Click below to choose a new one.`)}
    ${button('Reset Password', resetLink)}
    ${panel('This link expires in <strong>1 hour</strong>. If you didn\'t request it, no action is needed.', 'warning')}`,
})

exports.adminNewUserEmailTemplate = (userName, userEmail, registeredAt) => renderEmail({
  title: 'New User Registered',
  preheader: `${userName} just registered.`,
  body: `${h2('New user registered')}
    ${rows([['Name', esc(userName)], ['Email', esc(userEmail)], ['Registered', esc(registeredAt)]])}
    ${button('View in Admin Panel', `${FRONTEND_URL}/admin/users`)}`,
})

exports.adminNewOrderEmailTemplate = (userName, userEmail, courseName, amount, orderId) => renderEmail({
  title: 'New Order Received',
  preheader: `${userName} purchased ${courseName} — ₹${amount}.`,
  body: `${h2('New order received')}
    ${rows([['Student', esc(userName)], ['Email', esc(userEmail)], ['Item', esc(courseName)], ['Amount', `₹${esc(amount)}`], ['Order ID', `<span style="font-size:12px;color:${BRAND.muted}">${esc(orderId)}</span>`]])}
    ${button('View Orders', `${FRONTEND_URL}/admin/orders`)}`,
})

exports.adminCustomRequestEmailTemplate = (userName, userEmail, title, deliverable, topics, budget) => renderEmail({
  title: 'New Custom Course Request',
  preheader: `${userName} submitted a custom request.`,
  body: `${h2('New custom course request')}
    ${rows([
      ['Student', esc(userName)], ['Email', esc(userEmail)], ['Title', esc(title)],
      ['Deliverable', esc(deliverable) || 'Not specified'], ['Topics', esc(topics) || 'Not specified'],
      ['Budget', budget ? `₹${esc(budget)}` : 'Not specified'],
    ])}
    ${button('Review Request', `${FRONTEND_URL}/admin/custom-requests`)}`,
})

exports.studentCustomRequestQuotedTemplate = (userName, title, quotedPrice, adminNote) => renderEmail({
  title: 'Your Request Has Been Quoted',
  preheader: `${title} has been quoted at ₹${quotedPrice}.`,
  body: `${h2('Your request has been quoted')}
    ${p(`Hi ${esc(userName)}, your custom request <strong>“${esc(title)}”</strong> has been reviewed.`)}
    ${hero(`₹${esc(quotedPrice)}`, 'Quoted price')}
    ${adminNote ? panel(`<strong>Note:</strong> ${esc(adminNote)}`, 'info') : ''}
    ${button('View & Accept', `${FRONTEND_URL}/dashboard/custom-requests`)}`,
})

exports.studentCustomRequestStatusTemplate = (userName, title, status, message) => {
  const cfg = {
    reviewing: { tone: 'warning', label: 'Under Review' },
    accepted: { tone: 'success', label: 'Accepted' },
    rejected: { tone: 'danger', label: 'Not Fulfilled' },
    completed: { tone: 'success', label: 'Completed' },
  }[status] || { tone: 'info', label: status }
  return renderEmail({
    title: `Request ${cfg.label}`,
    preheader: `Your request “${title}” is now ${cfg.label}.`,
    body: `${h2(`Request ${cfg.label}`)}
      ${p(`Hi ${esc(userName)}, the status of your request <strong>“${esc(title)}”</strong> is now <strong>${cfg.label}</strong>.`)}
      ${message ? panel(esc(message), cfg.tone) : ''}
      ${button('View Request', `${FRONTEND_URL}/dashboard/custom-requests`)}`,
  })
}

exports.quizResultsEmailTemplate = (userName, quizTitle, score, totalQuestions, percentage, passed) => renderEmail({
  title: 'Quiz Results',
  preheader: `You scored ${percentage}% on ${quizTitle}.`,
  body: `${h2('Your quiz results')}
    ${p(`Hi ${esc(userName)}, here are your results for <strong>${esc(quizTitle)}</strong>:`)}
    ${hero(`${esc(percentage)}%`, `${esc(score)} / ${esc(totalQuestions)} correct`, passed ? '#10b981' : '#ef4444')}
    ${panel(passed ? '🎉 You passed — great work!' : 'Keep practicing — you\'ll get there.', passed ? 'success' : 'warning')}
    ${button('Go to Dashboard', `${FRONTEND_URL}/dashboard`)}`,
})

exports.accountActionEmailTemplate = (userName, action, details) => {
  const cfg = {
    suspended: { tone: 'danger', title: 'Account Suspended' },
    unsuspended: { tone: 'success', title: 'Account Restored' },
    warning: { tone: 'warning', title: 'Account Warning' },
  }[action] || { tone: 'info', title: 'Account Update' }
  return renderEmail({
    title: cfg.title,
    preheader: cfg.title,
    body: `${h2(cfg.title)}
      ${p(`Hi ${esc(userName)},`)}
      ${panel(esc(details), cfg.tone)}
      ${p('If you have any questions, please contact our support team.')}
      ${button('Contact Support', `${FRONTEND_URL}/contact`)}`,
  })
}

exports.paymentReceiptEmailTemplate = (userName, courseName, amount, orderId, paymentDate) => renderEmail({
  title: 'Payment Receipt',
  preheader: `Receipt for ${courseName} — ₹${amount}.`,
  body: `${h2('Payment receipt')}
    ${p(`Hi ${esc(userName)}, thank you for your purchase. Here's your receipt:`)}
    ${rows([['Item', esc(courseName)], ['Order ID', `<span style="font-size:12px;color:${BRAND.muted}">${esc(orderId)}</span>`], ['Date', esc(paymentDate)], ['Total Paid', `<span style="color:#10b981;font-size:18px;font-weight:700;">₹${esc(amount)}</span>`]])}
    ${button('Start Learning', `${FRONTEND_URL}/dashboard`)}`,
})

// ── Promoter communications (new) ─────────────────────────────────────────────
exports.promoterWithdrawalRequestedTemplate = (promoterName, amount, balanceAfter) => renderEmail({
  title: 'Withdrawal Request Received',
  preheader: `Your withdrawal request for ₹${amount} has been received.`,
  body: `${h2('Withdrawal request received')}
    ${p(`Hi ${esc(promoterName)}, we've received your withdrawal request.`)}
    ${hero(`₹${esc(amount)}`, 'Requested amount')}
    ${panel('Your withdrawal request has been submitted successfully. The amount will be credited to your registered bank account within 24 hours after verification.', 'success')}
    ${rows([['Remaining balance', `₹${esc(balanceAfter)}`]])}
    ${button('View Dashboard', `${FRONTEND_URL}/promoter/dashboard`)}`,
})

exports.promoterWithdrawalProcessedTemplate = (promoterName, amount, status, note) => {
  const paid = status === 'paid' || status === 'approved'
  return renderEmail({
    title: paid ? 'Withdrawal Paid' : 'Withdrawal Update',
    preheader: paid ? `₹${amount} has been paid to your account.` : `Update on your ₹${amount} withdrawal.`,
    body: `${h2(paid ? 'Withdrawal paid' : 'Withdrawal update')}
      ${p(`Hi ${esc(promoterName)},`)}
      ${hero(`₹${esc(amount)}`, paid ? 'Paid to your account' : 'Withdrawal amount', paid ? '#10b981' : '#ef4444')}
      ${paid
        ? panel('This amount has been credited to your registered bank account. Please allow a short time for it to reflect.', 'success')
        : panel(`Your withdrawal could not be processed and the amount has been returned to your balance.${note ? ` Reason: ${esc(note)}` : ''}`, 'danger')}
      ${button('View Dashboard', `${FRONTEND_URL}/promoter/dashboard`)}`,
  })
}

exports.promoterKycStatusTemplate = (promoterName, status, reason) => {
  const verified = status === 'verified'
  return renderEmail({
    title: verified ? 'KYC Verified' : 'KYC Update',
    preheader: verified ? 'Your KYC has been verified.' : 'Your KYC needs attention.',
    body: `${h2(verified ? 'KYC verified' : 'KYC could not be verified')}
      ${p(`Hi ${esc(promoterName)},`)}
      ${verified
        ? panel('Your KYC documents have been verified. Your withdrawals can now be processed without delay.', 'success')
        : panel(`We couldn't verify your KYC documents.${reason ? ` Reason: ${esc(reason)}` : ''} Please re-upload clear, valid documents from your dashboard.`, 'danger')}
      ${button('Open Dashboard', `${FRONTEND_URL}/promoter/dashboard`)}`,
  })
}

exports.promoterCommissionEarnedTemplate = (promoterName, commission, studentName, balance) => renderEmail({
  title: 'You Earned a Commission',
  preheader: `You earned ₹${commission} in commission.`,
  body: `${h2('You earned a commission!')}
    ${p(`Hi ${esc(promoterName)}, a student purchased using your promo code.`)}
    ${hero(`₹${esc(commission)}`, 'Commission earned', '#10b981')}
    ${rows([studentName ? ['Student', esc(studentName)] : null, ['Available balance', `₹${esc(balance)}`]])}
    ${button('View Earnings', `${FRONTEND_URL}/promoter/dashboard`)}`,
})

module.exports = {
  otpEmailTemplate: exports.otpEmailTemplate,
  welcomeEmailTemplate: exports.welcomeEmailTemplate,
  courseEnrollmentEmailTemplate: exports.courseEnrollmentEmailTemplate,
  courseExpiryReminderEmailTemplate: exports.courseExpiryReminderEmailTemplate,
  passwordResetEmailTemplate: exports.passwordResetEmailTemplate,
  adminNewUserEmailTemplate: exports.adminNewUserEmailTemplate,
  adminNewOrderEmailTemplate: exports.adminNewOrderEmailTemplate,
  adminCustomRequestEmailTemplate: exports.adminCustomRequestEmailTemplate,
  studentCustomRequestQuotedTemplate: exports.studentCustomRequestQuotedTemplate,
  studentCustomRequestStatusTemplate: exports.studentCustomRequestStatusTemplate,
  quizResultsEmailTemplate: exports.quizResultsEmailTemplate,
  accountActionEmailTemplate: exports.accountActionEmailTemplate,
  paymentReceiptEmailTemplate: exports.paymentReceiptEmailTemplate,
  // New promoter communications
  promoterWithdrawalRequestedTemplate: exports.promoterWithdrawalRequestedTemplate,
  promoterWithdrawalProcessedTemplate: exports.promoterWithdrawalProcessedTemplate,
  promoterKycStatusTemplate: exports.promoterKycStatusTemplate,
  promoterCommissionEarnedTemplate: exports.promoterCommissionEarnedTemplate,
}
