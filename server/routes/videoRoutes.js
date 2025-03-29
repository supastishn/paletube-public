const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const videoController = require('../controllers/videoController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Configure multer for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      cb(null, path.join(__dirname, '../uploads/thumbnails'));
    } else {
      cb(null, path.join(__dirname, '../uploads'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only accept video files and images for thumbnails
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    const allowedTypes = /mp4|mov|avi|wmv|flv|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  } else if (file.fieldname === 'thumbnail') {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails!'));
    }
  } else {
    cb(new Error('Unexpected field'));
  }
};

const uploadMulter = multer({ 
  storage: videoStorage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
});

// For thumbnail-only updates
const thumbnailUpload = multer({
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for thumbnails
});

// Public routes
router.get('/', videoController.getVideos);
router.get('/search', videoController.searchVideos);
router.get('/channel/:id', videoController.getVideosByChannel);
router.get('/:id', videoController.getVideoById);

// Protected routes
router.post('/', protect, uploadMulter.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), videoController.uploadVideo);
router.put('/:id', protect, thumbnailUpload.single('thumbnail'), videoController.updateVideo);
router.delete('/:id', protect, videoController.deleteVideo);
router.post('/:id/rate', protect, videoController.rateVideo);

// Route for ad uploads
router.post('/ads', protect, uploadMulter.single('adImage'), videoController.uploadAd);

// Admin routes
router.get('/admin/ads/pending', protect, admin, videoController.getPendingAds);
router.put('/admin/ads/:id/approve', protect, admin, videoController.approveAd);
router.delete('/admin/ads/:id/reject', protect, admin, videoController.rejectAd);

module.exports = router;