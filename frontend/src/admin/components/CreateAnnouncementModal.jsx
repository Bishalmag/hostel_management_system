import React, { useState } from 'react';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const CreateAnnouncementModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    notification_type: 'announcement',
    priority: 'medium',
    expires_at: '',
    link: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.message.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/notifications/send_announcement/', form);
      showSuccess(response.data.message);
      onSuccess();
      onClose();
      setForm({
        title: '',
        message: '',
        notification_type: 'announcement',
        priority: 'medium',
        expires_at: '',
        link: '',
      });
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#60a5fa',
      medium: '#f5a623',
      high: '#fb923c',
      urgent: '#f87171',
    };
    return colors[priority] || '#6b8aaa';
  };

  const getPriorityEmoji = (priority) => {
    const emojis = {
      low: '●',
      medium: '◉',
      high: '◆',
      urgent: '◆',
    };
    return emojis[priority] || '●';
  };

  const getTypeEmoji = (type) => {
    const emojis = {
      announcement: '◆',
      maintenance: '◈',
      general: '◉',
      emergency: '◆',
      event: '◇',
    };
    return emojis[type] || '●';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px',
    }}>
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        maxWidth: '512px',
        width: '100%',
        padding: '24px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#eaf2ff',
              margin: 0,
            }}>
              Send Announcement
            </h2>
            <p style={{
              color: '#6b8aaa',
              fontSize: '14px',
              marginTop: '4px',
              marginBottom: 0,
            }}>
              This will be sent to all students
            </p>
          </div>
          <button onClick={onClose} style={{
            color: '#6b8aaa',
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
            padding: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#eaf2ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b8aaa';
          }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: '#6b8aaa',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Water Maintenance Today"
              style={{
                width: '100%',
                padding: '8px 12px',
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: '#6b8aaa',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>Message *</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              placeholder="Detailed announcement message..."
              style={{
                width: '100%',
                padding: '8px 12px',
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>Type</label>
              <select
                name="notification_type"
                value={form.notification_type}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
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
                <option value="announcement">{getTypeEmoji('announcement')} Announcement</option>
                <option value="maintenance">{getTypeEmoji('maintenance')} Maintenance</option>
                <option value="general">{getTypeEmoji('general')} General</option>
                <option value="emergency">{getTypeEmoji('emergency')} Emergency</option>
                <option value="event">{getTypeEmoji('event')} Event</option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#0f2040',
                  border: '1px solid #1a3050',
                  borderRadius: '8px',
                  color: getPriorityColor(form.priority),
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
                <option value="low" style={{ color: '#60a5fa' }}>{getPriorityEmoji('low')} Low</option>
                <option value="medium" style={{ color: '#f5a623' }}>{getPriorityEmoji('medium')} Medium</option>
                <option value="high" style={{ color: '#fb923c' }}>{getPriorityEmoji('high')} High</option>
                <option value="urgent" style={{ color: '#f87171' }}>{getPriorityEmoji('urgent')} Urgent</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>Expires At</label>
              <input
                type="datetime-local"
                name="expires_at"
                value={form.expires_at}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
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
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>Link (Optional)</label>
              <input
                type="url"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
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
          </div>

          <div style={{
            background: 'rgba(245, 166, 35, 0.1)',
            border: '1px solid rgba(245, 166, 35, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
          }}>
            <p style={{
              color: '#f5a623',
              fontSize: '12px',
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}>
              <span>◆</span>
              <span>This announcement will be sent as a notification to <strong>ALL students</strong>. 
              Urgent priority notifications will appear as popups.</span>
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '8px',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#0f2040',
                color: '#c8daf0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
                fontSize: '14px',
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
                padding: '8px 16px',
                background: loading ? '#6b8aaa' : '#f5a623',
                color: '#0a1628',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: 600,
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
                    width: '16px',
                    height: '16px',
                    border: '2px solid #0a1628',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  Sending...
                </>
              ) : (
                'Send to All Students'
              )}
            </button>
          </div>
        </form>
      </div>

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

export default CreateAnnouncementModal;