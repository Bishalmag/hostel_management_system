import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageAllocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/allocation/allocations/')
      .then(res => setAllocations(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this allocation?')) return;
    try {
      await api.patch(`/allocation/allocations/${id}/`, { status: 'cancelled' });
      setAllocations(a => a.map(x => x.id === id ? {...x, status: 'cancelled'} : x));
    } catch { alert('Failed.'); }
  };

  const getStatusStyle = (status) => {
    if (status === 'active') {
      return {
        bg: 'rgba(29, 219, 168, 0.2)',
        color: '#1ddba8',
        border: 'rgba(29, 219, 168, 0.3)'
      };
    } else if (status === 'cancelled') {
      return {
        bg: 'rgba(248, 113, 113, 0.2)',
        color: '#f87171',
        border: 'rgba(248, 113, 113, 0.3)'
      };
    } else {
      return {
        bg: 'rgba(107, 138, 170, 0.2)',
        color: '#6b8aaa',
        border: 'rgba(107, 138, 170, 0.3)'
      };
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
          <p style={{ color: '#6b8aaa' }}>Loading allocations...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#eaf2ff',
        margin: 0,
      }}>Room Allocations</h1>

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
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              <th style={{
                padding: '12px 20px',
                textAlign: 'left',
              }}>Student</th>
              <th style={{
                padding: '12px 20px',
                textAlign: 'left',
              }}>Room</th>
              <th style={{
                padding: '12px 20px',
                textAlign: 'left',
              }}>Allocated On</th>
              <th style={{
                padding: '12px 20px',
                textAlign: 'left',
              }}>Valid Until</th>
              <th style={{
                padding: '12px 20px',
                textAlign: 'left',
              }}>Status</th>
              <th style={{
                padding: '12px 20px',
                textAlign: 'left',
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map(a => {
              const statusStyle = getStatusStyle(a.status);
              return (
                <tr
                  key={a.id}
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
                  <td style={{
                    padding: '12px 20px',
                    color: '#eaf2ff',
                  }}>{a.student}</td>
                  <td style={{
                    padding: '12px 20px',
                    color: '#c8daf0',
                  }}>{a.room}</td>
                  <td style={{
                    padding: '12px 20px',
                    color: '#c8daf0',
                  }}>{a.allocated_on}</td>
                  <td style={{
                    padding: '12px 20px',
                    color: '#c8daf0',
                  }}>{a.valid_until ?? '—'}</td>
                  <td style={{
                    padding: '12px 20px',
                  }}>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      border: `1px solid ${statusStyle.border}`,
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      textTransform: 'capitalize',
                    }}>{a.status}</span>
                  </td>
                  <td style={{
                    padding: '12px 20px',
                  }}>
                    {a.status === 'active' && (
                      <button
                        onClick={() => handleCancel(a.id)}
                        style={{
                          fontSize: '12px',
                          padding: '4px 12px',
                          background: 'rgba(248, 113, 113, 0.2)',
                          color: '#f87171',
                          border: '1px solid rgba(248, 113, 113, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(248, 113, 113, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)';
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {allocations.length === 0 && (
              <tr>
                <td colSpan={6} style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#3a5070',
                }}>
                  No allocations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default ManageAllocations;