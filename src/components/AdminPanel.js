import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './AdminPanel.css';

const AdminPanel = () => {
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/video/admin/ads/${id}/approve`);
      setAds(ads.filter(ad => ad._id !== id));
    } catch (error) {
      console.error('Error approving ad:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/video/admin/ads/${id}/reject`);
      setAds(ads.filter(ad => ad._id !== id));
    } catch (error) {
      console.error('Error rejecting ad:', error);
    }
  };

  const handleViewDetails = (ad) => {
    setSelectedAd(ad);
    setShowModal(true);
  };

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/admin/ads/pending`);
        setAds(response.data);
      } catch (error) {
        console.error('Error fetching ads:', error);
      }
    };

    fetchAds();
  }, []);

  const calculateAge = (date) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    const age = Math.floor(diff / (1000 * 60 * 60 * 24));
    return age;
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Pending Advertisements</p>
      <ul>
        {ads.map(ad => (
          <li key={ad._id}>
            <p>Ad Type: {ad.adType}</p>
            <p>Category: {ad.category}</p>
            <p>Budget: {ad.budget}</p>
            <p>Schedule: {ad.schedule}</p>
            <p>Age: {calculateAge(ad.createdAt)} days</p>
            <button onClick={() => handleApprove(ad._id)}>Approve</button>
            <button onClick={() => handleReject(ad._id)}>Reject</button>
            <button onClick={() => handleViewDetails(ad)}>View Details</button>
          </li>
        ))}
      </ul>

      {showModal && selectedAd && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>Ad Details</h2>
            <p>Ad Type: {selectedAd.adType}</p>
            <p>Category: {selectedAd.category}</p>
            <p>Budget: {selectedAd.budget}</p>
            <p>Schedule: {selectedAd.schedule}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
