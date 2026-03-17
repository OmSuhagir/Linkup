const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Team = require('../models/Team');
const User = require('../models/User');

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.error('Socket authentication failed: No token provided');
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      console.log('Socket authenticated for user:', socket.userId);
      return next();
    } catch (error) {
      console.error('Socket authentication failed: Invalid token', error.message);
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id, 'userId:', socket.userId);

    // Automatically join user's private room
    if (socket.userId) {
      socket.join(socket.userId);
    }

    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', socket.id, 'reason:', reason);
    });

    // Proximity Alert - when a user comes nearby
    socket.on('proximityAlert', (data) => {
      const { userId, nearbyUserId, userName } = data;
      // Send alert to the nearby user
      io.to(nearbyUserId).emit('proximityAlert', {
        userId,
        name: userName,
        message: `${userName} is nearby`
      });
      console.log(`Proximity alert sent: ${userName} is near user ${nearbyUserId}`);
    });

    // Join user room
    socket.on('joinUser', (userId) => {
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('Invalid userId for joinUser:', userId);
        socket.emit('serverError', { message: 'Invalid user ID' });
        return;
      }
      socket.join(userId);
      console.log(`User ${userId} joined their private room`);
    });

    // Join team room
    socket.on('joinTeam', (teamId) => {
      if (!teamId || teamId === 'undefined' || teamId === 'null') {
        console.error('Invalid teamId for joinTeam:', teamId);
        socket.emit('serverError', { message: 'Invalid team ID' });
        return;
      }
      socket.join(teamId);
      console.log(`User joined team ${teamId}`);
    });

    // Send private message
    socket.on('sendMessage', async (data) => {
      try {
        const { senderId, receiverId, message } = data;
        console.log('Received sendMessage:', { senderId, receiverId, message: message?.substring(0, 50) });

        // Validate input with detailed error messages
        if (!senderId) {
          console.error('Missing senderId');
          socket.emit('serverError', { message: 'Missing sender ID' });
          return;
        }
        
        if (!receiverId) {
          console.error('Missing receiverId');
          socket.emit('serverError', { message: 'Missing receiver ID' });
          return;
        }
        
        if (!message) {
          console.error('Missing message content');
          socket.emit('serverError', { message: 'Message content is required' });
          return;
        }

        if (senderId === receiverId) {
          console.error('Cannot send message to yourself');
          socket.emit('serverError', { message: 'Cannot send message to yourself' });
          return;
        }

        // Verify sender and receiver exist
        const sender = await User.findById(senderId).select('name');
        const receiver = await User.findById(receiverId).select('name');

        if (!sender || !receiver) {
          console.error('User not found:', { sender: !!sender, receiver: !!receiver });
          socket.emit('serverError', { message: 'User not found' });
          return;
        }

        // Create and save message
        const newMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          message: message.trim()
        });

        // Populate sender with full details
        await newMessage.populate('sender', 'name email');
        await newMessage.populate('receiver', 'name email');

        // Create notification for receiver
        const notification = await Notification.create({
          user: receiverId,
          type: 'NEW_MESSAGE',
          message: `${sender?.name || 'Someone'} sent you a message`,
          relatedUser: senderId,
        });

        console.log('Notification created:', {
          _id: notification._id,
          type: notification.type,
          relatedUser: notification.relatedUser,
          message: notification.message
        });

        // Convert to plain object and ensure all IDs are strings
        const notificationObj = {
          _id: String(notification._id),
          user: String(notification.user),
          type: notification.type,
          message: notification.message,
          relatedUser: notification.relatedUser ? String(notification.relatedUser) : null,
          teamId: notification.teamId ? String(notification.teamId) : null,
          createdAt: notification.createdAt,
          isRead: notification.isRead
        };

        console.log('Notification object converted for socket:', notificationObj);

        // Emit to receiver only (sender already has optimistic update)
        io.to(receiverId).emit('receiveMessage', newMessage);
        io.to(receiverId).emit('notification', notificationObj);

        console.log(`Message sent successfully from ${senderId} to ${receiverId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('serverError', { message: 'Failed to send message: ' + error.message });
        // Don't let the error crash the socket
      }
    });

    // Send team message
    socket.on('sendTeamMessage', async (data) => {
      try {
        const { senderId, teamId, message } = data;
        console.log('Received sendTeamMessage:', { senderId, teamId, message: message?.substring(0, 50) });

        // Validate input with detailed error messages
        if (!senderId) {
          console.error('Missing senderId for team message');
          socket.emit('serverError', { message: 'Missing sender ID' });
          return;
        }
        
        if (!teamId) {
          console.error('Missing teamId for team message');
          socket.emit('serverError', { message: 'Missing team ID' });
          return;
        }
        
        if (!message) {
          console.error('Missing message content for team message');
          socket.emit('serverError', { message: 'Message content is required' });
          return;
        }

        // Check if team exists
        const team = await Team.findById(teamId);
        if (!team) {
          console.error('Team not found:', teamId);
          socket.emit('serverError', { message: 'Team not found' });
          return;
        }

        // Check if sender is member
        if (!team.members.some(memberId => memberId.toString() === senderId.toString())) {
          console.error('User not authorized for team:', { senderId, teamId });
          socket.emit('serverError', { message: 'Not authorized to send message in this team' });
          return;
        }

        // Verify sender exists
        const sender = await User.findById(senderId).select('name');
        if (!sender) {
          console.error('Sender not found:', senderId);
          socket.emit('serverError', { message: 'User not found' });
          return;
        }

        // Create and save message
        const newMessage = await Message.create({
          sender: senderId,
          teamId,
          message: message.trim()
        });

        // Populate sender with full details
        await newMessage.populate('sender', 'name email');

        // Emit to team room
        io.to(teamId).emit('receiveTeamMessage', newMessage);

        console.log(`Team message sent successfully from ${senderId} to team ${teamId}`);
      } catch (error) {
        console.error('Error sending team message:', error);
        socket.emit('serverError', { message: 'Failed to send message: ' + error.message });
        // Don't let the error crash the socket
      }
    });

    // Team join request
    socket.on('teamJoinRequest', (data) => {
      const { teamId, leaderId } = data;
      io.to(leaderId).emit('joinRequest', { teamId, userId: socket.userId });
    });

    // Proximity alert
    socket.on('proximityAlert', (data) => {
      const { userId, nearbyUserId } = data;
      io.to(userId).emit('nearbyUser', { userId: nearbyUserId });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};