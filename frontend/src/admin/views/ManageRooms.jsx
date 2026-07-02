// src/admin/pages/ManageRooms.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ← Add this import
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const ManageRooms = () => {
  const navigate = useNavigate(); // ← Add this
  const { showSuccess, showError } = useNotification();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/hostel/rooms/');
      
      let roomsData = response.data;
      if (response.data.results) {
        roomsData = response.data.results;
      }
      
      if (!Array.isArray(roomsData)) {
        roomsData = [];
      }
      
      setRooms(roomsData);
      
    } catch (err) {
      console.error('Error fetching rooms:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load rooms';
      setError(errorMsg);
      showError(errorMsg, 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/hostel/rooms/${roomId}/`);
      showSuccess('Room deleted successfully!', 'Success');
      fetchRooms();
    } catch (err) {
      console.error('Error deleting room:', err);
      showError(err.response?.data?.detail || 'Failed to delete room', 'Error');
    }
  };

  const getFilteredRooms = () => {
    if (filter === 'all') return rooms;
    if (filter === 'residential') {
      return rooms.filter(room => room.room_purpose === 'residential');
    }
    if (filter === 'common') {
      return rooms.filter(room => room.room_purpose !== 'residential');
    }
    return rooms;
  };

  const filteredRooms = getFilteredRooms();
  
  const stats = {
    total: rooms.length,
    residential: rooms.filter(r => r.room_purpose === 'residential').length,
    common: rooms.filter(r => r.room_purpose !== 'residential').length,
    occupied: rooms.filter(r => r.current_occupancy > 0).length,
    available: rooms.filter(r => r.current_occupancy < r.capacity && r.capacity > 0).length,
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
          <p style={{ color: '#6b8aaa' }}>Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(248, 113, 113, 0.1)',
        border: '1px solid rgba(248, 113, 113, 0.3)',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <p style={{ color: '#f87171' }}>Error: {error}</p>
        <button
          onClick={fetchRooms}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: '#f5a623',
            color: '#0a1628',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
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
          Try Again
        </button>
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
          }}>Manage Rooms</h1>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            marginTop: '4px',
            marginBottom: 0,
          }}>
            Total: {stats.total} rooms • {stats.residential} residential • {stats.common} common areas
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/rooms/add')} // ← Fixed: Navigate to add room page
          style={{
            padding: '8px 16px',
            background: '#1ddba8',
            color: '#0a1628',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#16c39a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1ddba8';
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Room
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
          }}>Total Rooms</p>
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
          }}>Residential</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#60a5fa',
            margin: '4px 0 0 0',
          }}>{stats.residential}</p>
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
          }}>Common Areas</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#a78bfa',
            margin: '4px 0 0 0',
          }}>{stats.common}</p>
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
          }}>Occupied</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#f5a623',
            margin: '4px 0 0 0',
          }}>{stats.occupied}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #1a3050',
      }}>
        {[
          { key: 'all', label: `All (${stats.total})` },
          { key: 'residential', label: `Residential (${stats.residential})` },
          { key: 'common', label: `Common Areas (${stats.common})` },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: filter === item.key ? '#f5a623' : '#6b8aaa',
              borderBottom: filter === item.key ? '2px solid #f5a623' : '2px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (filter !== item.key) {
                e.currentTarget.style.color = '#c8daf0';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== item.key) {
                e.currentTarget.style.color = '#6b8aaa';
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Rooms Table */}
      {filteredRooms.length === 0 ? (
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
          }}>No Rooms Found</h3>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            margin: 0,
          }}>
            {filter === 'all' 
              ? "No rooms have been added yet." 
              : filter === 'residential'
              ? "No residential rooms found."
              : "No common areas found."}
          </p>
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
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Room</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Purpose</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Capacity</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Occupancy</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Price/Month</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => {
                  const isOccupied = room.current_occupancy > 0;
                  const isFull = room.current_occupancy >= room.capacity;
                  const isResidential = room.room_purpose === 'residential';
                  
                  return (
                    <tr
                      key={room.id}
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
                          }}>Room {room.room_number}</p>
                          <p style={{
                            color: '#6b8aaa',
                            fontSize: '12px',
                            margin: '4px 0 0 0',
                          }}>Floor {room.floor_number || 'N/A'}</p>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          textTransform: 'capitalize',
                          color: '#c8daf0',
                        }}>
                          {room.room_type}
                          {room.ac_type && (
                            <span style={{
                              marginLeft: '4px',
                              padding: '2px 6px',
                              fontSize: '12px',
                              borderRadius: '4px',
                              background: room.ac_type === 'ac' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(251, 146, 60, 0.2)',
                              color: room.ac_type === 'ac' ? '#60a5fa' : '#fb923c',
                            }}>
                              {room.ac_type.toUpperCase()}
                            </span>
                          )}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: '1px solid',
                          background: isResidential ? 'rgba(29, 219, 168, 0.2)' : 'rgba(167, 139, 250, 0.2)',
                          color: isResidential ? '#1ddba8' : '#a78bfa',
                          borderColor: isResidential ? 'rgba(29, 219, 168, 0.3)' : 'rgba(167, 139, 250, 0.3)',
                        }}>
                          {room.room_purpose || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ color: '#c8daf0', margin: 0 }}>{room.capacity}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <div style={{
                            flex: 1,
                            background: '#1a3050',
                            borderRadius: '4px',
                            height: '6px',
                            width: '64px',
                          }}>
                            <div style={{
                              height: '6px',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease',
                              background: isFull ? '#f87171' : isOccupied ? '#f5a623' : '#1ddba8',
                              width: `${(room.current_occupancy / room.capacity) * 100}%`,
                            }} />
                          </div>
                          <span style={{
                            fontSize: '12px',
                            color: isFull ? '#f87171' : isOccupied ? '#f5a623' : '#1ddba8',
                          }}>
                            {room.current_occupancy}/{room.capacity}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{
                          color: '#f5a623',
                          fontWeight: 500,
                          margin: 0,
                        }}>
                          {room.price_per_month ? `Rs. ${room.price_per_month}` : 'N/A'}
                        </p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                        }}>
                          <button
                            onClick={() => navigate(`/admin/rooms/edit/${room.id}`)} // ← Fixed: Navigate to edit room page
                            style={{
                              padding: '4px 12px',
                              background: '#0f2040',
                              color: '#c8daf0',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
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
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            style={{
                              padding: '4px 12px',
                              background: 'rgba(248, 113, 113, 0.2)',
                              color: '#f87171',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
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

export default ManageRooms;