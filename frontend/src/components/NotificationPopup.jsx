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

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return '📅';
      case 'complaint': return '⚠️';
      case 'payment': return '💰';
      case 'maintenance': return '🔧';
      case 'feedback': return '💬';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'booking': return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
      case 'complaint': return 'from-red-500/20 to-red-600/10 border-red-500/30';
      case 'payment': return 'from-green-500/20 to-green-600/10 border-green-500/30';
      case 'maintenance': return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      case 'feedback': return 'from-purple-500/20 to-purple-600/10 border-purple-500/30';
      case 'success': return 'from-green-500/20 to-green-600/10 border-green-500/30';
      case 'error': return 'from-red-500/20 to-red-600/10 border-red-500/30';
      case 'warning': return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      default: return 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30';
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

  return (
    <div className={`animate-slide-in ${isExiting ? 'animate-slide-out' : ''}`}>
      <div className={`bg-gradient-to-br ${getBgColor(notification.type)} border rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getIcon(notification.type)}</span>
            <h3 className="text-white font-semibold text-sm">{notification.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{getTimeAgo(notification.timestamp)}</span>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-3 bg-gray-900/30">
          <p className="text-gray-300 text-sm">{notification.message}</p>
          {notification.details && (
            <div className="mt-2 text-xs text-gray-400 border-t border-gray-700 pt-2">
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

.animate-slide-in {
  animation: slideIn 0.3s ease-out forwards;
}

.animate-slide-out {
  animation: slideOut 0.3s ease-in forwards;
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default NotificationPopup;