const nodemailer = require('nodemailer');

/**
 * Email transporter configuration
 * Creates a reusable SMTP transporter for sending emails
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Connection pool for better performance
  pool: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 2000,
    rateLimit: 5,
  },
  // Socket/connection timeout settings
  socketTimeout: 5000, // 5 seconds
  connectionTimeout: 5000, // 5 seconds
  greetingTimeout: 5000, // 5 seconds
  // TLS configuration
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2',
  },
});

/**
 * Verify transporter configuration on startup (non-blocking)
 * Uses async/await to allow server to start even if email fails
 */
(async () => {
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 8000);
      
      transporter.verify((error, success) => {
        clearTimeout(timeout);
        if (error) reject(error);
        else resolve(success);
      });
    });
    
    console.log('✅ Email service is ready to send messages');
  } catch (error) {
    console.warn('⚠️  Email service warning:', error.message);
    console.log('\n📝 Email Troubleshooting:');
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('Port:', process.env.EMAIL_PORT);
    console.log('Secure:', process.env.EMAIL_SECURE);
    console.log('\n🔧 Try these fixes:');
    console.log('1. Verify credentials in .env are correct');
    console.log('2. For Hostinger: Check if SMTP is enabled for your email account');
    console.log('3. Try port 465 (SSL) or port 587 (TLS)');
    console.log('4. Check firewall isn\'t blocking SMTP ports');
    console.log('\n⚡ Server will continue running. Test the contact form anyway.\n');
  }
})();

module.exports = transporter;
