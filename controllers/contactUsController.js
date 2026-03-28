const { sendContactEmail } = require('../utils/emailService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Handle contact form submission
 * @route   POST /api/v1/contact
 * @access  Public
 * @param   {Object} req - Express request object
 * @param   {string} req.body.name - Sender's name
 * @param   {string} req.body.mobile - Sender's mobile number
 * @param   {string} req.body.message - Contact message
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware
 */
const submitContactForm = async (req, res, next) => {
  try {
    const { name, mobile, message } = req.body;

    // Send email
    const emailResult = await sendContactEmail({
      name,
      mobile,
      message,
    });

    // Return success response
    // Note: We don't store the data, just send email and forget
    successResponse(
      res,
      200,
      {
        timestamp: new Date().toISOString(),
        message: 'Your message has been received and will be reviewed shortly.',
      },
      'Contact form submitted successfully'
    );
  } catch (error) {
    console.error('Contact form submission error:', error);

    // Check if error is from email service
    if (error.success === false) {
      return errorResponse(
        res,
        500,
        error.error || 'Failed to send contact email',
        error.details ? [{ error: error.details }] : undefined
      );
    }

    // Handle other errors
    return errorResponse(
      res,
      500,
      'An error occurred while processing your request'
    );
  }
};

module.exports = {
  submitContactForm,
};
