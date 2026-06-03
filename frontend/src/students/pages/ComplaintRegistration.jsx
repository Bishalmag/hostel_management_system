import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const ComplaintRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [form, setForm] = useState({
    title: '',
    description: '',
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title.' });
      return;
    }
    
    if (!form.description.trim()) {
      setMessage({ type: 'error', text: 'Please enter a description.' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Use the correct endpoint - matches your urls.py configuration
      const response = await api.post('/complaints/', {
        title: form.title,
        description: form.description,
      });
      
      console.log('Complaint submitted:', response.data);
      
      setMessage({ 
        type: 'success', 
        text: 'Complaint registered successfully! You can track its status in Registered Complaints.' 
      });
      
      // Reset form
      setForm({ title: '', description: '' });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/students/complaints');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting complaint:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setMessage({ 
          type: 'error', 
          text: 'Please login again to submit a complaint.' 
        });
      } else if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          setMessage({ 
            type: 'error', 
            text: Array.isArray(firstError) ? firstError[0] : firstError 
          });
        } else {
          setMessage({ type: 'error', text: errorData });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to register complaint. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/20 rounded-xl">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Register Complaint</h1>
            <p className="text-gray-400 mt-1">Submit your complaint and we'll address it promptly</p>
          </div>
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

      {/* Complaint Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
              Complaint Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Water Supply Issue, Noisy Neighbors, Maintenance Required"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              placeholder="Please provide detailed information about your complaint..."
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition resize-none"
              required
            />
          </div>

          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your complaint will be reviewed within 24-48 hours. You can track its status in the "Registered Complaints" section.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/students/complaints')}
            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintRegistration;