import React, { useState } from 'react';
import './AdvertisingPortal.css';

const AdvertisingPortal = () => {
  const [adType, setAdType] = useState('');
  const [adLink, setAdLink] = useState('');
  const [adImage, setAdImage] = useState(null);

  const handleAdTypeChange = (type) => {
    setAdType(type);
    setAdLink('');
    setAdImage(null);
  };

  const handleAdLinkChange = (event) => {
    setAdLink(event.target.value);
  };

  const handleAdImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setAdImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('adType', adType);
    formData.append('adLink', adLink);
    if (adImage) {
      formData.append('adImage', adImage);
    }

    try {
      const response = await fetch('/api/ads', { // Replace with your actual API endpoint
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Handle success (e.g., show a success message)
        console.log('Ad submitted successfully!');
      } else {
        // Handle error (e.g., show an error message)
        console.error('Error submitting ad:', response.status);
      }
    } catch (error) {
      console.error('Error submitting ad:', error);
    }
  };

  return (
    <div className="advertising-portal-container">
      <h1 className="ad-portal-heading">Advertising Portal</h1>
      <h2 className="ad-portal-subheading">Select Ad Type</h2>
      <div className="ad-type-selection">
        <label>
          <input
            type="radio"
            value="video"
            checked={adType === 'video'}
            onChange={() => handleAdTypeChange('video')}
          />
          Video Ad
        </label>
        <label>
          <input
            type="radio"
            value="banner"
            checked={adType === 'banner'}
            onChange={() => handleAdTypeChange('banner')}
          />
          Banner Ad
        </label>
      </div>

      <h2>Select Category</h2>
      <div>
        <label>Category:</label>
        <select className="form-control">
          <option>Technology</option>
          <option>Sports</option>
          <option>Food</option>
          <option>Travel</option>
          <option>Fashion</option>
        </select>
      </div>

      <h2>Upload/Create Ad Creative</h2>
      {adType === 'video' && (
        <div>
          <label>Video Ad Link:</label>
          <input type="text" className="form-control" value={adLink} onChange={handleAdLinkChange} placeholder="Enter video ad link" required />
          <input type="file" className="form-control" onChange={handleAdImageUpload} accept="video/*" required />
        </div>
      )}
      {adType === 'banner' && (
        <div>
          <label>Banner Ad Link:</label>
          <input type="text" className="form-control" value={adLink} onChange={handleAdLinkChange} placeholder="Enter banner ad link" />
          <label>Upload Banner Image:</label>
          <input type="file" className="form-control" onChange={handleAdImageUpload} accept="image/*" required />
        </div>
      )}

      <h2>Set Budget and Schedule</h2>
      <div>
        <label>Budget:</label>
        <input type="number" placeholder="Daily Budget" className="form-control"/>
      </div>
      <div>
        <label>Schedule:</label>
        <input type="date" className="form-control"/> - <input type="date" className="form-control" />
      </div>

      <h2>Preview Ad Placement</h2>
      {adType === 'video' && adLink && adImage && (
        <div className="ad-preview">
          <video src={URL.createObjectURL(adImage)} width="300" height="250" controls className="ad-video"></video>
        </div>
      )}
      {adType === 'banner' && adLink && adImage && (
        <div className="ad-preview">
          <img src={URL.createObjectURL(adImage)} alt="Ad Preview" className="ad-image" />
        </div>
      )}

      <h2>Submit Campaign for Review</h2>
      
        <button className="btn btn-primary" onClick={handleSubmit}>Submit Campaign</button>
      
      <h2>Manage Existing Campaigns</h2>
      {/* Add manage campaigns UI here */}
      
    </div>
  );
};

export default AdvertisingPortal;