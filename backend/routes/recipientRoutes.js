const express = require('express');
const {
  createRequest,
  getRequestHistory,
} = require('../controllers/recipientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('recipient'));

router.post('/request', createRequest);
router.get('/requests', getRequestHistory);

module.exports = router;