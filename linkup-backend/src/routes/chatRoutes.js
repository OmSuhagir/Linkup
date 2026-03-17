const express = require('express');
const { getChat, getTeamChat, getMessagingHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get messaging history
router.get('/history', protect, getMessagingHistory);

// Must define /team/:teamId BEFORE /:userId to avoid route collision
router.get('/team/:teamId', protect, getTeamChat);
router.get('/:userId', protect, getChat);

module.exports = router;