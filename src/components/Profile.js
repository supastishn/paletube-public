import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const Profile = () => {
  const { currentUser, updateProfile, logout, error } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  // Password changing from profile was removed. Will keep these methods if we need to re add them in the future
  const password = ''
  const setPassword = () => {}
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Set initial values
    setUsername(currentUser.username || '');
    setEmail(currentUser.email || '');
    setBio(currentUser.bio || '');
    setProfilePreview(
      currentUser.profilePicture 
        ? `${API_BASE_URL}${currentUser.profilePicture}` 
        : ''
    );
  }, [currentUser, navigate]);
  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    
    // Validate form
    if (password && password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    if (password && password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const userData = {
        username,
        email,
        bio
      };
      
      if (password) {
        userData.password = password;
      }
      
      await updateProfile(userData, profilePicture);
      setSuccessMessage('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.log(err)
      setFormError(error || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Handle profile picture error
  const handleImageError = (e) => {
    e.target.src = `${API_BASE_URL}/uploads/profiles/default-profile.svg`;
  };
  
  if (!currentUser) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container">
      <div className="profile-container">
        <h2>My Profile</h2>
        
        {formError && <div className="alert alert-danger">{formError}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        
        <div className="profile-content">
          <div className="profile-picture-section">
            <div className="profile-picture">
              <img 
                src={profilePreview || `${API_BASE_URL}${currentUser.profilePicture}`} 
                alt={username} 
                onError={handleImageError}
              />
            </div>
            <div className="profile-picture-upload">
              <label htmlFor="profilePicture" className="btn btn-secondary">
                Change Profile Picture
              </label>
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          
          <div className="profile-form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength="3"
                  maxLength="30"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  className="form-control"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength="500"
                  rows="3"
                />
              </div>
              
            
              
              <div className="profile-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Profile'}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 