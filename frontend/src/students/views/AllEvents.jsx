// src/students/views/AllEvents.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const AllEvents = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/');
      const allEvents = response.data.results || response.data;
      // Filter only active events
      const activeEvents = allEvents.filter(e => e.is_active);
      // Sort by start date (upcoming first)
      const sortedEvents = activeEvents.sort((a, b) => 
        new Date(a.start_date) - new Date(b.start_date)
      );
      setEvents(sortedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
      showError('Failed to load events', 'Error');
    } finally {
      setLoading(false);
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

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    
    if (end < now) return { label: 'Past', color: 'text-gray-400 bg-gray-500/20 border-gray-500/30' };
    if (start <= now && end >= now) return { label: 'Ongoing', color: 'text-green-400 bg-green-500/20 border-green-500/30' };
    return { label: 'Upcoming', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' };
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      general: '📋',
      academic: '📚',
      cultural: '🎭',
      sports: '⚽',
      maintenance: '🔧',
      emergency: '🚨',
      holiday: '🎉',
      other: '📌',
    };
    return icons[type] || '📅';
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
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysRemaining = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = start - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/students/homepage')}
          className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-white">All Events</h1>
        <p className="text-gray-400 mt-1">Stay updated with all hostel events and activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
          <p className="text-gray-400">
            {filter === 'all' 
              ? "There are no events scheduled at the moment." 
              : `No ${filter} events found.`}
          </p>
          <button
            onClick={() => navigate('/students/homepage')}
            className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            const daysRemaining = getDaysRemaining(event.start_date);
            const isUpcoming = status.label === 'Upcoming';
            
            return (
              <div 
                key={event.id} 
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedEvent(event);
                  setShowEventModal(true);
                }}
              >
                {/* Header with status */}
                <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getEventTypeIcon(event.event_type)}</span>
                      <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors">
                        {event.title}
                      </h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  {isUpcoming && daysRemaining > 0 && (
                    <p className="text-yellow-400 text-xs mt-2">
                      ⏰ {daysRemaining} days remaining
                    </p>
                  )}
                </div>
                
                {/* Body */}
                <div className="p-6 space-y-3">
                  <p className="text-gray-300 text-sm line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">📅 Start:</span>
                      <span className="text-gray-300">{formatDateShort(event.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">📅 End:</span>
                      <span className="text-gray-300">{formatDateShort(event.end_date)}</span>
                    </div>
                    {event.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">📍 Location:</span>
                        <span className="text-gray-300">{event.location}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="text-gray-300 capitalize">{getEventTypeLabel(event.event_type)}</span>
                    </div>
                  </div>
                  
                  {event.is_featured && (
                    <div className="mt-2">
                      <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        ⭐ Featured Event
                      </span>
                    </div>
                  )}
                  
                  <button 
                    className="w-full mt-3 py-2 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 rounded-lg text-sm font-medium transition group-hover:bg-cyan-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                      setShowEventModal(true);
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getEventTypeIcon(selectedEvent.event_type)}</span>
                <h2 className="text-xl font-bold text-white">{selectedEvent.title}</h2>
              </div>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEventStatus(selectedEvent).color}`}>
                  {getEventStatus(selectedEvent).label}
                </span>
                {selectedEvent.is_featured && (
                  <span className="text-sm text-yellow-400 bg-yellow-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                    ⭐ Featured
                  </span>
                )}
                <span className="text-sm text-gray-400">
                  {getEventTypeLabel(selectedEvent.event_type)}
                </span>
              </div>

              {/* Description */}
              <div className="bg-gray-800/30 rounded-xl p-4">
                <p className="text-gray-300">{selectedEvent.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Start Date</p>
                  <p className="text-white font-medium">{formatDate(selectedEvent.start_date)}</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">End Date</p>
                  <p className="text-white font-medium">{formatDate(selectedEvent.end_date)}</p>
                </div>
                {selectedEvent.location && (
                  <div className="bg-gray-800/30 rounded-xl p-4 md:col-span-2">
                    <p className="text-gray-500 text-xs uppercase tracking-wide">📍 Location</p>
                    <p className="text-white font-medium">{selectedEvent.location}</p>
                  </div>
                )}
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Type</p>
                  <p className="text-white font-medium capitalize">{getEventTypeLabel(selectedEvent.event_type)}</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Status</p>
                  <p className="text-white font-medium">{getEventStatus(selectedEvent).label}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition"
                >
                  Close
                </button>
                {getEventStatus(selectedEvent).label !== 'Past' && (
                  <button
                    onClick={() => {
                      // You can add "Add to Calendar" functionality here
                      alert(`📅 Event: ${selectedEvent.title}\n📅 Date: ${formatDate(selectedEvent.start_date)}\n📍 Location: ${selectedEvent.location || 'TBD'}`);
                    }}
                    className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition"
                  >
                    Add to Calendar +
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;