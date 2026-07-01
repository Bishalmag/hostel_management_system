import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [processingPayment, setProcessingPayment] = useState(null);

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
    fetchUserBookings();
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const studentRes = await api.get('/students/');
      const students = studentRes.data.results || studentRes.data;
      const currentStudent = students.find(s => s.user === user?.id);
      
      if (!currentStudent) {
        setBookings([]);
        setLoading(false);
        return;
      }
      
      const bookingsRes = await api.get('/bookings/bookings/');
      const allBookings = bookingsRes.data.results || bookingsRes.data;
      const userBookings = allBookings.filter(b => b.student === currentStudent.id);
      
      const bookingsWithDetails = await Promise.all(
        userBookings.map(async (booking) => {
          try {
            const roomRes = await api.get(`/hostel/rooms/${booking.room}/`);
            const room = roomRes.data;
            const floorRes = await api.get(`/hostel/floors/${room.floor}/`);
            const floor = floorRes.data;
            const blockRes = await api.get(`/hostel/blocks/${floor.block}/`);
            const block = blockRes.data;
            const hostelRes = await api.get(`/hostel/hostels/${block.hostel}/`);
            const hostel = hostelRes.data;
            
            return {
              ...booking,
              room_number: room.room_number,
              room_type: room.room_type,
              floor_number: floor.floor_number,
              block_name: block.name,
              hostel_name: hostel.name,
              hostel_address: hostel.address,
            };
          } catch (err) {
            console.error('Error fetching details for booking:', booking.id, err);
            return booking;
          }
        })
      );
      
      setBookings(bookingsWithDetails);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    setCancelling(true);
    try {
      await api.delete(`/bookings/bookings/${bookingId}/`);
      await fetchUserBookings();
      alert('Booking cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
      setSelectedBooking(null);
    }
  };

  const handlePayment = async (booking) => {
    setProcessingPayment(booking.id);
    try {
      const response = await api.post('/bookings/payments/initiate/', {
        booking_id: booking.id
      });
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = response.data.form;
      document.body.appendChild(tempDiv);
      const form = tempDiv.querySelector('form');
      if (form) {
        form.submit();
      }
    } catch (err) {
      console.error('Payment initiation failed:', err);
      alert(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
      setProcessingPayment(null);
    }
  };

  const getStatusColor = (status, isPast) => {
    if (isPast) return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'cancelled':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'completed':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysRemaining = (checkOutDate) => {
    const today = new Date();
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getFilteredBookings = () => {
    const today = new Date();
    if (activeTab === 'upcoming') {
      return bookings.filter(b => new Date(b.check_out_date) >= today);
    } else if (activeTab === 'past') {
      return bookings.filter(b => new Date(b.check_out_date) < today);
    }
    return bookings;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
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
          Loading your bookings...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={fetchUserBookings}
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
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>My Bookings</h1>
        <p style={{ color: '#6b8aaa', marginTop: '4px' }}>View and manage your hostel bookings</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #1a3050',
        marginBottom: '24px',
      }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === 'upcoming' ? '#f5a623' : '#6b8aaa',
            borderBottom: activeTab === 'upcoming' ? '2px solid #f5a623' : '2px solid transparent',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'upcoming') e.currentTarget.style.color = '#c8daf0';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'upcoming') e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          Active & Upcoming
          {bookings.filter(b => new Date(b.check_out_date) >= new Date()).length > 0 && (
            <span style={{
              marginLeft: '8px',
              padding: '0px 6px',
              fontSize: '10px',
              background: 'rgba(245, 166, 35, 0.2)',
              borderRadius: '9999px',
              color: '#f5a623',
            }}>
              {bookings.filter(b => new Date(b.check_out_date) >= new Date()).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === 'past' ? '#f5a623' : '#6b8aaa',
            borderBottom: activeTab === 'past' ? '2px solid #f5a623' : '2px solid transparent',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'past') e.currentTarget.style.color = '#c8daf0';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'past') e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          Past Bookings
          {bookings.filter(b => new Date(b.check_out_date) < new Date()).length > 0 && (
            <span style={{
              marginLeft: '8px',
              padding: '0px 6px',
              fontSize: '10px',
              background: 'rgba(107, 114, 128, 0.2)',
              borderRadius: '9999px',
              color: '#6b8aaa',
            }}>
              {bookings.filter(b => new Date(b.check_out_date) < new Date()).length}
            </span>
          )}
        </button>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#eaf2ff', marginBottom: '8px' }}>No Bookings Found</h3>
          <p style={{ color: '#6b8aaa', marginBottom: '24px' }}>
            {activeTab === 'upcoming' 
              ? "You don't have any active or upcoming bookings." 
              : activeTab === 'past' 
              ? "You don't have any past bookings."
              : "You haven't made any hostel bookings yet."}
          </p>
          {(activeTab === 'upcoming' || activeTab === 'all') && (
            <button
              onClick={() => navigate('/students/book-hostels')}
              style={{
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
              Browse Hostels
            </button>
          )}
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{
                background: 'rgba(18, 36, 72, 0.3)',
                borderBottom: '1px solid #1a3050',
              }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hostel</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room Details</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check-in</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check-out</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid #1a3050' }}>
                {filteredBookings.map((booking) => {
                  const isPast = new Date(booking.check_out_date) < new Date();
                  const isPending = booking.status === 'pending';
                  
                  return (
                    <tr key={booking.id} style={{
                      borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(18, 36, 72, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <p style={{ color: '#eaf2ff', fontWeight: 500, margin: 0 }}>{booking.hostel_name}</p>
                          <p style={{ color: '#6b8aaa', fontSize: '14px', marginTop: '4px' }}>{booking.hostel_address}</p>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <p style={{ color: '#c8daf0', fontSize: '14px', margin: '2px 0' }}>
                            <span style={{ color: '#6b8aaa' }}>Block:</span> {booking.block_name}
                          </p>
                          <p style={{ color: '#c8daf0', fontSize: '14px', margin: '2px 0' }}>
                            <span style={{ color: '#6b8aaa' }}>Floor:</span> {booking.floor_number}
                          </p>
                          <p style={{ color: '#c8daf0', fontSize: '14px', margin: '2px 0' }}>
                            <span style={{ color: '#6b8aaa' }}>Room:</span> {booking.room_number} ({booking.room_type})
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ color: '#eaf2ff' }}>{formatDate(booking.check_in_date)}</p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ color: '#eaf2ff' }}>{formatDate(booking.check_out_date)}</p>
                        {!isPast && (
                          <p style={{ color: '#f5a623', fontSize: '12px', marginTop: '4px' }}>
                            {getDaysRemaining(booking.check_out_date)} days left
                          </p>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '2px 12px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: 500,
                          border: '1px solid',
                          display: 'inline-block',
                          background: isPast 
                            ? 'rgba(107, 114, 128, 0.1)' 
                            : booking.status?.toLowerCase() === 'approved'
                            ? 'rgba(29, 219, 168, 0.1)'
                            : booking.status?.toLowerCase() === 'pending'
                            ? 'rgba(245, 166, 35, 0.1)'
                            : 'rgba(107, 114, 128, 0.1)',
                          color: isPast 
                            ? '#6b8aaa' 
                            : booking.status?.toLowerCase() === 'approved'
                            ? '#1ddba8'
                            : booking.status?.toLowerCase() === 'pending'
                            ? '#f5a623'
                            : '#6b8aaa',
                          borderColor: isPast 
                            ? 'rgba(107, 114, 128, 0.3)' 
                            : booking.status?.toLowerCase() === 'approved'
                            ? 'rgba(29, 219, 168, 0.3)'
                            : booking.status?.toLowerCase() === 'pending'
                            ? 'rgba(245, 166, 35, 0.3)'
                            : 'rgba(107, 114, 128, 0.3)',
                        }}>
                          {isPast ? 'Completed' : (booking.status || 'Confirmed')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => navigate(`/students/booking/${booking.id}`)}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(18, 36, 72, 0.5)',
                              color: '#f5a623',
                              fontSize: '14px',
                              fontWeight: 500,
                              borderRadius: '8px',
                              border: '1px solid rgba(245, 166, 35, 0.2)',
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
                            View Details
                          </button>
                          {!isPast && isPending && (
                            <>
                              <button
                                onClick={() => handlePayment(booking)}
                                disabled={processingPayment === booking.id}
                                style={{
                                  padding: '6px 12px',
                                  background: 'rgba(29, 219, 168, 0.1)',
                                  color: '#1ddba8',
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  borderRadius: '8px',
                                  border: '1px solid rgba(29, 219, 168, 0.2)',
                                  cursor: processingPayment === booking.id ? 'not-allowed' : 'pointer',
                                  opacity: processingPayment === booking.id ? 0.5 : 1,
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                                onMouseEnter={(e) => {
                                  if (processingPayment !== booking.id) {
                                    e.currentTarget.style.background = 'rgba(29, 219, 168, 0.2)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(29, 219, 168, 0.1)';
                                }}
                              >
                                {processingPayment === booking.id ? (
                                  <>
                                    <span style={{
                                      width: '12px',
                                      height: '12px',
                                      border: '2px solid #1ddba8',
                                      borderTop: '2px solid transparent',
                                      borderRadius: '50%',
                                      display: 'inline-block',
                                      animation: 'spin 0.8s linear infinite',
                                    }} />
                                    Processing...
                                  </>
                                ) : (
                                  'Pay Now'
                                )}
                              </button>
                              <button
                                onClick={() => setSelectedBooking(booking)}
                                disabled={cancelling}
                                style={{
                                  padding: '6px 12px',
                                  background: 'rgba(248, 113, 113, 0.1)',
                                  color: '#f87171',
                                  fontSize: '14px',
                                  fontWeight: 500,
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
                                Cancel
                              </button>
                            </>
                          )}
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

      {/* Cancellation Modal */}
      {selectedBooking && (
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
            <p style={{ color: '#6b8aaa', marginBottom: '24px' }}>
              Are you sure you want to cancel your booking at <span style={{ color: '#eaf2ff' }}>{selectedBooking.hostel_name}</span>?
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setSelectedBooking(null)}
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
                onClick={() => handleCancelBooking(selectedBooking.id)}
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

export default MyBookings;