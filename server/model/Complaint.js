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
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        'Road',
        'Electricity',
        'Water',
        'Health',
        'Sanitation',
        'Leadership',
        'Infrastructure',
        'Environment',
        'Public Services',
        'Other'
      ],
    },

    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },

    citizen: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      contact: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
    },

    assignedAgency: {
      type: Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },

    responses: [
      {
        message: String,
        respondedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    history: [
      {
        action: {
          type: String,
          enum: ['Created', 'Assigned', 'Updated', 'Resolved', 'Rejected'],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', ComplaintSchema);
