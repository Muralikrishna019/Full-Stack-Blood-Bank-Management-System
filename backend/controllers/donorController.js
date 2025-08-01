const Donation = require('../models/Donation');
const BloodInventory = require('../models/BloodInventory');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Record a blood donation
// @route   POST /api/donor/donate
// @access  Private (Donor)
exports.recordDonation = asyncHandler(async (req, res, next) => {
  const { bloodType, donationDate, quantity } = req.body;
  const donor = req.user.id;

  // Create donation record
  const donation = await Donation.create({
    donor,
    bloodType,
    donationDate,
    quantity: quantity || 1,
  });

  // Update blood inventory
  const inventory = await BloodInventory.updateInventory(bloodType, quantity || 1);

  res.status(201).json({
    success: true,
    data: donation,
    inventory,
  });
});

// @desc    Get donor's donation history
// @route   GET /api/donor/history
// @access  Private (Donor)
exports.getDonationHistory = asyncHandler(async (req, res, next) => {
  const donations = await Donation.find({ donor: req.user.id }).sort('-donationDate');

  res.status(200).json({
    success: true,
    count: donations.length,
    data: donations,
  });
});