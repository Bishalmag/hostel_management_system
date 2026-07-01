import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ManageHostel = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHostels = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/hostel/hostels/');
      setHostels(res.data.results ?? res.data);
    } catch (err) {
      setError('Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this hostel?');
    if (!ok) return;

    try {
      await api.delete(`/hostel/hostels/${id}/`);
      fetchHostels();
    } catch {
      alert('Failed to delete hostel');
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
          <p style={{ color: '#6b8aaa' }}>Loading hostels...</p>
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
      {/* HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>Manage Hostels</h1>
      </div>

      {/* ERROR */}
      {error && (
        <div style={{
          color: '#f87171',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {/* TABLE */}
      <div style={{
        background: '#0a1628',
        border: '1px solid #1a3050',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <table style={{
          width: '100%',
          fontSize: '14px',
          textAlign: 'left',
          color: '#c8daf0',
          borderCollapse: 'collapse',
        }}>
          <thead style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            background: '#0f2040',
            color: '#6b8aaa',
          }}>
            <tr>
              <th style={{
                padding: '12px 16px',
              }}>ID</th>
              <th style={{
                padding: '12px 16px',
              }}>Name</th>
              <th style={{
                padding: '12px 16px',
              }}>Address</th>
              <th style={{
                padding: '12px 16px',
              }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {hostels.length === 0 ? (
              <tr>
                <td colSpan="4" style={{
                  textAlign: 'center',
                  padding: '24px 0',
                  color: '#3a5070',
                }}>
                  No hostels found
                </td>
              </tr>
            ) : (
              hostels.map(h => (
                <tr
                  key={h.id}
                  style={{
                    borderTop: '1px solid #1a3050',
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
                    padding: '12px 16px',
                  }}>{h.id}</td>
                  <td style={{
                    padding: '12px 16px',
                    color: '#eaf2ff',
                  }}>{h.name}</td>
                  <td style={{
                    padding: '12px 16px',
                    color: '#c8daf0',
                  }}>{h.address}</td>

                  <td style={{
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '12px',
                  }}>
                    <button
                      onClick={() => navigate(`/admin/hostels/edit/${h.id}`)}
                      style={{
                        color: '#60a5fa',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.3s ease',
                        fontSize: '14px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#3b82f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#60a5fa';
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(h.id)}
                      style={{
                        color: '#f87171',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.3s ease',
                        fontSize: '14px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#f87171';
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
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

export default ManageHostel;