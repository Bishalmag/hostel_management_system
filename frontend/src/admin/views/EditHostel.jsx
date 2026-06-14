import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const inputCls = 'w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition';
const labelCls = 'block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2';

const EditHostel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchHostelDetails();
  }, [id]);

  const fetchHostelDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hostel/hostels/${id}/`);
      console.log('Fetched hostel data:', response.data);
      setForm({
        name: response.data.name || '',
        address: response.data.address || '',
        latitude: response.data.latitude !== null && response.data.latitude !== undefined ? response.data.latitude.toString() : '',
        longitude: response.data.longitude !== null && response.data.longitude !== undefined ? response.data.longitude.toString() : '',
      });
    } catch (err) {
      console.error('Error fetching hostel:', err);
      setMessage({ type: 'error', text: 'Failed to load hostel details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Hostel name is required.' });
      return;
    }
    
    if (!form.address.trim()) {
      setMessage({ type: 'error', text: 'Hostel address is required.' });
      return;
    }
    
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const updateData = {
        name: form.name,
        address: form.address,
      };
      
      // Only add lat/lng if they are valid numbers
      const lat = form.latitude ? parseFloat(form.latitude) : null;
      const lng = form.longitude ? parseFloat(form.longitude) : null;
      
      if (lat !== null && !isNaN(lat)) {
        updateData.latitude = lat;
      }
      if (lng !== null && !isNaN(lng)) {
        updateData.longitude = lng;
      }
      
      console.log('Sending update data:', updateData);
      
      const response = await api.patch(`/hostel/hostels/${id}/`, updateData);
      console.log('Update response:', response.data);
      
      setMessage({ type: 'success', text: 'Hostel updated successfully!' });
      
      setTimeout(() => {
        navigate('/admin/hostels');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating hostel:', err);
      console.error('Error response data:', err.response?.data);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData).map(([key, value]) => `${key}: ${value}`).join(', ');
          setMessage({ type: 'error', text: errorMessages });
        } else {
          setMessage({ type: 'error', text: errorData });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to update hostel. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          Loading hostel details...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/hostels')}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Hostel</h1>
            <p className="text-gray-400 text-sm mt-1">Update hostel information</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/admin/hostels/${id}/blocks`)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition"
          >
            Manage Blocks
          </button>
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

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 space-y-6">
          {/* Hostel Name */}
          <div>
            <label className={labelCls}>
              Hostel Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Boys Hostel, Girls Hostel"
              className={inputCls}
              required
            />
          </div>

          {/* Hostel Address */}
          <div>
            <label className={labelCls}>
              Hostel Address <span className="text-red-400">*</span>
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              placeholder="Enter complete address"
              className={`${inputCls} resize-none`}
              required
            />
          </div>

          {/* Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Latitude</label>
              <input 
                type="text" 
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="e.g. 27.7172"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" 
              />
              <p className="text-gray-500 text-xs mt-1">Example: 27.7172 (Kathmandu)</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Longitude</label>
              <input 
                type="text" 
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="e.g. 85.3240"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" 
              />
              <p className="text-gray-500 text-xs mt-1">Example: 85.3240 (Kathmandu)</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-cyan-400 text-sm font-medium">Note:</p>
                <p className="text-gray-400 text-sm mt-1">
                  Changes to hostel name and address will affect all associated blocks, floors, and rooms.
                  Latitude and Longitude are used for map location services.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/hostels')}
            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Links */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Other Management Options</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate(`/admin/hostels/${id}/blocks`)}
            className="flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition group"
          >
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/30 transition">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Manage Blocks</p>
              <p className="text-gray-500 text-xs">Add, edit, or delete blocks</p>
            </div>
          </button>
          
          <button
            className="flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition group opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Manage Floors</p>
              <p className="text-gray-500 text-xs">Coming soon</p>
            </div>
          </button>
          
          <button
            className="flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition group opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Manage Rooms</p>
              <p className="text-gray-500 text-xs">Coming soon</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditHostel;