// src/students/views/ViewReceipts.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';
import { useNotification } from '../../context/NotificationContext';

const ViewReceipts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useNotification();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

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
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const studentRes = await api.get('/students/');
      const students = studentRes.data.results || studentRes.data;
      const currentStudent = students.find(s => s.user === user?.id);

      if (!currentStudent) {
        setPayments([]);
        setLoading(false);
        return;
      }

      const paymentsRes = await api.get(`/bookings/payments/`);
      const allPayments = paymentsRes.data.results || paymentsRes.data;
      
      const studentPayments = allPayments.filter(p => 
        p.student === currentStudent.id && p.paid_status === 'paid'
      );
      
      const paymentsWithDetails = await Promise.all(
        studentPayments.map(async (payment) => {
          try {
            let roomNumber = 'N/A';
            let hostelName = 'N/A';
            let bookingDate = 'N/A';
            
            if (payment.booking) {
              const bookingRes = await api.get(`/bookings/bookings/${payment.booking}/`);
              const booking = bookingRes.data;
              bookingDate = booking.created_at;
              
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
              booking_date: bookingDate,
            };
          } catch (err) {
            console.error('Error fetching details for payment:', payment.id, err);
            return payment;
          }
        })
      );
      
      setPayments(paymentsWithDetails);
      
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payment receipts');
      showError('Failed to load payment receipts', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPayments = () => {
    const now = new Date();
    if (filter === 'this_month') {
      return payments.filter(p => {
        const date = new Date(p.paid_at);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
    } else if (filter === 'last_month') {
      return payments.filter(p => {
        const date = new Date(p.paid_at);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return date >= lastMonth && date < thisMonth;
      });
    } else if (filter === 'this_year') {
      return payments.filter(p => {
        const date = new Date(p.paid_at);
        return date.getFullYear() === now.getFullYear();
      });
    }
    return payments;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: '',
      card: '',
      bank_transfer: '',
      esewa: '',
      mobile_banking: '',
      online: '',
    };
    return icons[method] || '';
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Cash',
      card: 'Card',
      bank_transfer: 'Bank Transfer',
      esewa: 'eSewa',
      mobile_banking: 'Mobile Banking',
      online: 'Online',
    };
    return labels[method] || method;
  };

  const filteredPayments = getFilteredPayments();
  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
    thisMonth: payments.filter(p => {
      const now = new Date();
      const date = new Date(p.paid_at);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
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
          <p style={{ color: '#6b8aaa' }}>Loading receipts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#f87171' }}>{error}</p>
          <button
            onClick={fetchPayments}
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
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/students/homepage')}
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
          ← Back to Dashboard
        </button>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>Payment Receipts</h1>
        <p style={{ color: '#6b8aaa', marginTop: '4px' }}>View all your payment receipts and history</p>
      </div>

      {/* Stats Cards */}
      {payments.length > 0 && (
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
            padding: '16px',
          }}>
            <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Receipts</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#eaf2ff', marginTop: '4px' }}>{stats.total}</p>
          </div>
          <div style={{
            background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
            border: '1px solid #1a3050',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Paid</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#1ddba8', marginTop: '4px' }}>{formatPrice(stats.totalAmount)}</p>
          </div>
          <div style={{
            background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
            border: '1px solid #1a3050',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <p style={{ color: '#6b8aaa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>This Month</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#f5a623', marginTop: '4px' }}>{stats.thisMonth}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        borderBottom: '1px solid #1a3050',
        marginBottom: '24px',
      }}>
        {['all', 'this_month', 'last_month', 'this_year'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: filter === tab ? '#f5a623' : '#6b8aaa',
              borderBottom: filter === tab ? '2px solid #f5a623' : '2px solid transparent',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize',
            }}
            onMouseEnter={(e) => {
              if (filter !== tab) e.currentTarget.style.color = '#c8daf0';
            }}
            onMouseLeave={(e) => {
              if (filter !== tab) e.currentTarget.style.color = '#6b8aaa';
            }}
          >
            {tab === 'all' ? 'All Receipts' : tab.replace('_', ' ')}
            <span style={{
              marginLeft: '8px',
              padding: '0px 6px',
              fontSize: '10px',
              background: 'rgba(107, 114, 128, 0.2)',
              borderRadius: '9999px',
              color: '#6b8aaa',
            }}>
              {tab === 'all' ? payments.length : getFilteredPayments().length}
            </span>
          </button>
        ))}
      </div>

      {/* Receipts List */}
      {filteredPayments.length === 0 ? (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧾</div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#eaf2ff', marginBottom: '8px' }}>No Receipts Found</h3>
          <p style={{ color: '#6b8aaa' }}>
            {payments.length === 0 
              ? "You haven't made any payments yet." 
              : `No receipts found for ${filter.replace('_', ' ')}.`}
          </p>
          {payments.length === 0 && (
            <button
              onClick={() => navigate('/students/pay-rent')}
              style={{
                marginTop: '16px',
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
              Make a Payment
            </button>
          )}
        </div>
      ) : (
        <div>
          {filteredPayments.map((payment) => (
            <div 
              key={payment.id} 
              style={{
                background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
                border: '1px solid #1a3050',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                marginBottom: '16px',
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
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}>
                  {/* Left Section */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px',
                    }}>
                      <span style={{ fontSize: '24px' }}></span>
                      <div>
                        <h3 style={{ color: '#eaf2ff', fontWeight: 600, margin: 0 }}>
                          Receipt #{payment.receipt_number || payment.id}
                        </h3>
                        <p style={{ color: '#6b8aaa', fontSize: '14px', marginTop: '4px' }}>
                          {formatDate(payment.paid_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '8px',
                      marginTop: '12px',
                    }}>
                      <div>
                        <p style={{ color: '#3a5070', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Amount</p>
                        <p style={{ color: '#f5a623', fontWeight: 700, fontSize: '18px', marginTop: '4px' }}>{formatPrice(payment.amount)}</p>
                      </div>
                      <div>
                        <p style={{ color: '#3a5070', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Payment Method</p>
                        <p style={{ color: '#eaf2ff', marginTop: '4px' }}>
                          <span style={{ marginRight: '4px' }}>{getPaymentMethodIcon(payment.payment_method)}</span>
                          {getPaymentMethodLabel(payment.payment_method)}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#3a5070', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Room</p>
                        <p style={{ color: '#eaf2ff', marginTop: '4px' }}>Room {payment.room_number}</p>
                      </div>
                      <div>
                        <p style={{ color: '#3a5070', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Hostel</p>
                        <p style={{ color: '#eaf2ff', marginTop: '4px' }}>{payment.hostel_name}</p>
                      </div>
                      {payment.transaction_code && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p style={{ color: '#3a5070', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Transaction ID</p>
                          <p style={{ color: '#c8daf0', fontSize: '14px', fontFamily: 'monospace', marginTop: '4px' }}>{payment.transaction_code}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}>
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowReceiptModal(true);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(245, 166, 35, 0.1)',
                        color: '#f5a623',
                        fontWeight: 500,
                        borderRadius: '8px',
                        border: '1px solid rgba(245, 166, 35, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(245, 166, 35, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(245, 166, 35, 0.1)';
                      }}
                    >
                      View Full Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
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
            maxWidth: '672px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              position: 'sticky',
              top: 0,
              background: 'rgba(10, 22, 40, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '16px 24px',
              borderBottom: '1px solid #1a3050',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}></span>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>
                  Receipt #{selectedPayment.receipt_number || selectedPayment.id}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedPayment(null);
                }}
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

            {/* Receipt Content */}
            <div id={`receipt-${selectedPayment.id}`} style={{ padding: '24px' }}>
              {/* Header */}
              <div style={{
                textAlign: 'center',
                borderBottom: '1px solid #1a3050',
                paddingBottom: '16px',
                marginBottom: '24px',
              }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>HOSTEL MANAGEMENT SYSTEM</h1>
                <p style={{ color: '#6b8aaa', marginTop: '4px' }}>Payment Receipt</p>
                <p style={{ color: '#3a5070', fontSize: '14px', marginTop: '4px' }}>Receipt #{selectedPayment.receipt_number || selectedPayment.id}</p>
              </div>

              {/* Details */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                }}>
                  <span style={{ color: '#6b8aaa' }}>Date</span>
                  <span style={{ color: '#eaf2ff' }}>{formatDate(selectedPayment.paid_at)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                }}>
                  <span style={{ color: '#6b8aaa' }}>Student</span>
                  <span style={{ color: '#eaf2ff' }}>{selectedPayment.student_name || 'N/A'}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                }}>
                  <span style={{ color: '#6b8aaa' }}>Room</span>
                  <span style={{ color: '#eaf2ff' }}>Room {selectedPayment.room_number}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                }}>
                  <span style={{ color: '#6b8aaa' }}>Hostel</span>
                  <span style={{ color: '#eaf2ff' }}>{selectedPayment.hostel_name}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                }}>
                  <span style={{ color: '#6b8aaa' }}>Payment Method</span>
                  <span style={{ color: '#eaf2ff' }}>
                    <span style={{ marginRight: '4px' }}>{getPaymentMethodIcon(selectedPayment.payment_method)}</span>
                    {getPaymentMethodLabel(selectedPayment.payment_method)}
                  </span>
                </div>
                {selectedPayment.transaction_code && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                  }}>
                    <span style={{ color: '#6b8aaa' }}>Transaction ID</span>
                    <span style={{ color: '#eaf2ff', fontFamily: 'monospace', fontSize: '14px' }}>{selectedPayment.transaction_code}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  marginTop: '8px',
                  borderTop: '2px solid #1a3050',
                }}>
                  <span style={{ color: '#eaf2ff', fontWeight: 600, fontSize: '18px' }}>Total Amount</span>
                  <span style={{ color: '#f5a623', fontWeight: 700, fontSize: '24px' }}>{formatPrice(selectedPayment.amount)}</span>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                textAlign: 'center',
                borderTop: '1px solid #1a3050',
                paddingTop: '16px',
                marginTop: '24px',
              }}>
                <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Thank you for your payment!</p>
                <p style={{ color: '#3a5070', fontSize: '12px', marginTop: '4px' }}>This is a computer-generated receipt.</p>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              position: 'sticky',
              bottom: 0,
              background: 'rgba(10, 22, 40, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '16px 24px',
              borderTop: '1px solid #1a3050',
              display: 'flex',
              gap: '12px',
            }}>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedPayment(null);
                }}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: 'rgba(18, 36, 72, 0.5)',
                  color: '#c8daf0',
                  fontWeight: 500,
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
                Close
              </button>
              <button
                onClick={() => {
                  const printContent = document.getElementById(`receipt-${selectedPayment.id}`);
                  if (printContent) {
                    const win = window.open('', '_blank');
                    win.document.write(`
                      <html>
                        <head>
                          <title>Receipt #${selectedPayment.receipt_number || selectedPayment.id}</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; background: #fff; color: #333; }
                            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                            .details { margin-bottom: 20px; }
                            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                            .total { font-size: 20px; font-weight: bold; color: #28a745; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
                            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
                          </style>
                        </head>
                        <body>
                          ${printContent.innerHTML}
                        </body>
                      </html>
                    `);
                    win.document.close();
                    win.print();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 16px',
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
                 Print Receipt
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

export default ViewReceipts;