const express = require('express');
const rateLimit = require('express-rate-limit');
const { submitContactForm } = require('../controllers/contactUsController');
const { validateContactForm, handleValidationErrors } = require('../middleware/validateContact');

const router = express.Router();

/**
 * Rate limiting middleware for contact form
 * Max 5 requests per 15 minutes per IP address
 */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many contact form submissions from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Optional: Skip rate limiting for certain IPs or conditions
    // For development, you can skip rate limiting
    return process.env.NODE_ENV !== 'production' && process.env.SKIP_RATE_LIMIT === 'true';
  },
  keyGenerator: (req) => {
    // Use client IP for rate limiting (handles proxies)
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  },
});

/**
 * POST /api/v1/contact
 * @desc    Submit contact form
 * @access  Public
 * @returns {Object} Success or error response
 */
router.post(
  '/',
  contactLimiter, // Apply rate limiting
  validateContactForm, // Validate input
  handleValidationErrors, // Handle validation errors
  submitContactForm // Process contact form
);

module.exports = router;
