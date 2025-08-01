const BloodInventory = require('../models/BloodInventory');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get blood inventory
// @route   GET /api/blood/availability
// @access  Private
exports.getInventory = asyncHandler(async (req, res, next) => {
  const inventory = await BloodInventory.find().sort('bloodType');

  res.status(200).json({
    success: true,
    count: inventory.length,
    data: inventory,
  });
});

// @desc    Get blood types compatible with requested type
// @route   GET /api/blood/compatible/:bloodType
// @access  Private
exports.getCompatibleTypes = asyncHandler(async (req, res, next) => {
  const { bloodType } = req.params;

  const compatibleTypes = getCompatibleBloodTypes(bloodType);

  res.status(200).json({
    success: true,
    data: compatibleTypes,
  });
});

// Helper function to determine compatible blood types
function getCompatibleBloodTypes(bloodType) {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'],
  };

  return compatibility[bloodType] || [];
}