const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  body('latitude', 'Latitude is required').isNumeric(),
  body('longitude', 'Longitude is required').isNumeric()
], register);

router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], login);

router.get('/me', protect, getMe);

module.exports = router;