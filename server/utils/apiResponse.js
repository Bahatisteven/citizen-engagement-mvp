/**
 * Standardized API response utilities
 * @module utils/apiResponse
 */

/**
 * Standard success response structure
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} [message] - Optional success message
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {Object} Express response
 */
exports.success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standard error response structure
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Object} [details] - Additional error details
 * @returns {Object} Express response
 */
exports.error = (res, message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };

  if (details && process.env.NODE_ENV !== 'production') {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} [message] - Optional success message
 * @returns {Object} Express response
 */
exports.created = (res, data, message = 'Resource created successfully') => {
  return exports.success(res, data, message, 201);
};

/**
 * No content response (204)
 * @param {Object} res - Express response object
 * @returns {Object} Express response
 */
exports.noContent = (res) => {
  return res.status(204).send();
};

/**
 * Bad request response (400)
 * @param {Object} res - Express response object
 * @param {string} [message] - Error message
 * @param {Object} [details] - Additional error details
 * @returns {Object} Express response
 */
exports.badRequest = (res, message = 'Bad request', details = null) => {
  return exports.error(res, message, 400, details);
};

/**
 * Unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} [message] - Error message
 * @returns {Object} Express response
 */
exports.unauthorized = (res, message = 'Unauthorized') => {
  return exports.error(res, message, 401);
};

/**
 * Forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} [message] - Error message
 * @returns {Object} Express response
 */
exports.forbidden = (res, message = 'Access forbidden') => {
  return exports.error(res, message, 403);
};

/**
 * Not found response (404)
 * @param {Object} res - Express response object
 * @param {string} [message] - Error message
 * @returns {Object} Express response
 */
exports.notFound = (res, message = 'Resource not found') => {
  return exports.error(res, message, 404);
};

/**
 * Conflict response (409)
 * @param {Object} res - Express response object
 * @param {string} [message] - Error message
 * @returns {Object} Express response
 */
exports.conflict = (res, message = 'Resource conflict') => {
  return exports.error(res, message, 409);
};

/**
 * Validation error response (422)
 * @param {Object} res - Express response object
 * @param {Array|Object} errors - Validation errors
 * @returns {Object} Express response
 */
exports.validationError = (res, errors) => {
  return res.status(422).json({
    success: false,
    error: 'Validation failed',
    errors,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Internal server error response (500)
 * @param {Object} res - Express response object
 * @param {string} [message] - Error message
 * @param {Error} [error] - Error object (details only shown in development)
 * @returns {Object} Express response
 */
exports.serverError = (res, message = 'Internal server error', error = null) => {
  const details = error && process.env.NODE_ENV !== 'production'
    ? { message: error.message, stack: error.stack }
    : null;

  return exports.error(res, message, 500, details);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination metadata
 * @param {number} pagination.page - Current page
 * @param {number} pagination.limit - Items per page
 * @param {number} pagination.total - Total number of items
 * @param {string} [message] - Optional success message
 * @returns {Object} Express response
 */
exports.paginated = (res, data, pagination, message = 'Success') => {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};
