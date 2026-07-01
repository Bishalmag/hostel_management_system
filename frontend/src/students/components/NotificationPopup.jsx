import React, { useState, useEffect } from 'react';

const NotificationPopup = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return '📅';
      case 'complaint': return '⚠️';
      case 'payment': return '💰';
      case 'maintenance': return '🔧';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'booking': 
        return { border: '#1a3050', bg: 'rgba(59, 130, 246, 0.05)', accent: '#3b82f6' };
      case 'complaint':
      case 'error':
        return { border: '#1a3050', bg: 'rgba(239, 68, 68, 0.05)', accent: '#ef4444' };
      case 'payment':
      case 'success':
        return { border: '#1a3050', bg: 'rgba(34, 197, 94, 0.05)', accent: '#22c55e' };
      case 'maintenance':
      case 'warning':
        return { border: '#1a3050', bg: 'rgba(234, 179, 8, 0.05)', accent: '#eab308' };
      default:
        return { border: '#1a3050', bg: 'rgba(245, 166, 35, 0.05)', accent: '#f5a623' };
    }
  };

  const colors = getColors(notification.type);

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 50,
      animation: isExiting ? 'slideOut 0.3s ease-in forwards' : 'slideIn 0.3s ease-out forwards',
      maxWidth: '320px',
      width: '100%',
    }}>
      <div style={{
        background: `linear-gradient(to bottom right, ${colors.bg}, rgba(10, 22, 40, 0.95))`,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #1a3050',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(10, 22, 40, 0.5)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '18px' }}>{getIcon(notification.type)}</span>
            <h3 style={{
              color: '#eaf2ff',
              fontWeight: 600,
              fontSize: '14px',
              margin: 0,
            }}>{notification.title}</h3>
          </div>
          <button
            onClick={handleClose}
            style={{
              color: '#6b8aaa',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#eaf2ff';
              e.currentTarget.style.background = 'rgba(18, 36, 72, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b8aaa';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px' }}>
          <p style={{
            color: '#c8daf0',
            fontSize: '14px',
            margin: 0,
            lineHeight: 1.5,
          }}>{notification.message}</p>
          {notification.details && (
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#6b8aaa',
            }}>
              {notification.details}
            </div>
          )}
          {notification.timestamp && (
            <div style={{
              marginTop: '8px',
              fontSize: '11px',
              color: '#3a5070',
            }}>
              {new Date(notification.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Actions */}
        {notification.actions && notification.actions.length > 0 && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(10, 22, 40, 0.5)',
            borderTop: '1px solid #1a3050',
            display: 'flex',
            gap: '8px',
          }}>
            {notification.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  action.onClick?.();
                  handleClose();
                }}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: action.primary ? '#f5a623' : 'rgba(26, 48, 80, 0.5)',
                  color: action.primary ? '#0a1628' : '#c8daf0',
                }}
                onMouseEnter={(e) => {
                  if (action.primary) {
                    e.currentTarget.style.background = '#e09515';
                  } else {
                    e.currentTarget.style.background = 'rgba(26, 48, 80, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (action.primary) {
                    e.currentTarget.style.background = '#f5a623';
                  } else {
                    e.currentTarget.style.background = 'rgba(26, 48, 80, 0.5)';
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Add CSS animations
const styles = `
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default NotificationPopup;