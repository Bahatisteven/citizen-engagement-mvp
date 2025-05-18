const Complaint = require('../model/Complaint.js');
const categoryToAgency = {
  Road: 'Department of Roads',
  Water: 'Water Authority',
  Electricity: 'Power Corporation',
  Health: 'Health Department',
  Sanitation: 'Sanitation Department',
  Leadership: 'Local Government',
  Infrastructure: 'Infrastructure Development',
  Environment: 'Environmental Protection Agency',
  PublicServices: 'Public Services Department',
  Other: 'General Department',
};

exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, citizen } = req.body;
    const assignedAgency = categoryToAgency[category] || 'General Department';
    const complaint = new Complaint({ title, description, category, location, citizen, assignedAgency });
    const saved = await complaint.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create Complaint Error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    console.error('Get Complaint Error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.listComplaints = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error('List Complaints Error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const { status, note, updatedBy } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (status) complaint.status = status;
    complaint.history.push({ action: `Status changed to ${status}`, notes: note || '', updatedBy: updatedBy || 'Admin' });
    const updated = await complaint.save();
    res.json(updated);
  } catch (err) {
    console.error('Update Complaint Error:', err);
    res.status(400).json({ error: err.message });
  }
};
