const { validationResult } = require('express-validator');
const Auth = require('../models/Auth');
const { generateTokenAndSetCookie, clearTokenCookie } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Register a new user (Admin only)
 * @route   POST /api/v1/auth/register
 * @access  Private/Admin
 */
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await Auth.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      const message = existingUser.email === email 
        ? 'Email already registered' 
        : 'Phone number already registered';
      return errorResponse(res, 400, message);
    }

    // Create new user
    const user = await Auth.create({
      name,
      email,
      phone,
      password,
      role: role || 'user', // Default to 'user' if not specified
    });

    return successResponse(res, 201, { user: user.toJSON() }, 'User registered successfully');
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 500, error.message || 'Registration failed');
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const { userId, password } = req.body;

    // Find user by userId
    const user = await Auth.findOne({ userId: userId.toUpperCase() }).select('+password');

    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse(res, 403, 'Account is deactivated. Please contact support');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token and set cookie
    const token = generateTokenAndSetCookie(
      res,
      { userId: user.userId, email: user.email },
      'token'
    );

    // Remove password from response
    user.password = undefined;

    return successResponse(res, 200, { user, token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, error.message || 'Login failed');
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = (req, res) => {
  try {
    // Clear token cookie
    clearTokenCookie(res, 'token');

    return successResponse(res, 200, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 500, error.message || 'Logout failed');
  }
};

/**
 * @desc    Check login status
 * @route   GET /api/v1/auth/check-login
 * @access  Public
 */
exports.checkLogin = async (req, res) => {
  try {
    const { extractToken, verifyToken } = require('../utils/jwt');
    
    // Extract token from cookie or Authorization header
    const token = extractToken(req, 'token');

    if (!token) {
      return successResponse(res, 200, { isLoggedIn: false }, 'Not logged in');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user by userId from token
    const user = await Auth.findOne({ userId: decoded.userId });

    if (!user || !user.isActive) {
      return successResponse(res, 200, { isLoggedIn: false }, 'Invalid or inactive session');
    }

    // Return user data along with login status
    return successResponse(res, 200, { 
      isLoggedIn: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 'Session valid');
  } catch (error) {
    // Token verification failed or expired
    return successResponse(res, 200, { isLoggedIn: false }, 'Session expired or invalid');
  }
};
