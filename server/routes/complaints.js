const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaintById,
  listComplaints,
  updateComplaint
} = require('../controllers/complaints');

// route for creating a new complaint
router.post('/', createComplaint);

// route for listing all complaints
router.get('/', listComplaints);

// route for getting a specific complaint
router.get('/:id', getComplaintById);

// route for updating a specific complaint
router.put('/:id', updateComplaint);

module.exports = router;
