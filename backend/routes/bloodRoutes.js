const express = require('express');
const {
  getInventory,
  getCompatibleTypes,
} = require('../controllers/bloodController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/availability', getInventory);
router.get('/compatible/:bloodType', getCompatibleTypes);

module.exports = router;