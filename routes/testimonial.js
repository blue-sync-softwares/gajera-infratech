const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// Validation middleware
const validateTestimonial = [
  body('project_slug')
    .optional()
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Project slug cannot be empty'),
  body('business_slug')
    .optional()
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Business slug cannot be empty'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('image.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  body('image.public_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Image public ID is required when URL is provided'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Routes
router.post('/', protect, authorizeAdmin, validateTestimonial, createTestimonial);
router.get('/', getAllTestimonials);
router.get('/:id', getTestimonialById);
router.put('/:id', protect, authorizeAdmin, validateTestimonial, updateTestimonial);
router.delete('/:id', protect, authorizeAdmin, deleteTestimonial);

module.exports = router;
