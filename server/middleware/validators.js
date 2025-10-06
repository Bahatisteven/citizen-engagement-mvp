const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth validators
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/)
    .withMessage('Password must contain at least one letter, one number, and one special character'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['citizen', 'pending_institution', 'institution', 'admin'])
    .withMessage('Invalid role'),
  body('category')
    .optional()
    .isIn(['Road', 'Water', 'Electricity', 'Health', 'Other'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

exports.validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  handleValidationErrors
];

exports.validateResetPassword = [
  body('token')
    .trim()
    .notEmpty().withMessage('Reset token is required')
    .isLength({ min: 64, max: 64 }).withMessage('Invalid reset token'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/)
    .withMessage('Password must contain at least one letter, one number, and one special character'),
  handleValidationErrors
];

exports.validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  handleValidationErrors
];

// Complaint validators
exports.validateCreateComplaint = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Road', 'Electricity', 'Water', 'Health', 'Sanitation', 'Leadership', 'Infrastructure', 'Environment', 'PublicServices', 'Other'])
    .withMessage('Invalid category'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location must not exceed 200 characters'),
  // Removed 'citizen' validation - it now comes from authenticated JWT token
  handleValidationErrors
];

exports.validateUpdateComplaint = [
  body('status')
    .optional()
    .isIn(['Open', 'In Progress', 'Resolved', 'Rejected'])
    .withMessage('Invalid status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Note must not exceed 500 characters'),
  body('updatedBy')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('UpdatedBy must be between 2 and 100 characters'),
  handleValidationErrors
];

exports.validateComplaintId = [
  param('id')
    .isMongoId().withMessage('Invalid complaint ID'),
  handleValidationErrors
];

exports.validateInstitutionId = [
  param('id')
    .isMongoId().withMessage('Invalid institution ID'),
  handleValidationErrors
];

exports.validateComplaintQuery = [
  query('status')
    .optional()
    .isIn(['Open', 'In Progress', 'Resolved', 'Rejected'])
    .withMessage('Invalid status'),
  query('category')
    .optional()
    .isIn(['Road', 'Electricity', 'Water', 'Health', 'Sanitation', 'Leadership', 'Infrastructure', 'Environment', 'PublicServices', 'Other'])
    .withMessage('Invalid category'),
  handleValidationErrors
];