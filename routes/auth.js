const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, logout } = require('../controllers/authController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// Register route (Admin only)
router.post(
  '/register',
  protect,
  authorizeAdmin,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Role must be either user or admin'),
  ],
  register
);

// Login route
router.post(
  '/login',
  [
    body('userId')
      .trim()
      .notEmpty()
      .withMessage('User ID is required')
      .isLength({ min: 5, max: 5 })
      .withMessage('User ID must be 5 characters'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  login
);

// Logout route
router.post('/logout', logout);

module.exports = router;
