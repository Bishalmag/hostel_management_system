// src/admin/views/AddEvent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const AddEvent = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'general',
    start_date: '',
    end_date: '',
    location: '',
    is_active: true,
    is_featured: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      showError('Please enter a title', 'Validation Error');
      return;
    }
    if (!form.description.trim()) {
      showError('Please enter a description', 'Validation Error');
      return;
    }
    if (!form.start_date) {
      showError('Please select a start date', 'Validation Error');
      return;
    }
    if (!form.end_date) {
      showError('Please select an end date', 'Validation Error');
      return;
    }
    if (new Date(form.start_date) >= new Date(form.end_date)) {
      showError('End date must be after start date', 'Validation Error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/events/', form);
      showSuccess('Event created successfully!', 'Success');
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (err) {
      console.error('Error creating event:', err);
      showError(err.response?.data?.message || 'Failed to create event', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

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
      <div>
        <button
          onClick={() => navigate('/admin/events')}
          style={{
            color: '#6b8aaa',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '14px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f5a623';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          ← Back to Events
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>Add New Event</h1>
        <p style={{
          color: '#6b8aaa',
          fontSize: '14px',
          marginTop: '4px',
          marginBottom: 0,
        }}>Create a new event announcement for students</p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Title */}
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
            Event Title <span style={{ color: '#f87171' }}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., Freshers Welcome Party, Sports Day"
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

        {/* Description */}
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
            Description <span style={{ color: '#f87171' }}>*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the event in detail..."
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

        {/* Event Type */}
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
            Event Type
          </label>
          <select
            name="event_type"
            value={form.event_type}
            onChange={handleChange}
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
          >
            <option value="general">General</option>
            <option value="academic">Academic</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="maintenance">Maintenance</option>
            <option value="emergency">Emergency</option>
            <option value="holiday">Holiday</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Location */}
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
            Location
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g., Main Hall, Sports Ground, Hostel Common Room"
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
          />
        </div>

        {/* Dates */}
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
              fontWeight: 600,
              marginBottom: '8px',
            }}>
              Start Date <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              type="datetime-local"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              min={getTodayDateTime()}
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
              End Date <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              type="datetime-local"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              min={form.start_date || getTodayDateTime()}
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
        </div>

        {/* Options */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                border: '1px solid #1a3050',
                background: '#0f2040',
                accentColor: '#f5a623',
              }}
            />
            <span style={{
              fontSize: '14px',
              color: '#6b8aaa',
            }}>Active</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              name="is_featured"
              checked={form.is_featured}
              onChange={handleChange}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                border: '1px solid #1a3050',
                background: '#0f2040',
                accentColor: '#f5a623',
              }}
            />
            <span style={{
              fontSize: '14px',
              color: '#6b8aaa',
            }}>◆ Featured Event</span>
          </label>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #1a3050',
        }}>
          <button
            type="button"
            onClick={() => navigate('/admin/events')}
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
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: loading ? '#3a5070' : '#f5a623',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#e09515';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#f5a623';
              }
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #0a1628',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Creating...
              </>
            ) : (
              'Create Event'
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

export default AddEvent;