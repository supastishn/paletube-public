import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = `${API_BASE_URL}/uploads/profiles/default-profile.svg`;
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <i className="fas fa-play-circle"></i>
        <h1>Supa<span>Tube</span></h1>
      </Link>
      
      <SearchBar />
      
      <div className="navbar-links">
        {currentUser ? (
          <>
            <Link to="/upload" className="upload-link">
              <i className="fas fa-upload"></i> Upload
            </Link>
            <div className="user-menu">
              <Link to="/profile" className="profile-link">
                <img 
                  src={`${API_BASE_URL}${currentUser.profilePicture}`} 
                  alt={currentUser.username}
                  className="profile-thumbnail"
                  onError={handleImageError}
                />
              </Link>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="login-link">Login</Link>
            <Link to="/register" className="register-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 