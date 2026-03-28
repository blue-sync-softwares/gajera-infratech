const axios = require("axios");

/**
 * Retry logic with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 2, initialDelay = 1000) => {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < maxRetries) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`📧 Attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Send contact email via Brevo API (Production-safe)
 */
const sendContactEmail = async (contactData) => {
  try {
    const { name, mobile, message } = contactData;

    const recipientEmail = process.env.EMAIL_TO || process.env.EMAIL_USER;

    // HTML template (same as yours)
    const htmlTemplate = `
      <h2>📩 New Contact Form Submission</h2>
      <p><b>Name:</b> ${escapeHtml(name)}</p>
      <p><b>Mobile:</b> ${escapeHtml(mobile)}</p>
      <p><b>Message:</b><br/>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      <p style="margin-top:20px;font-size:12px;color:#666;">
        Received on: ${new Date().toLocaleString("en-IN")}
      </p>
    `;

    // Plain text fallback
    const textTemplate = `
New Contact Form Submission

Name: ${name}
Mobile: ${mobile}
Message: ${message}

Received on: ${new Date().toLocaleString()}
    `.trim();

    /**
     * Brevo API call
     */
    const response = await retryWithBackoff(async () => {
      return await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            email: process.env.EMAIL_USER,
            name: "Gajera Infratech Contact Form",
          },
          to: [
            {
              email: recipientEmail,
            },
          ],
          subject: `New Contact Form Submission from ${name}`,
          htmlContent: htmlTemplate,
          textContent: textTemplate,
        },
        {
          headers: {
            "api-key": process.env.EMAIL_PASS.trim(), // Brevo API key
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 sec timeout
        }
      );
    }, 3, 2000);

    console.log("✅ Email sent via Brevo API");

    return {
      success: true,
      messageId: response.data?.messageId || null,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Email send error:", error.response?.data || error.message);

    let errorDetails = "Unknown error";

    if (error.response) {
      errorDetails = error.response.data?.message || "Brevo API error";
    } else if (error.code === "ECONNABORTED") {
      errorDetails = "Request timeout";
    }

    throw {
      success: false,
      error: "Failed to send email via Brevo API",
      details: errorDetails,
    };
  }
};

/**
 * Escape HTML to prevent injection
 */
const escapeHtml = (text) => {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

module.exports = {
  sendContactEmail,
};