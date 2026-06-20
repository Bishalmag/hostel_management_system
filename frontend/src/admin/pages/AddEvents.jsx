// src/admin/views/AddEvent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const AddEvent = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'general',
    start_date: '',
    end_date: '',
    location: '',
    is_active: true,
    is_featured: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      showError('Please enter a title', 'Validation Error');
      return;
    }
    if (!form.description.trim()) {
      showError('Please enter a description', 'Validation Error');
      return;
    }
    if (!form.start_date) {
      showError('Please select a start date', 'Validation Error');
      return;
    }
    if (!form.end_date) {
      showError('Please select an end date', 'Validation Error');
      return;
    }
    if (new Date(form.start_date) >= new Date(form.end_date)) {
      showError('End date must be after start date', 'Validation Error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/events/', form);
      showSuccess('Event created successfully!', 'Success');
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (err) {
      console.error('Error creating event:', err);
      showError(err.response?.data?.message || 'Failed to create event', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/admin/events')}
          className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm"
        >
          ← Back to Events
        </button>
        <h1 className="text-2xl font-bold text-white">Add New Event</h1>
        <p className="text-gray-400 text-sm mt-1">Create a new event announcement for students</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
            Event Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., Freshers Welcome Party, Sports Day"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the event in detail..."
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
            Event Type
          </label>
          <select
            name="event_type"
            value={form.event_type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="general">General</option>
            <option value="academic">Academic</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="maintenance">Maintenance</option>
            <option value="emergency">Emergency</option>
            <option value="holiday">Holiday</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g., Main Hall, Sports Ground, Hostel Common Room"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
              Start Date <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              min={getTodayDateTime()}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
              End Date <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              min={form.start_date || getTodayDateTime()}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-cyan-500"
            />
            <span className="text-sm text-gray-400">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              checked={form.is_featured}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-yellow-500"
            />
            <span className="text-sm text-gray-400">⭐ Featured Event</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={() => navigate('/admin/events')}
            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Creating...
              </>
            ) : (
              'Create Event'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEvent;