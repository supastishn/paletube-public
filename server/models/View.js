const mongoose = require('mongoose');

const ViewSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 86400 // Document will be automatically deleted after 24 hours
  }
});

// Compound index for videoId and ip
ViewSchema.index({ videoId: 1, ip: 1 });

const adSchema = new mongoose.Schema({
  adType: {
    type: String,
    required: true,
    enum: ['video', 'banner'],
  },
  adLink: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  filepath: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
  },
  schedule: {
    type: Date,
  },
  category: {
    type: String,
  },
});

const Ad = mongoose.model('Ad', adSchema);

module.exports = {
  View: mongoose.model('View', ViewSchema),
  Ad: Ad
};