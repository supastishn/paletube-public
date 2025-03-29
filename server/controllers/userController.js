const Ad = require('../models/Ad');

// Get all pending ads
exports.getPendingAds = async (req, res) => {
  try {
    // Check if the user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

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
};