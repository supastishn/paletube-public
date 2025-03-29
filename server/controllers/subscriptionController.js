const Subscription = require('../models/Subscription');
const User = require('../models/User');

// Get subscriber count for a channel
exports.getSubscriberCount = async (req, res) => {
  try {
    const count = await Subscription.countDocuments({ channel: req.params.channelId });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriber count' });
  }
};

// Get subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      subscriber: req.user._id,
      channel: req.params.channelId
    });
    res.json({ isSubscribed: !!subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error checking subscription status' });
  }
};

// Get channel subscriptions (subscribers)
exports.getChannelSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ channel: req.params.channelId })
      .populate('subscriber', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching channel subscriptions' });
  }
};

// Get user subscriptions (channels subscribed to)
exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ subscriber: req.params.userId })
      .populate('channel', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user subscriptions' });
  }
};

// Toggle subscription (subscribe/unsubscribe)
exports.toggleSubscription = async (req, res) => {
  try {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    // Check if user is trying to subscribe to themselves
    if (channelId === subscriberId.toString()) {
      return res.status(400).json({ message: 'Cannot subscribe to yourself' });
    }

    // Check if channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
      subscriber: subscriberId,
      channel: channelId
    });

    if (existingSubscription) {
      // Unsubscribe
      await existingSubscription.remove();
      res.json({ message: 'Unsubscribed successfully', isSubscribed: false });
    } else {
      // Subscribe
      const subscription = new Subscription({
        subscriber: subscriberId,
        channel: channelId
      });
      await subscription.save();
      res.json({ message: 'Subscribed successfully', isSubscribed: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling subscription' });
  }
}; 