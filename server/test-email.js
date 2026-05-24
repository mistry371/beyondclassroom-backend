require('dotenv').config()
const nodemailer = require('nodemailer')

console.log('EMAIL_USER:', process.env.EMAIL_USER)
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ set (' + process.env.EMAIL_PASS.length + ' chars)' : '❌ NOT SET')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
})

transporter.verify((error, success) => {
  if (error) {
    console.log('\n❌ SMTP Connection FAILED:')
    console.log('Error code:', error.code)
    console.log('Error message:', error.message)
    if (error.code === 'EAUTH') {
      console.log('\n👉 Fix: App Password galat hai ya 2FA off hai')
      console.log('   1. myaccount.google.com → Security → 2-Step Verification ON karo')
      console.log('   2. Phir App Passwords → naya password banao')
    }
  } else {
    console.log('\n✅ SMTP Connection SUCCESS — ab test mail bhej raha hoon...')
    transporter.sendMail({
      from: `"Beyond Classroom" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email from MathPlatform',
      text: 'Yeh test email hai. Email service kaam kar rahi hai!'
    }, (err, info) => {
      if (err) {
        console.log('❌ Send failed:', err.message)
      } else {
        console.log('✅ Email sent! Message ID:', info.messageId)
        console.log('👉 Check karo:', process.env.EMAIL_USER, 'inbox')
      }
    })
  }
})
