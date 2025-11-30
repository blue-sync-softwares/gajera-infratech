const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  createProject,
  getAllProjects,
  getProjectBySlug,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// Validation middleware
const validateProject = [
  body('business_name_slug')
    .optional()
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Business slug cannot be empty'),
  body('project_name')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Project name cannot exceed 150 characters'),
  body('project_description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project description is required'),
  body('project_type')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project type is required'),
  body('project_features')
    .optional()
    .isArray()
    .withMessage('Project features must be an array'),
  body('project_features.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Feature cannot be empty'),
  body('project_images')
    .optional()
    .isArray()
    .withMessage('Project images must be an array'),
  body('project_images.*.ranking')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Image ranking must be at least 1'),
  body('project_images.*.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  body('project_images.*.public_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Image public ID is required'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('hero_image.url')
    .optional()
    .isURL()
    .withMessage('Hero image URL must be valid'),
  body('hero_image.public_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Hero image public ID is required'),
  body('project_detail.image.url')
    .optional()
    .isURL()
    .withMessage('Project detail image URL must be valid'),
  body('project_detail.image.public_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project detail image public ID is required'),
  body('project_detail.title')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Project detail title cannot exceed 150 characters'),
  body('project_detail.description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project detail description is required'),
  body('project_document')
    .optional()
    .isArray()
    .withMessage('Project document must be an array'),
  body('project_document.*.image.url')
    .optional()
    .isURL()
    .withMessage('Document image URL must be valid'),
  body('project_document.*.image.public_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Document image public ID is required'),
  body('project_document.*.title')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Document title cannot exceed 150 characters'),
  body('project_document.*.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Document description cannot exceed 500 characters'),
  body('project_document.*.file_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('File name is required'),
  body('project_document.*.file_link.url')
    .optional()
    .isURL()
    .withMessage('File URL must be valid'),
  body('project_document.*.file_link.public_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('File public ID is required'),
  body('project_document.*.button_title')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Button title cannot exceed 50 characters'),
  body('project_document.*.download_message')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Download message cannot exceed 200 characters'),
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
router.post('/', protect, authorizeAdmin, validateProject, createProject);
router.get('/', getAllProjects);
router.get('/:slug', getProjectBySlug);
router.put('/:slug', protect, authorizeAdmin, validateProject, updateProject);
router.delete('/:slug', protect, authorizeAdmin, deleteProject);

module.exports = router;
