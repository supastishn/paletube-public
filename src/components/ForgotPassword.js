import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/forgot-password`, { email });
      setStatus('success');
      setMessage(response.data.message);
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Failed to send password reset email. Please try again.'
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Reset Password</h2>
        
        {message && (
          <div className={`alert ${status === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}
        
        {status !== 'success' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'submitting'}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <p className="text-center">
            Please check your email for password reset instructions.
          </p>
        )}
        
        <div className="auth-links">
          <p>
            Remember your password? <Link to="/login">Login</Link>
          </p>
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 