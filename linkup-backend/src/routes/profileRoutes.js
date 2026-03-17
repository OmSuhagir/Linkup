const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id', getProfile);
router.put('/update', protect, updateProfile);

module.exports = router;