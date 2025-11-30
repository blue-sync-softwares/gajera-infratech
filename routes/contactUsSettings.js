const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createContactUsSettings,
  getContactUsSettings,
  getFormConfig,
  updateContactUsSettings,
  deleteContactUsSettings,
} = require('../controllers/contactUsSettingsController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// Validation rules
const contactUsSettingsValidation = [
  body('heroDescription')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Hero description is required')
    .isLength({ max: 500 })
    .withMessage('Hero description cannot exceed 500 characters'),

  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('emailMessage')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Email message cannot exceed 300 characters'),

  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),

  body('headOfficeDetails')
    .optional()
    .isArray()
    .withMessage('Head office details must be an array'),

  body('headOfficeDetails.*.uniqueKey')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Office unique key is required'),

  body('headOfficeDetails.*.officeName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Office name is required')
    .isLength({ max: 200 })
    .withMessage('Office name cannot exceed 200 characters'),

  body('headOfficeDetails.*.officeAddress')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Office address is required')
    .isLength({ max: 500 })
    .withMessage('Office address cannot exceed 500 characters'),

  body('headOfficeDetails.*.officeEmail')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Office email is required')
    .isEmail()
    .withMessage('Please provide a valid office email address')
    .normalizeEmail(),

  body('headOfficeDetails.*.officeMobile')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Office mobile is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit mobile number'),

  body('contactUsFormFields.name.enabled')
    .optional()
    .isBoolean()
    .withMessage('Name enabled must be a boolean'),

  body('contactUsFormFields.name.mandatory')
    .optional()
    .isBoolean()
    .withMessage('Name mandatory must be a boolean'),

  body('contactUsFormFields.email.enabled')
    .optional()
    .isBoolean()
    .withMessage('Email enabled must be a boolean'),

  body('contactUsFormFields.email.mandatory')
    .optional()
    .isBoolean()
    .withMessage('Email mandatory must be a boolean'),

  body('contactUsFormFields.phone.enabled')
    .optional()
    .isBoolean()
    .withMessage('Phone enabled must be a boolean'),

  body('contactUsFormFields.phone.mandatory')
    .optional()
    .isBoolean()
    .withMessage('Phone mandatory must be a boolean'),

  body('contactUsFormFields.subject.enabled')
    .optional()
    .isBoolean()
    .withMessage('Subject enabled must be a boolean'),

  body('contactUsFormFields.subject.mandatory')
    .optional()
    .isBoolean()
    .withMessage('Subject mandatory must be a boolean'),

  body('contactUsFormFields.message.enabled')
    .optional()
    .isBoolean()
    .withMessage('Message enabled must be a boolean'),

  body('contactUsFormFields.message.mandatory')
    .optional()
    .isBoolean()
    .withMessage('Message mandatory must be a boolean'),

  body('contactUsFormFields.message.rows')
    .optional()
    .isInt({ min: 3, max: 10 })
    .withMessage('Message rows must be between 3 and 10'),

  body('contactUsFormFields.company.enabled')
    .optional()
    .isBoolean()
    .withMessage('Company enabled must be a boolean'),

  body('contactUsFormFields.company.mandatory')
    .optional()
    .isBoolean()
    .withMessage('Company mandatory must be a boolean'),

  body('googleMapPinLink')
    .optional()
    .trim()
    .matches(/^https:\/\/(www\.)?google\.com\/maps\/.+/i)
    .withMessage('Please provide a valid Google Maps link'),
];

// Create contact us settings (Admin only) - Only works if no settings exist
router.post('/', protect, authorizeAdmin, contactUsSettingsValidation, createContactUsSettings);

// Get contact us settings (Public)
router.get('/', getContactUsSettings);

// Get form configuration (Public) - Returns only enabled fields and mandatory fields list
router.get('/form-config', getFormConfig);

// Update contact us settings (Admin only)
router.put('/', protect, authorizeAdmin, contactUsSettingsValidation, updateContactUsSettings);

// Delete contact us settings (Admin only)
router.delete('/', protect, authorizeAdmin, deleteContactUsSettings);

module.exports = router;
