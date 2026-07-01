import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ManageStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/students/')
      .then(res => setStudents(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    s.registration_no?.toLowerCase().includes(search.toLowerCase())
  );

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
        }}>All Students</h1>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, email, reg no..."
        style={{
          width: '100%',
          maxWidth: '384px',
          padding: '10px 16px',
          background: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '8px',
          color: '#eaf2ff',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.3s ease',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#a78bfa';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#1a3050';
        }}
      />

      {loading ? (
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
            <p style={{ color: '#6b8aaa' }}>Loading...</p>
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
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                <th style={{
                  padding: '12px 20px',
                  textAlign: 'left',
                }}>Name</th>
                <th style={{
                  padding: '12px 20px',
                  textAlign: 'left',
                }}>Email</th>
                <th style={{
                  padding: '12px 20px',
                  textAlign: 'left',
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr
                  key={s.id}
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
                  }}>{s.user_name ?? '—'}</td>
                  <td style={{
                    padding: '12px 20px',
                    color: '#c8daf0',
                  }}>{s.user_email ?? '—'}</td>
                  <td style={{
                    padding: '12px 20px',
                  }}>
                    <button
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      style={{
                        fontSize: '12px',
                        padding: '4px 12px',
                        background: '#0f2040',
                        color: '#c8daf0',
                        border: '1px solid #1a3050',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#122448';
                        e.currentTarget.style.borderColor = '#2a4870';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0f2040';
                        e.currentTarget.style.borderColor = '#1a3050';
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#3a5070',
                  }}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

export default ManageStudents;