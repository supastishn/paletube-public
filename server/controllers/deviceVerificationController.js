const DeviceVerification = require('../models/DeviceVerification');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config()
    // Configure nodemailer (you'll need to set these environment variables)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate a random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a device ID based on user agent and IP
const generateDeviceId = (userAgent, ip) => {
  const data = `${userAgent}${ip}`;
  return crypto.createHash('md5').update(data).digest('hex');
};

// Send verification email
const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Login Verification Code - SupaTube',
    html: `
      <h2>Login Verification Required</h2>
      <p>A login attempt was detected for your account.</p>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't attempt to log in, please ignore this email and consider changing your password.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Request verification code
exports.requestVerification = async (req, res) => {
  try {
    const { userId, email } = req.body;
    const verificationCode = generateVerificationCode();
    
    // Create new verification
    const verification = new DeviceVerification({
      userId,
      verificationCode,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    await verification.save();
    await sendVerificationEmail(email, verificationCode);
    
    res.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Verification request error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
};

// Verify code
exports.verifyCode = async (req, res) => {
  try {
    const { userId, code } = req.body;
    
    const verification = await DeviceVerification.findOne({
      userId,
      verificationCode: code,
      isEmailVerified: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!verification) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }
    
    verification.isEmailVerified = true;
    await verification.save();
    
    res.json({ verified: true });
  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
};

// Check if device needs verification
exports.checkDevice = async (req, res) => {
  try {
    const { userId } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    
    const deviceId = generateDeviceId(userAgent, ipAddress);
    
    const verification = await DeviceVerification.findOne({
      userId,
      deviceId,
      isEmailVerified: true
    });
    
    res.json({ 
      requiresVerification: !verification,
      deviceId
    });
  } catch (error) {
    console.error('Device check error:', error);
    res.status(500).json({ error: 'Failed to check device status' });
  }
}; 