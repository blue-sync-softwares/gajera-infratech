const transporter = require('../config/mail');

/**
 * @desc    Retry logic with exponential backoff
 * @param   {Function} fn - Function to retry
 * @param   {number} maxRetries - Maximum retry attempts
 * @param   {number} initialDelay - Initial delay in ms
 * @returns {Promise<any>} Result from function
 */
const retryWithBackoff = async (fn, maxRetries = 2, initialDelay = 1000) => {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        const delay = initialDelay * Math.pow(2, i); // Exponential backoff
        console.log(`📧 Email send attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

/**
 * @desc    Send contact form email to business owner
 * @param   {Object} contactData - Contact form data
 * @param   {string} contactData.name - Sender's name
 * @param   {string} contactData.mobile - Sender's mobile number
 * @param   {string} contactData.message - Contact message
 * @returns {Promise<Object>} Email send result
 */
const sendContactEmail = async (contactData) => {
  try {
    const { name, mobile, message } = contactData;
    const recipientEmail = process.env.EMAIL_TO || process.env.EMAIL_USER;

    // HTML email template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .field {
            margin-bottom: 25px;
          }
          .label {
            font-weight: 600;
            color: #667eea;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .value {
            color: #333333;
            font-size: 16px;
            line-height: 1.6;
            padding: 12px;
            background-color: #f9f9f9;
            border-left: 3px solid #667eea;
            border-radius: 4px;
            word-break: break-word;
          }
          .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666666;
            border-top: 1px solid #e0e0e0;
          }
          .timestamp {
            color: #999999;
            font-size: 12px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📩 New Contact Form Submission</h1>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label">Sender's Name</div>
              <div class="value">${escapeHtml(name)}</div>
            </div>
            
            <div class="field">
              <div class="label">Mobile Number</div>
              <div class="value">${escapeHtml(mobile)}</div>
            </div>
            
            <div class="field">
              <div class="label">Message</div>
              <div class="value">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">This is an automated email from your website contact form.</p>
            <p class="timestamp">Received on: ${new Date().toLocaleString('en-IN', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZoneName: 'short'
            })}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text fallback
    const textTemplate = `
New Contact Form Submission
============================

Sender's Name: ${name}
Mobile Number: ${mobile}
Message: ${message}

Received on: ${new Date().toLocaleString()}
    `.trim();

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `New Contact Form Submission from ${name}`,
      text: textTemplate,
      html: htmlTemplate,
    };

    // Send email with retry logic and extended timeout
    // Browser requests need more retries due to IPv6 fallback delays
    const info = await retryWithBackoff(async () => {
      return await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email send timeout after 45 seconds')), 45000)
        ),
      ]);
    }, 3, 2000); // 3 retries with 2, 4, 8 second delays = up to 14 seconds retry time
    
    console.log(`✅ Email sent via Brevo. ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    console.error('   Error code:', error.code);
    
    // Specific error messages for Brevo and common issues
    let errorDetails = error.message;
    if (error.message.includes('ENETUNREACH')) {
      errorDetails = 'Network unreachable - connection issue detected';
    } else if (error.message.includes('ENOTFOUND')) {
      errorDetails = 'Cannot resolve Brevo SMTP server DNS';
    } else if (error.message.includes('ECONNREFUSED')) {
      errorDetails = 'Connection refused by Brevo SMTP server';
    } else if (error.message.includes('ETIMEDOUT')) {
      errorDetails = 'Connection timed out - network may be slow';
    } else if (error.message.includes('timeout')) {
      errorDetails = 'SMTP request timed out - Brevo server delayed or unreachable';
    } else if (error.message.includes('Authentication') || error.message.includes('535')) {
      errorDetails = 'Invalid Brevo SMTP credentials - check .env configuration';
    }
    
    throw {
      success: false,
      error: 'Failed to send email via Brevo',
      details: errorDetails,
    };
  }
};

/**
 * @desc    Escape HTML special characters to prevent injection
 * @param   {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

module.exports = {
  sendContactEmail,
};
