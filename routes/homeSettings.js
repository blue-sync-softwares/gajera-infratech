const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createHomeSettings,
  getHomeSettings,
  updateHomeSettings,
  deleteHomeSettings,
} = require('../controllers/homeSettingsController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// Validation rules
const homeSettingsValidation = [
  body('heroTitle')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Hero title is required')
    .isLength({ max: 200 })
    .withMessage('Hero title cannot exceed 200 characters'),

  body('heroDescription')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Hero description is required')
    .isLength({ max: 500 })
    .withMessage('Hero description cannot exceed 500 characters'),

  body('featuredProjects')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Featured projects must be an array'),

  body('featuredProjects.*')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Each featured project must be a valid MongoDB ID'),

  body('featureTitle')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Feature title is required')
    .isLength({ max: 200 })
    .withMessage('Feature title cannot exceed 200 characters'),

  body('featureDescription')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Feature description is required')
    .isLength({ max: 500 })
    .withMessage('Feature description cannot exceed 500 characters'),

  body('features')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Features must be an array')
    .custom((value) => {
      if (value.length > 3) {
        throw new Error('Features array cannot have more than 3 items');
      }
      return true;
    }),

  body('features.*.key')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Feature key is required'),

  body('features.*.title')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Feature title is required')
    .isLength({ max: 100 })
    .withMessage('Feature title cannot exceed 100 characters'),

  body('features.*.description')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Feature description is required')
    .isLength({ max: 300 })
    .withMessage('Feature description cannot exceed 300 characters'),

  body('features.*.image.url')
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage('Feature image URL is required'),

  body('features.*.image.public_id')
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage('Feature image public_id is required'),

  body('legacyTitle')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Legacy title is required')
    .isLength({ max: 200 })
    .withMessage('Legacy title cannot exceed 200 characters'),

  body('legacyDescription')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Legacy description is required')
    .isLength({ max: 1000 })
    .withMessage('Legacy description cannot exceed 1000 characters'),

  body('legacyAwardTitle')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Legacy award title cannot exceed 100 characters'),

  body('legacyAwardYears')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Award years cannot exceed 50 characters'),

  body('topTestimonial')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Top testimonial must be a valid MongoDB ID'),

  body('metrics')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Metrics must be an array')
    .custom((value) => {
      if (value.length > 3) {
        throw new Error('Metrics array cannot have more than 3 items');
      }
      return true;
    }),

  body('metrics.*.key')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Metric key is required'),

  body('metrics.*.title')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Metric title is required')
    .isLength({ max: 100 })
    .withMessage('Metric title cannot exceed 100 characters'),

  body('metrics.*.metricValue')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Metric value is required')
    .isLength({ max: 50 })
    .withMessage('Metric value cannot exceed 50 characters'),
];

// Create home settings (Admin only) - Only works if no settings exist
router.post('/', protect, authorizeAdmin, homeSettingsValidation, createHomeSettings);

// Get home settings (Public)
router.get('/', getHomeSettings);

// Update home settings (Admin only)
router.put('/', protect, authorizeAdmin, homeSettingsValidation, updateHomeSettings);

// Delete home settings (Admin only)
router.delete('/', protect, authorizeAdmin, deleteHomeSettings);

module.exports = router;
