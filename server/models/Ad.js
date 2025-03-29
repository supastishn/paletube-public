const mongoose = require('mongoose');

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

module.exports = Ad;