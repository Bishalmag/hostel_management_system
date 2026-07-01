import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const EditBlock = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ hostel: '', name: '' });
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch hostels
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await api.get('/hostel/hostels/');
        const hostelData = res.data.results ?? res.data;
        setHostels(Array.isArray(hostelData) ? hostelData : []);
      } catch (error) {
        console.error('Error fetching hostels:', error);
      }
    };
    fetchHostels();
  }, []);

  // Fetch block details
  useEffect(() => {
    const fetchBlock = async () => {
      if (!id) {
        setMessage({ type: 'error', text: 'No block ID provided.' });
        setFetching(false);
        return;
      }

      try {
        const response = await api.get(`/hostel/blocks/${id}/`);
        setForm({
          hostel: response.data.hostel || '',
          name: response.data.name || ''
        });
        setFetching(false);
      } catch (error) {
        console.error('Error fetching block:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.status === 404 ? 'Block not found.' : 'Failed to load block details.'
        });
        setFetching(false);
      }
    };

    fetchBlock();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.put(`/hostel/blocks/${id}/`, form);
      setMessage({ type: 'success', text: 'Block updated successfully!' });
      setTimeout(() => navigate('/admin/blocks'), 1500);
    } catch (error) {
      console.error('Error updating block:', error);
      let errorMessage = 'Failed to update block.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).flat().join(', ');
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this block?')) return;
    
    try {
      await api.delete(`/hostel/blocks/${id}/`);
      navigate('/admin/blocks');
    } catch (error) {
      console.error('Error deleting block:', error);
      setMessage({ type: 'error', text: 'Failed to delete block.' });
    }
  };

  if (fetching) {
    return (
      <div style={{
        maxWidth: '512px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        <div style={{
          backgroundColor: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
          }}>
            <div style={{ color: '#6b8aaa' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '3px solid #1a3050',
                borderTop: '3px solid #f5a623',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }} />
              Loading block details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '512px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <div>
        <button
          onClick={() => navigate('/admin/blocks')}
          style={{
            fontSize: '14px',
            color: '#6b8aaa',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '12px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#a78bfa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          ← Back to Blocks
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>Edit Block</h1>
        <p style={{
          fontSize: '12px',
          color: '#6b8aaa',
          marginTop: '4px',
          marginBottom: 0,
        }}>Block ID: {id}</p>
      </div>

      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          border: '1px solid',
          backgroundColor: message.type === 'success' ? 'rgba(29, 219, 168, 0.1)' : 'rgba(248, 113, 113, 0.1)',
          color: message.type === 'success' ? '#1ddba8' : '#f87171',
          borderColor: message.type === 'success' ? 'rgba(29, 219, 168, 0.3)' : 'rgba(248, 113, 113, 0.3)',
        }}>
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b8aaa',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px',
          }}>
            Hostel *
          </label>
          <select
            value={form.hostel}
            onChange={e => setForm(f => ({...f, hostel: e.target.value}))}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#0f2040',
              border: '1px solid #1a3050',
              borderRadius: '8px',
              color: '#eaf2ff',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box',
              opacity: hostels.length === 1 ? 0.7 : 1,
              cursor: hostels.length === 1 ? 'not-allowed' : 'pointer',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#a78bfa';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1a3050';
            }}
            required
            disabled={hostels.length === 1}
          >
            <option value="">Select hostel</option>
            {hostels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          {hostels.length === 1 && (
            <p style={{
              fontSize: '12px',
              color: '#6b8aaa',
              marginTop: '4px',
              marginBottom: 0,
            }}>
              {hostels[0]?.name}
            </p>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b8aaa',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px',
          }}>
            Block Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({...f, name: e.target.value}))}
            placeholder="e.g. Block A"
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#0f2040',
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
            required
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '8px',
        }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: loading ? '#3a5070' : '#a78bfa',
              color: '#0a1628',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#8b5cf6';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#a78bfa';
              }
            }}
          >
            {loading ? 'Updating...' : 'Update Block'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/admin/blocks')}
            style={{
              padding: '10px 24px',
              backgroundColor: '#0f2040',
              color: '#eaf2ff',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#122448';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0f2040';
            }}
          >
            Cancel
          </button>
        </div>

        <div style={{
          paddingTop: '8px',
          borderTop: '1px solid #1a3050',
        }}>
          <button
            type="button"
            onClick={handleDelete}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              color: '#f87171',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Delete Block
          </button>
        </div>
      </form>

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

export default EditBlock;