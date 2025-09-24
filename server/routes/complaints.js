const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaintById,
  listComplaints,
  updateComplaint
} = require('../controllers/complaints');
const { requireAuth } = require('../middleware/auth');
const {
  validateCreateComplaint,
  validateUpdateComplaint,
  validateComplaintId,
  validateComplaintQuery
} = require('../middleware/validators');
const { csrfMiddleware } = require('../middleware/csrf');

// route for creating a new complaint
router.post('/', requireAuth, validateCreateComplaint, csrfMiddleware, createComplaint);

// route for listing all complaints
router.get('/', requireAuth, validateComplaintQuery, listComplaints);

// route for getting a specific complaint
router.get('/:id', requireAuth, validateComplaintId, getComplaintById);

// route for updating a specific complaint
router.put('/:id', requireAuth, validateComplaintId, validateUpdateComplaint, csrfMiddleware, updateComplaint);

module.exports = router;
