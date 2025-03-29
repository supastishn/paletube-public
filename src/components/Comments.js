import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';

const Comments = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/comments/video/${videoId}`);
      setComments(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load comments');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/comments/video/${videoId}`,
        { text: newComment },
        {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        }
      );
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err) {
      setError('Failed to post comment');
    }
  };

  const handleReply = async (commentId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/comments/${commentId}/reply`,
        { text: replyText },
        {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        }
      );
      
      setComments(comments.map(comment => 
        comment._id === commentId ? response.data : comment
      ));
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      setError('Failed to post reply');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        }
      );
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  const handleRate = async (commentId, action) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/comments/${commentId}/rate`,
        { action },
        {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        }
      );
      
      setComments(comments.map(comment => 
        comment._id === commentId ? {
          ...comment,
          likes: response.data.likes,
          dislikes: response.data.dislikes,
          liked: response.data.liked,
          disliked: response.data.disliked
        } : comment
      ));
    } catch (err) {
      setError('Failed to rate comment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="comments-section">
      <h3>{comments.length} Comments</h3>
      
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={currentUser ? "Add a comment..." : "Please login to comment"}
          className="form-control"
          disabled={!currentUser}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!currentUser || !newComment.trim()}
        >
          Comment
        </button>
      </form>

      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment._id} className="comment">
            <div className="comment-header">
              <img 
                src={`${API_BASE_URL}${comment.user.profilePicture}`}
                alt={comment.user.username}
                className="comment-avatar"
                onError={(e) => {
                  e.target.src = `${API_BASE_URL}/uploads/profiles/default-profile.svg`;
                }}
              />
              <span className="comment-username">{comment.user.username}</span>
              <span className="comment-date">{formatDate(comment.createdAt)}</span>
            </div>
            
            <div className="comment-content">
              <p>{comment.text}</p>
            </div>
            
            <div className="comment-actions">
              <button 
                onClick={() => handleRate(comment._id, 'like')}
                className={`action-button ${comment.liked ? 'liked' : ''}`}
                disabled={!currentUser}
              >
                <i className="fas fa-thumbs-up"></i> {comment.likes}
              </button>
              
              <button 
                onClick={() => handleRate(comment._id, 'dislike')}
                className={`action-button ${comment.disliked ? 'disliked' : ''}`}
                disabled={!currentUser}
              >
                <i className="fas fa-thumbs-down"></i> {comment.dislikes}
              </button>
              
              <button 
                onClick={() => setReplyingTo(comment._id)}
                className="action-button"
                disabled={!currentUser}
              >
                Reply
              </button>
              
              {currentUser && currentUser._id === comment.user._id && (
                <button 
                  onClick={() => handleDelete(comment._id)}
                  className="action-button text-danger"
                >
                  Delete
                </button>
              )}
            </div>

            {replyingTo === comment._id && (
              <div className="reply-form">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="form-control"
                />
                <div className="reply-actions">
                  <button 
                    onClick={() => handleReply(comment._id)}
                    className="btn btn-primary btn-sm"
                    disabled={!replyText.trim()}
                  >
                    Reply
                  </button>
                  <button 
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="replies">
                {comment.replies.map(reply => (
                  <div key={reply._id} className="reply">
                    <div className="comment-header">
                      <img 
                        src={`${API_BASE_URL}${reply.user.profilePicture}`}
                        alt={reply.user.username}
                        className="comment-avatar"
                        onError={(e) => {
                          e.target.src = `${API_BASE_URL}/uploads/profiles/default-profile.svg`;
                        }}
                      />
                      <span className="comment-username">{reply.user.username}</span>
                      <span className="comment-date">{formatDate(reply.createdAt)}</span>
                    </div>
                    <div className="comment-content">
                      <p>{reply.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments; 