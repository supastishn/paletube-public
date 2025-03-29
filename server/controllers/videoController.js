const Video = require('../models/Video');
const { View, Ad } = require('../models/View');
const fs = require('fs').promises;
const path = require('path');
const { processUploadedVideo } = require('../utils/videoProcessor');

// In-memory cache for rate limiting
const viewCache = new Map();

// Clean up old cache entries every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [key, timestamp] of viewCache.entries()) {
    if (timestamp < oneHourAgo) {
      viewCache.delete(key);
    }
  }
}, 3600000);

// Get all videos
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ visibility: 'public' })
      .populate('uploader', 'username profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ message: 'Error fetching videos' });
  }
};

// Search videos
const searchVideos = async (req, res) => {
  try {
    const { query } = req.query;
    
    const videos = await Video.find({
      $and: [
        { visibility: 'public' },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .populate('uploader', 'username profilePicture')
    .sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (err) {
    console.error('Error searching videos:', err);
    res.status(500).json({ message: 'Error searching videos' });
  }
};

// Get a single video by ID with rate-limited view counting
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploader', 'username profilePicture');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Get client IP address
    const ip = req.ip;
    
    // Create a unique key for this video and IP
    const viewKey = `${video._id}-${ip}`;
    
    // Check if this IP has viewed this video recently (in memory)
    const lastViewTime = viewCache.get(viewKey);
    const now = Date.now();
    
    if (!lastViewTime || (now - lastViewTime) > 3600000) { // 1 hour cooldown
      try {
        // Check MongoDB for views in the last 24 hours
        const existingView = await View.findOne({
          videoId: video._id,
          ip,
          timestamp: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        
        if (!existingView) {
          // Create new view record
          await View.create({
            videoId: video._id,
            ip
          });
          
          // Increment view count
          video.views += 1;
          await video.save();
          
          // Update cache
          viewCache.set(viewKey, now);
        }
      } catch (viewError) {
        console.error('Error processing view:', viewError);
        // Continue serving the video even if view counting fails
      }
    }
    
    res.status(200).json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload a new video
const uploadVideo = async (req, res) => {
  try {
    if (!req.files || !req.files.video || !req.files.thumbnail) {
      return res.status(400).json({ message: 'Please upload both video and thumbnail' });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];
    const { title, description } = req.body;

    // Create video document
    const video = new Video({
      title,
      description,
      filename: videoFile.filename,
      filepath: `/uploads/${videoFile.filename}`,
      thumbnail: thumbnailFile.filename,
      thumbnailPath: `/uploads/thumbnails/${thumbnailFile.filename}`,
      uploader: req.user._id,
      user: req.user._id,
      duration: 0,
      status: 'processing' // Add status to track processing state
    });

    // Save initial video entry
    await video.save();
    
    try {
      // Process the video (compress to 480p 30fps)
      await processUploadedVideo(path.join(__dirname, '..', 'uploads', videoFile.filename));
      
      // Update video status to completed
      video.status = 'completed';
      await video.save();
    } catch (processError) {
      console.error('Error processing video:', processError);
      video.status = 'failed';
      await video.save();
      // Continue with the response as the original video is still available
    }

    await video.populate('uploader', 'username profilePicture');
    res.status(201).json(video);
  } catch (err) {
    console.error('Error uploading video:', err);
    res.status(500).json({ message: 'Error uploading video' });
  }
};

// Update video details
const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    if (video.uploader.toString() !== req.user._id.toString() && !req.user.admin) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }

    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.visibility) updates.visibility = req.body.visibility;
    
    if (req.file) {
      // Delete old thumbnail
      try {
        await fs.unlink(path.join(__dirname, '..', 'uploads', 'thumbnails', video.thumbnail));
      } catch (err) {
        console.error('Error deleting old thumbnail:', err);
      }
      
      updates.thumbnail = req.file.filename;
      updates.thumbnailPath = `/uploads/thumbnails/${req.file.filename}`;
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate('uploader', 'username profilePicture');
    
    res.json(updatedVideo);
  } catch (err) {
    console.error('Error updating video:', err);
    res.status(500).json({ message: 'Error updating video' });
  }
};

// Delete a video
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    if (video.uploader.toString() !== req.user._id.toString() && !req.user.admin) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    // Delete video and thumbnail files
    try {
      await fs.unlink(path.join(__dirname, '..', video.filepath));
      await fs.unlink(path.join(__dirname, '..', video.thumbnailPath));
    } catch (err) {
      console.error('Error deleting video files:', err);
    }

    await video.remove();
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({ message: 'Error deleting video' });
  }
};

// Like/Dislike a video
const rateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user._id;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Initialize arrays if they don't exist
    if (!video.likedBy) video.likedBy = [];
    if (!video.dislikedBy) video.dislikedBy = [];

    const isLiked = video.likedBy.includes(userId);
    const isDisliked = video.dislikedBy.includes(userId);

    // Remove any existing rating
    if (isLiked) {
      video.likedBy.pull(userId);
      video.likes = Math.max(0, video.likes - 1);
    }
    if (isDisliked) {
      video.dislikedBy.pull(userId);
      video.dislikes = Math.max(0, video.dislikes - 1);
    }

    // Add new rating
    if (action === 'like' && !isLiked) {
      video.likedBy.push(userId);
      video.likes += 1;
    } else if (action === 'dislike' && !isDisliked) {
      video.dislikedBy.push(userId);
      video.dislikes += 1;
    }

    await video.save();

    res.json({
      likes: video.likes,
      dislikes: video.dislikes,
      liked: video.likedBy.includes(userId),
      disliked: video.dislikedBy.includes(userId)
    });
  } catch (err) {
    console.error('Error rating video:', err);
    res.status(500).json({ message: 'Error rating video' });
  }
};

