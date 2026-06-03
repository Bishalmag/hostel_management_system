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
        // Update existing feedback
        await api.put(`/feedback/${existingFeedback.id}/`, {
          rating: form.rating,
          comment: form.comment,
        });
        setMessage({ type: 'success', text: 'Feedback updated successfully! Thank you for your input.' });
      } else {
        // Create new feedback
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
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <svg
            className={`w-10 h-10 md:w-12 md:h-12 ${
              i <= currentRating ? 'text-yellow-400' : 'text-gray-600'
            } fill-current transition-colors`}
            fill="none"
            stroke="currentColor"
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-500/20 rounded-xl">
          <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {existingFeedback ? 'Update Your Feedback' : 'Share Your Feedback'}
          </h1>
          <p className="text-gray-400 mt-1">
            {existingFeedback 
              ? 'Thank you for updating your feedback. We value your opinion!' 
              : 'Your feedback helps us improve our services. Please share your experience.'}
          </p>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`px-4 py-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 space-y-8">
          {/* Rating Section */}
          <div className="text-center">
            <label className="block text-sm text-gray-400 mb-4">
              How would you rate your experience?
            </label>
            <div className="flex justify-center gap-2 md:gap-3">
              {renderStars()}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {form.rating === 1 && 'Very Poor - Needs significant improvement'}
              {form.rating === 2 && 'Poor - Below expectations'}
              {form.rating === 3 && 'Average - Met basic expectations'}
              {form.rating === 4 && 'Good - Satisfied with the service'}
              {form.rating === 5 && 'Excellent - Exceeded expectations!'}
            </p>
          </div>

          {/* Comment Section */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Your Comments (Optional)
            </label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              rows={5}
              placeholder="Please share your thoughts, suggestions, or any issues you encountered..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition resize-none"
            />
          </div>

          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your feedback is anonymous to other users and helps us improve our services.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/students/homepage')}
            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || form.rating === 0}
            className="flex-1 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Feedback;