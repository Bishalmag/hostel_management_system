import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Feedback = () => {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ message: '', rating: 5 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/notifications/', {
        message: `[FEEDBACK ★${form.rating}] ${form.message}`,
      });
      setMessage({ type: 'success', text: 'Feedback submitted! Thank you.' });
      setForm({ message: '', rating: 5 });
    } catch {
      setMessage({ type: 'error', text: 'Failed to submit feedback.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <button onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-cyan-400 transition mb-3 flex items-center gap-2">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-white">Share Feedback</h1>
        <p className="text-gray-500 text-sm mt-1">Help us improve your hostel experience</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        {message.text && (
          <div className={`mb-5 px-4 py-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star rating */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-3 block">Rating</label>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button"
                  onClick={() => setForm(f => ({ ...f, rating: star }))}
                  className={`text-3xl transition-transform hover:scale-110 ${
                    star <= form.rating ? 'text-yellow-400' : 'text-gray-700'
                  }`}>
                  ★
                </button>
              ))}
              <span className="text-sm text-gray-500 ml-2">{form.rating}/5</span>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
              Your Feedback <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={5} placeholder="Share your experience..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              required
            />
          </div>

          <button type="submit" disabled={loading || !form.message.trim()}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-lg transition disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;