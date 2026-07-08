const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: 'beyondclassroom247@gmail.com',
    pass: 'cvgp jxor pign ihhd',
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("SMTP Verification Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
  process.exit(0);
});
