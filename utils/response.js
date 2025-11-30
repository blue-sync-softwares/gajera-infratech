/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {Object} data - Response data
 * @param {String} message - Success message
 */
exports.successResponse = (res, statusCode = 200, data = null, message = 'Success') => {
  const response = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
};

/**
 * Error response helper
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Object} errors - Validation errors (optional)
 */
exports.errorResponse = (res, statusCode = 500, message = 'Something went wrong', errors = null) => {
  const response = {
    success: false,
    message,
    data: null,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
