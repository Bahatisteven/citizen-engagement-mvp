const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, getProfile, updateProfile, getPendingInstitutions, approveInstitution, logout } = require('../controllers/auth.js');
const { requireAuth } = require('../middleware/auth.js');
const { authLimiter, passwordResetLimiter, registrationLimiter } = require('../middleware/rateLimiter.js');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword, validateUpdateProfile, validateInstitutionId } = require('../middleware/validators.js');
const { csrfMiddleware } = require('../middleware/csrf.js');
const { refreshAccessToken } = require('../middleware/refreshToken.js');

// routes for authentication
router.post('/register', registrationLimiter, validateRegister, register);

// routes for login
router.post('/login', authLimiter, validateLogin, login);

// password reset routes
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateResetPassword, resetPassword);

// profile management routes
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, validateUpdateProfile, updateProfile);

// token refresh route
router.post('/refresh-token', refreshAccessToken);

// logout route
router.post('/logout', requireAuth, logout);

// admin routes for institution approval
router.get('/pending-institutions', requireAuth, getPendingInstitutions);
router.put('/approve-institution/:id', requireAuth, validateInstitutionId, csrfMiddleware, approveInstitution);

module.exports = router;
