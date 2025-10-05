const Complaint = require('../model/Complaint');

/**
 * Middleware to authorize complaint update operations
 * - Citizens cannot update complaints
 * - Institutions can only update complaints assigned to them
 * - Admins can update any complaint
 */
exports.authorizeComplaintUpdate = async (req, res, next) => {
  try {
    const { role, sub: userId, category } = req.auth;
    const complaintId = req.params.id;

    // Fetch the complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check authorization based on role
    if (role === 'admin') {
      // Admins can update any complaint
      return next();
    }

    if (role === 'institution') {
      // Institutions can only update complaints assigned to them
      if (complaint.assignedAgency.toString() !== userId) {
        return res.status(403).json({
          error: 'You can only update complaints assigned to your institution'
        });
      }
      return next();
    }

    // Citizens cannot update complaints
    return res.status(403).json({
      error: 'Citizens cannot update complaint status. Contact the assigned institution.'
    });

  } catch (err) {
    console.error('Authorization Error:', err);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Middleware to authorize complaint viewing
 * - Citizens can only view their own complaints
 * - Institutions can view complaints assigned to them
 * - Admins can view any complaint
 */
exports.authorizeComplaintView = async (req, res, next) => {
  try {
    const { role, sub: userId } = req.auth;
    const complaintId = req.params.id;

    // Fetch the complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check authorization based on role
    if (role === 'admin') {
      // Admins can view any complaint
      return next();
    }

    if (role === 'institution') {
      // Institutions can view complaints assigned to them
      if (complaint.assignedAgency.toString() !== userId) {
        return res.status(403).json({
          error: 'You can only view complaints assigned to your institution'
        });
      }
      return next();
    }

    if (role === 'citizen') {
      // Citizens can only view their own complaints
      if (complaint.citizen.toString() !== userId) {
        return res.status(403).json({
          error: 'You can only view your own complaints'
        });
      }
      return next();
    }

    return res.status(403).json({ error: 'Access denied' });

  } catch (err) {
    console.error('Authorization Error:', err);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Middleware to filter complaint list based on user role
 * This modifies req.query to add role-based filters
 */
exports.filterComplaintsByRole = (req, res, next) => {
  const { role, sub: userId } = req.auth;

  // Admins see all complaints (no additional filtering)
  if (role === 'admin') {
    return next();
  }

  // Citizens only see their own complaints
  if (role === 'citizen') {
    req.roleFilter = { citizen: userId };
    return next();
  }

  // Institutions only see complaints assigned to them
  if (role === 'institution') {
    req.roleFilter = { assignedAgency: userId };
    return next();
  }

  next();
};
