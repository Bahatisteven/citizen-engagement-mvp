const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaintById,
  listComplaints,
  updateComplaint
} = require('../controllers/complaints');


router.post('/', createComplaint);

router.get('/', listComplaints);

router.get('/:id', getComplaintById);

router.put('/:id', updateComplaint);

module.exports = router;
