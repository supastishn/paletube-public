import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DeviceVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyLoginCode } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const verified = await verifyLoginCode(verificationCode);
      
      if (verified) {
        navigate('/');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Verification Required</h2>
        <p>
          We've sent a verification code to your email address.
          Please enter the 6-digit code below to complete your login.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              pattern="[0-9]{6}"
              maxLength="6"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Complete Login'}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-link"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceVerification; 