// Get videos by channel ID
const getVideosByChannel = async (req, res) => {
  try {
    const videos = await Video.find({ 
      uploader: req.params.id,
      visibility: 'public'
    })
    .populate('uploader', 'username profilePicture')
    .sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (err) {
    console.error('Error fetching channel videos:', err);
    res.status(500).json({ message: 'Error fetching channel videos' });
  }
};

// Upload a new ad
const uploadAd = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an ad image or video' });
    }

    const { adType, adLink } = req.body;
    const adImageFile = req.file;

    // Create ad document
    const ad = new Ad({
      adType,
      adLink,
      filename: adImageFile.filename,
      filepath: `/uploads/${adImageFile.filename}`, // Adjust path as needed
      // Add other ad details as needed (budget, schedule, category, etc.)
    });

    // Save ad to MongoDB
    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    console.error('Error uploading ad:', error);
    res.status(500).json({ message: 'Error uploading ad' });
  }
};

// Get pending ads
const getPendingAds = async (req, res) => {
  try {
    const ads = await Ad.find({ status: 'pending' });
    res.json(ads);
  } catch (error) {
    console.error('Error fetching pending ads:', error);
    res.status(500).json({ message: 'Error fetching pending ads' });
  }
};

// Approve an ad
const approveAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    ad.status = 'approved';
    ad.approvedBy = req.user._id;
    ad.approvedAt = new Date();
    await ad.save();

    // Log the approval action
    console.log(`Ad ${ad._id} approved by ${req.user.username} at ${ad.approvedAt}`);

    res.json({ message: 'Ad approved successfully' });
  } catch (error) {
    console.error('Error approving ad:', error);
    res.status(500).json({ message: 'Error approving ad' });
  }
};

// Reject an ad
const rejectAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    // Implement reject logic here (e.g., set status to 'rejected')
    ad.status = 'rejected';
    ad.rejectedBy = req.user._id;
    ad.rejectedAt = new Date();
    await ad.save();

    // Log the rejection action
    console.log(`Ad ${ad._id} rejected by ${req.user.username} at ${ad.rejectedAt}`);

    res.json({ message: 'Ad rejected successfully' });
  } catch (error) {
    console.error('Error rejecting ad:', error);
    res.status(500).json({ message: 'Error rejecting ad' });
  }
};

module.exports = {
  getVideos,
  searchVideos,
  getVideoById,
  uploadVideo,
  updateVideo,
  deleteVideo,
  rateVideo,
  getVideosByChannel,
  uploadAd,
  getPendingAds,
  approveAd,
  rejectAd
};