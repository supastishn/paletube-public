import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import AdminPanel from './components/AdminPanel';
import AdvertisingPortal from './components/AdvertisingPortal';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';
import SearchResults from './components/SearchResults';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Channel from './components/Channel';
import EmailVerification from './components/EmailVerification';
import ResendVerification from './components/ResendVerification';
import DeviceVerification from './components/DeviceVerification';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/advertising" element={<AdvertisingPortal />} />
              <Route path="/video/:id" element={<VideoPlayer />} />
              <Route path="/channel/:id" element={<Channel />} />
              <Route path="/upload" element={<PrivateRoute><VideoUpload /></PrivateRoute>} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/verify-email/:token" element={<EmailVerification />} />
              <Route path="/resend-verification" element={<ResendVerification />} />
              <Route path="/device-verification" element={<DeviceVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/admin-panel" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;
