import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!currentUser) {
    console.log(currentUser);
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;