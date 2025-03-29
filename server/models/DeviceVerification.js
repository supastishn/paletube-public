const mongoose = require('mongoose');

const deviceVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verificationCode: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 10 * 60 * 1000) // 10 minutes expiry
  }
}, {
  timestamps: true
});

// Index to automatically remove expired verification attempts
deviceVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('DeviceVerification', deviceVerificationSchema); 