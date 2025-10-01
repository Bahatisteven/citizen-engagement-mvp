/**
 * Validation error handling middleware
 * @module middleware/validate
 */

const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');

/**
 * Middleware to handle validation errors from express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return apiResponse.validationError(res, formattedErrors);
  }

  next();
};

module.exports = exports;
