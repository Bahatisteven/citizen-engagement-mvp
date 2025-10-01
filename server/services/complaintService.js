/**
 * Complaint business logic service
 * @module services/complaintService
 */

const Complaint = require('../model/Complaint');
const logger = require('../config/logger');

/**
 * Category to agency mapping
 */
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

/**
 * Create a new complaint
 * @param {Object} complaintData - Complaint data
 * @param {string} complaintData.title - Complaint title
 * @param {string} complaintData.description - Complaint description
 * @param {string} complaintData.category - Complaint category
 * @param {string} complaintData.location - Location of complaint
 * @param {string} complaintData.citizen - Citizen email
 * @returns {Promise<Object>} Created complaint
 */
exports.createComplaint = async (complaintData) => {
  try {
    const { title, description, category, location, citizen } = complaintData;

    // Assign to appropriate agency
    const assignedAgency = categoryToAgency[category] || 'General Department';

    const complaint = new Complaint({
      title,
      description,
      category,
      location,
      citizen,
      assignedAgency,
    });

    const saved = await complaint.save();

    logger.logInfo('Complaint created successfully', {
      complaintId: saved._id,
      citizen,
      category,
    });

    return saved;
  } catch (error) {
    logger.logError('Error creating complaint', error);
    throw error;
  }
};

/**
 * Get complaint by ID
 * @param {string} complaintId - Complaint ID
 * @returns {Promise<Object|null>} Complaint or null if not found
 */
exports.getComplaintById = async (complaintId) => {
  try {
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      logger.logWarn('Complaint not found', { complaintId });
    }

    return complaint;
  } catch (error) {
    logger.logError('Error fetching complaint', error);
    throw error;
  }
};

/**
 * List complaints with optional filtering
 * @param {Object} filters - Filter options
 * @param {string} [filters.status] - Filter by status
 * @param {string} [filters.category] - Filter by category
 * @param {string} [filters.citizen] - Filter by citizen email
 * @param {Object} [options] - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Items per page
 * @returns {Promise<Object>} Complaints with pagination
 */
exports.listComplaints = async (filters = {}, options = {}) => {
  try {
    const { status, category, citizen } = filters;
    const { page = 1, limit = 20 } = options;

    // Build filter query
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (citizen) filter.citizen = citizen;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    logger.logDebug('Complaints listed', {
      count: complaints.length,
      total,
      filters,
    });

    return {
      complaints,
      pagination: {
        page,
        limit,
        total,
      },
    };
  } catch (error) {
    logger.logError('Error listing complaints', error);
    throw error;
  }
};

/**
 * Update complaint status and add history entry
 * @param {string} complaintId - Complaint ID
 * @param {Object} updateData - Update data
 * @param {string} [updateData.status] - New status
 * @param {string} [updateData.note] - Update note
 * @param {string} [updateData.updatedBy] - User who updated
 * @returns {Promise<Object>} Updated complaint
 */
exports.updateComplaint = async (complaintId, updateData) => {
  try {
    const { status, note, updatedBy } = updateData;

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      const error = new Error('Complaint not found');
      error.statusCode = 404;
      throw error;
    }

    // Update status if provided
    if (status) {
      complaint.status = status;
    }

    // Add history entry
    complaint.history.push({
      action: status ? `Status changed to ${status}` : 'Complaint updated',
      notes: note || '',
      updatedBy: updatedBy || 'System',
      timestamp: new Date(),
    });

    const updated = await complaint.save();

    logger.logInfo('Complaint updated', {
      complaintId,
      status,
      updatedBy,
    });

    return updated;
  } catch (error) {
    logger.logError('Error updating complaint', error);
    throw error;
  }
};

/**
 * Add response to complaint
 * @param {string} complaintId - Complaint ID
 * @param {Object} responseData - Response data
 * @param {string} responseData.text - Response text
 * @param {string} responseData.from - Responder name/email
 * @returns {Promise<Object>} Updated complaint
 */
exports.addResponse = async (complaintId, responseData) => {
  try {
    const { text, from } = responseData;

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      const error = new Error('Complaint not found');
      error.statusCode = 404;
      throw error;
    }

    complaint.responses.push({
      text,
      from,
      date: new Date().toISOString(),
    });

    const updated = await complaint.save();

    logger.logInfo('Response added to complaint', {
      complaintId,
      from,
    });

    return updated;
  } catch (error) {
    logger.logError('Error adding response to complaint', error);
    throw error;
  }
};

/**
 * Get complaint statistics
 * @returns {Promise<Object>} Complaint statistics
 */
exports.getStatistics = async () => {
  try {
    const [statusStats, categoryStats, total] = await Promise.all([
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Complaint.countDocuments(),
    ]);

    return {
      total,
      byStatus: statusStats.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      byCategory: categoryStats.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
    };
  } catch (error) {
    logger.logError('Error fetching complaint statistics', error);
    throw error;
  }
};

module.exports = exports;
