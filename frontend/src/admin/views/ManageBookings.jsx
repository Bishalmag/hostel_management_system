import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const statusColors = {
  pending: { bg: 'rgba(245, 166, 35, 0.2)', text: '#f5a623', border: 'rgba(245, 166, 35, 0.3)' },
  approved: { bg: 'rgba(29, 219, 168, 0.2)', text: '#1ddba8', border: 'rgba(29, 219, 168, 0.3)' },
  rejected: { bg: 'rgba(248, 113, 113, 0.2)', text: '#f87171', border: 'rgba(248, 113, 113, 0.3)' },
  cancelled: { bg: 'rgba(107, 138, 170, 0.2)', text: '#6b8aaa', border: 'rgba(107, 138, 170, 0.3)' },
};

const ManageBookings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/bookings/');
      const allBookings = response.data.results ?? response.data;
      
      const bookingsWithDetails = await Promise.all(
        allBookings.map(async (booking) => {
          try {
            const roomRes = await api.get(`/hostel/rooms/${booking.room}/`);
            const room = roomRes.data;
            
            const floorRes = await api.get(`/hostel/floors/${room.floor}/`);
            const floor = floorRes.data;
            
            const blockRes = await api.get(`/hostel/blocks/${floor.block}/`);
            const block = blockRes.data;
            
            let studentName = `Student ${booking.student}`;
            try {
              const studentRes = await api.get(`/students/${booking.student}/`);
              studentName = studentRes.data.user_name || studentRes.data.user?.full_name || studentName;
            } catch (e) {
              console.log('Could not fetch student name');
            }
            
            return {
              ...booking,
              room_number: room.room_number,
              room_type: room.room_type,
              floor_number: floor.floor_number,
              block_name: block.name,
              capacity: room.capacity,
              current_occupancy: room.current_occupancy,
              student_name: studentName,
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
      showError('Failed to load bookings', 'Error');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, refreshKey]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (processing === bookingId) return;
    
    setProcessing(bookingId);
    
    const originalBooking = bookings.find(b => b.id === bookingId);
    if (!originalBooking) {
      showError('Booking not found', 'Error');
      setProcessing(null);
      return;
    }

    setBookings(prevBookings =>
      prevBookings.map(b =>
        b.id === bookingId
          ? { ...b, status: newStatus }
          : b
      )
    );

    try {
      await api.patch(`/bookings/bookings/${bookingId}/`, {
        status: newStatus
      });

      if (newStatus === 'approved' && originalBooking.status === 'pending') {
        try {
          const roomRes = await api.get(`/hostel/rooms/${originalBooking.room}/`);
          const room = roomRes.data;
          
          if (room.current_occupancy >= room.capacity) {
            showError(`Room ${room.room_number} is fully occupied!`, 'Cannot Approve');
            setBookings(prevBookings =>
              prevBookings.map(b =>
                b.id === bookingId
                  ? { ...b, status: originalBooking.status }
                  : b
              )
            );
            setProcessing(null);
            return;
          }
          
          await api.patch(`/hostel/rooms/${originalBooking.room}/`, {
            current_occupancy: room.current_occupancy + 1
          });
        } catch (roomErr) {
          console.error('Error updating room occupancy:', roomErr);
        }
      } else if (newStatus === 'rejected' && originalBooking.status === 'approved') {
        try {
          const roomRes = await api.get(`/hostel/rooms/${originalBooking.room}/`);
          const room = roomRes.data;
          await api.patch(`/hostel/rooms/${originalBooking.room}/`, {
            current_occupancy: Math.max(0, room.current_occupancy - 1)
          });
        } catch (roomErr) {
          console.error('Error updating room occupancy:', roomErr);
        }
      }

      if (newStatus === 'approved') {
        showSuccess(`Booking #${bookingId} has been approved`, 'Approved');
      } else if (newStatus === 'rejected') {
        showSuccess(`Booking #${bookingId} has been rejected`, 'Rejected');
      }

      setRefreshKey(prev => prev + 1);

    } catch (err) {
      console.error('Error updating booking status:', err);
      
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b.id === bookingId
            ? { ...b, status: originalBooking.status }
            : b
        )
      );
      
      let errorMsg = 'Failed to update booking status. ';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const messages = Object.values(errorData).flat();
          errorMsg += messages.join(', ');
        } else {
          errorMsg += errorData;
        }
      } else {
        errorMsg += 'Please try again.';
      }
      
      showError(errorMsg, 'Update Failed');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCount = (status) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>Manage Bookings</h1>
        </div>
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
          Loading bookings...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>Manage Bookings</h1>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: '#0f2040',
          border: '1px solid #1a3050',
          borderRadius: '8px',
          padding: '4px',
        }}>
          {['all', 'pending', 'approved', 'rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 16px',
                fontSize: '12px',
                borderRadius: '6px',
                fontWeight: 500,
                textTransform: 'capitalize',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: filter === tab ? '#122448' : 'transparent',
                color: filter === tab ? '#eaf2ff' : '#6b8aaa',
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
              {tab} ({getCount(tab)})
            </button>
          ))}
        </div>
      </div>

      <div style={{
        background: '#0a1628',
        border: '1px solid #1a3050',
        borderRadius: '12px',
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
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Student</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Block</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Room No.</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Room Type</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Check-in</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Check-out</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ divideY: '1px solid #1a3050' }}>
              {filtered.map(booking => {
                const statusStyle = statusColors[booking.status] || statusColors.pending;
                return (
                  <tr
                    key={booking.id}
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
                    <td style={{ padding: '16px 20px', color: '#6b8aaa', fontFamily: 'monospace', fontSize: '12px' }}>
                      #{booking.id}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>
                        {booking.student_name || `Student ${booking.student}`}
                      </p>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ color: '#c8daf0', fontSize: '14px' }}>
                        {booking.block_name || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ color: '#eaf2ff', fontWeight: 500 }}>
                        {booking.room_number || booking.room}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ color: '#c8daf0', fontSize: '14px', textTransform: 'capitalize' }}>
                        {booking.room_type || 'Standard'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ color: '#c8daf0', fontSize: '14px' }}>
                        {formatDate(booking.check_in_date)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ color: '#c8daf0', fontSize: '14px' }}>
                        {formatDate(booking.check_out_date)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '12px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: `1px solid ${statusStyle.border}`,
                        textTransform: 'capitalize',
                        background: statusStyle.bg,
                        color: statusStyle.text,
                      }}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'approved')}
                              disabled={processing === booking.id}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(29, 219, 168, 0.2)',
                                color: '#1ddba8',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: processing === booking.id ? 'not-allowed' : 'pointer',
                                transition: 'background 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: processing === booking.id ? 0.5 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (processing !== booking.id) {
                                  e.currentTarget.style.background = 'rgba(29, 219, 168, 0.3)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(29, 219, 168, 0.2)';
                              }}
                            >
                              <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                              disabled={processing === booking.id}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(248, 113, 113, 0.2)',
                                color: '#f87171',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: processing === booking.id ? 'not-allowed' : 'pointer',
                                transition: 'background 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: processing === booking.id ? 0.5 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (processing !== booking.id) {
                                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.3)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)';
                              }}
                            >
                              <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </>
                        )}
                        {booking.status === 'approved' && (
                          <span style={{
                            fontSize: '12px',
                            color: '#1ddba8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approved
                          </span>
                        )}
                        {booking.status === 'rejected' && (
                          <span style={{
                            fontSize: '12px',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Rejected
                          </span>
                        )}
                        <button
                          onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                          style={{
                            padding: '6px 12px',
                            background: '#0f2040',
                            color: '#c8daf0',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
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
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{
                    padding: '48px 20px',
                    textAlign: 'center',
                    color: '#6b8aaa',
                  }}>
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && bookings.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}>
          <div style={{
            background: '#0a1628',
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
            }}>Total</p>
            <p style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#eaf2ff',
              margin: '4px 0 0 0',
            }}>{bookings.length}</p>
          </div>
          <div style={{
            background: '#0a1628',
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
            }}>Pending</p>
            <p style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#f5a623',
              margin: '4px 0 0 0',
            }}>
              {bookings.filter(b => b.status === 'pending').length}
            </p>
          </div>
          <div style={{
            background: '#0a1628',
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
            }}>Approved</p>
            <p style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1ddba8',
              margin: '4px 0 0 0',
            }}>
              {bookings.filter(b => b.status === 'approved').length}
            </p>
          </div>
          <div style={{
            background: '#0a1628',
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
            }}>Rejected</p>
            <p style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#f87171',
              margin: '4px 0 0 0',
            }}>
              {bookings.filter(b => b.status === 'rejected').length}
            </p>
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

export default ManageBookings;