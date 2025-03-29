import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import VideoGrid from './VideoGrid';
import '../styles/Channel.css';

const Channel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [channelResponse, videosResponse, subscriberResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/users/${id}`),
          axios.get(`${API_BASE_URL}/api/videos/channel/${id}`),
          axios.get(`${API_BASE_URL}/api/subscriptions/count/${id}`)
        ]);

        setChannel(channelResponse.data);
        setVideos(videosResponse.data);
        setSubscriberCount(subscriberResponse.data.count);

        // Check subscription status if user is logged in
        if (currentUser) {
          try {
            const statusResponse = await axios.get(
              `${API_BASE_URL}/api/subscriptions/status/${id}`,
              {
                headers: { Authorization: `Bearer ${currentUser.token}` }
              }
            );
            setIsSubscribed(statusResponse.data.isSubscribed);
          } catch (err) {
            console.error('Error checking subscription status:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching channel data:', err);
        if (err.response?.status === 404) {
          setError('Channel not found');
        } else {
          setError('Failed to load channel data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [id, currentUser]);

  const handleSubscribe = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/subscriptions/${id}`,
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

  if (loading) {
    return (
      <div className="channel-container">
        <div className="loading-message">Loading channel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="channel-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="channel-container">
        <div className="error-message">Channel not found</div>
      </div>
    );
  }

  return (
    <div className="channel-container">
      <div className="channel-header">
        <div className="channel-info">
          <img
            src={`${API_BASE_URL}${channel.profilePicture}`}
            alt={channel.username}
            className="channel-avatar"
            onError={(e) => {
              e.target.src = `${API_BASE_URL}/default-avatar.png`;
            }}
          />
          <div className="channel-details">
            <h1>{channel.username}</h1>
            <span className="subscriber-count">
              {subscriberCount} {subscriberCount === 1 ? 'subscriber' : 'subscribers'}
            </span>
            {channel.bio && <p className="channel-bio">{channel.bio}</p>}
          </div>
          {currentUser && currentUser._id !== channel._id && (
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

      <div className="channel-videos">
        <h2>Videos</h2>
        {videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <p className="no-videos">This channel hasn't uploaded any videos yet.</p>
        )}
      </div>
    </div>
  );
};

export default Channel; 