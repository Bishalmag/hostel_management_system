import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const AddFloor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    hostel: searchParams.get('hostel') ?? '',
    block: searchParams.get('block') ?? '',
    floor_number: ''
  });

  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch hostels and auto-select if only one
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await api.get('/hostel/hostels/');
        const hostelData = res.data.results ?? res.data;
        const hostelsList = Array.isArray(hostelData) ? hostelData : [];
        setHostels(hostelsList);
        
        if (hostelsList.length === 1 && !searchParams.get('hostel')) {
          setForm(f => ({ ...f, hostel: hostelsList[0].id }));
        }
      } catch (error) {
        console.error('Error fetching hostels:', error);
      }
    };
    
    fetchHostels();
  }, [searchParams]);

  // Fetch blocks when hostel changes
  useEffect(() => {
    if (!form.hostel) {
      setBlocks([]);
      return;
    }

    const fetchBlocks = async () => {
      try {
        const res = await api.get(`/hostel/blocks/?hostel=${form.hostel}`);
        const blocksData = res.data.results ?? res.data;
        setBlocks(Array.isArray(blocksData) ? blocksData : []);
      } catch (error) {
        console.error('Error fetching blocks:', error);
        setBlocks([]);
      }
    };

    fetchBlocks();
  }, [form.hostel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/hostel/floors/', {
        block: form.block,
        floor_number: form.floor_number
      });
      
      setMessage({ type: 'success', text: 'Floor added successfully!' });
      setTimeout(() => navigate('/admin/floors'), 1500);
    } catch (err) {
      console.error('Error adding floor:', err);
      let errorMessage = 'Failed to add floor.';
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
        }}>Add Floor</h1>
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
        {/* HOSTEL SELECT */}
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
            onChange={(e) =>
              setForm(f => ({ ...f, hostel: e.target.value, block: '' }))
            }
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
              opacity: hostels.length === 1 && !searchParams.get('hostel') ? 0.7 : 1,
              cursor: hostels.length === 1 && !searchParams.get('hostel') ? 'not-allowed' : 'pointer',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#a78bfa';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1a3050';
            }}
            required
            disabled={hostels.length === 1 && !searchParams.get('hostel')}
          >
            <option value="">Select hostel</option>
            {hostels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* BLOCK SELECT */}
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
            onChange={e => setForm(f => ({ ...f, block: e.target.value }))}
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
              opacity: !form.hostel || blocks.length === 0 ? 0.7 : 1,
              cursor: !form.hostel || blocks.length === 0 ? 'not-allowed' : 'pointer',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#a78bfa';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1a3050';
            }}
            required
            disabled={!form.hostel || blocks.length === 0}
          >
            <option value="">Select block</option>
            {blocks.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {form.hostel && blocks.length === 0 && (
            <p style={{
              fontSize: '12px',
              color: '#f5a623',
              marginTop: '4px',
              marginBottom: 0,
            }}>
              No blocks available. Please add a block first.
            </p>
          )}
        </div>

        {/* FLOOR NUMBER */}
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
            onChange={e => setForm(f => ({ ...f, floor_number: e.target.value }))}
            placeholder="e.g. 1"
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
          {loading ? 'Adding...' : 'Add Floor'}
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

export default AddFloor;