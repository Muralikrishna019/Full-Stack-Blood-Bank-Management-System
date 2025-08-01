const express = require('express');
const {
  getRequests,
  updateRequestStatus,
  getUsers,
  getDonations,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/requests', getRequests);
router.put('/request/status', updateRequestStatus);
router.get('/users', getUsers);
router.get('/donations', getDonations);

module.exports = router;