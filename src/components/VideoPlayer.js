import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import Comments from './Comments';
import '../styles/Comments.css';
import EditVideoModal from './EditVideoModal';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/videos/${id}`);
        setVideo(response.data);
        setLikes(response.data.likes);
        setDislikes(response.data.dislikes);
        
        // Fetch subscriber count
        const subscriberResponse = await axios.get(`${API_BASE_URL}/api/subscriptions/count/${response.data.uploader._id}`);
        setSubscriberCount(subscriberResponse.data.count);
        
        // Only check like/dislike and subscription status if user is logged in
        if (currentUser && currentUser.token) {
          setIsLiked(response.data.likedBy?.includes(currentUser._id));
          setIsDisliked(response.data.dislikedBy?.includes(currentUser._id));
          
          // Check subscription status
          try {
            const statusResponse = await axios.get(
              `${API_BASE_URL}/api/subscriptions/status/${response.data.uploader._id}`,
              {
                headers: { Authorization: `Bearer ${currentUser.token}` }
              }
            );
            setIsSubscribed(statusResponse.data.isSubscribed);
          } catch (err) {
            console.error('Error checking subscription status:', err);
            // Don't let subscription status error affect video loading
          }
        }
        
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          navigate('/');
          return;
        }
        setError('Failed to load video. Please try again later.');
        setLoading(false);
        console.error('Error fetching video:', err);
      }
    };

    fetchVideo();
  }, [id, navigate, currentUser]);

  const handleRate = async (action) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/videos/${id}/rate`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        }
      );
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);
      setIsLiked(response.data.liked);
      setIsDisliked(response.data.disliked);
    } catch (err) {
      console.error('Error rating video:', err);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/subscriptions/${video.uploader._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        }
      );

      setIsSubscribed(response.data.isSubscribed);
      setSubscriberCount(prev => response.data.isSubscribed ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Error updating subscription:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleUpdate = (updatedVideo) => {
    setVideo(updatedVideo);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`${API_BASE_URL}/api/videos/${video._id}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      navigate('/');
    } catch (err) {
      console.error('Error deleting video:', err);
      alert('Failed to delete video. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle video error
  const handleVideoError = () => {
    setVideoError(true);
  };

  // Handle poster image error
  const handlePosterError = (e) => {
    e.target.src = 'https://via.placeholder.com/1280x720?text=Video+Unavailable';
  };

  if (loading) {
    return <div className="container">Loading video...</div>;
  }

  if (error) {
    return <div className="container">{error}</div>;
  }

  if (!video) {
    return <div className="container">Video not found</div>;
  }

  return (
    <div className="container">
      <div className="video-player-container">
        {video.status === 'processing' ? (
          <div className="video-processing">
            <div className="processing-message">
              <i className="fas fa-cog fa-spin"></i>
              <p>Video is being processed. Please wait...</p>
              <p className="processing-info">We're optimizing your video to 480p 30fps for better streaming.</p>
            </div>
          </div>
        ) : video.status === 'failed' ? (
          <div className="video-error">
            <img 
              src="https://via.placeholder.com/1280x720?text=Processing+Failed" 
              alt="Processing failed" 
              className="video-player"
            />
            <p className="error-message">Video processing failed. The original video is still available.</p>
          </div>
        ) : videoError ? (
          <div className="video-error">
            <img 
              src="https://via.placeholder.com/1280x720?text=Video+Unavailable" 
              alt="Video unavailable" 
              className="video-player"
            />
            <p className="error-message">This video is unavailable. It may have been removed or is temporarily inaccessible.</p>
          </div>
        ) : (
          <video 
            className="video-player" 
            src={`${API_BASE_URL}${video.filepath}`} 
            controls 
            autoPlay
            poster={`${API_BASE_URL}${video.thumbnailPath}`}
            onError={handleVideoError}
            onPosterError={handlePosterError}
          ></video>
        )}
        
        <div className="video-details">
          <h1>{video.title}</h1>
          <div className="video-stats">
            <span>{video.views} views • {formatDate(video.createdAt)}</span>
          </div>
          
          <div className="video-actions">
            <button 
              className={`action-button ${isLiked ? 'liked' : ''}`} 
              onClick={() => handleRate('like')}
            >
              <i className={`fas fa-thumbs-up ${isLiked ? 'text-primary' : ''}`}></i> 
              {likes} {likes === 1 ? 'Like' : 'Likes'}
            </button>
            <button 
              className={`action-button ${isDisliked ? 'disliked' : ''}`} 
              onClick={() => handleRate('dislike')}
            >
              <i className={`fas fa-thumbs-down ${isDisliked ? 'text-danger' : ''}`}></i> 
              {dislikes} {dislikes === 1 ? 'Dislike' : 'Dislikes'}
            </button>
            {currentUser && currentUser._id === video.uploader._id && (
              <div className="video-management">
                <button
                  className="edit-button"
                  onClick={handleEdit}
                  disabled={isDeleting}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button
                  className="delete-button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
          
          <div className="uploader-info">
            <div className="uploader-details-container">
              <Link to={`/channel/${video.uploader._id}`} className="uploader-link">
                <img 
                  src={`${API_BASE_URL}${video.uploader.profilePicture}`}
                  alt={video.uploader.username}
                  className="uploader-avatar"
                  onError={(e) => {
                    e.target.src = `${API_BASE_URL}/default-avatar.png`;
                  }}
                />
                <div className="uploader-details">
                  <h3>{video.uploader.username}</h3>
                  <span className="subscriber-count">{subscriberCount} {subscriberCount === 1 ? 'subscriber' : 'subscribers'}</span>
                </div>
              </Link>
              {currentUser && currentUser._id !== video.uploader._id && (
                <button
                  className={`subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
                  onClick={handleSubscribe}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              )}
            </div>
          </div>
          
          <div className="video-description">
            <p>{video.description}</p>
          </div>
        </div>

        <Comments videoId={id} />
      </div>

      {showEditModal && (
        <EditVideoModal
          video={video}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default VideoPlayer; 