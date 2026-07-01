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
      const activeEvents = allEvents.filter(e => e.is_active);
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
    
    if (end < now) return { label: 'Past', color: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b8aaa', border: 'rgba(107, 114, 128, 0.3)' } };
    if (start <= now && end >= now) return { label: 'Ongoing', color: { bg: 'rgba(29, 219, 168, 0.1)', color: '#1ddba8', border: 'rgba(29, 219, 168, 0.3)' } };
    return { label: 'Upcoming', color: { bg: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' } };
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '256px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b8aaa' }}>Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#f87171' }}>{error}</p>
          <button
            onClick={fetchEvents}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#f5a623',
              color: '#0a1628',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e09515'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f5a623'}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/students/homepage')}
          style={{
            color: '#6b8aaa',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '14px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>All Events</h1>
        <p style={{
          color: '#6b8aaa',
          marginTop: '4px',
        }}>Stay updated with all hostel events and activities</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}>Total Events</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
            marginTop: '4px',
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
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}>Upcoming</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#60a5fa',
            marginTop: '4px',
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
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}>Ongoing</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1ddba8',
            marginTop: '4px',
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
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}>Past</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#6b8aaa',
            marginTop: '4px',
          }}>{stats.past}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        borderBottom: '1px solid #1a3050',
        marginBottom: '24px',
      }}>
        {['all', 'upcoming', 'ongoing', 'past'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: filter === tab ? '#f5a623' : '#6b8aaa',
              borderBottom: filter === tab ? '2px solid #f5a623' : '2px solid transparent',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize',
            }}
            onMouseEnter={(e) => {
              if (filter !== tab) e.currentTarget.style.color = '#c8daf0';
            }}
            onMouseLeave={(e) => {
              if (filter !== tab) e.currentTarget.style.color = '#6b8aaa';
            }}
          >
            {tab === 'all' ? 'All Events' : tab}
            <span style={{
              marginLeft: '8px',
              padding: '0px 6px',
              fontSize: '10px',
              background: 'rgba(107, 114, 128, 0.2)',
              borderRadius: '9999px',
              color: '#6b8aaa',
            }}>
              {tab === 'all' ? stats.total : stats[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            color: '#3a5070',
          }}>📅</div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#eaf2ff', marginBottom: '8px' }}>No Events Found</h3>
          <p style={{ color: '#6b8aaa' }}>
            {filter === 'all' 
              ? "There are no events scheduled at the moment." 
              : `No ${filter} events found.`}
          </p>
          <button
            onClick={() => navigate('/students/homepage')}
            style={{
              marginTop: '16px',
              padding: '8px 24px',
              background: '#f5a623',
              color: '#0a1628',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e09515'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f5a623'}
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            const daysRemaining = getDaysRemaining(event.start_date);
            const isUpcoming = status.label === 'Upcoming';
            
            return (
              <div 
                key={event.id} 
                style={{
                  background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
                  border: '1px solid #1a3050',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.5)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 166, 35, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => {
                  setSelectedEvent(event);
                  setShowEventModal(true);
                }}
              >
                {/* Header with status */}
                <div style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #1a3050',
                  background: 'rgba(18, 36, 72, 0.3)',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <h3 style={{
                        color: '#eaf2ff',
                        fontWeight: 600,
                        margin: 0,
                        transition: 'color 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#eaf2ff'}>
                        {event.title}
                      </h3>
                      <p style={{
                        color: '#6b8aaa',
                        fontSize: '12px',
                        marginTop: '4px',
                      }}>{getEventTypeLabel(event.event_type)}</p>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      border: '1px solid',
                      background: status.color.bg,
                      color: status.color.color,
                      borderColor: status.color.border,
                    }}>
                      {status.label}
                    </span>
                  </div>
                  {isUpcoming && daysRemaining > 0 && (
                    <p style={{
                      color: '#f5a623',
                      fontSize: '12px',
                      marginTop: '8px',
                    }}>
                      {daysRemaining} days remaining
                    </p>
                  )}
                </div>
                
                {/* Body */}
                <div style={{ padding: '24px' }}>
                  <p style={{
                    color: '#c8daf0',
                    fontSize: '14px',
                    margin: '0 0 16px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>{event.description}</p>
                  
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      padding: '4px 0',
                    }}>
                      <span style={{ color: '#6b8aaa' }}>Start:</span>
                      <span style={{ color: '#c8daf0' }}>{formatDateShort(event.start_date)}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      padding: '4px 0',
                    }}>
                      <span style={{ color: '#6b8aaa' }}>End:</span>
                      <span style={{ color: '#c8daf0' }}>{formatDateShort(event.end_date)}</span>
                    </div>
                    {event.location && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        padding: '4px 0',
                      }}>
                        <span style={{ color: '#6b8aaa' }}>Location:</span>
                        <span style={{ color: '#c8daf0' }}>{event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {event.is_featured && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{
                        fontSize: '10px',
                        color: '#f5a623',
                        background: 'rgba(245, 166, 35, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                      }}>
                        Featured Event
                      </span>
                    </div>
                  )}
                  
                  <button 
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '8px',
                      color: '#f5a623',
                      border: '1px solid rgba(245, 166, 35, 0.3)',
                      background: 'transparent',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 166, 35, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
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
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
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
            maxWidth: '672px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{
              position: 'sticky',
              top: 0,
              background: 'rgba(10, 22, 40, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '16px 24px',
              borderBottom: '1px solid #1a3050',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#eaf2ff',
                  margin: 0,
                }}>{selectedEvent.title}</h2>
                <p style={{
                  color: '#6b8aaa',
                  fontSize: '14px',
                  marginTop: '4px',
                }}>{getEventTypeLabel(selectedEvent.event_type)}</p>
              </div>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                style={{
                  color: '#6b8aaa',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#eaf2ff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
              >
                <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              {/* Status Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
              }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: '1px solid',
                  background: getEventStatus(selectedEvent).color.bg,
                  color: getEventStatus(selectedEvent).color.color,
                  borderColor: getEventStatus(selectedEvent).color.border,
                }}>
                  {getEventStatus(selectedEvent).label}
                </span>
                {selectedEvent.is_featured && (
                  <span style={{
                    fontSize: '14px',
                    color: '#f5a623',
                    background: 'rgba(245, 166, 35, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                  }}>
                    Featured
                  </span>
                )}
              </div>

              {/* Description */}
              <div style={{
                background: 'rgba(18, 36, 72, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <p style={{ color: '#c8daf0', margin: 0 }}>{selectedEvent.description}</p>
              </div>

              {/* Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}>
                <div style={{
                  background: 'rgba(18, 36, 72, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  <p style={{
                    color: '#6b8aaa',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 4px 0',
                  }}>Start Date</p>
                  <p style={{ color: '#eaf2ff', fontWeight: 500, margin: 0 }}>{formatDate(selectedEvent.start_date)}</p>
                </div>
                <div style={{
                  background: 'rgba(18, 36, 72, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  <p style={{
                    color: '#6b8aaa',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 4px 0',
                  }}>End Date</p>
                  <p style={{ color: '#eaf2ff', fontWeight: 500, margin: 0 }}>{formatDate(selectedEvent.end_date)}</p>
                </div>
                {selectedEvent.location && (
                  <div style={{
                    background: 'rgba(18, 36, 72, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    gridColumn: '1 / -1',
                  }}>
                    <p style={{
                      color: '#6b8aaa',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 4px 0',
                    }}>Location</p>
                    <p style={{ color: '#eaf2ff', fontWeight: 500, margin: 0 }}>{selectedEvent.location}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                paddingTop: '16px',
                marginTop: '16px',
                borderTop: '1px solid #1a3050',
              }}>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: 'rgba(18, 36, 72, 0.5)',
                    color: '#c8daf0',
                    fontWeight: 500,
                    borderRadius: '8px',
                    border: '1px solid #1a3050',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(18, 36, 72, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(18, 36, 72, 0.5)';
                  }}
                >
                  Close
                </button>
                {getEventStatus(selectedEvent).label !== 'Past' && (
                  <button
                    onClick={() => {
                      alert(`Event: ${selectedEvent.title}\nDate: ${formatDate(selectedEvent.start_date)}\nLocation: ${selectedEvent.location || 'TBD'}`);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      background: '#f5a623',
                      color: '#0a1628',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e09515';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f5a623';
                    }}
                  >
                    Add to Calendar +
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AllEvents;