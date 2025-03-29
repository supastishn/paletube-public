const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Get comments for a video
router.get('/video/:videoId', commentController.getVideoComments);

// Protected routes
router.post('/video/:videoId', protect, commentController.addComment);
router.post('/:commentId/reply', protect, commentController.addReply);
router.delete('/:commentId', protect, commentController.deleteComment);
router.post('/:commentId/rate', protect, commentController.rateComment);

module.exports = router; 