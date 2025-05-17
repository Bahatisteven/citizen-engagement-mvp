const express = require('express');
const {
  createComplaint,
  getComplaintById,
  listComplaints,
  updateComplaint
} = require('../controllers/complaints.js');

const router = express.Router();

router.post('/', createComplaint);
router.get('/:id', getComplaintById);
router.get('/', listComplaints);
router.put('/:id', updateComplaint);

module.exports = router;