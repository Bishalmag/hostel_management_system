// src/students/views/PayNow.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';
import PayNowButton from '../components/PayNowButton';

const PayNowPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/bookings/${bookingId}/`);
      setBooking(response.data);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '256px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #1a3050',
          borderTop: '3px solid #f5a623',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ maxWidth: '672px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#f87171' }}>{error || 'Booking not found'}</p>
          <button
            onClick={() => navigate('/students/my-bookings')}
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
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '672px', margin: '0 auto', padding: '24px' }}>
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
        ← Back to Bookings
      </button>

      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a3050',
          background: 'rgba(18, 36, 72, 0.3)',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: 0,
          }}>Payment Details</h2>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            marginTop: '4px',
          }}>Complete your payment to confirm your booking</p>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Booking Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <div style={{
              background: 'rgba(18, 36, 72, 0.5)',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <p style={{
                color: '#6b8aaa',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
              }}>Room</p>
              <p style={{
                color: '#eaf2ff',
                fontWeight: 700,
                fontSize: '18px',
                marginTop: '4px',
              }}>Room {booking.room_number || booking.room}</p>
            </div>
            <div style={{
              background: 'rgba(18, 36, 72, 0.5)',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <p style={{
                color: '#6b8aaa',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
              }}>Status</p>
              <p style={{
                color: '#f5a623',
                fontWeight: 700,
                fontSize: '18px',
                textTransform: 'capitalize',
                marginTop: '4px',
              }}>{booking.status}</p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <div style={{
              background: 'rgba(18, 36, 72, 0.5)',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <p style={{
                color: '#6b8aaa',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
              }}>Check-in</p>
              <p style={{
                color: '#eaf2ff',
                fontWeight: 600,
                marginTop: '4px',
              }}>{formatDate(booking.check_in_date)}</p>
            </div>
            <div style={{
              background: 'rgba(18, 36, 72, 0.5)',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <p style={{
                color: '#6b8aaa',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
              }}>Check-out</p>
              <p style={{
                color: '#eaf2ff',
                fontWeight: 600,
                marginTop: '4px',
              }}>{formatDate(booking.check_out_date)}</p>
            </div>
          </div>

          <div style={{
            background: 'rgba(245, 166, 35, 0.05)',
            border: '1px solid rgba(245, 166, 35, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                <p style={{
                  color: '#6b8aaa',
                  fontSize: '14px',
                  margin: 0,
                }}>Total Amount</p>
                <p style={{
                  color: '#f5a623',
                  fontWeight: 700,
                  fontSize: '32px',
                  marginTop: '4px',
                }}>{formatPrice(booking.total_amount)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  color: '#6b8aaa',
                  fontSize: '14px',
                  margin: 0,
                }}>Payment Method</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px',
                }}>
                  <img 
                    src="https://esewa.com.np/common/images/esewa_logo.png" 
                    alt="eSewa" 
                    style={{
                      height: '32px',
                      width: 'auto',
                    }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <span style={{
                    color: '#eaf2ff',
                    fontWeight: 500,
                  }}>eSewa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pay Now Button */}
          <PayNowButton 
            bookingId={booking.id} 
            amount={booking.total_amount}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(245, 166, 35, 0.3)',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: 'linear-gradient(to right, #f5a623, #e09515)',
              color: '#0a1628',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #e09515, #c47d0e)';
              e.currentTarget.style.boxShadow = '0 4px 30px rgba(245, 166, 35, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #f5a623, #e09515)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 166, 35, 0.3)';
            }}
          />

          <p style={{
            color: '#3a5070',
            fontSize: '12px',
            textAlign: 'center',
            marginTop: '12px',
          }}>
            You will be redirected to eSewa secure payment gateway to complete the transaction
          </p>
        </div>
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

export default PayNowPage;