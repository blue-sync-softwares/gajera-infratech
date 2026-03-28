const transporter = require('../config/mail');

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
      replyTo: mobile, // Optional: allow replying to sender's contact
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw {
      success: false,
      error: 'Failed to send email',
      details: error.message,
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
