const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

/**
 * Validation rules for contact form
 */
const validateContactForm = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters')
    .matches(/^[a-zA-Z\s'-]*$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[+]?[\d\s\-()]*$/)
    .withMessage('Invalid mobile number format')
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile number must be between 10 and 15 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters long')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
];

/**
 * Middleware to handle validation results
 * Sends formatted error response if validation fails
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));
    
    return errorResponse(
      res,
      422, // Unprocessable Entity
      'Validation failed',
      formattedErrors
    );
  }
  
  next();
};

/**
 * Sanitization middleware for additional security
 */
const sanitizeContactInput = [
  body('name').escape(),
  body('mobile').escape(),
  body('message').escape(),
];

module.exports = {
  validateContactForm,
  handleValidationErrors,
  sanitizeContactInput,
};
