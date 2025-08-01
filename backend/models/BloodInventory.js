const mongoose = require('mongoose');

const BloodInventorySchema = new mongoose.Schema({
  bloodType: { type: String, required: true, unique: true }, // e.g., "A+", "O-"
  quantity: { type: Number, default: 0 }
});

module.exports = mongoose.model('BloodInventory', BloodInventorySchema);