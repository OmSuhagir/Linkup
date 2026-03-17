const Notification = require('../models/Notification');

// @desc    Get current user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('relatedUser', 'name email _id')
      .populate('teamId', 'name _id')
      .sort({ createdAt: -1 });

    // Convert ObjectIds to strings for consistent frontend handling
    const serializedNotifications = notifications.map(notif => {
      const obj = notif.toObject();
      return {
        ...obj,
        _id: String(notif._id),
        user: String(notif.user),
        relatedUser: notif.relatedUser ? String(notif.relatedUser._id || notif.relatedUser) : null,
        teamId: notif.teamId ? String(notif.teamId._id || notif.teamId) : null,
      };
    });

    res.json({ notifications: serializedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
