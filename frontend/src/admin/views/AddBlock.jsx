import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AddBlock = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ hostel: '', name: '' });
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await api.get('/hostel/hostels/');
        const hostelData = res.data.results ?? res.data;
        const hostelsList = Array.isArray(hostelData) ? hostelData : [];
        setHostels(hostelsList);
        
        if (hostelsList.length === 1) {
          setForm(f => ({ ...f, hostel: hostelsList[0].id }));
        }
      } catch (error) {
        console.error('Error fetching hostels:', error);
      }
    };
    
    fetchHostels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.post('/hostel/blocks/', form);
      setMessage({ type: 'success', text: 'Block added successfully!' });
      setTimeout(() => navigate('/admin/blocks'), 1500);
    } catch (err) {
      console.error('Error adding block:', err);
      let errorMessage = 'Failed to add block.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = Object.values(err.response.data.errors).flat().join(', ');
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally { 
      setLoading(false); 
    }
  };

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
        }}>Add Block</h1>
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

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
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
          {loading ? 'Adding...' : 'Add Block'}
        </button>
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

export default AddBlock;