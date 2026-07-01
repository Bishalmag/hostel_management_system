// src/admin/views/EditEvent.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}/`);
      const event = response.data;
      
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
      };
      
      setForm({
        title: event.title || '',
        description: event.description || '',
        event_type: event.event_type || 'general',
        start_date: formatDateForInput(event.start_date),
        end_date: formatDateForInput(event.end_date),
        location: event.location || '',
        is_active: event.is_active !== undefined ? event.is_active : true,
        is_featured: event.is_featured !== undefined ? event.is_featured : false,
      });
    } catch (err) {
      console.error('Error fetching event:', err);
      showError('Failed to load event details', 'Error');
      navigate('/admin/events');
    } finally {
      setLoading(false);
    }
  };

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

    setSubmitting(true);
    try {
      await api.patch(`/events/${id}/`, form);
      showSuccess('Event updated successfully!', 'Success');
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (err) {
      console.error('Error updating event:', err);
      showError(err.response?.data?.message || 'Failed to update event', 'Error');
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
          Loading event details...
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
        }}>Edit Event</h1>
        <p style={{
          color: '#6b8aaa',
          fontSize: '14px',
          marginTop: '4px',
          marginBottom: 0,
        }}>Update event details</p>
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
              min={form.start_date}
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

        {/* Info Box */}
        <div style={{
          background: 'rgba(245, 166, 35, 0.1)',
          border: '1px solid rgba(245, 166, 35, 0.3)',
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}>
            <svg style={{
              width: '20px',
              height: '20px',
              color: '#f5a623',
              marginTop: '2px',
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p style={{
                color: '#f5a623',
                fontSize: '14px',
                fontWeight: 500,
                margin: 0,
              }}>Note:</p>
              <p style={{
                color: '#6b8aaa',
                fontSize: '14px',
                marginTop: '4px',
                marginBottom: 0,
              }}>
                Events marked as <span style={{ color: '#f5a623' }}>Featured</span> will appear prominently on the student dashboard.
                Inactive events will not be visible to students.
              </p>
            </div>
          </div>
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
              'Save Changes'
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

export default EditEvent;