const express = require('express');
const { getNearbyUsers } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/nearby', protect, getNearbyUsers);

module.exports = router;