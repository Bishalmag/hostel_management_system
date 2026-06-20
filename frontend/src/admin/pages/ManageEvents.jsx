// src/admin/views/ManageEvents.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const ManageEvents = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/');
      const allEvents = response.data.results || response.data;
      setEvents(allEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      showError('Failed to load events', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}/`);
      showSuccess('Event deleted successfully!', 'Deleted');
      fetchEvents();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting event:', err);
      showError('Failed to delete event', 'Error');
    }
  };

  const handleToggleStatus = async (eventId, currentStatus) => {
    try {
      await api.patch(`/events/${eventId}/`, {
        is_active: !currentStatus
      });
      showSuccess(`Event ${!currentStatus ? 'activated' : 'deactivated'}`, 'Status Updated');
      fetchEvents();
    } catch (err) {
      console.error('Error updating event status:', err);
      showError('Failed to update event status', 'Error');
    }
  };

  const handleToggleFeatured = async (eventId, currentFeatured) => {
    try {
      await api.patch(`/events/${eventId}/`, {
        is_featured: !currentFeatured
      });
      showSuccess(`Event ${!currentFeatured ? 'featured' : 'unfeatured'}`, 'Updated');
      fetchEvents();
    } catch (err) {
      console.error('Error updating event featured status:', err);
      showError('Failed to update event', 'Error');
    }
  };

  const getFilteredEvents = () => {
    const now = new Date();
    if (filter === 'upcoming') {
      return events.filter(e => new Date(e.start_date) > now);
    } else if (filter === 'ongoing') {
      return events.filter(e => new Date(e.start_date) <= now && new Date(e.end_date) >= now);
    } else if (filter === 'past') {
      return events.filter(e => new Date(e.end_date) < now);
    }
    return events;
  };

  const getEventTypeColor = (type) => {
    const colors = {
      general: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      academic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cultural: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      sports: 'bg-green-500/20 text-green-400 border-green-500/30',
      maintenance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      emergency: 'bg-red-500/20 text-red-400 border-red-500/30',
      holiday: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      general: 'General',
      academic: 'Academic',
      cultural: 'Cultural',
      sports: 'Sports',
      maintenance: 'Maintenance',
      emergency: 'Emergency',
      holiday: 'Holiday',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredEvents = getFilteredEvents();
  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.start_date) > new Date()).length,
    ongoing: events.filter(e => new Date(e.start_date) <= new Date() && new Date(e.end_date) >= new Date()).length,
    past: events.filter(e => new Date(e.end_date) < new Date()).length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Manage Events</h1>
        </div>
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          Loading events...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Events</h1>
          <p className="text-gray-400 text-sm mt-1">Create and manage hostel events</p>
        </div>
        <button
          onClick={() => navigate('/admin/events/add')}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Total Events</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Upcoming</p>
          <p className="text-2xl font-bold text-blue-400">{stats.upcoming}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Ongoing</p>
          <p className="text-2xl font-bold text-green-400">{stats.ongoing}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Past</p>
          <p className="text-2xl font-bold text-gray-400">{stats.past}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800">
        {['all', 'upcoming', 'ongoing', 'past'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium transition capitalize ${
              filter === tab
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab === 'all' ? 'All Events' : tab}
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-500/20 rounded-full">
              {tab === 'all' ? stats.total : stats[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Events Table */}
      {filteredEvents.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
          <p className="text-gray-400">
            {filter === 'all' 
              ? "No events have been created yet." 
              : `No ${filter} events found.`}
          </p>
          <button
            onClick={() => navigate('/admin/events/add')}
            className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-4 text-left">Title</th>
                  <th className="px-5 py-4 text-left">Type</th>
                  <th className="px-5 py-4 text-left">Start Date</th>
                  <th className="px-5 py-4 text-left">End Date</th>
                  <th className="px-5 py-4 text-left">Location</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredEvents.map((event) => {
                  const isActive = event.is_active;
                  const isFeatured = event.is_featured;
                  const isUpcoming = new Date(event.start_date) > new Date();
                  const isOngoing = new Date(event.start_date) <= new Date() && new Date(event.end_date) >= new Date();
                  const isPast = new Date(event.end_date) < new Date();
                  
                  let statusLabel = 'Active';
                  let statusColor = 'bg-green-500/20 text-green-400 border-green-500/30';
                  if (!isActive) {
                    statusLabel = 'Inactive';
                    statusColor = 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                  } else if (isPast) {
                    statusLabel = 'Past';
                    statusColor = 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                  } else if (isOngoing) {
                    statusLabel = 'Ongoing';
                    statusColor = 'bg-green-500/20 text-green-400 border-green-500/30';
                  } else if (isUpcoming) {
                    statusLabel = 'Upcoming';
                    statusColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                  }
                  
                  return (
                    <tr key={event.id} className="hover:bg-gray-800/30 transition">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-white font-medium">{event.title}</p>
                          {isFeatured && (
                            <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">⭐ Featured</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.event_type)}`}>
                          {getEventTypeLabel(event.event_type)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-300 text-xs">{formatDate(event.start_date)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-300 text-xs">{formatDate(event.end_date)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-400 text-sm">{event.location || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                            className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs font-medium rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(event.id, event.is_active)}
                            className={`px-2 py-1 text-xs font-medium rounded transition ${
                              event.is_active 
                                ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                                : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                            }`}
                          >
                            {event.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(event.id, event.is_featured)}
                            className={`px-2 py-1 text-xs font-medium rounded transition ${
                              event.is_featured 
                                ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                                : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400'
                            }`}
                          >
                            {event.is_featured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEventId(event.id);
                              setShowDeleteModal(true);
                            }}
                            className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Delete Event?</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedEventId)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;