import React, { useState, useEffect } from 'react';

const NotificationPopup = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-close after 5 seconds
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

  const getBgColor = (type) => {
    switch (type) {
      case 'booking': return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
      case 'complaint': return 'from-red-500/20 to-red-600/10 border-red-500/30';
      case 'payment': return 'from-green-500/20 to-green-600/10 border-green-500/30';
      case 'maintenance': return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      case 'success': return 'from-green-500/20 to-green-600/10 border-green-500/30';
      case 'error': return 'from-red-500/20 to-red-600/10 border-red-500/30';
      case 'warning': return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      default: return 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-in ${isExiting ? 'animate-slide-out' : ''}`}>
      <div className={`bg-gradient-to-br ${getBgColor(notification.type)} border rounded-xl shadow-2xl w-80 overflow-hidden`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getIcon(notification.type)}</span>
            <h3 className="text-white font-semibold text-sm">{notification.title}</h3>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-gray-300 text-sm">{notification.message}</p>
          {notification.details && (
            <div className="mt-2 text-xs text-gray-400">
              {notification.details}
            </div>
          )}
          {notification.timestamp && (
            <div className="mt-2 text-xs text-gray-500">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Actions */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700 flex gap-2">
            {notification.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  action.onClick?.();
                  handleClose();
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  action.primary 
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
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

// Add CSS animations to document
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