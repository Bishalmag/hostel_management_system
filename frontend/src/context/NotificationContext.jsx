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

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((message, title = 'Success', details = null) => {
    addNotification({ title, message, details, type: 'success', timestamp: new Date() });
  }, [addNotification]);

  const showError = useCallback((message, title = 'Error', details = null) => {
    addNotification({ title, message, details, type: 'error', timestamp: new Date() });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Information', details = null) => {
    addNotification({ title, message, details, type: 'info', timestamp: new Date() });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning', details = null) => {
    addNotification({ title, message, details, type: 'warning', timestamp: new Date() });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ 
      addNotification, 
      removeNotification,
      showSuccess,
      showError,
      showInfo,
      showWarning
    }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {notifications.map(notification => (
          <NotificationPopup
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};