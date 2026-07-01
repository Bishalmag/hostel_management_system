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
      general: { bg: 'rgba(107, 138, 170, 0.2)', text: '#6b8aaa', border: 'rgba(107, 138, 170, 0.3)' },
      academic: { bg: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
      cultural: { bg: 'rgba(167, 139, 250, 0.2)', text: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)' },
      sports: { bg: 'rgba(29, 219, 168, 0.2)', text: '#1ddba8', border: 'rgba(29, 219, 168, 0.3)' },
      maintenance: { bg: 'rgba(245, 166, 35, 0.2)', text: '#f5a623', border: 'rgba(245, 166, 35, 0.3)' },
      emergency: { bg: 'rgba(248, 113, 113, 0.2)', text: '#f87171', border: 'rgba(248, 113, 113, 0.3)' },
      holiday: { bg: 'rgba(236, 72, 153, 0.2)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' },
      other: { bg: 'rgba(107, 138, 170, 0.2)', text: '#6b8aaa', border: 'rgba(107, 138, 170, 0.3)' },
    };
    return colors[type] || { bg: 'rgba(107, 138, 170, 0.2)', text: '#6b8aaa', border: 'rgba(107, 138, 170, 0.3)' };
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: 0,
          }}>Manage Events</h1>
        </div>
        <div style={{
          textAlign: 'center',
          color: '#6b8aaa',
          padding: '48px 0',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          Loading events...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: 0,
          }}>Manage Events</h1>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            marginTop: '4px',
            marginBottom: 0,
          }}>Create and manage hostel events</p>
        </div>
        <button
          onClick={() => navigate('/admin/events/add')}
          style={{
            padding: '8px 16px',
            background: '#f5a623',
            color: '#0a1628',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e09515';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f5a623';
          }}
        >
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Event
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Total Events</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: '4px 0 0 0',
          }}>{stats.total}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Upcoming</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#60a5fa',
            margin: '4px 0 0 0',
          }}>{stats.upcoming}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Ongoing</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1ddba8',
            margin: '4px 0 0 0',
          }}>{stats.ongoing}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Past</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#6b8aaa',
            margin: '4px 0 0 0',
          }}>{stats.past}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        borderBottom: '1px solid #1a3050',
      }}>
        {['all', 'upcoming', 'ongoing', 'past'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'capitalize',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: filter === tab ? '#f5a623' : '#6b8aaa',
              borderBottom: filter === tab ? '2px solid #f5a623' : '2px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (filter !== tab) {
                e.currentTarget.style.color = '#c8daf0';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== tab) {
                e.currentTarget.style.color = '#6b8aaa';
              }
            }}
          >
            {tab === 'all' ? 'All Events' : tab}
            <span style={{
              marginLeft: '8px',
              padding: '2px 6px',
              fontSize: '12px',
              background: 'rgba(107, 138, 170, 0.2)',
              borderRadius: '20px',
            }}>
              {tab === 'all' ? stats.total : stats[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Events Table */}
      {filteredEvents.length === 0 ? (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>◇</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#eaf2ff',
            marginBottom: '8px',
          }}>No Events Found</h3>
          <p style={{
            color: '#6b8aaa',
            marginBottom: '16px',
          }}>
            {filter === 'all' 
              ? "No events have been created yet." 
              : `No ${filter} events found.`}
          </p>
          <button
            onClick={() => navigate('/admin/events/add')}
            style={{
              padding: '8px 24px',
              background: '#f5a623',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e09515';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5a623';
            }}
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              fontSize: '14px',
              borderCollapse: 'collapse',
            }}>
              <thead style={{
                background: 'rgba(15, 32, 64, 0.5)',
                borderBottom: '1px solid #1a3050',
              }}>
                <tr style={{
                  color: '#6b8aaa',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Title</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Start Date</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>End Date</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Location</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const isActive = event.is_active;
                  const isFeatured = event.is_featured;
                  const isUpcoming = new Date(event.start_date) > new Date();
                  const isOngoing = new Date(event.start_date) <= new Date() && new Date(event.end_date) >= new Date();
                  const isPast = new Date(event.end_date) < new Date();
                  
                  let statusLabel = 'Active';
                  let statusColor = 'rgba(29, 219, 168, 0.2)';
                  let statusTextColor = '#1ddba8';
                  let statusBorder = 'rgba(29, 219, 168, 0.3)';
                  
                  if (!isActive) {
                    statusLabel = 'Inactive';
                    statusColor = 'rgba(107, 138, 170, 0.2)';
                    statusTextColor = '#6b8aaa';
                    statusBorder = 'rgba(107, 138, 170, 0.3)';
                  } else if (isPast) {
                    statusLabel = 'Past';
                    statusColor = 'rgba(107, 138, 170, 0.2)';
                    statusTextColor = '#6b8aaa';
                    statusBorder = 'rgba(107, 138, 170, 0.3)';
                  } else if (isOngoing) {
                    statusLabel = 'Ongoing';
                    statusColor = 'rgba(29, 219, 168, 0.2)';
                    statusTextColor = '#1ddba8';
                    statusBorder = 'rgba(29, 219, 168, 0.3)';
                  } else if (isUpcoming) {
                    statusLabel = 'Upcoming';
                    statusColor = 'rgba(96, 165, 250, 0.2)';
                    statusTextColor = '#60a5fa';
                    statusBorder = 'rgba(96, 165, 250, 0.3)';
                  }

                  const eventTypeStyle = getEventTypeColor(event.event_type);

                  return (
                    <tr
                      key={event.id}
                      style={{
                        borderBottom: '1px solid #1a3050',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(18, 36, 72, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div>
                          <p style={{
                            color: '#eaf2ff',
                            fontWeight: 500,
                            margin: 0,
                          }}>{event.title}</p>
                          {isFeatured && (
                            <span style={{
                              fontSize: '12px',
                              color: '#f5a623',
                              background: 'rgba(245, 166, 35, 0.2)',
                              padding: '2px 8px',
                              borderRadius: '20px',
                              display: 'inline-block',
                              marginTop: '4px',
                            }}>◆ Featured</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: `1px solid ${eventTypeStyle.border}`,
                          background: eventTypeStyle.bg,
                          color: eventTypeStyle.text,
                        }}>
                          {getEventTypeLabel(event.event_type)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{
                          color: '#c8daf0',
                          fontSize: '12px',
                          margin: 0,
                        }}>{formatDate(event.start_date)}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{
                          color: '#c8daf0',
                          fontSize: '12px',
                          margin: 0,
                        }}>{formatDate(event.end_date)}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{
                          color: '#6b8aaa',
                          fontSize: '14px',
                          margin: 0,
                        }}>{event.location || 'N/A'}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: `1px solid ${statusBorder}`,
                          background: statusColor,
                          color: statusTextColor,
                        }}>
                          {statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}>
                          <button
                            onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                            style={{
                              padding: '4px 12px',
                              background: 'rgba(245, 166, 35, 0.2)',
                              color: '#f5a623',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'background 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(245, 166, 35, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(245, 166, 35, 0.2)';
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(event.id, event.is_active)}
                            style={{
                              padding: '4px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              background: event.is_active ? 'rgba(245, 166, 35, 0.2)' : 'rgba(29, 219, 168, 0.2)',
                              color: event.is_active ? '#f5a623' : '#1ddba8',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = event.is_active ? 'rgba(245, 166, 35, 0.3)' : 'rgba(29, 219, 168, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = event.is_active ? 'rgba(245, 166, 35, 0.2)' : 'rgba(29, 219, 168, 0.2)';
                            }}
                          >
                            {event.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(event.id, event.is_featured)}
                            style={{
                              padding: '4px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              background: event.is_featured ? 'rgba(245, 166, 35, 0.2)' : 'rgba(107, 138, 170, 0.2)',
                              color: event.is_featured ? '#f5a623' : '#6b8aaa',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = event.is_featured ? 'rgba(245, 166, 35, 0.3)' : 'rgba(107, 138, 170, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = event.is_featured ? 'rgba(245, 166, 35, 0.2)' : 'rgba(107, 138, 170, 0.2)';
                            }}
                          >
                            {event.is_featured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEventId(event.id);
                              setShowDeleteModal(true);
                            }}
                            style={{
                              padding: '4px 12px',
                              background: 'rgba(248, 113, 113, 0.2)',
                              color: '#f87171',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'background 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(248, 113, 113, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)';
                            }}
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
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px',
        }}>
          <div style={{
            background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
            border: '1px solid #1a3050',
            borderRadius: '16px',
            maxWidth: '448px',
            width: '100%',
            padding: '24px',
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#eaf2ff',
              marginBottom: '16px',
              marginTop: 0,
            }}>Delete Event?</h2>
            <p style={{
              color: '#6b8aaa',
              marginBottom: '24px',
            }}>
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: '#0f2040',
                  color: '#eaf2ff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#122448';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0f2040';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedEventId)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: '#f87171',
                  color: '#0a1628',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f87171';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ManageEvents;