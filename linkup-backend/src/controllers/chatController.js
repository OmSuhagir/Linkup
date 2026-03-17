const Message = require('../models/Message');
const Team = require('../models/Team');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get chat messages with a user
// @route   GET /api/chat/:userId
// @access  Private
const getChat = async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate ObjectId format
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch messages between current user and the other user
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    })
      .populate('sender', 'name email _id')
      .populate('receiver', 'name email _id')
      .sort({ timestamp: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get team chat messages
// @route   GET /api/chat/team/:teamId
// @access  Private
const getTeamChat = async (req, res) => {
  const { teamId } = req.params;

  try {
    // Validate teamId
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }

    // Validate ObjectId format
    if (!isValidObjectId(teamId)) {
      return res.status(400).json({ message: 'Invalid team ID format' });
    }

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is member
    if (!team.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this team' });
    }

    // Fetch team messages
    const messages = await Message.find({ teamId })
      .populate('sender', 'name email _id')
      .sort({ timestamp: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching team chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get messaging history (conversations)
// @route   GET /api/chat/history
// @access  Private
const getMessagingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get private conversations
    const privateMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) }
          ],
          teamId: { $exists: false } // Only private messages
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
              then: '$receiver',
              else: '$sender'
            }
          },
          lastMessage: { $first: '$$ROOT' },
          messageCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          type: { $literal: 'private' },
          participantId: '$_id',
          participant: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email'
          },
          lastMessage: {
            _id: '$lastMessage._id',
            message: '$lastMessage.message',
            timestamp: '$lastMessage.timestamp',
            sender: '$lastMessage.sender'
          },
          messageCount: 1,
          unreadCount: { $literal: 0 }
        }
      }
    ]);

    // Get team conversations
    const userTeams = await Team.find({ members: userId }).select('_id name');
    const teamConversations = [];

    for (const team of userTeams) {
      const lastMessage = await Message.findOne({ teamId: team._id })
        .populate('sender', 'name email')
        .sort({ timestamp: -1 });

      if (lastMessage) {
        const messageCount = await Message.countDocuments({ teamId: team._id });

        teamConversations.push({
          type: 'team',
          participantId: team._id,
          participant: {
            _id: team._id,
            name: team.name
          },
          lastMessage: {
            _id: lastMessage._id,
            message: lastMessage.message,
            timestamp: lastMessage.timestamp,
            sender: lastMessage.sender
          },
          messageCount,
          unreadCount: 0 // TODO: Implement unread count logic
        });
      }
    }

    // Combine and sort by last message timestamp
    const allConversations = [...privateMessages, ...teamConversations]
      .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

    res.json({ conversations: allConversations });
  } catch (error) {
    console.error('Error fetching messaging history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getChat,
  getTeamChat,
  getMessagingHistory
};