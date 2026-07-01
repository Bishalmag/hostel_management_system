// src/students/views/ViewBooking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';
import { useNotification } from '../../context/NotificationContext';

const ViewBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const bookingRes = await api.get(`/bookings/bookings/${bookingId}/`);
      const bookingData = bookingRes.data;
      
      const roomRes = await api.get(`/hostel/rooms/${bookingData.room}/`);
      const room = roomRes.data;
      
      const floorRes = await api.get(`/hostel/floors/${room.floor}/`);
      const floor = floorRes.data;
      
      const blockRes = await api.get(`/hostel/blocks/${floor.block}/`);
      const block = blockRes.data;
      
      const hostelRes = await api.get(`/hostel/hostels/${block.hostel}/`);
      const hostel = hostelRes.data;
      
      let payment = null;
      try {
        const paymentRes = await api.get(`/bookings/payments/?booking=${bookingId}`);
        const payments = paymentRes.data.results || paymentRes.data;
        payment = payments.length > 0 ? payments[0] : null;
      } catch (e) {
        console.log('No payment found for this booking');
      }
      
      setBooking({
        ...bookingData,
        room_number: room.room_number,
        room_type: room.room_type,
        floor_number: floor.floor_number,
        block_name: block.name,
        hostel_name: hostel.name,
        hostel_address: hostel.address,
        capacity: room.capacity,
        current_occupancy: room.current_occupancy,
        payment: payment,
      });
      
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      await api.patch(`/bookings/bookings/${bookingId}/`, {
        status: 'cancelled'
      });
      
      setBooking(prev => ({
        ...prev,
        status: 'cancelled'
      }));
      
      showSuccess('Booking cancelled successfully!', 'Cancelled');
      setShowCancelModal(false);
      await fetchBookingDetails();
      
    } catch (err) {
      console.error('Error cancelling booking:', err);
      showError(err.response?.data?.message || 'Failed to cancel booking.', 'Error');
    } finally {
      setCancelling(false);
    }
  };

  const handlePayment = () => {
    navigate(`/students/pay/${bookingId}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'rgba(245, 166, 35, 0.1)',
      approved: 'rgba(29, 219, 168, 0.1)',
      rejected: 'rgba(248, 113, 113, 0.1)',
      cancelled: 'rgba(107, 114, 128, 0.1)',
    };
    return colors[status] || 'rgba(107, 114, 128, 0.1)';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      pending: '#f5a623',
      approved: '#1ddba8',
      rejected: '#f87171',
      cancelled: '#6b8aaa',
    };
    return colors[status] || '#6b8aaa';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '';
      case 'approved': return '';
      case 'rejected': return '';
      case 'cancelled': return '';
      default: return '📋';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysRemaining = () => {
    if (!booking) return 0;
    const today = new Date();
    const checkOut = new Date(booking.check_out_date);
    const diffTime = checkOut - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStayDuration = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const diffTime = checkOut - checkIn;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
          <p style={{ color: '#6b8aaa' }}>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#f87171', marginBottom: '16px' }}>{error || 'Booking not found'}</p>
          <button
            onClick={() => navigate('/students/my-bookings')}
            style={{
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
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const isActive = booking.status === 'approved' && new Date(booking.check_out_date) >= new Date();
  const isPending = booking.status === 'pending';
  const isPast = new Date(booking.check_out_date) < new Date();

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto', padding: '24px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/students/my-bookings')}
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
        ← Back to My Bookings
      </button>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>Booking Details</h1>
          <p style={{ color: '#6b8aaa', marginTop: '4px' }}>Booking #{booking.id}</p>
        </div>
        <span style={{
          padding: '6px 16px',
          borderRadius: '9999px',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: getStatusColor(booking.status),
          color: getStatusTextColor(booking.status),
          borderColor: getStatusColor(booking.status),
          textTransform: 'capitalize',
        }}>
          {getStatusIcon(booking.status)}
          {booking.status}
        </span>
      </div>

      {/* Booking Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Hostel</p>
          <p style={{ color: '#eaf2ff', fontWeight: 600, marginTop: '4px' }}>{booking.hostel_name}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Room</p>
          <p style={{ color: '#eaf2ff', fontWeight: 600, marginTop: '4px' }}>Room {booking.room_number}</p>
          <p style={{ color: '#6b8aaa', fontSize: '12px', margin: '2px 0' }}>Block: {booking.block_name}</p>
          <p style={{ color: '#6b8aaa', fontSize: '12px', margin: 0 }}>Floor: {booking.floor_number}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Stay Duration</p>
          <p style={{ color: '#eaf2ff', fontWeight: 600, marginTop: '4px' }}>{getStayDuration()} days</p>
          <p style={{ color: '#6b8aaa', fontSize: '12px', margin: '2px 0' }}>Check-in: {formatDate(booking.check_in_date)}</p>
          <p style={{ color: '#6b8aaa', fontSize: '12px', margin: 0 }}>Check-out: {formatDate(booking.check_out_date)}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Amount</p>
          <p style={{ color: '#f5a623', fontWeight: 700, fontSize: '24px', marginTop: '4px' }}>{formatPrice(booking.total_amount)}</p>
          {isActive && (
            <p style={{ color: '#f5a623', fontSize: '12px', marginTop: '4px' }}>{getDaysRemaining()} days remaining</p>
          )}
        </div>
      </div>

      {/* Room Details */}
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a3050',
          background: 'rgba(18, 36, 72, 0.3)',
        }}>
          <h2 style={{
            color: '#eaf2ff',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '18px',
            margin: 0,
          }}>
            <span style={{ fontSize: '20px' }}>🏠</span> Room Details
          </h2>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}>
            <div>
              <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Room Number</p>
              <p style={{ color: '#eaf2ff', fontSize: '18px', fontWeight: 600, marginTop: '4px' }}>Room {booking.room_number}</p>
            </div>
            <div>
              <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Room Type</p>
              <p style={{ color: '#eaf2ff', textTransform: 'capitalize', marginTop: '4px' }}>{booking.room_type}</p>
            </div>
            <div>
              <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Block / Floor</p>
              <p style={{ color: '#eaf2ff', marginTop: '4px' }}>{booking.block_name} / Floor {booking.floor_number}</p>
            </div>
            <div>
              <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Capacity</p>
              <p style={{ color: '#eaf2ff', marginTop: '4px' }}>{booking.capacity} persons</p>
            </div>
            <div>
              <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Current Occupancy</p>
              <p style={{ color: '#eaf2ff', marginTop: '4px' }}>{booking.current_occupancy} occupants</p>
            </div>
            <div>
              <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Hostel Address</p>
              <p style={{ color: '#eaf2ff', fontSize: '14px', marginTop: '4px' }}>{booking.hostel_address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      {booking.payment && (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #1a3050',
            background: 'rgba(18, 36, 72, 0.3)',
          }}>
            <h2 style={{
              color: '#eaf2ff',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              margin: 0,
            }}>
              <span style={{ fontSize: '20px' }}>💰</span> Payment Details
            </h2>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}>
              <div>
                <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Amount</p>
                <p style={{ color: '#eaf2ff', fontSize: '18px', fontWeight: 600, marginTop: '4px' }}>{formatPrice(booking.payment.amount)}</p>
              </div>
              <div>
                <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Status</p>
                <span style={{
                  padding: '2px 12px',
                  borderRadius: '9999px',
                  fontSize: '10px',
                  fontWeight: 500,
                  border: '1px solid',
                  display: 'inline-block',
                  marginTop: '4px',
                  background: booking.payment.paid_status === 'paid' 
                    ? 'rgba(29, 219, 168, 0.1)' 
                    : 'rgba(245, 166, 35, 0.1)',
                  color: booking.payment.paid_status === 'paid' 
                    ? '#1ddba8' 
                    : '#f5a623',
                  borderColor: booking.payment.paid_status === 'paid' 
                    ? 'rgba(29, 219, 168, 0.3)' 
                    : 'rgba(245, 166, 35, 0.3)',
                }}>
                  {booking.payment.paid_status}
                </span>
              </div>
              <div>
                <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Paid On</p>
                <p style={{ color: '#eaf2ff', marginTop: '4px' }}>{booking.payment.paid_at ? formatDate(booking.payment.paid_at) : 'Not paid yet'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {isPending && (
          <button
            onClick={handlePayment}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(to right, #f5a623, #e09515)',
              color: '#0a1628',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(245, 166, 35, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #e09515, #c47d0e)';
              e.currentTarget.style.boxShadow = '0 4px 30px rgba(245, 166, 35, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #f5a623, #e09515)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 166, 35, 0.3)';
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pay Now
          </button>
        )}
        
        {isActive && (
          <button
            onClick={() => navigate(`/students/pay-rent`)}
            style={{
              padding: '10px 24px',
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
            Pay Rent
          </button>
        )}
        
        {(isPending || isActive) && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={cancelling}
            style={{
              padding: '10px 24px',
              background: 'rgba(248, 113, 113, 0.1)',
              color: '#f87171',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              cursor: cancelling ? 'not-allowed' : 'pointer',
              opacity: cancelling ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!cancelling) {
                e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)';
            }}
          >
            Cancel Booking
          </button>
        )}
        
        <button
          onClick={() => navigate('/students/my-bookings')}
          style={{
            padding: '10px 24px',
            background: 'rgba(18, 36, 72, 0.5)',
            color: '#c8daf0',
            fontWeight: 600,
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
          View All Bookings
        </button>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
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
            maxWidth: '448px',
            width: '100%',
            padding: '24px',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#eaf2ff', marginBottom: '16px' }}>Cancel Booking?</h2>
            <p style={{ color: '#6b8aaa', marginBottom: '8px' }}>
              Are you sure you want to cancel your booking at <span style={{ color: '#eaf2ff' }}>{booking.hostel_name}</span>?
            </p>
            <p style={{ color: '#3a5070', fontSize: '14px', marginBottom: '24px' }}>
              Room {booking.room_number} • {formatDate(booking.check_in_date)} to {formatDate(booking.check_out_date)}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: '#1a3050',
                  color: '#eaf2ff',
                  fontWeight: 500,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2a4870'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a3050'}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: '#f87171',
                  color: '#0a1628',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  opacity: cancelling ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!cancelling) e.currentTarget.style.background = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f87171';
                }}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
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

export default ViewBooking;