// admin/views/EditFloor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const EditFloor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ block: '', floor_number: '', description: '' });
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch blocks list
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await api.get('/hostel/blocks/');
        const data = response.data.results || response.data || [];
        const blocksList = Array.isArray(data) ? data : [];
        setBlocks(blocksList);
        
        if (blocksList.length === 1 && form.block === '') {
          setForm(f => ({ ...f, block: blocksList[0].id }));
        }
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    };
    fetchBlocks();
  }, []);

  // Fetch floor details
  useEffect(() => {
    const fetchFloor = async () => {
      if (!id) {
        setMessage({ type: 'error', text: 'No floor ID provided.' });
        setFetching(false);
        return;
      }

      try {
        const response = await api.get(`/hostel/floors/${id}/`);
        
        setForm({
          block: response.data.block || '',
          floor_number: response.data.floor_number || '',
          description: response.data.description || ''
        });
        setFetching(false);
      } catch (error) {
        console.error('Error fetching floor:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.status === 404 ? 'Floor not found.' : 'Failed to load floor details.'
        });
        setFetching(false);
      }
    };

    fetchFloor();
  }, [id]);

  // Auto-select block if only one exists after floor data is loaded
  useEffect(() => {
    if (!fetching && blocks.length === 1 && !form.block) {
      setForm(f => ({ ...f, block: blocks[0].id }));
    }
  }, [fetching, blocks, form.block]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.put(`/hostel/floors/${id}/`, {
        block: form.block,
        floor_number: form.floor_number,
        description: form.description
      });
      setMessage({ type: 'success', text: 'Floor updated successfully!' });
      setTimeout(() => navigate('/admin/floors'), 1500);
    } catch (error) {
      console.error('Error updating floor:', error);
      let errorMessage = 'Failed to update floor.';
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
    if (!window.confirm('Are you sure you want to delete this floor?')) return;
    
    try {
      await api.delete(`/hostel/floors/${id}/`);
      navigate('/admin/floors');
    } catch (error) {
      console.error('Error deleting floor:', error);
      setMessage({ type: 'error', text: 'Failed to delete floor.' });
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
              <div style={{ color: '#6b8aaa' }}>Loading floor details...</div>
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
          onClick={() => navigate('/admin/floors')}
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
          ← Back to Floors
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>Edit Floor</h1>
        <p style={{
          fontSize: '12px',
          color: '#6b8aaa',
          marginTop: '4px',
          marginBottom: 0,
        }}>Floor ID: {id}</p>
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
            Block *
          </label>
          <select
            value={form.block}
            onChange={e => setForm(f => ({...f, block: e.target.value}))}
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
              opacity: blocks.length === 1 ? 0.7 : 1,
              cursor: blocks.length === 1 ? 'not-allowed' : 'pointer',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#a78bfa';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1a3050';
            }}
            required
            disabled={blocks.length === 1}
          >
            <option value="">Select block</option>
            {blocks.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {blocks.length === 1 && (
            <p style={{
              fontSize: '12px',
              color: '#6b8aaa',
              marginTop: '4px',
              marginBottom: 0,
            }}>
              Auto-selected: {blocks[0]?.name}
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
            Floor Number *
          </label>
          <input
            type="number"
            value={form.floor_number}
            onChange={e => setForm(f => ({...f, floor_number: e.target.value}))}
            placeholder="e.g. 1, 2, 3"
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
            min="0"
          />
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
            Description (Optional)
          </label>
          <input
            type="text"
            value={form.description || ''}
            onChange={e => setForm(f => ({...f, description: e.target.value}))}
            placeholder="e.g. Ground Floor, First Floor"
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
            {loading ? 'Updating...' : 'Update Floor'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/admin/floors')}
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
            Delete Floor
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

export default EditFloor;