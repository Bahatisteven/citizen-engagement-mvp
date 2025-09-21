const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, getProfile, updateProfile, getPendingInstitutions, approveInstitution } = require('../controllers/auth.js');
const { requireAuth } = require('../middleware/auth.js');

// routes for authentication
router.post('/register', register);

// routes for login
router.post('/login', login);

// password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// profile management routes
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

// admin routes for institution approval
router.get('/pending-institutions', requireAuth, getPendingInstitutions);
router.put('/approve-institution/:id', requireAuth, approveInstitution);

module.exports = router;
