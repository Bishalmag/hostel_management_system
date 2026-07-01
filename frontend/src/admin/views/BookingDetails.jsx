import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const Row = ({ label, value }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '10px 0',
    borderBottom: '1px solid #1a3050',
  }}>
    <span style={{
      fontSize: '12px',
      color: '#6b8aaa',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      width: '144px',
      flexShrink: 0,
    }}>{label}</span>
    <span style={{
      fontSize: '14px',
      color: '#eaf2ff',
    }}>{value ?? '—'}</span>
  </div>
);

const BookingDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const [booking, setBooking] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      
      const bookingRes = await api.get(`/bookings/bookings/${id}/`);
      const bookingData = bookingRes.data;
      setBooking(bookingData);
      
      if (bookingData.room) {
        const roomRes = await api.get(`/hostel/rooms/${bookingData.room}/`);
        setRoomDetails(roomRes.data);
      }
      
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setMessage({ type: 'error', text: 'Failed to load booking details.' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    if (submitting) return;
    
    if (status === 'approved' && roomDetails) {
      if (roomDetails.current_occupancy >= roomDetails.capacity) {
        setMessage({ 
          type: 'error', 
          text: `Room ${roomDetails.room_number} is fully occupied! Capacity: ${roomDetails.capacity}/${roomDetails.current_occupancy}` 
        });
        return;
      }
    }
    
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.patch(`/bookings/bookings/${id}/`, { status });
      
      if (status === 'approved' && booking && roomDetails) {
        try {
          await api.patch(`/hostel/rooms/${booking.room}/`, {
            current_occupancy: roomDetails.current_occupancy + 1
          });
        } catch (roomErr) {
          console.error('Error updating room occupancy:', roomErr);
        }
        
        try {
          await api.post('/allocation/allocations/', {
            student: booking.student,
            room: booking.room,
            status: 'active',
          });
        } catch (allocationErr) {
          console.error('Allocation creation error:', allocationErr);
        }
      }
      
      setMessage({ 
        type: 'success', 
        text: `Booking ${status} successfully!` 
      });
      
      showSuccess(`Booking #${id} has been ${status}`, 'Success');
      
      await fetchBookingDetails();
      
      setTimeout(() => {
        navigate('/admin/bookings');
      }, 2000);
      
    } catch (err) {
      console.error('Error updating booking:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update booking.';
      setMessage({ type: 'error', text: errorMsg });
      showError(errorMsg, 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        maxWidth: '672px',
        margin: '0 auto',
        padding: '24px',
      }}>
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
          Loading booking details...
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{
        maxWidth: '672px',
        margin: '0 auto',
        padding: '24px',
      }}>
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#f87171' }}>Booking not found.</p>
          <button
            onClick={() => navigate('/admin/bookings')}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#f5a623',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
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
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const isRoomFull = roomDetails && roomDetails.current_occupancy >= roomDetails.capacity;

  return (
    <div style={{
      maxWidth: '672px',
      margin: '0 auto',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <div>
        <button
          onClick={() => navigate('/admin/bookings')}
          style={{
            fontSize: '14px',
            color: '#6b8aaa',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#a78bfa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          ← Back to Bookings
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>Booking #{booking.id}</h1>
        <p style={{
          color: '#6b8aaa',
          fontSize: '14px',
          marginTop: '4px',
          marginBottom: 0,
        }}>Review and manage booking details</p>
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

      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h2 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#6b8aaa',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '16px',
          marginTop: 0,
        }}>Booking Details</h2>
        <div>
          <Row label="Student" value={booking.student} />
          <Row label="Room" value={booking.room} />
          <Row label="Room Number" value={roomDetails?.room_number || 'N/A'} />
          <Row label="Check-in" value={booking.check_in_date} />
          <Row label="Check-out" value={booking.check_out_date} />
          <Row label="Amount" value={booking.total_amount ? `Rs. ${booking.total_amount}` : '—'} />
          <Row label="Status" value={booking.status} />
        </div>
      </div>

      {roomDetails && (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#6b8aaa',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '16px',
            marginTop: 0,
          }}>Room Status</h2>
          <div>
            <Row label="Room Number" value={roomDetails.room_number} />
            <Row label="Capacity" value={roomDetails.capacity} />
            <Row label="Current Occupancy" value={roomDetails.current_occupancy} />
            <Row label="Available Spots" value={roomDetails.capacity - roomDetails.current_occupancy} />
            <Row 
              label="Status" 
              value={
                <span style={{
                  color: isRoomFull ? '#f87171' : '#1ddba8',
                  fontWeight: 500,
                }}>
                  {isRoomFull ? 'FULL' : 'AVAILABLE'}
                </span>
              } 
            />
          </div>
        </div>
      )}

      {booking.status === 'pending' && (
        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={() => updateStatus('approved')}
            disabled={submitting || isRoomFull}
            style={{
              flex: 1,
              padding: '12px',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: (submitting || isRoomFull) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: (submitting || isRoomFull) ? 0.5 : 1,
              background: isRoomFull ? '#3a5070' : '#1ddba8',
              color: isRoomFull ? '#6b8aaa' : '#0a1628',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (!submitting && !isRoomFull) {
                e.currentTarget.style.background = '#16c39a';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting && !isRoomFull) {
                e.currentTarget.style.background = '#1ddba8';
              }
            }}
            title={isRoomFull ? 'Room is fully occupied' : ''}
          >
            {isRoomFull ? '◆ Room Full' : '✓ Approve'}
          </button>
          <button
            onClick={() => updateStatus('rejected')}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '12px',
              background: '#f87171',
              color: '#0a1628',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: submitting ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = '#ef4444';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = '#f87171';
              }
            }}
          >
            ✕ Reject
          </button>
        </div>
      )}

      {booking.status !== 'pending' && (
        <div style={{
          background: 'rgba(15, 32, 64, 0.3)',
          border: '1px solid #1a3050',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            margin: 0,
          }}>
            This booking has already been{' '}
            <span style={{
              fontWeight: 500,
              color: '#eaf2ff',
            }}>{booking.status}</span>
            {booking.status === 'approved' && ' ✓'}
            {booking.status === 'rejected' && ' ✕'}
          </p>
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

export default BookingDetails;