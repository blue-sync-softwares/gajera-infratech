const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  createBusiness,
  getAllBusinesses,
  getBusinessBySlug,
  updateBusiness,
  deleteBusiness
} = require('../controllers/businessController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// Validation middleware
const validateBusiness = [
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('business_title')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Business title cannot exceed 150 characters'),
  body('business_overview')
    .optional()
    .trim()
    .isLength({ max: 700 })
    .withMessage('Business overview cannot exceed 700 characters'),
  body('business_description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Business description is required'),
  body('business_tagline')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Business tagline cannot exceed 200 characters'),
  body('ctaTitle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('CTA title cannot exceed 100 characters'),
  body('ctaHref')
    .optional()
    .trim(),
  body('business_gallery')
    .optional()
    .isArray()
    .withMessage('Business gallery must be an array'),
  body('business_gallery.*.image_title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Gallery image title cannot exceed 100 characters'),
  body('business_gallery.*.image_src.url')
    .optional()
    .isURL()
    .withMessage('Gallery image URL must be valid'),
  body('business_gallery.*.image_src.public_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Gallery image public ID is required'),
  body('business_testimonials')
    .optional()
    .isArray()
    .withMessage('Business testimonials must be an array'),
  body('business_testimonials.*')
    .optional()
    .isMongoId()
    .withMessage('Each testimonial must be a valid MongoDB ID'),
  body('project_types')
    .optional()
    .isArray()
    .withMessage('Project types must be an array'),
  body('project_types.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project type cannot be empty'),
  body('project_details')
    .optional()
    .isArray()
    .withMessage('Project details must be an array'),
  body('project_details.*')
    .optional()
    .isMongoId()
    .withMessage('Each project must be a valid MongoDB ID'),
  body('hero_image.url')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Hero image URL must be valid'),
  body('hero_image.public_id')
    .optional({ checkFalsy: true })
    .trim(),
  body('featured_image.url')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Featured image URL must be valid'),
  body('featured_image.public_id')
    .optional({ checkFalsy: true })
    .trim(),
  body('businessStats')
    .optional()
    .isArray()
    .withMessage('Business stats must be an array'),
  body('businessStats.*.uniqueKey')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Stat unique key is required'),
  body('businessStats.*.title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Stat title cannot exceed 100 characters'),
  body('businessStats.*.statValue')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Stat value cannot exceed 50 characters'),
  body('callToActionSection.title')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('CTA section title cannot exceed 150 characters'),
  body('callToActionSection.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('CTA section description cannot exceed 500 characters'),
  body('callToActionSection.buttonTitle')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('CTA button title cannot exceed 50 characters'),
  body('callToActionSection.isActive')
    .optional()
    .isBoolean()
    .withMessage('CTA section isActive must be a boolean'),
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
router.post('/', protect, authorizeAdmin, validateBusiness, createBusiness);
router.get('/', getAllBusinesses);
router.get('/:slug', getBusinessBySlug);
router.put('/:slug', protect, authorizeAdmin, validateBusiness, updateBusiness);
router.delete('/:slug', protect, authorizeAdmin, deleteBusiness);

module.exports = router;
