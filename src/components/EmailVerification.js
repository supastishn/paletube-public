import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/verify-email/${token}`);
        setStatus('success');
        setTimeout(() => {
          navigate('/login');
        }, 500);
      } catch (error) {
        setStatus('error');
        console.error('Email verification error:', error);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        {status === 'verifying' && (
          <>
            <h2>Verifying Your Email</h2>
            <p className="text-center">Please wait while we verify your email address...</p>
            <div className="loading-spinner"></div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <h2>Email Verified!</h2>
            <p className="text-center">
              Your email has been successfully verified. You will be redirected to the login page in a few seconds...
            </p>
            <div className="success-checkmark">
              <i className="fas fa-check-circle"></i>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <h2>Verification Failed</h2>
            <p className="text-center">
              
              The verification link is invalid or has expired. Please request a new verification email.
              
            </p>
            <div className="error-x">
              <i className="fas fa-times-circle"></i>
            </div>
            <button 
              className="btn btn-primary btn-block"
              onClick={() => navigate('/resend-verification')}
            >
              Request New Verification Email
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification; 