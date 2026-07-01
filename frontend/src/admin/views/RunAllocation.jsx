import React, { useState } from 'react';
import api from '../../api/axios';

const RunAllocation = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleRun = async () => {
    if (!confirm('Run auto-allocation for all unallocated students?')) return;
    setLoading(true);
    setResults(null);
    try {
      const { data } = await api.post('/allocation/run/');
      setResults(data);
      setMessage({ type: 'success', text: `Allocated ${data.allocated} students successfully!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Allocation failed.' });
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '768px',
    }}>
      <div>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>Auto Room Allocation</h1>
        <p style={{
          color: '#6b8aaa',
          fontSize: '14px',
          marginTop: '4px',
          marginBottom: 0,
        }}>
          Automatically allocate rooms to unallocated students based on preferences.
        </p>
      </div>

      <div style={{
        background: '#0a1628',
        border: '1px solid #1a3050',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '14px',
          color: '#6b8aaa',
        }}>
          <p style={{ margin: 0 }}>Algorithm considers:</p>
          <ul style={{
            margin: '4px 0 0 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            color: '#6b8aaa',
            padding: 0,
            listStyle: 'none',
          }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#3a5070' }}>◆</span> Floor preference
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#3a5070' }}>◆</span> Noise tolerance
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#3a5070' }}>◆</span> Disability support needs (priority)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#3a5070' }}>◆</span> Discipline history (penalty)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#3a5070' }}>◆</span> Friend preferences
            </li>
          </ul>
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#3a5070' : '#a78bfa',
            color: '#0a1628',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = '#8b5cf6';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = '#a78bfa';
          }}
        >
          {loading && (
            <svg style={{
              width: '16px',
              height: '16px',
              animation: 'spin 1s linear infinite',
            }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          )}
          {loading ? 'Running...' : '▶ Run Auto Allocation'}
        </button>
      </div>

      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          border: '1px solid',
          background: message.type === 'success' ? 'rgba(29, 219, 168, 0.1)' : 'rgba(248, 113, 113, 0.1)',
          color: message.type === 'success' ? '#1ddba8' : '#f87171',
          borderColor: message.type === 'success' ? 'rgba(29, 219, 168, 0.3)' : 'rgba(248, 113, 113, 0.3)',
        }}>
          {message.text}
        </div>
      )}

      {results && results.results?.length > 0 && (
        <div style={{
          background: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid #1a3050',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#eaf2ff',
              margin: 0,
            }}>Allocation Results ({results.allocated} allocated)</h3>
          </div>
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
                }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {results.results.map((r, i) => (
                <tr
                  key={i}
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
                  }}>{r.student}</td>
                  <td style={{
                    padding: '12px 20px',
                    color: '#c8daf0',
                  }}>{r.room}</td>
                  <td style={{
                    padding: '12px 20px',
                    color: '#a78bfa',
                    fontFamily: 'monospace',
                  }}>{r.score}</td>
                </tr>
              ))}
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

export default RunAllocation;