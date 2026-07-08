require('dotenv').config({ path: __dirname + '/.env' });
const { sendEmail } = require('./services/emailService');

(async () => {
  console.log("Testing email send with Resend...");
  console.log("API KEY:", process.env.RESEND_API_KEY ? "Loaded" : "Missing");
  const result = await sendEmail({
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<p>Test</p>'
  });
  console.log("Result:", result); console.log("Actual Return from Resend:", await new (require('resend').Resend)(process.env.RESEND_API_KEY).emails.send({to:'test@example.com', from:'Beyond Classroom <onboarding@resend.dev>', subject:'test', html:'test'}))
})();
