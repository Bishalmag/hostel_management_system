// src/students/components/PayNowButton.jsx
import React, { useState } from 'react';
import api from '../../api/axios';

const PayNowButton = ({ bookingId, amount, className }) => {
  const [loading, setLoading] = useState(false);

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
      alert(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pay Now
        </>
      )}
    </button>
  );
};

export default PayNowButton;