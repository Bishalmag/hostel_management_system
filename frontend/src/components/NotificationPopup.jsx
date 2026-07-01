import React, { useState, useEffect } from 'react';

const NotificationPopup = ({ notification, onClose, onRead }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    if (onRead) onRead();
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'booking': return { bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.3)', accent: '#3b82f6' };
      case 'complaint': return { bg: 'rgba(248, 113, 113, 0.05)', border: 'rgba(248, 113, 113, 0.3)', accent: '#f87171' };
      case 'payment': return { bg: 'rgba(29, 219, 168, 0.05)', border: 'rgba(29, 219, 168, 0.3)', accent: '#1ddba8' };
      case 'maintenance': return { bg: 'rgba(245, 166, 35, 0.05)', border: 'rgba(245, 166, 35, 0.3)', accent: '#f5a623' };
      case 'feedback': return { bg: 'rgba(167, 139, 250, 0.05)', border: 'rgba(167, 139, 250, 0.3)', accent: '#a78bfa' };
      case 'success': return { bg: 'rgba(29, 219, 168, 0.05)', border: 'rgba(29, 219, 168, 0.3)', accent: '#1ddba8' };
      case 'error': return { bg: 'rgba(248, 113, 113, 0.05)', border: 'rgba(248, 113, 113, 0.3)', accent: '#f87171' };
      case 'warning': return { bg: 'rgba(245, 166, 35, 0.05)', border: 'rgba(245, 166, 35, 0.3)', accent: '#f5a623' };
      default: return { bg: 'rgba(245, 166, 35, 0.05)', border: 'rgba(245, 166, 35, 0.3)', accent: '#f5a623' };
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const typeColors = getTypeColor(notification.type);

  return (
    <div style={{
      animation: isExiting ? 'slideOut 0.3s ease-in forwards' : 'slideIn 0.3s ease-out forwards',
      maxWidth: '384px',
      width: '100%',
    }}>
      <div style={{
        background: `linear-gradient(to bottom right, ${typeColors.bg}, rgba(10, 22, 40, 0.95))`,
        border: `1px solid ${typeColors.border}`,
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
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
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: typeColors.accent,
            }} />
            <h3 style={{
              color: '#eaf2ff',
              fontWeight: 600,
              fontSize: '14px',
              margin: 0,
            }}>{notification.title}</h3>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{
              fontSize: '10px',
              color: '#3a5070',
            }}>{getTimeAgo(notification.timestamp)}</span>
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
        </div>

        {/* Body */}
        <div style={{
          padding: '12px 16px',
          background: 'rgba(10, 22, 40, 0.3)',
        }}>
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
              borderTop: '1px solid #1a3050',
              paddingTop: '8px',
            }}>
              {notification.details}
            </div>
          )}
        </div>
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