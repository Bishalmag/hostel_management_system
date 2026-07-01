import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const Feedback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [existingFeedback, setExistingFeedback] = useState(null);
  
  const [form, setForm] = useState({
    rating: 0,
    comment: '',
  });
  
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchUserFeedback();
  }, []);

  const fetchUserFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedback/');
      const feedbacks = response.data.results || response.data;
      if (feedbacks.length > 0) {
        setExistingFeedback(feedbacks[0]);
        setForm({
          rating: feedbacks[0].rating,
          comment: feedbacks[0].comment || '',
        });
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) => {
    setForm(prev => ({ ...prev, rating }));
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.rating === 0) {
      setMessage({ type: 'error', text: 'Please select a rating.' });
      return;
    }
    
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      if (existingFeedback) {
        await api.put(`/feedback/${existingFeedback.id}/`, {
          rating: form.rating,
          comment: form.comment,
        });
        setMessage({ type: 'success', text: 'Feedback updated successfully! Thank you for your input.' });
      } else {
        await api.post('/feedback/', {
          rating: form.rating,
          comment: form.comment,
        });
        setMessage({ type: 'success', text: 'Feedback submitted successfully! Thank you for your input.' });
      }
      
      setTimeout(() => {
        navigate('/students/homepage');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setMessage({ type: 'error', text: 'Failed to submit feedback. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

 const renderStars = () => {
  const stars = [];
  const currentRating = hoverRating || form.rating;
  
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <button
        key={i}
        type="button"
        onClick={() => handleRatingClick(i)}
        onMouseEnter={() => setHoverRating(i)}
        onMouseLeave={() => setHoverRating(0)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          padding: 0,
          transform: 'scale(1)',
        }}
      >
        <svg
          style={{
            width: '40px',
            height: '40px',
            color: i <= currentRating ? '#f5a623' : '#1a3050',
            fill: 'currentColor',
            transition: 'color 0.2s ease',
          }}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    );
  }
  return stars;
};

  if (loading) {
    return (
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '24px' }}>
        <div style={{ textAlign: 'center', color: '#6b8aaa', padding: '48px 0' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>
          {existingFeedback ? 'Update Your Feedback' : 'Share Your Feedback'}
        </h1>
        <p style={{
          color: '#6b8aaa',
          marginTop: '4px',
        }}>
          {existingFeedback 
            ? 'Thank you for updating your feedback. We value your opinion!' 
            : 'Your feedback helps us improve our services. Please share your experience.'}
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: message.type === 'success' 
              ? 'rgba(29, 219, 168, 0.1)' 
              : 'rgba(248, 113, 113, 0.1)',
            color: message.type === 'success' 
              ? '#1ddba8' 
              : '#f87171',
            borderColor: message.type === 'success' 
              ? 'rgba(29, 219, 168, 0.3)' 
              : 'rgba(248, 113, 113, 0.3)',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Feedback Form */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
        }}>
          {/* Rating Section */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: '#6b8aaa',
              marginBottom: '16px',
            }}>
              How would you rate your experience?
            </label>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
            }}>
              {renderStars()}
            </div>
            <p style={{
              fontSize: '12px',
              color: '#3a5070',
              marginTop: '12px',
            }}>
              {form.rating === 1 && 'Very Poor - Needs significant improvement'}
              {form.rating === 2 && 'Poor - Below expectations'}
              {form.rating === 3 && 'Average - Met basic expectations'}
              {form.rating === 4 && 'Good - Satisfied with the service'}
              {form.rating === 5 && 'Excellent - Exceeded expectations!'}
            </p>
          </div>

          {/* Comment Section */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: '#6b8aaa',
              marginBottom: '8px',
            }}>
              Your Comments (Optional)
            </label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              rows={5}
              placeholder="Please share your thoughts, suggestions, or any issues you encountered..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#0a1628',
                border: '1px solid #1a3050',
                borderRadius: '8px',
                color: '#eaf2ff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f5a623';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 166, 35, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1a3050';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{
            background: 'rgba(18, 36, 72, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #1a3050',
            marginTop: '16px',
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6b8aaa',
              margin: 0,
            }}>
              Your feedback is anonymous to other users and helps us improve our services.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/students/homepage')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'rgba(18, 36, 72, 0.5)',
              color: '#c8daf0',
              fontWeight: 500,
              borderRadius: '8px',
              border: '1px solid #1a3050',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(18, 36, 72, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(18, 36, 72, 0.5)';
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || form.rating === 0}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: (submitting || form.rating === 0) ? '#1a3050' : '#f5a623',
              color: (submitting || form.rating === 0) ? '#3a5070' : '#0a1628',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: (submitting || form.rating === 0) ? 'not-allowed' : 'pointer',
              opacity: (submitting || form.rating === 0) ? 0.5 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (!submitting && form.rating !== 0) {
                e.currentTarget.style.background = '#e09515';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting && form.rating !== 0) {
                e.currentTarget.style.background = '#f5a623';
              }
            }}
          >
            {submitting ? (
              <>
                <span style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #0a1628',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Submitting...
              </>
            ) : (
              existingFeedback ? 'Update Feedback' : 'Submit Feedback'
            )}
          </button>
        </div>
      </form>

      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Feedback;