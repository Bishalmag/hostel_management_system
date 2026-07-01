import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const ComplaintRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [form, setForm] = useState({
    title: '',
    description: '',
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title.' });
      return;
    }
    
    if (!form.description.trim()) {
      setMessage({ type: 'error', text: 'Please enter a description.' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.post('/complaints/', {
        title: form.title,
        description: form.description,
      });
      
      console.log('Complaint submitted:', response.data);
      
      setMessage({ 
        type: 'success', 
        text: 'Complaint registered successfully! You can track its status in Registered Complaints.' 
      });
      
      setForm({ title: '', description: '' });
      
      setTimeout(() => {
        navigate('/students/complaints');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting complaint:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setMessage({ 
          type: 'error', 
          text: 'Please login again to submit a complaint.' 
        });
      } else if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          setMessage({ 
            type: 'error', 
            text: Array.isArray(firstError) ? firstError[0] : firstError 
          });
        } else {
          setMessage({ type: 'error', text: errorData });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to register complaint. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto', padding: '24px' }}>
      {/* Header - Without Icon */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>Register Complaint</h1>
        <p style={{
          color: '#6b8aaa',
          marginTop: '4px',
        }}>Submit your complaint and we'll address it promptly</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: message.type === 'success' 
              ? 'rgba(29, 219, 168, 0.1)' 
              : 'rgba(248, 113, 113, 0.1)',
            color: message.type === 'success' 
              ? '#1ddba8' 
              : '#f87171',
            borderColor: message.type === 'success' 
              ? 'rgba(29, 219, 168, 0.3)' 
              : 'rgba(248, 113, 113, 0.3)',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Complaint Form */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '10px',
              color: '#6b8aaa',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
              marginBottom: '8px',
            }}>
              Complaint Title <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Water Supply Issue, Noisy Neighbors, Maintenance Required"
              style={{
                width: '100%',
                padding: '10px 16px',
                background: '#0a1628',
                border: '1px solid #1a3050',
                borderRadius: '8px',
                color: '#eaf2ff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f87171';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(248, 113, 113, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1a3050';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '10px',
              color: '#6b8aaa',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
              marginBottom: '8px',
            }}>
              Description <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              placeholder="Please provide detailed information about your complaint..."
              style={{
                width: '100%',
                padding: '10px 16px',
                background: '#0a1628',
                border: '1px solid #1a3050',
                borderRadius: '8px',
                color: '#eaf2ff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f87171';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(248, 113, 113, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1a3050';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={{
            background: 'rgba(18, 36, 72, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #1a3050',
            marginTop: '16px',
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6b8aaa',
              margin: 0,
            }}>
              Your complaint will be reviewed within 24-48 hours. You can track its status in the "Registered Complaints" section.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/students/complaints')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'rgba(18, 36, 72, 0.5)',
              color: '#c8daf0',
              fontWeight: 500,
              borderRadius: '8px',
              border: '1px solid #1a3050',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(18, 36, 72, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(18, 36, 72, 0.5)';
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: loading ? '#3a5070' : '#f87171',
              color: '#0a1628',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#fca5a5';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#f87171';
              }
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #0a1628',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Submitting...
              </>
            ) : (
              'Submit Complaint'
            )}
          </button>
        </div>
      </form>

      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ComplaintRegistration;