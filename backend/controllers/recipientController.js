const Request = require('../models/Request');
const BloodInventory = require('../models/BloodInventory');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create a blood request
// @route   POST /api/recipient/request
// @access  Private (Recipient)
exports.createRequest = asyncHandler(async (req, res, next) => {
  const { bloodType, location, urgency } = req.body;
  const recipient = req.user.id;

  // Create request
  const request = await Request.create({
    recipient,
    bloodType,
    location,
    urgency: urgency || 'normal',
  });

  res.status(201).json({
    success: true,
    data: request,
  });
});

// @desc    Get recipient's request history
// @route   GET /api/recipient/requests
// @access  Private (Recipient)
exports.getRequestHistory = asyncHandler(async (req, res, next) => {
  const requests = await Request.find({ recipient: req.user.id }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});