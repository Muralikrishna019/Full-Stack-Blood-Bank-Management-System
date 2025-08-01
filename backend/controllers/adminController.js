const Request = require('../models/Request');
const User = require('../models/User');
const Donation = require('../models/Donation');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all pending requests
// @route   GET /api/admin/requests
// @access  Private (Admin)
exports.getRequests = asyncHandler(async (req, res, next) => {
  const requests = await Request.find({ status: 'Pending' })
    .populate('recipient', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// @desc    Update request status
// @route   PUT /api/admin/request/status
// @access  Private (Admin)
exports.updateRequestStatus = asyncHandler(async (req, res, next) => {
  const { requestId, status } = req.body;

  const request = await Request.findById(requestId).populate('recipient', 'name email');

  if (!request) {
    return next(new ErrorResponse(`Request not found with id of ${requestId}`, 404));
  }

  request.status = status;
  await request.save();

  res.status(200).json({
    success: true,
    data: request,
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get all donations
// @route   GET /api/admin/donations
// @access  Private (Admin)
exports.getDonations = asyncHandler(async (req, res, next) => {
  const donations = await Donation.find().populate('donor', 'name email bloodType');

  res.status(200).json({
    success: true,
    count: donations.length,
    data: donations,
  });
});