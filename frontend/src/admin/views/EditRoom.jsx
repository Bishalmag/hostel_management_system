import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const EditRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    floor: '',
    room_number: '',
    capacity: '',
    room_type: 'single',
    room_purpose: 'residential',
    ac_type: 'non_ac',
    bathroom_type: 'shared',
    current_occupancy: 0,
    price_per_month: ''
  });
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check if room is residential
  const isResidential = form.room_purpose === 'residential';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomRes, floorsRes] = await Promise.all([
          api.get(`/hostel/rooms/${id}/`),
          api.get('/hostel/floors/')
        ]);
        
        setForm(roomRes.data);
        setFloors(floorsRes.data.results ?? floorsRes.data);
        setFetching(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to load room details.' });
        setFetching(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const payload = {
        floor: form.floor,
        room_number: form.room_number,
        room_purpose: form.room_purpose,
      };

      // Only add residential fields if room is residential
      if (isResidential) {
        payload.capacity = form.capacity;
        payload.room_type = form.room_type;
        payload.ac_type = form.ac_type;
        payload.bathroom_type = form.bathroom_type;
        payload.current_occupancy = form.current_occupancy;
        payload.price_per_month = form.price_per_month;
      } else {
        // Set default values for non-residential rooms
        payload.capacity = 0;
        payload.room_type = 'single';
        payload.ac_type = 'non_ac';
        payload.bathroom_type = 'shared';
        payload.current_occupancy = 0;
        payload.price_per_month = 0;
      }

      await api.patch(`/hostel/rooms/${id}/`, payload);
      setMessage({ type: 'success', text: 'Room updated successfully!' });
      setTimeout(() => navigate('/admin/rooms'), 1500);
    } catch (err) {
      console.error('Error updating room:', err);
      const msg = Object.values(err.response?.data ?? {}).flat().join(', ');
      setMessage({ type: 'error', text: msg || 'Failed to update room.' });
    } finally { 
      setLoading(false); 
    }
  };

  // Reset residential fields when purpose changes to non-residential
  const handlePurposeChange = (e) => {
    const newPurpose = e.target.value;
    const isRes = newPurpose === 'residential';
    
    setForm(f => ({
      ...f,
      room_purpose: newPurpose,
      // Reset residential fields if switching to non-residential
      ...(!isRes && {
        capacity: '',
        room_type: 'single',
        ac_type: 'non_ac',
        bathroom_type: 'shared',
        current_occupancy: 0,
        price_per_month: ''
      })
    }));
  };

  const set = field => e => setForm(f => ({...f, [field]: e.target.value}));

  if (fetching) {
    return (
      <div style={{
        maxWidth: '512px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        <div style={{
          backgroundColor: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
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
              <div style={{ color: '#6b8aaa' }}>Loading room details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '512px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <div>
        <button
          onClick={() => navigate('/admin/rooms')}
          style={{
            fontSize: '14px',
            color: '#6b8aaa',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '12px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#a78bfa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          ← Back to Rooms
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>Edit Room</h1>
        <p style={{
          fontSize: '12px',
          color: '#6b8aaa',
          marginTop: '4px',
          marginBottom: 0,
        }}>Room ID: {id}</p>
      </div>
      
      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          border: '1px solid',
          backgroundColor: message.type === 'success' ? 'rgba(29, 219, 168, 0.1)' : 'rgba(248, 113, 113, 0.1)',
          color: message.type === 'success' ? '#1ddba8' : '#f87171',
          borderColor: message.type === 'success' ? 'rgba(29, 219, 168, 0.3)' : 'rgba(248, 113, 113, 0.3)',
        }}>
          {message.text}
        </div>
      )}
      
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* FLOOR */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b8aaa',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px',
          }}>
            Floor *
          </label>
          <select
            value={form.floor}
            onChange={set('floor')}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#0f2040',
              border: '1px solid #1a3050',
              borderRadius: '8px',
              color: '#eaf2ff',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#a78bfa';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1a3050';
            }}
            required
          >
            <option value="">Select floor</option>
            {floors.map(f => (
              <option key={f.id} value={f.id}>Floor {f.floor_number}</option>
            ))}
          </select>
        </div>

        {/* ROOM NUMBER */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b8aaa',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px',
          }}>
            Room Number *
          </label>
          <input
            type="text"
            value={form.room_number}
            onChange={set('room_number')}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#0f2040',
              border: '1px solid #1a3050',
              borderRadius: '8px',
              color: '#eaf2ff',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#a78bfa';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1a3050';
            }}
            required
          />
        </div>

        {/* ROOM PURPOSE */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b8aaa',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px',
          }}>
            Room Purpose *
          </label>
          <select
            value={form.room_purpose}
            onChange={handlePurposeChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#0f2040',
              border: '1px solid #1a3050',
              borderRadius: '8px',
              color: '#eaf2ff',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#a78bfa';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1a3050';
            }}
            required
          >
            <option value="residential">Residential</option>
            <option value="reception">Reception</option>
            <option value="office">Office</option>
            <option value="lobby">Lobby</option>
            <option value="DI_room">DI Room</option>
            <option value="library">Library</option>
            <option value="canteen">Canteen</option>
            <option value="hall">Hall</option>
          </select>
          <p style={{
            fontSize: '12px',
            marginTop: '4px',
            marginBottom: 0,
            color: isResidential ? '#1ddba8' : '#f5a623',
          }}>
            {isResidential 
              ? '✓ Residential rooms are available for student booking.' 
              : '⚠ Non-residential rooms are not available for student booking.'}
          </p>
        </div>

        {/* ===== RESIDENTIAL-ONLY FIELDS ===== */}
        {isResidential && (
          <>
            {/* CAPACITY */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}>
                Capacity *
              </label>
              <input
                type="number"
                value={form.capacity}
                onChange={set('capacity')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0f2040',
                  border: '1px solid #1a3050',
                  borderRadius: '8px',
                  color: '#eaf2ff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a78bfa';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
                required
                min="1"
              />
            </div>

            {/* ROOM TYPE */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}>
                Room Type *
              </label>
              <select
                value={form.room_type}
                onChange={set('room_type')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0f2040',
                  border: '1px solid #1a3050',
                  borderRadius: '8px',
                  color: '#eaf2ff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a78bfa';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
              </select>
            </div>

            {/* AC TYPE */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}>
                AC Type *
              </label>
              <select
                value={form.ac_type}
                onChange={set('ac_type')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0f2040',
                  border: '1px solid #1a3050',
                  borderRadius: '8px',
                  color: '#eaf2ff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a78bfa';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
              >
                <option value="non_ac">Non-AC</option>
                <option value="ac">AC</option>
              </select>
            </div>

            {/* BATHROOM TYPE */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}>
                Bathroom Type *
              </label>
              <select
                value={form.bathroom_type}
                onChange={set('bathroom_type')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0f2040',
                  border: '1px solid #1a3050',
                  borderRadius: '8px',
                  color: '#eaf2ff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a78bfa';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
              >
                <option value="shared">Shared Bathroom</option>
                <option value="attached">Attached Bathroom</option>
              </select>
            </div>

            {/* PRICE PER MONTH */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}>
                Price per Month (NPR)
              </label>
              <input
                type="number"
                value={form.price_per_month || ''}
                onChange={set('price_per_month')}
                placeholder="e.g. 5000"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0f2040',
                  border: '1px solid #1a3050',
                  borderRadius: '8px',
                  color: '#eaf2ff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a78bfa';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
                min="0"
              />
            </div>

            {/* CURRENT OCCUPANCY */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}>
                Current Occupancy
              </label>
              <input
                type="number"
                value={form.current_occupancy}
                onChange={set('current_occupancy')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0f2040',
                  border: '1px solid #1a3050',
                  borderRadius: '8px',
                  color: '#eaf2ff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a78bfa';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
                min="0"
              />
            </div>
          </>
        )}

        {/* ===== NON-RESIDENTIAL MESSAGE ===== */}
        {!isResidential && (
          <div style={{
            backgroundColor: 'rgba(15, 32, 64, 0.5)',
            border: '1px solid #1a3050',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <p style={{
              color: '#6b8aaa',
              fontSize: '14px',
              margin: 0,
            }}>
              <span style={{ color: '#f5a623' }}>◆</span> This is a non-residential room. 
              It will be used for pathfinding and navigation only. 
              Students cannot book this room.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#3a5070' : '#a78bfa',
            color: '#0a1628',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: loading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#8b5cf6';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#a78bfa';
            }
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

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

export default EditRoom;