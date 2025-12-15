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

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search, limit, page = 1 } = req.query;
    
    const query = {};
    
    // Filter by role if provided
    if (role) {
      query.role = role;
    }
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Search by name, email, or userId
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNum = parseInt(page);
    const limitNum = limit ? parseInt(limit) : 0;
    const skip = (pageNum - 1) * limitNum;
    
    let userQuery = Auth.find(query);
    
    if (limitNum > 0) {
      userQuery = userQuery.limit(limitNum).skip(skip);
    }
    
    // Sort by createdAt descending
    userQuery = userQuery.sort({ createdAt: -1 });
    
    const users = await userQuery;
    const total = await Auth.countDocuments(query);
    
    const responseData = {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum || total,
        pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1
      }
    };
    
    return successResponse(res, 200, responseData, 'Users retrieved successfully');
  } catch (error) {
    console.error('Get all users error:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve users');
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await Auth.findById(req.params.id);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    
    return successResponse(res, 200, { user }, 'User retrieved successfully');
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 400, 'Invalid user ID');
    }
    console.error('Get user error:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve user');
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const user = await Auth.findById(req.params.id);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    
    const { name, email, phone, role, isActive, password } = req.body;
    
    // Check if email or phone already exists for another user
    if (email || phone) {
      const existingUser = await Auth.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      });
      
      if (existingUser) {
        const message = existingUser.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered';
        return errorResponse(res, 400, message);
      }
    }
    
    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password !== undefined) user.password = password; // Will be hashed by pre-save hook
    
    await user.save();
    
    return successResponse(res, 200, { user: user.toJSON() }, 'User updated successfully');
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 400, 'Invalid user ID');
    }
    console.error('Update user error:', error);
    return errorResponse(res, 500, error.message || 'Failed to update user');
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await Auth.findById(req.params.id);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    
    // Prevent deleting own account
    if (req.user._id.toString() === req.params.id) {
      return errorResponse(res, 400, 'You cannot delete your own account');
    }
    
    await user.deleteOne();
    
    return successResponse(res, 200, null, 'User deleted successfully');
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 400, 'Invalid user ID');
    }
    console.error('Delete user error:', error);
    return errorResponse(res, 500, error.message || 'Failed to delete user');
  }
};

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/v1/users/:id/toggle-status
 * @access  Private/Admin
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await Auth.findById(req.params.id);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    
    // Prevent disabling own account
    if (req.user._id.toString() === req.params.id) {
      return errorResponse(res, 400, 'You cannot disable your own account');
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    const message = user.isActive ? 'User activated successfully' : 'User deactivated successfully';
    
    return successResponse(res, 200, { user: user.toJSON() }, message);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 400, 'Invalid user ID');
    }
    console.error('Toggle status error:', error);
    return errorResponse(res, 500, error.message || 'Failed to toggle user status');
  }
};
