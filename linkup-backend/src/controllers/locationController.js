const User = require('../models/User');
const { calculateDistance } = require('../utils/distance');

// @desc    Update user location
// @route   POST /api/location/update
// @access  Private
const updateLocation = async (req, res) => {
  const { latitude, longitude, accuracy } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  // Validate coordinate ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ message: 'Invalid coordinates' });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if location has actually changed significantly (optional optimization)
    const hasMoved = !user.location.latitude || !user.location.longitude ||
      calculateDistance(user.location.latitude, user.location.longitude, latitude, longitude) > 0.01; // 10 meters

    if (hasMoved) {
      user.location.latitude = latitude;
      user.location.longitude = longitude;
      user.location.lastUpdated = new Date();
      user.location.accuracy = accuracy || null;

      await user.save();

      // Optional: Emit socket event for real-time proximity updates
      // This could notify nearby users about the location change
      // io.emit('userLocationUpdate', { userId: user._id, location: user.location });
    }

    res.json({
      message: 'Location updated successfully',
      location: {
        latitude: user.location.latitude,
        longitude: user.location.longitude,
        lastUpdated: user.location.lastUpdated,
        accuracy: user.location.accuracy
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get nearby users with enhanced filtering
// @route   GET /api/users/nearby
// @access  Private
const getNearbyUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current user is discoverable
    if (!currentUser.isDiscoverable) {
      return res.status(403).json({ message: 'You must be discoverable to search for nearby users' });
    }

    // Ensure current user has location set, otherwise we cannot calculate proximity
    if (!currentUser.location?.latitude || !currentUser.location?.longitude) {
      return res.status(400).json({ message: 'Please update your location before searching for nearby users' });
    }

    // Get query parameters for filtering
    const maxDistance = parseFloat(req.query.distance) || 100; // meters
    const maxAge = parseInt(req.query.maxAge) || 1440; // minutes since last update (24 hours default)

    const allUsers = await User.find({
      isDiscoverable: true,
      _id: { $ne: req.user.id },
      'location.lastUpdated': {
        $gte: new Date(Date.now() - maxAge * 60 * 1000) // Only users updated within last X minutes
      }
    });

    console.log(`User ${req.user.id} searching for nearby users:`);
    console.log(`- Found ${allUsers.length} users with recent location updates`);
    console.log(`- Current user location: ${currentUser.location.latitude}, ${currentUser.location.longitude}`);
    console.log(`- Max distance: ${maxDistance}m, Max age: ${maxAge} minutes`);

    const nearbyUsers = allUsers.filter(user => {
      const distance = calculateDistance(
        currentUser.location.latitude,
        currentUser.location.longitude,
        user.location.latitude,
        user.location.longitude
      );
      const isNearby = distance <= maxDistance;
      console.log(`- User ${user._id} (${user.name}): ${distance.toFixed(2)}m away, ${isNearby ? 'INCLUDED' : 'EXCLUDED'}`);
      return isNearby;
    });

    const users = nearbyUsers.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
      interests: user.interests,
      bio: user.bio,
      github: user.github,
      linkedin: user.linkedin,
      location: user.location,
      distance: Math.round(calculateDistance(
        currentUser.location.latitude,
        currentUser.location.longitude,
        user.location.latitude,
        user.location.longitude
      ) * 100) / 100 // Round to 2 decimal places
    }));

    res.json({
      users,
      searchCriteria: {
        maxDistance,
        maxAge,
        userCount: users.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  updateLocation,
  getNearbyUsers
};