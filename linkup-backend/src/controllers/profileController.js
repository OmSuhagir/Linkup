const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile/:id
// @access  Public
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        interests: user.interests,
        bio: user.bio,
        github: user.github,
        linkedin: user.linkedin,
        projects: user.projects,
        experience: user.experience,
        location: user.location,
        isDiscoverable: user.isDiscoverable,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile/update
// @access  Private
const updateProfile = async (req, res) => {
  const { bio, skills, interests, projects, experience, github, linkedin } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (interests !== undefined) user.interests = interests;
    if (projects !== undefined) user.projects = projects;
    if (experience !== undefined) user.experience = experience;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;

    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        interests: user.interests,
        bio: user.bio,
        github: user.github,
        linkedin: user.linkedin,
        projects: user.projects,
        experience: user.experience,
        location: user.location,
        isDiscoverable: user.isDiscoverable,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile
};