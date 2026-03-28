const nodemailer = require('nodemailer');
const dns = require('dns');

/**
 * Force IPv4 globally - disable IPv6 DNS lookups
 * This is critical for preventing ENETUNREACH errors
 */
dns.setDefaultResultOrder('ipv4first');

/**
 * Email transporter configuration with Brevo (Sendinblue) SMTP
 * Heavily optimized for browser and production environments
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true' ? true : false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Critical: Force IPv4 only, no IPv6 fallback
  family: 4,
  connectionUrl: undefined,
  // Connection pooling
  pool: {
    maxConnections: 1,
    maxMessages: 50,
    rateDelta: 1000,
    rateLimit: 1,
  },
  // Very extended timeouts for browser requests (can be slow)
  socketTimeout: 45000, // 45 seconds
  connectionTimeout: 45000, // 45 seconds
  greetingTimeout: 15000, // 15 seconds
  // TLS settings
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2',
    servername: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  },
  // Single connection (avoids IPv6 multiplexing issues)
  maxConnections: 1,
  maxMessages: 50,
  maxRetries: 0, // Retries handled at emailService level
});

/**
 * Non-blocking verification on startup
 */
setImmediate(() => {
  transporter.verify((error, success) => {
    if (error) {
      console.warn('⚠️  Email service warning:', error.message);
      console.log('\n📧 Brevo SMTP Configuration:');
      console.log('   Host:', process.env.EMAIL_HOST);
      console.log('   Port:', process.env.EMAIL_PORT);
      console.log('   Protocol: TLS (IPv4-only)');
    } else {
      console.log('✅ Email service ready (Brevo SMTP - IPv4)');
    }
  });
});

module.exports = transporter;