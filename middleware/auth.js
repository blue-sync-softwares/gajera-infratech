const { verifyToken, extractToken } = require('../utils/jwt');
const Auth = require('../models/Auth');
const { errorResponse } = require('../utils/response');

/**
 * Middleware to protect routes - verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    // Extract token from cookie or Authorization header
    const token = extractToken(req, 'token');

    if (!token) {
      return errorResponse(res, 401, 'Not authorized to access this route. Please login');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user by userId from token
    const user = await Auth.findOne({ userId: decoded.userId });

    if (!user) {
      return errorResponse(res, 401, 'User not found. Token invalid');
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse(res, 403, 'Account is deactivated. Please contact support');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, error.message || 'Not authorized to access this route');
  }
};

/**
 * Middleware to check if user is admin
 */
exports.authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, 'Not authorized. Please login first');
  }

  if (req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Access denied. Admin privileges required');
  }

  next();
};
