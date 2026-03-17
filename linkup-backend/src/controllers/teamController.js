const Team = require('../models/Team');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a new team
// @route   POST /api/teams/create
// @access  Private
const createTeam = async (req, res) => {
  const { teamName, requiredSkills, teamSize } = req.body;

  if (!teamName || !teamSize) {
    return res.status(400).json({ message: 'Team name and size are required' });
  }

  try {
    const team = await Team.create({
      teamName,
      leader: req.user.id,
      requiredSkills: requiredSkills || [],
      teamSize,
      members: [req.user.id]
    });

    res.status(201).json({ team });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('leader', 'name email').populate('members', 'name email');
    res.json({ teams });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get team details
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name email')
      .populate('members', 'name email')
      .populate('joinRequests.user', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ team, joinRequests: team.joinRequests });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join a team
// @route   POST /api/teams/join
// @access  Private
const joinTeam = async (req, res) => {
  const { teamId } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is already a member
    if (team.members.some(memberId => memberId.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Already a member of this team' });
    }

    // Check if already requested
    const existingRequest = team.joinRequests.find(request => request.user.toString() === req.user.id);
    if (existingRequest) {
      return res.status(400).json({ message: 'Join request already sent' });
    }

    // Check if team is full
    if (team.members.length >= team.teamSize) {
      return res.status(400).json({ message: 'Team is full' });
    }

    team.joinRequests.push({ user: req.user.id });
    await team.save();

    // Create a notification for the team leader
    const leaderId = team.leader.toString();
    const notification = await Notification.create({
      user: leaderId,
      type: 'TEAM_REQUEST',
      message: `${req.user.name || 'A user'} has requested to join your team "${team.teamName}"`,
      teamId: team._id,
      relatedUser: req.user.id,
    });

    // Emit notification via socket if available
    const io = req.app.get('io');
    if (io) {
      io.to(leaderId).emit('notification', notification);
    }

    res.json({ message: 'Join request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve join request
// @route   POST /api/teams/approve
// @access  Private
const approveJoin = async (req, res) => {
  const { teamId, userId } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is leader
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team leader can approve requests' });
    }

    // Find request
    const requestIndex = team.joinRequests.findIndex(request => request.user.toString() === userId);
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    // Check if team is full
    if (team.members.length >= team.teamSize) {
      return res.status(400).json({ message: 'Team is full' });
    }

    // Add to members and remove request
    team.members.push(userId);
    team.joinRequests.splice(requestIndex, 1);
    await team.save();

    res.json({ message: 'User added to team' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject join request
// @route   POST /api/teams/reject
// @access  Private
const rejectJoin = async (req, res) => {
  const { teamId, userId } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is leader
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team leader can reject requests' });
    }

    // Find and remove request
    const requestIndex = team.joinRequests.findIndex(request => request.user.toString() === userId);
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    team.joinRequests.splice(requestIndex, 1);
    await team.save();

    res.json({ message: 'Join request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  joinTeam,
  approveJoin,
  rejectJoin
};