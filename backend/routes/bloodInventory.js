const express = require('express');
const router = express.Router();
const BloodInventory = require('../models/BloodInventory');

// Get all blood types and their stock
router.get('/', async (req, res) => {
  try {
    const inventory = await BloodInventory.find();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update stock (increase/decrease)
router.patch('/:bloodType', async (req, res) => {
  try {
    const { action, units } = req.body; // action: "increase" or "decrease"
    const bloodType = req.params.bloodType.toUpperCase();

    const inventoryItem = await BloodInventory.findOne({ bloodType });
    if (!inventoryItem) return res.status(404).json({ message: 'Blood type not found' });

    if (action === 'increase') {
      inventoryItem.quantity += units;
    } else if (action === 'decrease') {
      if (inventoryItem.quantity < units) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      inventoryItem.quantity -= units;
    }

    await inventoryItem.save();
    res.json(inventoryItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;