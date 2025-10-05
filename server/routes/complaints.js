const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaintById,
  listComplaints,
  updateComplaint
} = require('../controllers/complaints');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  validateCreateComplaint,
  validateUpdateComplaint,
  validateComplaintId,
  validateComplaintQuery
} = require('../middleware/validators');
const { csrfMiddleware } = require('../middleware/csrf');
const {
  authorizeComplaintUpdate,
  authorizeComplaintView,
  filterComplaintsByRole
} = require('../middleware/complaintAuth');

// route for creating a new complaint (citizens only)
router.post('/', requireAuth, requireRole('citizen'), validateCreateComplaint, csrfMiddleware, createComplaint);

// route for listing complaints (filtered by role)
router.get('/', requireAuth, validateComplaintQuery, filterComplaintsByRole, listComplaints);

// route for getting a specific complaint (with authorization check)
router.get('/:id', requireAuth, validateComplaintId, authorizeComplaintView, getComplaintById);

// route for updating a specific complaint (with authorization check)
router.put('/:id', requireAuth, validateComplaintId, validateUpdateComplaint, authorizeComplaintUpdate, csrfMiddleware, updateComplaint);

module.exports = router;
