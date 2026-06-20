import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationPopup from '../components/NotificationPopup';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      ...notification,
      id,
      read: false,
      timestamp: new Date().toISOString(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 6000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Basic notification types
  const showSuccess = useCallback((message, title = 'Success', details = null) => {
    addNotification({ title, message, details, type: 'success' });
  }, [addNotification]);

  const showError = useCallback((message, title = 'Error', details = null) => {
    addNotification({ title, message, details, type: 'error' });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Information', details = null) => {
    addNotification({ title, message, details, type: 'info' });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning', details = null) => {
    addNotification({ title, message, details, type: 'warning' });
  }, [addNotification]);

  // Domain-specific notification types
  const showBooking = useCallback((message, title = 'New Booking', details = null) => {
    addNotification({ title, message, details, type: 'booking' });
  }, [addNotification]);

  const showPayment = useCallback((message, title = 'Payment Received', details = null) => {
    addNotification({ title, message, details, type: 'payment' });
  }, [addNotification]);

  const showComplaint = useCallback((message, title = 'Complaint Update', details = null) => {
    addNotification({ title, message, details, type: 'complaint' });
  }, [addNotification]);

  const showFeedback = useCallback((message, title = 'New Feedback', details = null) => {
    addNotification({ title, message, details, type: 'feedback' });
  }, [addNotification]);

  const showMaintenance = useCallback((message, title = 'Maintenance Notice', details = null) => {
    addNotification({ title, message, details, type: 'maintenance' });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ 
      notifications,
      unreadCount,
      addNotification, 
      removeNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      showSuccess,
      showError,
      showInfo,
      showWarning,
      showBooking,
      showPayment,
      showComplaint,
      showFeedback,
      showMaintenance,
    }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
        {notifications.slice(0, 5).map(notification => (
          <NotificationPopup
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
            onRead={() => markAsRead(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};