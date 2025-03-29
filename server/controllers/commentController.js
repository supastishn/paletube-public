const Comment = require('../models/Comment');
const Video = require('../models/Video');

// Get all comments for a video
const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const comments = await Comment.find({ video: videoId })
      .populate('user', 'username profilePicture')
      .populate('replies.user', 'username profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// Add a new comment
const addComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const comment = new Comment({
      video: videoId,
      user: userId,
      text
    });

    await comment.save();

    // Populate user details before sending response
    await comment.populate('user', 'username profilePicture');

    res.status(201).json(comment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// Add a reply to a comment
const addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.replies.push({
      user: userId,
      text,
      createdAt: new Date()
    });

    await comment.save();

    // Populate user details for the entire comment including replies
    await comment.populate('user replies.user', 'username profilePicture');

    res.json(comment);
  } catch (err) {
    console.error('Error adding reply:', err);
    res.status(500).json({ message: 'Error adding reply' });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment owner
    if (comment.user.toString() !== userId.toString() &&!req.user.admin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.remove();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

// Rate a comment (like/dislike)
const rateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { action } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Initialize arrays if they don't exist
    if (!comment.likedBy) comment.likedBy = [];
    if (!comment.dislikedBy) comment.dislikedBy = [];

    const isLiked = comment.likedBy.includes(userId);
    const isDisliked = comment.dislikedBy.includes(userId);

    // Remove any existing rating
    if (isLiked) {
      comment.likedBy.pull(userId);
      comment.likes = Math.max(0, comment.likes - 1);
    }
    if (isDisliked) {
      comment.dislikedBy.pull(userId);
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    }

    // Add new rating
    if (action === 'like' && !isLiked) {
      comment.likedBy.push(userId);
      comment.likes += 1;
    } else if (action === 'dislike' && !isDisliked) {
      comment.dislikedBy.push(userId);
      comment.dislikes += 1;
    }

    await comment.save();

    res.json({
      likes: comment.likes,
      dislikes: comment.dislikes,
      liked: comment.likedBy.includes(userId),
      disliked: comment.dislikedBy.includes(userId)
    });
  } catch (err) {
    console.error('Error rating comment:', err);
    res.status(500).json({ message: 'Error rating comment' });
  }
};

module.exports = {
  getVideoComments,
  addComment,
  addReply,
  deleteComment,
  rateComment
};
