const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/authMiddleware');

// Get user/channel by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email -isEmailVerified -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Update user profile
router.put('/profile', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being updated and if it's already in use
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = req.body.email;
    }

    // Update other fields
    user.username = req.body.username || user.username;
    user.bio = req.body.bio || user.bio;
    
    if (req.file) {
      user.profilePicture = '/uploads/profiles/' + req.file.filename;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    console.error('req.file:', req.file);
    if (req.file) {
      console.error('req.file.path:', req.file.path);
      console.error('req.file.filename:', req.file.filename);
    }
    if (err.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

router.get('/admin/ads/pending', protect, admin, async (req, res) => {
  const Ad = require('../models/Ad');
  try {

    // Find all ads with status 'pending'
    const pendingAds = await Ad.find({ status: 'pending' });

    // If no pending ads are found, return a 404 status code
    if (!pendingAds || pendingAds.length === 0) {
      return res.status(404).json({ message: 'No pending ads found' });
    }

    // Return the pending ads as a JSON array
    res.status(200).json(pendingAds);
  } catch (error) {
    console.error('Error fetching pending ads:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;