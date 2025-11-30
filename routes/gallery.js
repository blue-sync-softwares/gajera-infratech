const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  createGalleryImage,
  getAllGalleryImages,
  getGalleryImageById,
  updateGalleryImage,
  deleteGalleryImage
} = require('../controllers/galleryController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// Validation middleware
const validateGallery = [
  body('image.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  body('image.public_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Image public ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('tag')
    .optional()
    .trim()
    .toLowerCase()
    .isLength({ max: 50 })
    .withMessage('Tag cannot exceed 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('altText')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Alt text cannot exceed 100 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('width')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Width must be at least 1'),
  body('height')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Height must be at least 1'),
  body('fileSize')
    .optional()
    .isInt({ min: 0 })
    .withMessage('File size cannot be negative'),
  body('format')
    .optional()
    .trim()
    .toUpperCase()
    .isLength({ max: 10 })
    .withMessage('Format cannot exceed 10 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
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
router.post('/', protect, authorizeAdmin, validateGallery, createGalleryImage);
router.get('/', getAllGalleryImages);
router.get('/:id', getGalleryImageById);
router.put('/:id', protect, authorizeAdmin, validateGallery, updateGalleryImage);
router.delete('/:id', protect, authorizeAdmin, deleteGalleryImage);

module.exports = router;
