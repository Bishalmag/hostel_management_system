import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      maxWidth: '448px',
      margin: '0 auto',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        background: 'rgba(248, 113, 113, 0.2)',
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <svg style={{
          width: '40px',
          height: '40px',
          color: '#f87171',
        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#eaf2ff',
        marginBottom: '8px',
      }}>Payment Failed!</h2>
      <p style={{
        color: '#6b8aaa',
        marginBottom: '24px',
      }}>Something went wrong with your payment. Please try again.</p>
      <div>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '100%',
            padding: '8px 24px',
            background: '#f5a623',
            color: '#0a1628',
            fontWeight: 500,
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '12px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e09515';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f5a623';
          }}
        >
          Try Again
        </button>
        <button
          onClick={() => navigate('/students/my-bookings')}
          style={{
            width: '100%',
            padding: '8px 24px',
            background: 'rgba(18, 36, 72, 0.5)',
            color: '#c8daf0',
            fontWeight: 500,
            borderRadius: '8px',
            border: '1px solid #1a3050',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(18, 36, 72, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(18, 36, 72, 0.5)';
          }}
        >
          View My Bookings
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;