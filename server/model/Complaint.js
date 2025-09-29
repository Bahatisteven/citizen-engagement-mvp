// here we define the Complaint model for the database 
const mongoose = require('mongoose');

// define the Complaint schema 
const Schema = mongoose.Schema;
const ComplaintSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['Road','Electricity','Water','Health','Sanitation','Leadership','Infrastructure','Environment','PublicServices','Other'] },
  location: { type: String, trim: true },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAgency: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Open','In Progress','Resolved','Rejected'], default: 'Open' },
  responses: [{
    text: { type: String, required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  history: [{
    action: { type: String, required: true },
    notes: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Create indexes for better query performance
ComplaintSchema.index({ citizen: 1 }); // For citizen's complaints
ComplaintSchema.index({ assignedAgency: 1 }); // For agency's assigned complaints
ComplaintSchema.index({ status: 1 }); // For status filtering
ComplaintSchema.index({ category: 1 }); // For category filtering
ComplaintSchema.index({ createdAt: -1 }); // For sorting by creation date
ComplaintSchema.index({ citizen: 1, status: 1 }); // Compound index for citizen status queries
ComplaintSchema.index({ assignedAgency: 1, status: 1 }); // Compound index for agency status queries

// export the Complaint model
module.exports = mongoose.model('Complaint', ComplaintSchema);
