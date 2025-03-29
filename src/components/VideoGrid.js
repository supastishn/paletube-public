import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const VideoGrid = ({ videos }) => {
  // Format view count
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else {
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    }
  };

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <Link to={`/video/${video._id}`} key={video._id} className="video-card">
          <img
            src={`${API_BASE_URL}${video.thumbnailPath}`}
            alt={video.title}
            className="video-thumbnail"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/320x180?text=Video+Thumbnail';
            }}
          />
          <div className="video-info">
            <h3 className="video-title">{video.title}</h3>
            <div className="video-uploader">
              <img
                src={`${API_BASE_URL}${video.uploader.profilePicture}`}
                alt={video.uploader.username}
                className="uploader-thumbnail"
                onError={(e) => {
                  e.target.src = `${API_BASE_URL}/default-avatar.png`;
                }}
              />
              <span>{video.uploader.username}</span>
            </div>
            <div className="video-meta">
              <span>{formatViews(video.views)} views</span>
              <span>{formatDate(video.createdAt)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default VideoGrid; 