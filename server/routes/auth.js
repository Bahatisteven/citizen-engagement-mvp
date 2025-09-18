const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, getProfile, updateProfile, getPendingInstitutions, approveInstitution } = require('../controllers/auth.js');
const { authenticateToken } = require('../middleware/auth.js');

// routes for authentication
router.post('/register', register);

// routes for login
router.post('/login', login);

// password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// profile management routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// admin routes for institution approval
router.get('/pending-institutions', authenticateToken, getPendingInstitutions);
router.put('/approve-institution/:id', authenticateToken, approveInstitution);

module.exports = router;
