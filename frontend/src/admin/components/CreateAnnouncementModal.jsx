import React, { useState } from 'react';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const CreateAnnouncementModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    notification_type: 'announcement',
    priority: 'medium',
    expires_at: '',
    link: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.message.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/notifications/send_announcement/', form);
      showSuccess(`✅ ${response.data.message}`);
      onSuccess();
      onClose();
      setForm({
        title: '',
        message: '',
        notification_type: 'announcement',
        priority: 'medium',
        expires_at: '',
        link: '',
      });
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-blue-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      urgent: 'text-red-400',
    };
    return colors[priority] || 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">📢 Send Announcement</h2>
            <p className="text-gray-400 text-sm mt-1">This will be sent to all students</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 uppercase mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Water Maintenance Today"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase mb-1">Message *</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              placeholder="Detailed announcement message..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-1">Type</label>
              <select
                name="notification_type"
                value={form.notification_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="announcement">📢 Announcement</option>
                <option value="maintenance">🔧 Maintenance</option>
                <option value="general">📋 General</option>
                <option value="emergency">🚨 Emergency</option>
                <option value="event">📅 Event</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-1">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 ${getPriorityColor(form.priority)}`}
              >
                <option value="low" className="text-blue-400">🔵 Low</option>
                <option value="medium" className="text-yellow-400">🟡 Medium</option>
                <option value="high" className="text-orange-400">🟠 High</option>
                <option value="urgent" className="text-red-400">🔴 Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-1">Expires At</label>
              <input
                type="datetime-local"
                name="expires_at"
                value={form.expires_at}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-1">Link (Optional)</label>
              <input
                type="url"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-xs flex items-start gap-2">
              <span>⚠️</span>
              <span>This announcement will be sent as a notification to <strong>ALL students</strong>. 
              Urgent priority notifications will appear as popups.</span>
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Sending...
                </>
              ) : (
                'Send to All Students'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;