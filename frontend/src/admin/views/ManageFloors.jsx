import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ManageFloors = () => {
  const navigate = useNavigate();
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFloors = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/hostel/floors/');
      setFloors(res.data.results ?? res.data);
    } catch (err) {
      setError('Failed to load floors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this floor?');
    if (!ok) return;

    try {
      await api.delete(`/hostel/floors/${id}/`);
      fetchFloors();
    } catch {
      alert('Failed to delete floor');
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
          <p style={{ color: '#6b8aaa' }}>Loading floors...</p>
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
        }}>Manage Floors</h1>

        <button
          onClick={() => navigate('/admin/floors/add')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            background: '#a78bfa',
            color: '#0a1628',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 0.3s ease',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#8b5cf6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#a78bfa';
          }}
        >
          + Add Floor
        </button>
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
              }}>Block</th>
              <th style={{
                padding: '12px 16px',
              }}>Floor Number</th>
              <th style={{
                padding: '12px 16px',
              }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {floors.length === 0 ? (
              <tr>
                <td colSpan="4" style={{
                  textAlign: 'center',
                  padding: '24px 0',
                  color: '#3a5070',
                }}>
                  No floors found
                </td>
              </tr>
            ) : (
              floors.map(f => (
                <tr
                  key={f.id}
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
                  }}>{f.id}</td>
                  
                  <td style={{
                    padding: '12px 16px',
                    color: '#c8daf0',
                  }}>
                    {f.block_name || '—'}
                  </td>

                  <td style={{
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: '#eaf2ff',
                  }}>
                    {f.floor_number}
                  </td>

                  <td style={{
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '12px',
                  }}>
                    <button
                      onClick={() => navigate(`/admin/floors/edit/${f.id}`)}
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
                      onClick={() => handleDelete(f.id)}
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

export default ManageFloors;