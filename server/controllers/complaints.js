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

// create new complaint
exports.createComplaint = async (req, res) => {
  try {
    // sending title, description, category, location and citizen in request body
    const { title, description, category, location, citizen } = req.body;

    // assigning complint to appropriate agency
    const assignedAgency = categoryToAgency[category] || 'General Department';
    const complaint = new Complaint({ title, description, category, location, citizen, assignedAgency });

    // saving the complaint
    const saved = await complaint.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create Complaint Error:', err);
    res.status(400).json({ error: err.message });
  }
};


// get complaint by id
exports.getComplaintById = async (req, res) => {
  try {
    // finding complaint by id in request body
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    console.error('Get Complaint Error:', err);
    res.status(400).json({ error: err.message });
  }
};


// list all complaints
exports.listComplaints = async (req, res) => {
  try {
    // sending status and category in request query
    const { status, category } = req.query;

    // filtering complaints
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    // finding and sorting complaints
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error('List Complaints Error:', err);
    res.status(400).json({ error: err.message });
  }
};

// update complaint
exports.updateComplaint = async (req, res) => {
  try {
    // sending status, note and updatedBy in request body
    const { status, note, updatedBy } = req.body;

    // finding complaint by id in request body
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (status) complaint.status = status;

    // updating complaint history
    complaint.history.push({ action: `Status changed to ${status}`, notes: note || '', updatedBy: updatedBy || 'Admin' });

    // saving the updated complaint
    const updated = await complaint.save();
    res.json(updated);
  } catch (err) {
    console.error('Update Complaint Error:', err);
    res.status(400).json({ error: err.message });
  }
};
