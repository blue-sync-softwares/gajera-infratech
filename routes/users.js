const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require('../controllers/authController');
const { protect, authorizeAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with optional filters
 * @access  Private/Admin
 */
router.get(
  '/',
  protect,
  authorizeAdmin,
  getAllUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get single user by ID
 * @access  Private/Admin
 */
router.get(
  '/:id',
  protect,
  authorizeAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID format')
  ],
  getUserById
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private/Admin
 */
router.put(
  '/:id',
  protect,
  authorizeAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID format'),
    body('name')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('email')
      .optional({ checkFalsy: true })
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('phone')
      .optional({ checkFalsy: true })
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone number must be 10 digits'),
    body('role')
      .optional({ checkFalsy: true })
      .isIn(['user', 'admin'])
      .withMessage('Role must be either user or admin'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('password')
      .optional({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  protect,
  authorizeAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID format')
  ],
  deleteUser
);

/**
 * @route   PATCH /api/v1/users/:id/toggle-status
 * @desc    Toggle user active/inactive status
 * @access  Private/Admin
 */
router.patch(
  '/:id/toggle-status',
  protect,
  authorizeAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID format')
  ],
  toggleUserStatus
);

module.exports = router;
