import React, { useState } from 'react';
import api from '../../api/axios';
// import { useNotification } from '../../context/NotificationContext';

const PayNowButton = ({ bookingId, amount, className }) => {
  const [loading, setLoading] = useState(false);
  const { showError } = useNotification();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await api.post('/bookings/payments/initiate/', {
        booking_id: bookingId
      });
      
      // Create a temporary div and submit the form to eSewa
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = response.data.form;
      document.body.appendChild(tempDiv);
      const form = tempDiv.querySelector('form');
      if (form) {
        form.submit();
      }
    } catch (err) {
      console.error('Payment initiation failed:', err);
      showError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-1 ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400"></div>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pay Now
        </>
      )}
    </button>
  );
};

export default PayNowButton;