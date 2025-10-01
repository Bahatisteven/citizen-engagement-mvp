/**
 * Complaint validation schemas using express-validator
 * @module validators/complaintValidator
 */

const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating a complaint
 */
exports.createComplaintRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Road',
      'Water',
      'Electricity',
      'Health',
      'Sanitation',
      'Leadership',
      'Infrastructure',
      'Environment',
      'PublicServices',
      'Other',
    ])
    .withMessage('Invalid category'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 500 })
    .withMessage('Location must not exceed 500 characters'),

  body('citizen')
    .trim()
    .notEmpty()
    .withMessage('Citizen email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
];

/**
 * Validation rules for getting complaint by ID
 */
exports.getComplaintByIdRules = [
  param('id')
    .notEmpty()
    .withMessage('Complaint ID is required')
    .isMongoId()
    .withMessage('Invalid complaint ID format'),
];

/**
 * Validation rules for listing complaints
 */
exports.listComplaintsRules = [
  query('status')
    .optional()
    .isIn(['Open', 'In Progress', 'Resolved', 'Rejected'])
    .withMessage('Invalid status value'),

  query('category')
    .optional()
    .isIn([
      'Road',
      'Water',
      'Electricity',
      'Health',
      'Sanitation',
      'Leadership',
      'Infrastructure',
      'Environment',
      'PublicServices',
      'Other',
    ])
    .withMessage('Invalid category value'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

/**
 * Validation rules for updating a complaint
 */
exports.updateComplaintRules = [
  param('id')
    .notEmpty()
    .withMessage('Complaint ID is required')
    .isMongoId()
    .withMessage('Invalid complaint ID format'),

  body('status')
    .optional()
    .isIn(['Open', 'In Progress', 'Resolved', 'Rejected'])
    .withMessage('Invalid status value'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Note must not exceed 1000 characters'),

  body('updatedBy')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('UpdatedBy must not exceed 200 characters'),
];

/**
 * Validation rules for adding a response
 */
exports.addResponseRules = [
  param('id')
    .notEmpty()
    .withMessage('Complaint ID is required')
    .isMongoId()
    .withMessage('Invalid complaint ID format'),

  body('text')
    .trim()
    .notEmpty()
    .withMessage('Response text is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Response text must be between 10 and 2000 characters'),

  body('from')
    .trim()
    .notEmpty()
    .withMessage('Responder information is required')
    .isLength({ max: 200 })
    .withMessage('Responder info must not exceed 200 characters'),
];

module.exports = exports;
