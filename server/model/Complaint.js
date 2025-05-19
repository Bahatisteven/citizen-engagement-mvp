// here we define the Complaint model for the database 
const mongoose = require('mongoose');

// define the Complaint schema 
const Schema = mongoose.Schema;
const ComplaintSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['Road','Electricity','Water','Health','Sanitation','Leadership','Infrastructure','Environment','PublicServices','Other'] },
  location: { type: String, trim: true },
  citizen: { type: String, required: true },
  assignedAgency: { type: String, required: true },
  status: { type: String, enum: ['Open','In Progress','Resolved','Rejected'], default: 'Open' },
  responses: [{ text: String, from: String, date: String }],
  history: [{ action: String, notes: String, updatedBy: String, timestamp: { type: Date, default: Date.now } }]
}, { timestamps: true });

// export the Complaint model
module.exports = mongoose.model('Complaint', ComplaintSchema);
