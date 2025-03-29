const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get subscriber count for a channel
router.get('/count/:channelId', async (req, res) => {
  try {
    const user = await User.findById(req.params.channelId);
    if (!user) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const subscriberCount = user.subscribers.length;
    res.json({ count: subscriberCount });
  } catch (error) {
    console.error('Get subscriber count error:', error);
    res.status(500).json({ message: 'Server error while getting subscriber count' });
  }
});

// Check if user is subscribed to a channel
router.get('/status/:channelId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isSubscribed = user.subscribedTo.includes(req.params.channelId);
    res.json({ isSubscribed });
  } catch (error) {
    console.error('Check subscription status error:', error);
    res.status(500).json({ message: 'Server error while checking subscription status' });
  }
});

// Subscribe/unsubscribe to a channel
router.post('/:channelId', protect, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.channelId) {
      return res.status(400).json({ message: 'You cannot subscribe to your own channel' });
    }

    const [user, channel] = await Promise.all([
      User.findById(req.user._id),
      User.findById(req.params.channelId)
    ]);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const isSubscribed = user.subscribedTo.includes(req.params.channelId);

    if (isSubscribed) {
      // Unsubscribe
      user.subscribedTo = user.subscribedTo.filter(id => id.toString() !== req.params.channelId);
      channel.subscribers = channel.subscribers.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Subscribe
      user.subscribedTo.push(req.params.channelId);
      channel.subscribers.push(req.user._id);
    }

    await Promise.all([user.save(), channel.save()]);

    res.json({
      isSubscribed: !isSubscribed,
      subscriberCount: channel.subscribers.length
    });
  } catch (error) {
    console.error('Subscribe/unsubscribe error:', error);
    res.status(500).json({ message: 'Server error while updating subscription' });
  }
});

// Get all subscriptions for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('subscribedTo', 'username profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.subscribedTo);
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    res.status(500).json({ message: 'Server error while getting subscriptions' });
  }
});

module.exports = router; 