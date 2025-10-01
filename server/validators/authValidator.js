/**
 * Authentication validation schemas using express-validator
 * @module validators/authValidator
 */

const { body } = require('express-validator');

/**
 * Password validation regex
 * At least 8 characters, one uppercase, one lowercase, one number
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Validation rules for user registration
 */
exports.registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(passwordRegex)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['citizen', 'pending_institution', 'institution', 'admin'])
    .withMessage('Invalid role'),

  body('category')
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
    .withMessage('Invalid category')
    .custom((value, { req }) => {
      // Category is required for institution roles
      if ((req.body.role === 'institution' || req.body.role === 'pending_institution') && !value) {
        throw new Error('Category is required for institution accounts');
      }
      return true;
    }),
];

/**
 * Validation rules for user login
 */
exports.loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for forgot password
 */
exports.forgotPasswordRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
];

/**
 * Validation rules for reset password
 */
exports.resetPasswordRules = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid reset token format'),

  body('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(passwordRegex)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

/**
 * Validation rules for updating profile
 */
exports.updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
];

module.exports = exports;
