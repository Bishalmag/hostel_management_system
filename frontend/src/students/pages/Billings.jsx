import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const Billings = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/payments/')
      .then(res => setPayments(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const paid = payments.filter(p => p.paid_status === 'paid').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const pending = payments.filter(p => p.paid_status === 'pending').reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  // Helper function to format Nepali Rupees
  const formatNPR = (amount) => {
    if (!amount && amount !== 0) return 'Rs. 0';
    const formatted = new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',  // Must be 'NPR', not 'Rs.'
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return formatted.replace('NPR', 'Rs.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#eaf2ff',
        margin: 0,
      }}>Billings</h1>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
      }}>
        {[
          { label: 'Total Billed', value: formatNPR(total), color: '#eaf2ff' },
          { label: 'Paid', value: formatNPR(paid), color: '#1ddba8' },
          { label: 'Pending', value: formatNPR(pending), color: '#f5a623' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#0a1628',
            border: '1px solid #1a3050',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <p style={{
              fontSize: '10px',
              color: '#6b8aaa',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 4px 0',
            }}>{s.label}</p>
            <p style={{
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: s.color,
              margin: 0,
            }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
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
                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 500 }}>Due Date</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 500 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#3a5070',
                  }}>No billing records.</td>
                </tr>
              ) : payments.map(p => (
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
                    color: '#eaf2ff',
                    fontFamily: 'monospace',
                  }}>{formatNPR(p.amount)}</td>
                  <td style={{
                    padding: '12px 20px',
                    color: '#6b8aaa',
                  }}>{p.due_date}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 12px',
                      borderRadius: '9999px',
                      border: '1px solid',
                      background: p.paid_status === 'paid' 
                        ? 'rgba(29, 219, 168, 0.1)' 
                        : p.paid_status === 'overdue' 
                        ? 'rgba(248, 113, 113, 0.1)' 
                        : 'rgba(245, 166, 35, 0.1)',
                      color: p.paid_status === 'paid' 
                        ? '#1ddba8' 
                        : p.paid_status === 'overdue' 
                        ? '#f87171' 
                        : '#f5a623',
                      borderColor: p.paid_status === 'paid' 
                        ? 'rgba(29, 219, 168, 0.3)' 
                        : p.paid_status === 'overdue' 
                        ? 'rgba(248, 113, 113, 0.3)' 
                        : 'rgba(245, 166, 35, 0.3)',
                    }}>
                      {p.paid_status}
                    </span>
                  </td>
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

export default Billings;