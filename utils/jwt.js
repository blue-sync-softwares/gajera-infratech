const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token (e.g., { userId, email })
 * @param {String} expiresIn - Token expiration time (default from env)
 * @returns {String} - JWT token
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
    });
    return token;
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
};

/**
 * Generate access token (short-lived)
 * @param {Object} payload - Data to encode
 * @returns {String} - Access token
 */
const generateAccessToken = (payload) => {
  return generateToken(payload, '15m'); // 15 minutes
};

/**
 * Generate refresh token (long-lived)
 * @param {Object} payload - Data to encode
 * @returns {String} - Refresh token
 */
const generateRefreshToken = (payload) => {
  return generateToken(payload, '30d'); // 30 days
};

/**
 * Decode token without verification (useful for debugging)
 * @param {String} token - JWT token
 * @returns {Object} - Decoded payload (unverified)
 */
const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    throw new Error(`Token decode failed: ${error.message}`);
  }
};

/**
 * Generate token and set it in cookie
 * @param {Object} res - Express response object
 * @param {Object} payload - Data to encode
 * @param {String} cookieName - Name of the cookie
 * @param {String} expiresIn - Token expiration time
 * @returns {String} - Generated token
 */
const generateTokenAndSetCookie = (res, payload, cookieName = 'token', expiresIn = process.env.JWT_EXPIRE || '7d') => {
  const token = generateToken(payload, expiresIn);
  
  // Parse expiration time to milliseconds
  const getExpirationMs = (exp) => {
    const value = parseInt(exp);
    const unit = exp.slice(-1);
    
    switch (unit) {
      case 'd': return value * 24 * 60 * 60 * 1000; // days
      case 'h': return value * 60 * 60 * 1000; // hours
      case 'm': return value * 60 * 1000; // minutes
      default: return 7 * 24 * 60 * 60 * 1000; // default 7 days
    }
  };

  const cookieOptions = {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: getExpirationMs(expiresIn),
  };

  res.cookie(cookieName, token, cookieOptions);
  
  return token;
};

/**
 * Clear authentication cookie
 * @param {Object} res - Express response object
 * @param {String} cookieName - Name of the cookie to clear
 */
const clearTokenCookie = (res, cookieName = 'token') => {
  res.cookie(cookieName, '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

/**
 * Extract token from request (from cookie or Authorization header)
 * @param {Object} req - Express request object
 * @param {String} cookieName - Name of the cookie
 * @returns {String|null} - Token or null
 */
const extractToken = (req, cookieName = 'token') => {
  let token = null;

  // Check cookie first
  if (req.cookies && req.cookies[cookieName]) {
    token = req.cookies[cookieName];
  }
  // Check Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  return token;
};

module.exports = {
  generateToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  decodeToken,
  generateTokenAndSetCookie,
  clearTokenCookie,
  extractToken,
};
