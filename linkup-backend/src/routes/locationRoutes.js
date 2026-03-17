const express = require('express');
const { updateLocation } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/update', protect, updateLocation);

module.exports = router;