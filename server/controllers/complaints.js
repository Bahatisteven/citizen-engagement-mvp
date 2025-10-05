const Complaint = require('../model/Complaint.js');
const User = require('../model/User.js');

// Map complaint categories to institution categories
const categoryToInstitutionCategory = {
  Road: 'Road',
  Water: 'Water',
  Electricity: 'Electricity',
  Health: 'Health',
  Sanitation: 'Other',
  Leadership: 'Other',
  Infrastructure: 'Other',
  Environment: 'Other',
  PublicServices: 'Other',
  Other: 'Other',
};

// create new complaint
exports.createComplaint = async (req, res) => {
  try {
    // sending title, description, category, location and citizen in request body
    const { title, description, category, location, citizen } = req.body;

    // Find an approved institution with matching category
    const institutionCategory = categoryToInstitutionCategory[category] || 'Other';
    const assignedAgency = await User.findOne({
      role: 'institution',
      status: 'approved',
      category: institutionCategory
    });

    if (!assignedAgency) {
      return res.status(400).json({
        error: `No approved institution found for category: ${category}. Please try again later.`
      });
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      location,
      citizen,
      assignedAgency: assignedAgency._id
    });

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
    // finding complaint by id and populating user references
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email')
      .populate('assignedAgency', 'name email category')
      .populate('responses.from', 'name email role')
      .populate('history.updatedBy', 'name email role');

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

    // Apply role-based filter if set by middleware
    if (req.roleFilter) {
      Object.assign(filter, req.roleFilter);
    }

    // finding and sorting complaints with populated references
    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name email')
      .populate('assignedAgency', 'name email category')
      .sort({ createdAt: -1 });

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
    const { status, note } = req.body;

    // finding complaint by id in request body
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    if (status) complaint.status = status;

    // updating complaint history with authenticated user ID
    complaint.history.push({
      action: `Status changed to ${status}`,
      notes: note || '',
      updatedBy: req.auth.sub // from JWT auth middleware (sub = subject/user ID)
    });

    // saving the updated complaint
    const updated = await complaint.save();
    res.json(updated);
  } catch (err) {
    console.error('Update Complaint Error:', err);
    res.status(400).json({ error: err.message });
  }
};
