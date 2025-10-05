const express = require('express');
const router = express.Router();
const { listComplaints, updateComplaint } = require('../controllers/complaints');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  validateUpdateComplaint,
  validateComplaintId,
  validateComplaintQuery
} = require('../middleware/validators');
const { csrfMiddleware } = require('../middleware/csrf');

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// Admin route to view all complaints (no filtering by user)
router.get('/complaints', validateComplaintQuery, listComplaints);

// Admin route to update any complaint
router.put('/complaints/:id', validateComplaintId, validateUpdateComplaint, csrfMiddleware, updateComplaint);

module.exports = router;
