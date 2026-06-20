// src/admin/views/EditEvent.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}/`);
      const event = response.data;
      
      // Format dates for datetime-local input
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
      };
      
      setForm({
        title: event.title || '',
        description: event.description || '',
        event_type: event.event_type || 'general',
        start_date: formatDateForInput(event.start_date),
        end_date: formatDateForInput(event.end_date),
        location: event.location || '',
        is_active: event.is_active !== undefined ? event.is_active : true,
        is_featured: event.is_featured !== undefined ? event.is_featured : false,
      });
    } catch (err) {
      console.error('Error fetching event:', err);
      showError('Failed to load event details', 'Error');
      navigate('/admin/events');
    } finally {
      setLoading(false);
    }
  };

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

    setSubmitting(true);
    try {
      await api.patch(`/events/${id}/`, form);
      showSuccess('Event updated successfully!', 'Success');
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (err) {
      console.error('Error updating event:', err);
      showError(err.response?.data?.message || 'Failed to update event', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          Loading event details...
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-white">Edit Event</h1>
        <p className="text-gray-400 text-sm mt-1">Update event details</p>
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
              min={form.start_date}
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

        {/* Info Box */}
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-cyan-400 text-sm font-medium">Note:</p>
              <p className="text-gray-400 text-sm mt-1">
                Events marked as <span className="text-yellow-400">Featured</span> will appear prominently on the student dashboard.
                Inactive events will not be visible to students.
              </p>
            </div>
          </div>
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
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;