import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const RoomDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { roomType, acType, bathroomType, pricePerMonth, roomTypeLabel, acLabel, bathroomLabel } = location.state || {};

  const [hostel, setHostel] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Helper function to format Nepali Rupees
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Rs. 0';
    const formatted = new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    return formatted.replace('NPR', 'Rs.');
  };

  useEffect(() => {
    if (!id) {
      setMessage({ type: 'error', text: 'No hostel selected. Please go back and select a hostel.' });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [hostelRes, blockRes, floorRes, roomRes] = await Promise.all([
          api.get(`/hostel/hostels/${id}/`),
          api.get('/hostel/blocks/'),
          api.get('/hostel/floors/'),
          api.get('/hostel/rooms/'),
        ]);

        const hostelData = hostelRes.data;
        const blockData = blockRes.data.results ?? blockRes.data;
        const floorData = floorRes.data.results ?? floorRes.data;
        const roomData = roomRes.data.results ?? roomRes.data;

        setHostel(hostelData);

        const hostelBlocks = blockData.filter(b => String(b.hostel) === String(id));
        setBlocks(hostelBlocks);

        const hostelBlockIds = hostelBlocks.map(b => b.id);
        const hostelFloors = floorData.filter(f => {
          const blockId = typeof f.block === 'object' ? f.block.id : f.block;
          return hostelBlockIds.includes(blockId);
        });
        setFloors(hostelFloors);
        setRooms(roomData);

      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to load hostel details. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBookNow = (room) => {
    navigate(`/students/book-hostels`, {
      state: {
        preSelectedRoom: room,
        preSelectedHostel: hostel,
        preSelectedFilters: {
          roomType,
          acType,
          bathroomType
        }
      }
    });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '24px' }}>
        <div style={{ textAlign: 'center', color: '#6b8aaa', padding: '48px 0' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          Loading hostel details...
        </div>
      </div>
    );
  }

  let availableRooms = rooms.filter(r => r.current_occupancy < r.capacity);
  
  if (roomType) {
    availableRooms = availableRooms.filter(r => r.room_type === roomType);
  }
  if (acType) {
    availableRooms = availableRooms.filter(r => r.ac_type === acType);
  }
  if (bathroomType) {
    availableRooms = availableRooms.filter(r => r.bathroom_type === bathroomType);
  }

  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '16px' }}>
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/students/book-hostels')}
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
          ← Back to Hostels
        </button>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>
          {hostel?.name || 'Hostel Details'}
        </h1>
        <p style={{ color: '#6b8aaa', marginTop: '4px' }}>
          {roomTypeLabel || (roomType && roomType.charAt(0).toUpperCase() + roomType.slice(1))} Room • 
          {acLabel || (acType === 'ac' ? ' AC' : ' Non-AC')} • 
          {bathroomLabel || (bathroomType === 'attached' ? ' Attached Bathroom' : ' Shared Bathroom')}
        </p>
        <p style={{ color: '#6b8aaa', marginTop: '8px' }}>{hostel?.address}</p>
        <p style={{ color: '#3a5070', fontSize: '14px', marginTop: '8px' }}>{availableRooms.length} rooms available</p>
      </div>

      {message.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid',
            marginBottom: '16px',
            background: message.type === 'success' 
              ? 'rgba(29, 219, 168, 0.1)' 
              : 'rgba(248, 113, 113, 0.1)',
            color: message.type === 'success' 
              ? '#1ddba8' 
              : '#f87171',
            borderColor: message.type === 'success' 
              ? 'rgba(29, 219, 168, 0.3)' 
              : 'rgba(248, 113, 113, 0.3)',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Room Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
      }}>
        {availableRooms.length > 0 ? (
          availableRooms.map((room) => (
            <div
              key={room.id}
              style={{
                background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
                border: '1px solid #1a3050',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1a3050';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px',
              }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>Room {room.room_number}</h3>
                  <p style={{ color: '#6b8aaa', fontSize: '14px', marginTop: '4px' }}>Floor {room.floor_number}</p>
                </div>
                {room.current_occupancy >= room.capacity ? (
                  <span style={{
                    fontSize: '10px',
                    color: '#f87171',
                    background: 'rgba(248, 113, 113, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}>Full</span>
                ) : (
                  <span style={{
                    fontSize: '10px',
                    color: '#1ddba8',
                    background: 'rgba(29, 219, 168, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}>
                    {room.capacity - room.current_occupancy} spots
                  </span>
                )}
              </div>
              
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #1a3050',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{
                      color: '#f5a623',
                      fontWeight: 700,
                      fontSize: '20px',
                      margin: 0,
                    }}>
                      {formatPrice(room.price_per_month || 5000)}
                      <span style={{ fontSize: '12px', color: '#6b8aaa', marginLeft: '4px' }}>/month</span>
                    </p>
                    <p style={{ color: '#3a5070', fontSize: '12px', marginTop: '4px' }}>
                      {formatPrice((room.price_per_month ? room.price_per_month / 30 : 5000 / 30).toFixed(0))}/day
                    </p>
                  </div>
                  <button
                    onClick={() => handleBookNow(room)}
                    disabled={room.current_occupancy >= room.capacity}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: 'none',
                      cursor: room.current_occupancy >= room.capacity ? 'not-allowed' : 'pointer',
                      background: room.current_occupancy >= room.capacity 
                        ? '#1a3050' 
                        : '#f5a623',
                      color: room.current_occupancy >= room.capacity 
                        ? '#3a5070' 
                        : '#0a1628',
                      opacity: room.current_occupancy >= room.capacity ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (room.current_occupancy < room.capacity) {
                        e.currentTarget.style.background = '#e09515';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (room.current_occupancy < room.capacity) {
                        e.currentTarget.style.background = '#f5a623';
                      }
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>

              {/* Room Details Tags */}
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #1a3050',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                <span style={{
                  fontSize: '10px',
                  background: '#0a1628',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  color: '#6b8aaa',
                  textTransform: 'capitalize',
                  border: '1px solid #1a3050',
                }}>
                  {room.room_type}
                </span>
                <span style={{
                  fontSize: '10px',
                  background: '#0a1628',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  color: '#6b8aaa',
                  textTransform: 'capitalize',
                  border: '1px solid #1a3050',
                }}>
                  {room.ac_type === 'ac' ? 'AC' : 'Non-AC'}
                </span>
                <span style={{
                  fontSize: '10px',
                  background: '#0a1628',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  color: '#6b8aaa',
                  textTransform: 'capitalize',
                  border: '1px solid #1a3050',
                }}>
                  {room.bathroom_type}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '48px 0',
            background: '#0a1628',
            borderRadius: '16px',
            gridColumn: '1 / -1',
          }}>
            <p style={{ color: '#6b8aaa' }}>No rooms available for this selection.</p>
            <button
              onClick={() => navigate('/students/book-hostels')}
              style={{
                marginTop: '16px',
                color: '#f5a623',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e09515'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#f5a623'}
            >
              Go back and try different filters
            </button>
          </div>
        )}
      </div>

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

export default RoomDetails;