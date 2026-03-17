const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, skills, interests, bio, github, linkedin, latitude, longitude } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      skills: skills || [],
      interests: interests || [],
      bio,
      github,
      linkedin,
      location: latitude && longitude ? {
        latitude,
        longitude,
        lastUpdated: new Date()
      } : undefined
    });

    // Generate token
    const token = generateToken(user._id, user.email);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        interests: user.interests,
        bio: user.bio,
        github: user.github,
        linkedin: user.linkedin,
        location: user.location,
        isDiscoverable: user.isDiscoverable,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error' }, error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.email);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        interests: user.interests,
        bio: user.bio,
        github: user.github,
        linkedin: user.linkedin,
        location: user.location,
        isDiscoverable: user.isDiscoverable,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        interests: user.interests,
        bio: user.bio,
        github: user.github,
        linkedin: user.linkedin,
        location: user.location,
        isDiscoverable: user.isDiscoverable,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error', error: error });
  }
};

module.exports = {
  register,
  login,
  getMe
};