import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const ManageBlocks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hostelId = searchParams.get('hostel');

  const [blocks, setBlocks] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      api.get('/hostel/blocks/'),
      api.get('/hostel/hostels/'),
    ]).then(([b, h]) => {
      setBlocks(b.data.results ?? b.data);
      setHostels(h.data.results ?? h.data);
    }).catch(() => {})
    .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = hostelId ? blocks.filter(b => b.hostel === parseInt(hostelId)) : blocks;

  const handleDelete = async (id) => {
    if (!confirm('Delete this block?')) return;
    try { 
      await api.delete(`/hostel/blocks/${id}/`); 
      fetchData(); 
    } catch { 
      alert('Failed to delete block.'); 
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/blocks/edit/${id}`);
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
          <p style={{ color: '#6b8aaa' }}>Loading blocks...</p>
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
        }}>Blocks & Floors</h1>
        <button
          onClick={() => navigate('/admin/blocks/add')}
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
          + Add Block
        </button>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {filtered.map(block => {
          const hostelName = hostels.find(h => h.id === block.hostel)?.name ?? block.hostel;
          return (
            <div
              key={block.id}
              style={{
                background: '#0a1628',
                border: '1px solid #1a3050',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2a4870';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1a3050';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h3 style={{
                    fontWeight: 600,
                    color: '#eaf2ff',
                    margin: 0,
                    fontSize: '16px',
                  }}>{block.name}</h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b8aaa',
                    marginTop: '2px',
                    marginBottom: 0,
                  }}>
                    Hostel: {hostelName}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                }}>
                  <button
                    onClick={() => handleEdit(block.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'rgba(96, 165, 250, 0.2)',
                      color: '#60a5fa',
                      border: '1px solid rgba(96, 165, 250, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(96, 165, 250, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)';
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(block.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'rgba(248, 113, 113, 0.2)',
                      color: '#f87171',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      borderRadius: '8px',
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
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{
            color: '#3a5070',
            textAlign: 'center',
            padding: '40px 0',
            margin: 0,
          }}>No blocks found.</p>
        )}
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

export default ManageBlocks;