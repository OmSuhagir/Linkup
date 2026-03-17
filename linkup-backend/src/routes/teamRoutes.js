const express = require('express');
const { createTeam, getTeams, getTeamById, joinTeam, approveJoin, rejectJoin } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', protect, createTeam);
router.get('/', protect, getTeams);
router.get('/:id', protect, getTeamById);
router.post('/join', protect, joinTeam);
router.post('/approve', protect, approveJoin);
router.post('/reject', protect, rejectJoin);

module.exports = router;