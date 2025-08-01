const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  urgency: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal',
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Request', requestSchema);