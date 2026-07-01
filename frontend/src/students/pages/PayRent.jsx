// src/students/pages/PayRent.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';
import PayNowButton from '../components/PayNowButton';

const PayRent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [unpaidPayments, setUnpaidPayments] = useState([]);
  const [paidPayments, setPaidPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
    fetchPaymentData();
  }, [user]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const studentRes = await api.get('/students/');
      const students = studentRes.data.results || studentRes.data;
      const currentStudent = students.find(s => s.user === user?.id);

      if (!currentStudent) {
        setError('Student profile not found');
        setLoading(false);
        return;
      }

      const paymentsRes = await api.get(`/bookings/payments/`);
      const allPayments = paymentsRes.data.results || paymentsRes.data;
      
      const studentPayments = allPayments.filter(p => p.student === currentStudent.id);
      
      const unpaid = studentPayments.filter(p => p.paid_status === 'pending' || p.paid_status === 'overdue');
      const paid = studentPayments.filter(p => p.paid_status === 'paid');

      const paidWithDetails = await Promise.all(
        paid.map(async (payment) => {
          try {
            let roomNumber = 'N/A';
            let hostelName = 'N/A';
            
            if (payment.booking) {
              const bookingRes = await api.get(`/bookings/bookings/${payment.booking}/`);
              const booking = bookingRes.data;
              
              if (booking.room) {
                const roomRes = await api.get(`/hostel/rooms/${booking.room}/`);
                const room = roomRes.data;
                roomNumber = room.room_number;
                
                const floorRes = await api.get(`/hostel/floors/${room.floor}/`);
                const floor = floorRes.data;
                const blockRes = await api.get(`/hostel/blocks/${floor.block}/`);
                const block = blockRes.data;
                const hostelRes = await api.get(`/hostel/hostels/${block.hostel}/`);
                hostelName = hostelRes.data.name;
              }
            }
            
            return {
              ...payment,
              room_number: roomNumber,
              hostel_name: hostelName,
            };
          } catch (err) {
            console.error('Error fetching details for payment:', payment.id, err);
            return payment;
          }
        })
      );

      setPayments(studentPayments);
      setUnpaidPayments(unpaid);
      setPaidPayments(paidWithDetails);

    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchPaymentData();
  };

  const handleViewReceipt = (payment) => {
    navigate(`/students/receipts/${payment.booking}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'rgba(245, 166, 35, 0.1)',
      paid: 'rgba(29, 219, 168, 0.1)',
      overdue: 'rgba(248, 113, 113, 0.1)',
      failed: 'rgba(248, 113, 113, 0.1)',
    };
    return colors[status] || 'rgba(107, 114, 128, 0.1)';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      pending: '#f5a623',
      paid: '#1ddba8',
      overdue: '#f87171',
      failed: '#f87171',
    };
    return colors[status] || '#6b8aaa';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return '';
      case 'pending': return '';
      case 'overdue': return '';
      case 'failed': return '';
      default: return '📋';
    }
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
          <p style={{ color: '#6b8aaa' }}>Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>Pay Rent</h1>
        <p style={{ color: '#6b8aaa', marginTop: '4px' }}>View and pay your hostel rent</p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          color: '#f87171',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Total Payments</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#eaf2ff', marginTop: '4px' }}>{payments.length}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Pending Payments</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#f5a623', marginTop: '4px' }}>{unpaidPayments.length}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Paid Payments</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#1ddba8', marginTop: '4px' }}>{paidPayments.length}</p>
        </div>
      </div>

      {/* Unpaid Payments Section */}
      {unpaidPayments.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#eaf2ff',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ color: '#f87171' }}></span> Pending Payments
            <span style={{ fontSize: '14px', color: '#6b8aaa', fontWeight: 400, marginLeft: '8px' }}>
              ({unpaidPayments.length} pending)
            </span>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            {unpaidPayments.map((payment) => (
              <div
                key={payment.id}
                style={{
                  background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
                  border: '1px solid #1a3050',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
              >
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                  }}>
                    <div>
                      <h3 style={{ color: '#eaf2ff', fontWeight: 600, margin: 0 }}>
                        Payment #{payment.id}
                      </h3>
                      <p style={{ color: '#6b8aaa', fontSize: '14px', marginTop: '4px' }}>
                        Due: {formatDate(payment.due_date)}
                      </p>
                    </div>
                    <span style={{
                      padding: '2px 12px',
                      borderRadius: '9999px',
                      fontSize: '10px',
                      fontWeight: 500,
                      border: '1px solid',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: getStatusBadge(payment.paid_status),
                      color: getStatusTextColor(payment.paid_status),
                      borderColor: getStatusBadge(payment.paid_status),
                      textTransform: 'capitalize',
                    }}>
                      {getStatusIcon(payment.paid_status)}
                      {payment.paid_status}
                    </span>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      padding: '4px 0',
                    }}>
                      <span style={{ color: '#6b8aaa' }}>Amount</span>
                      <span style={{ color: '#eaf2ff', fontWeight: 700, fontSize: '18px' }}>{formatPrice(payment.amount)}</span>
                    </div>
                    {payment.booking_room && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        padding: '4px 0',
                      }}>
                        <span style={{ color: '#6b8aaa' }}>Room</span>
                        <span style={{ color: '#eaf2ff' }}>Room {payment.booking_room}</span>
                      </div>
                    )}
                    {payment.paid_status === 'overdue' && (
                      <div style={{
                        background: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                        borderRadius: '8px',
                        padding: '8px',
                        marginTop: '8px',
                      }}>
                        <p style={{ color: '#f87171', fontSize: '12px', margin: 0 }}> This payment is overdue</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handlePayNow(payment)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'linear-gradient(to right, #f5a623, #e09515)',
                      color: '#0a1628',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid Payments Section */}
      {paidPayments.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#eaf2ff',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ color: '#1ddba8' }}></span> Payment History
            <span style={{ fontSize: '14px', color: '#6b8aaa', fontWeight: 400, marginLeft: '8px' }}>
              ({paidPayments.length} payments)
            </span>
          </h2>
          <div style={{
            background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
            border: '1px solid #1a3050',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                <thead style={{
                  background: 'rgba(18, 36, 72, 0.3)',
                  borderBottom: '1px solid #1a3050',
                }}>
                  <tr style={{
                    color: '#6b8aaa',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500 }}>Payment ID</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500 }}>Amount</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500 }}>Room</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500 }}>Paid On</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500 }}>Status</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500 }}>Receipt</th>
                  </tr>
                </thead>
                <tbody style={{ divideY: '1px solid #1a3050' }}>
                  {paidPayments.map((payment) => (
                    <tr key={payment.id} style={{
                      borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(18, 36, 72, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ color: '#6b8aaa', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>#{payment.id}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ color: '#eaf2ff', fontWeight: 600, margin: 0 }}>{formatPrice(payment.amount)}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ color: '#c8daf0', margin: 0 }}>Room {payment.room_number || 'N/A'}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ color: '#c8daf0', fontSize: '14px', margin: 0 }}>{formatDate(payment.paid_at)}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '2px 12px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: 500,
                          border: '1px solid',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: getStatusBadge(payment.paid_status),
                          color: getStatusTextColor(payment.paid_status),
                          borderColor: getStatusBadge(payment.paid_status),
                          textTransform: 'capitalize',
                        }}>
                          {getStatusIcon(payment.paid_status)}
                          {payment.paid_status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          onClick={() => handleViewReceipt(payment)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(245, 166, 35, 0.1)',
                            color: '#f5a623',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '8px',
                            border: '1px solid rgba(245, 166, 35, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(245, 166, 35, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(245, 166, 35, 0.1)';
                          }}
                        >
                          <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Payments */}
      {payments.length === 0 && (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#eaf2ff', marginBottom: '8px' }}>No Payment Records</h3>
          <p style={{ color: '#6b8aaa' }}>You don't have any payment records yet.</p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>Confirm Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
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

            <div>
              <div style={{
                background: 'rgba(18, 36, 72, 0.5)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}>
                  <span style={{ color: '#6b8aaa' }}>Payment Amount</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#f5a623' }}>{formatPrice(selectedPayment.amount)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                }}>
                  <span style={{ color: '#6b8aaa' }}>Due Date</span>
                  <span style={{ color: '#eaf2ff' }}>{formatDate(selectedPayment.due_date)}</span>
                </div>
                {selectedPayment.booking_room && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    marginTop: '4px',
                  }}>
                    <span style={{ color: '#6b8aaa' }}>Room</span>
                    <span style={{ color: '#eaf2ff' }}>Room {selectedPayment.booking_room}</span>
                  </div>
                )}
              </div>

              <div style={{
                background: 'rgba(245, 166, 35, 0.05)',
                border: '1px solid rgba(245, 166, 35, 0.2)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <p style={{ fontSize: '14px', color: '#6b8aaa', textAlign: 'center', margin: 0 }}>
                  You will be redirected to eSewa to complete the payment
                </p>
              </div>

              <PayNowButton
                bookingId={selectedPayment.booking}
                amount={selectedPayment.amount}
                className="w-full py-3 text-base font-bold shadow-xl shadow-green-500/30 hover:shadow-green-500/50"
              />

              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(18, 36, 72, 0.5)',
                  color: '#c8daf0',
                  fontWeight: 500,
                  borderRadius: '8px',
                  border: '1px solid #1a3050',
                  cursor: 'pointer',
                  marginTop: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(18, 36, 72, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(18, 36, 72, 0.5)';
                }}
              >
                Cancel
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

export default PayRent;