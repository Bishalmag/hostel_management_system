import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const EditHostel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchHostelDetails();
  }, [id]);

  const fetchHostelDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hostel/hostels/${id}/`);
      setForm({
        name: response.data.name || '',
        address: response.data.address || '',
        latitude: response.data.latitude !== null && response.data.latitude !== undefined ? response.data.latitude.toString() : '',
        longitude: response.data.longitude !== null && response.data.longitude !== undefined ? response.data.longitude.toString() : '',
      });
    } catch (err) {
      console.error('Error fetching hostel:', err);
      setMessage({ type: 'error', text: 'Failed to load hostel details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Hostel name is required.' });
      return;
    }
    
    if (!form.address.trim()) {
      setMessage({ type: 'error', text: 'Hostel address is required.' });
      return;
    }
    
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const updateData = {
        name: form.name,
        address: form.address,
      };
      
      const lat = form.latitude ? parseFloat(form.latitude) : null;
      const lng = form.longitude ? parseFloat(form.longitude) : null;
      
      if (lat !== null && !isNaN(lat)) {
        updateData.latitude = lat;
      }
      if (lng !== null && !isNaN(lng)) {
        updateData.longitude = lng;
      }
      
      await api.patch(`/hostel/hostels/${id}/`, updateData);
      
      setMessage({ type: 'success', text: 'Hostel updated successfully!' });
      
      setTimeout(() => {
        navigate('/admin/hostels');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating hostel:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData).map(([key, value]) => `${key}: ${value}`).join(', ');
          setMessage({ type: 'error', text: errorMessages });
        } else {
          setMessage({ type: 'error', text: errorData });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to update hostel. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        maxWidth: '896px',
        margin: '0 auto',
        padding: '24px',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#6b8aaa',
          padding: '48px 0',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          Loading hostel details...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '896px',
      margin: '0 auto',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <button
            onClick={() => navigate('/admin/hostels')}
            style={{
              padding: '8px',
              background: '#0f2040',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#122448';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0f2040';
            }}
          >
            <svg style={{ width: '20px', height: '20px', color: '#6b8aaa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#eaf2ff',
              margin: 0,
            }}>Edit Hostel</h1>
            <p style={{
              color: '#6b8aaa',
              fontSize: '14px',
              marginTop: '4px',
              marginBottom: 0,
            }}>Update hostel information</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
         
        </div>
      </div>

      {/* Message Alert */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {message.type === 'success' ? (
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          {/* Hostel Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: '#6b8aaa',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 600,
              marginBottom: '8px',
            }}>
              Hostel Name <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Boys Hostel, Girls Hostel"
              style={{
                width: '100%',
                padding: '10px 16px',
                background: '#0f2040',
                border: '1px solid #1a3050',
                borderRadius: '8px',
                color: '#eaf2ff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f5a623';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1a3050';
              }}
              required
            />
          </div>

          {/* Hostel Address */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: '#6b8aaa',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 600,
              marginBottom: '8px',
            }}>
              Hostel Address <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              placeholder="Enter complete address"
              style={{
                width: '100%',
                padding: '10px 16px',
                background: '#0f2040',
                border: '1px solid #1a3050',
                borderRadius: '8px',
                color: '#eaf2ff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f5a623';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1a3050';
              }}
              required
            />
          </div>

          {/* Latitude & Longitude */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}>Latitude</label>
              <input 
                type="text" 
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="e.g. 27.7172"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#0f2040',
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
              <p style={{
                color: '#3a5070',
                fontSize: '12px',
                marginTop: '4px',
                marginBottom: 0,
              }}>Example: 27.7172 (Kathmandu)</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}>Longitude</label>
              <input 
                type="text" 
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="e.g. 85.3240"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#0f2040',
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
              <p style={{
                color: '#3a5070',
                fontSize: '12px',
                marginTop: '4px',
                marginBottom: 0,
              }}>Example: 85.3240 (Kathmandu)</p>
            </div>
          </div>

          {/* Info Box */}
          <div style={{
            background: 'rgba(245, 166, 35, 0.1)',
            border: '1px solid rgba(245, 166, 35, 0.3)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <svg style={{ width: '20px', height: '20px', color: '#f5a623', marginTop: '2px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p style={{ color: '#f5a623', fontSize: '14px', fontWeight: 500, margin: 0 }}>Note:</p>
                <p style={{ color: '#6b8aaa', fontSize: '14px', marginTop: '4px', marginBottom: 0 }}>
                  Changes to hostel name and address will affect all associated blocks, floors, and rooms.
                  Latitude and Longitude are used for map location services.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '24px',
        }}>
          <button
            type="button"
            onClick={() => navigate('/admin/hostels')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: '#0f2040',
              color: '#c8daf0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#122448';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0f2040';
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: submitting ? '#3a5070' : '#f5a623',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: submitting ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = '#e09515';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = '#f5a623';
              }
            }}
          >
            {submitting ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #0a1628',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Saving...
              </>
            ) : (
              <>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
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

export default EditHostel;