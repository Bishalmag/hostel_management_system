import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AddRoom = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    hostel: '',
    block: '',
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

  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const isResidential = form.room_purpose === 'residential';

  const getSuggestedPrice = (roomType, acType, bathroomType) => {
    const prices = {
      single: { non_ac: { shared: 5000, attached: 6000 }, ac: { shared: 8000, attached: 9000 } },
      double: { non_ac: { shared: 8000, attached: 9500 }, ac: { shared: 12000, attached: 13500 } },
      triple: { non_ac: { shared: 10000, attached: 11500 }, ac: { shared: 15000, attached: 16500 } }
    };
    return prices[roomType]?.[acType]?.[bathroomType] || '';
  };

  useEffect(() => {
    if (isResidential && form.room_type && form.ac_type && form.bathroom_type) {
      const suggestedPrice = getSuggestedPrice(form.room_type, form.ac_type, form.bathroom_type);
      if (suggestedPrice && !form.price_per_month) {
        setForm(f => ({ ...f, price_per_month: suggestedPrice }));
      }
    }
  }, [form.room_type, form.ac_type, form.bathroom_type, isResidential]);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await api.get('/hostel/hostels/');
        const hostelData = res.data.results ?? res.data;
        const hostelsList = Array.isArray(hostelData) ? hostelData : [];
        setHostels(hostelsList);
        
        if (hostelsList.length === 1) {
          setForm(f => ({ ...f, hostel: hostelsList[0].id }));
        }
      } catch (error) {
        console.error('Error fetching hostels:', error);
      }
    };
    fetchHostels();
  }, []);

  useEffect(() => {
    const fetchAllFloors = async () => {
      try {
        const res = await api.get('/hostel/floors/');
        const floorsData = res.data.results ?? res.data;
        setAllFloors(Array.isArray(floorsData) ? floorsData : []);
      } catch (error) {
        console.error('Error fetching floors:', error);
      }
    };
    fetchAllFloors();
  }, []);

  useEffect(() => {
    if (!form.hostel) {
      setBlocks([]);
      setFilteredFloors([]);
      return;
    }

    const fetchBlocks = async () => {
      try {
        const res = await api.get(`/hostel/blocks/?hostel=${form.hostel}`);
        const blocksData = res.data.results ?? res.data;
        setBlocks(Array.isArray(blocksData) ? blocksData : []);
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    };
    fetchBlocks();
  }, [form.hostel]);

  useEffect(() => {
    if (!form.block) {
      setFilteredFloors([]);
      return;
    }

    const filtered = allFloors.filter(floor => floor.block === parseInt(form.block));
    setFilteredFloors(filtered);
    setForm(f => ({ ...f, floor: '' }));
  }, [form.block, allFloors]);

  useEffect(() => {
    if (!isResidential) {
      setForm(f => ({
        ...f,
        room_type: 'single',
        ac_type: 'non_ac',
        bathroom_type: 'shared',
        capacity: '',
        current_occupancy: 0,
        price_per_month: ''
      }));
    }
  }, [form.room_purpose]);

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

      if (isResidential) {
        payload.capacity = form.capacity;
        payload.room_type = form.room_type;
        payload.ac_type = form.ac_type;
        payload.bathroom_type = form.bathroom_type;
        payload.current_occupancy = form.current_occupancy;
        payload.price_per_month = form.price_per_month;
      } else {
        payload.capacity = 0;
        payload.room_type = 'single';
        payload.ac_type = 'non_ac';
        payload.bathroom_type = 'shared';
        payload.current_occupancy = 0;
        payload.price_per_month = 0;
      }

      await api.post('/hostel/rooms/', payload);

      setMessage({
        type: 'success',
        text: 'Room added successfully!'
      });

      setTimeout(() => navigate('/admin/rooms'), 1500);

    } catch (err) {
      console.error('Error adding room:', err);
      const msg = Object.values(err.response?.data ?? {})
        .flat()
        .join(', ');

      setMessage({
        type: 'error',
        text: msg || 'Failed to add room.'
      });

    } finally {
      setLoading(false);
    }
  };

  const set = field => e =>
    setForm(f => ({
      ...f,
      [field]: e.target.value
    }));

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
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#a78bfa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          ← Back
        </button>

        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>
          Add Room
        </h1>
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
        {/* HOSTEL */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b8aaa',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            Hostel *
          </label>

          <select
            value={form.hostel}
            onChange={set('hostel')}
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
              e.currentTarget.style.borderColor = '#f5a623';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1a3050';
            }}
            required
            disabled={hostels.length === 1}
          >
            <option value="">Select hostel</option>
            {hostels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          {hostels.length === 1 && (
            <p style={{
              fontSize: '12px',
              color: '#6b8aaa',
              marginTop: '4px',
              marginBottom: 0,
            }}>{hostels[0]?.name}</p>
          )}
        </div>

        {/* BLOCK */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b8aaa',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            Block *
          </label>

          <select
            value={form.block}
            onChange={set('block')}
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
              opacity: !form.hostel ? 0.5 : 1,
              cursor: !form.hostel ? 'not-allowed' : 'pointer',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#f5a623';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1a3050';
            }}
            required
            disabled={!form.hostel}
          >
            <option value="">Select block</option>
            {blocks.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* FLOOR */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b8aaa',
            textTransform: 'uppercase',
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
              opacity: (!form.block || filteredFloors.length === 0) ? 0.5 : 1,
              cursor: (!form.block || filteredFloors.length === 0) ? 'not-allowed' : 'pointer',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#f5a623';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1a3050';
            }}
            required
            disabled={!form.block || filteredFloors.length === 0}
          >
            <option value="">Select floor</option>
            {filteredFloors.map(f => (
              <option key={f.id} value={f.id}>
                Floor {f.floor_number} {f.description ? `- ${f.description}` : ''}
              </option>
            ))}
          </select>
          {form.block && filteredFloors.length === 0 && (
            <p style={{
              fontSize: '12px',
              color: '#f5a623',
              marginTop: '4px',
              marginBottom: 0,
            }}>
              No floors available for this block. Please add a floor first.
            </p>
          )}
        </div>

        {/* ROOM NUMBER */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b8aaa',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            Room Number *
          </label>

          <input
            type="text"
            value={form.room_number}
            onChange={set('room_number')}
            placeholder="e.g. 101"
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
              e.currentTarget.style.borderColor = '#f5a623';
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
            marginBottom: '4px',
          }}>
            Room Purpose *
          </label>

          <select
            value={form.room_purpose}
            onChange={set('room_purpose')}
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
              e.currentTarget.style.borderColor = '#f5a623';
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

        {/* RESIDENTIAL-ONLY FIELDS */}
        {isResidential && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#6b8aaa',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}>
                  Capacity *
                </label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={set('capacity')}
                  placeholder="e.g. 2"
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
                    e.currentTarget.style.borderColor = '#f5a623';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#1a3050';
                  }}
                  required
                  min="1"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#6b8aaa',
                  textTransform: 'uppercase',
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
                    e.currentTarget.style.borderColor = '#f5a623';
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
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
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
                  e.currentTarget.style.borderColor = '#f5a623';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
              >
                <option value="non_ac">Non-AC</option>
                <option value="ac">AC</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
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
                  e.currentTarget.style.borderColor = '#f5a623';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
              >
                <option value="shared">Shared Bathroom</option>
                <option value="attached">Attached Bathroom</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>
                Price per Month (NPR)
              </label>
              <input
                type="number"
                value={form.price_per_month}
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
                  e.currentTarget.style.borderColor = '#f5a623';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
                min="0"
              />
              <p style={{
                color: '#6b8aaa',
                fontSize: '12px',
                marginTop: '4px',
                marginBottom: 0,
              }}>
                Suggested price for {form.room_type}, {form.ac_type}, {form.bathroom_type}: 
                Rs. {getSuggestedPrice(form.room_type, form.ac_type, form.bathroom_type) || 'N/A'}
              </p>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>
                Current Occupancy
              </label>
              <input
                type="number"
                value={form.current_occupancy}
                onChange={set('current_occupancy')}
                placeholder="0"
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
                  e.currentTarget.style.borderColor = '#f5a623';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
                min="0"
              />
            </div>
          </>
        )}

        {/* NON-RESIDENTIAL MESSAGE */}
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
            backgroundColor: loading ? '#6b8aaa' : '#a78bfa',
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
          {loading ? 'Adding...' : 'Add Room'}
        </button>
      </form>
    </div>
  );
};

export default AddRoom;