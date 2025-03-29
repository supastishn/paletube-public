const multer = require('multer');
const path = require('path');

// Configure storage for videos and thumbnails
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      cb(null, path.join(__dirname, '../uploads/thumbnails'));
    } else if (file.fieldname === 'profilePicture') {
      cb(null, path.join(__dirname, '../uploads/profiles'));
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

// File filter for videos and thumbnails
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    // Allow common video formats
    const allowedTypes = /mp4|mov|avi|wmv|flv|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  } else if (file.fieldname === 'thumbnail') {
    // Allow common image formats
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails!'));
    }
  } else if (file.fieldname === 'profilePicture') {
    // Allow common image formats
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures!'));
    }
  } else if (file.fieldname === 'adImage') {
    const allowedTypes = /mp4|mov|avi|wmv|flv|mkv|webm|jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only video and image files are allowed for ads!'));
    }
  } else {
    cb(new Error('Unexpected field'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    files: 2 // Allow up to 2 files (video + thumbnail)
  }
});

module.exports = upload;