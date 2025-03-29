import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const checkDeviceVerification = async (user) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/device-verification/check`,
        { userId: user._id },
        { headers: { 'Authorization': `Bearer ${user.token}` }}
      );

      const { requiresVerification, deviceId } = response.data;

      if (requiresVerification) {
        // Store deviceId for later use
        localStorage.setItem('deviceId', deviceId);
        
        // Request verification code
        await axios.post(
          `${API_BASE_URL}/api/device-verification/request`,
          { 
            userId: user._id,
            email: user.email
          },
          { headers: { 'Authorization': `Bearer ${user.token}` }}
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error('Device verification check failed:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email,
        password
      });

      const user = response.data;

      // Check if device verification is needed
      const needsVerification = await checkDeviceVerification(user);

      if (needsVerification) {
        // Store user temporarily
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return { requiresVerification: true };
      }

      // If no verification needed, proceed with normal login
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return { requiresVerification: false };
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
      throw err;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('deviceId');
    localStorage.removeItem('isDeviceVerified');
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 