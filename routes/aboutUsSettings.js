const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  createAboutUsSettings,
  getAboutUsSettings,
  updateAboutUsSettings,
  deleteAboutUsSettings
} = require('../controllers/aboutUsSettingsController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// Validation middleware
const validateAboutUsSettings = [
  body('heroDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Hero description cannot exceed 500 characters'),
  body('missionStatement')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Mission statement cannot exceed 200 characters'),
  body('missionDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Mission description cannot exceed 1000 characters'),
  body('values')
    .optional()
    .isArray()
    .withMessage('Values must be an array'),
  body('values.*.uniqueKey')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Value unique key is required'),
  body('values.*.title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Value title cannot exceed 100 characters'),
  body('values.*.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Value description cannot exceed 500 characters'),
  body('history')
    .optional()
    .isArray()
    .withMessage('History must be an array'),
  body('history.*.year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
    .withMessage('Year must be between 1900 and 10 years in the future'),
  body('history.*.title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('History title cannot exceed 100 characters'),
  body('history.*.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('History description cannot exceed 500 characters'),
  body('companyStatistics')
    .optional()
    .isArray()
    .withMessage('Company statistics must be an array'),
  body('companyStatistics.*.uniqueKey')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Statistic unique key is required'),
  body('companyStatistics.*.title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Statistic title cannot exceed 100 characters'),
  body('companyStatistics.*.statValue')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Statistic value cannot exceed 50 characters'),
  body('leadershipDetails')
    .optional()
    .isArray()
    .withMessage('Leadership details must be an array'),
  body('leadershipDetails.*.uniqueKey')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Leadership unique key is required'),
  body('leadershipDetails.*.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Leader name cannot exceed 100 characters'),
  body('leadershipDetails.*.designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Leader designation cannot exceed 100 characters'),
  body('leadershipDetails.*.profileImage.url')
    .optional()
    .isURL()
    .withMessage('Profile image URL must be valid'),
  body('leadershipDetails.*.profileImage.public_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Profile image public ID is required'),
  body('featuredTestimonial')
    .optional()
    .isMongoId()
    .withMessage('Featured testimonial must be a valid MongoDB ID'),
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
router.post('/', protect, authorizeAdmin, validateAboutUsSettings, createAboutUsSettings);
router.get('/', getAboutUsSettings);
router.put('/', protect, authorizeAdmin, validateAboutUsSettings, updateAboutUsSettings);
router.delete('/', protect, authorizeAdmin, deleteAboutUsSettings);

module.exports = router;
