import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/payments/?paid_status=paid')
      .then(res => setPayments(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 0',
        color: '#6b8aaa',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ fontSize: '14px', color: '#6b8aaa', margin: 0 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>Payment History</h1>
        <div style={{
          background: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '8px 16px',
          minWidth: '120px',
        }}>
          <p style={{
            fontSize: '10px',
            color: '#6b8aaa',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}>Total Paid</p>
          <p style={{
            fontSize: '18px',
            fontWeight: 700,
            fontFamily: 'monospace',
            color: '#1ddba8',
            margin: 0,
          }}>{formatPrice(total)}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 0',
          background: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '12px',
        }}>
          <div style={{
            fontSize: '40px',
            marginBottom: '12px',
            color: '#3a5070',
          }}></div>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>No payment history yet.</p>
        </div>
      ) : (
        <div style={{
          background: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <table style={{
            width: '100%',
            fontSize: '14px',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid #1a3050',
                color: '#6b8aaa',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 500 }}>#</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 500 }}>Amount</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 500 }}>Paid At</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 500 }}>Booking</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} style={{
                  borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(18, 36, 72, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}>
                  <td style={{
                    padding: '12px 20px',
                    color: '#6b8aaa',
                    fontFamily: 'monospace',
                  }}>#{p.id}</td>
                  <td style={{
                    padding: '12px 20px',
                    color: '#1ddba8',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                  }}>{formatPrice(p.amount)}</td>
                  <td style={{
                    padding: '12px 20px',
                    color: '#6b8aaa',
                  }}>
                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}
                  </td>
                  <td style={{
                    padding: '12px 20px',
                    color: '#6b8aaa',
                  }}>#{p.booking ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default PaymentHistory;