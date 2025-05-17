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

// a new complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, citizen } = req.body;

    const assignedAgency = categoryToAgency[category] || 'General Department';

    const newComplaint = new Complaint({
      title,
      description,
      category,
      assignedAgency,
      citizen,
      status: 'Pending',
      history: [
        {
          action: 'Complaint Created',
          notes: 'Initial submission',
          updatedBy: 'Citizen',
        },
      ],
    });

    const savedComplaint = await newComplaint.save();
    console.log("New complaint submitted:", savedComplaint._id);

    res.status(201).json({ id: savedComplaint._id });
  } catch (err) {
    console.error("Error submitting complaint:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// get complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (err) {
    console.error("Error retrieving complaint:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// list all complaints (with optional filters)
exports.listComplaints = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("Error listing complaints:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// update status and log in history
exports.updateComplaint = async (req, res) => {
  try {
    const { status, note, updatedBy = 'Admin' } = req.body;
    const allowedStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (status) complaint.status = status;

    complaint.history.push({
      action: `Status changed to ${status}`,
      notes: note || '',
      updatedBy,
    });

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error("Error updating complaint:", err.message);
    res.status(400).json({ error: err.message });
  }
};
