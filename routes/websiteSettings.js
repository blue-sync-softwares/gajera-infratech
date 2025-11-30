const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createSettings,
  getSettings,
  updateSettings,
  deleteSettings,
} = require('../controllers/websiteSettingsController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// Validation rules
const settingsValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Website title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('tagline')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Tagline cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('logo.url')
    .optional()
    .notEmpty()
    .withMessage('Logo URL is required'),
  
  body('logo.public_id')
    .optional()
    .notEmpty()
    .withMessage('Logo public_id is required'),
  
  body('favicon.url')
    .optional(),
  
  body('favicon.public_id')
    .optional(),
  
  body('businessInfo.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ max: 200 })
    .withMessage('Business name cannot exceed 200 characters'),
  
  body('businessInfo.address.street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('businessInfo.address.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('businessInfo.address.state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('businessInfo.address.pincode')
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  
  body('businessInfo.address.country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  body('businessInfo.phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('businessInfo.email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('socialMedia.facebook')
    .optional()
    .trim()
    .matches(/^(https?:\/\/)?(www\.)?facebook\.com\/.+/i)
    .withMessage('Please provide a valid Facebook URL'),
  
  body('socialMedia.instagram')
    .optional()
    .trim()
    .matches(/^(https?:\/\/)?(www\.)?instagram\.com\/.+/i)
    .withMessage('Please provide a valid Instagram URL'),
  
  body('socialMedia.twitter')
    .optional()
    .trim()
    .matches(/^(https?:\/\/)?(www\.)?twitter\.com\/.+/i)
    .withMessage('Please provide a valid Twitter URL'),
  
  body('socialMedia.linkedin')
    .optional()
    .trim()
    .matches(/^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i)
    .withMessage('Please provide a valid LinkedIn URL'),
  
  body('socialMedia.youtube')
    .optional()
    .trim()
    .matches(/^(https?:\/\/)?(www\.)?youtube\.com\/.+/i)
    .withMessage('Please provide a valid YouTube URL'),
  
  body('socialMedia.whatsapp')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit WhatsApp number'),
  
  body('seo.metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title cannot exceed 60 characters'),
  
  body('seo.metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters'),
  
  body('copyright')
    .optional()
    .trim(),
];

// Create website settings (Admin only) - Only works if no settings exist
router.post('/', protect, authorizeAdmin, settingsValidation, createSettings);

// Get website settings (Public)
router.get('/', getSettings);

// Update website settings (Admin only)
router.put('/', protect, authorizeAdmin, settingsValidation, updateSettings);

// Delete website settings (Admin only)
router.delete('/', protect, authorizeAdmin, deleteSettings);

module.exports = router;
