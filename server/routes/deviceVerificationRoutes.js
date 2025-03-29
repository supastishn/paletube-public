const express = require('express');
const router = express.Router();
const deviceVerificationController = require('../controllers/deviceVerificationController');

// Route to request a verification code
router.post('/request', deviceVerificationController.requestVerification);

// Route to verify the code
router.post('/verify', deviceVerificationController.verifyCode);

// Route to check if device needs verification
router.post('/check', deviceVerificationController.checkDevice);

module.exports = router; 