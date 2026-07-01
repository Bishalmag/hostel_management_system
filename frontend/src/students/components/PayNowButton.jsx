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
      style={{
        padding: '8px 20px',
        background: loading ? '#3a5070' : 'linear-gradient(to right, #f5a623, #e09515)',
        color: '#0a1628',
        fontWeight: 600,
        borderRadius: '8px',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: loading ? 'none' : '0 4px 20px rgba(245, 166, 35, 0.3)',
        opacity: loading ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        ...(className ? {} : {}),
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = 'linear-gradient(to right, #e09515, #c47d0e)';
          e.currentTarget.style.boxShadow = '0 4px 30px rgba(245, 166, 35, 0.4)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.background = 'linear-gradient(to right, #f5a623, #e09515)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 166, 35, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {loading ? (
        <>
          <span style={{
            width: '16px',
            height: '16px',
            border: '2px solid #0a1628',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
          }} />
          Processing...
        </>
      ) : (
        <>
          <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pay Now
        </>
      )}
    </button>
  );
};

export default PayNowButton;