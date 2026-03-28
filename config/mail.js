const nodemailer = require('nodemailer');

/**
 * Production-ready Nodemailer transporter
 * Optimized for Render + Brevo SMTP
 * Minimal, stable, and avoids IPv6/network issues
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // use TLS (STARTTLS)
  requireTLS: true,
  family: 4, // 🔥 Force IPv4 (critical for Render)
  auth: {
    user: process.env.EMAIL_USER, // Brevo login email
    pass: process.env.EMAIL_PASS, // Brevo API key
  },
});

/**
 * Verify SMTP connection on startup
 */
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service ready (Brevo SMTP)');
  } catch (error) {
    console.error('❌ SMTP connection error:', error);
    console.log('\n📧 Current Config:');
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('Port:', process.env.EMAIL_PORT);
    console.log('User:', process.env.EMAIL_USER ? 'Loaded' : 'Missing');
    console.log('Pass:', process.env.EMAIL_PASS ? 'Loaded' : 'Missing');
  }
};

verifyTransporter();

module.exports = transporter;