import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const updateProfile = async (userData, profilePicture) => {
    try {
      const formData = new FormData();
      
      // Add user data to form
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });
      
      // Add profile picture if provided
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${currentUser.token}`
        }
      };
      
      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        formData,
        config
      );
      
      // Update current user in state and localStorage
      const updatedUser = { ...currentUser, ...response.data };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      const user = response.data;
      
      // Set the user as logged in immediately
      console.log('user'
        
      );
      console.log(user);
      setCurrentUser({...user, isAdmin: user.isAdmin});
      localStorage.setItem('user', JSON.stringify({...user, isAdmin: user.isAdmin}));
      if (user) {
      }
      return { requiresVerification: false };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    }
  };

  const verifyLoginCode = async (code) => {
    try {
      if (!tempUserData) {
        throw new Error('No login attempt in progress');
      }

      const response = await axios.post(`${API_BASE_URL}/api/device-verification/verify`, {
        userId: tempUserData._id,
        code: code
      });

      if (response.data.verified) {
        // Set the user as logged in
        setCurrentUser(tempUserData);
        localStorage.setItem('user', JSON.stringify(tempUserData));
        setTempUserData(null);
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setTempUserData(null);
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    verifyLoginCode,
    updateProfile,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};