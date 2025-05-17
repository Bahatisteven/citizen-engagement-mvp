const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ComplaintSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ['Road', 'Electricity', 'Water', 'Health', 'Sanitation', 'Leadership', 'Infrastructure', 'Environment', 'Public Services', 'Other'], 
    },

    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },

    assignedAgency: {
      type: String,
      required: true,
    },

    citizen: {
      name: {
        type: String,
        required: true,
      },
      contact: {
        type: String,
        required: true,
      },
    },

    history: [
      {
        action: String,            
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: String,          
        notes: String,
      },
    ],
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Complaint', ComplaintSchema);






module.exports = mongoose.model('Complaint', ComplaintSchema);