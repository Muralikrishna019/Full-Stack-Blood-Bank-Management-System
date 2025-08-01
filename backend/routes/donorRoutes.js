const express = require('express');
const {
  recordDonation,
  getDonationHistory,
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('donor'));

router.post('/donate', recordDonation);
router.get('/history', getDonationHistory);

module.exports = router;