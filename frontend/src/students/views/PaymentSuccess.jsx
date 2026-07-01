import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div style={{
      maxWidth: '448px',
      margin: '0 auto',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        background: 'rgba(29, 219, 168, 0.2)',
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
          color: '#1ddba8',
        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#eaf2ff',
        marginBottom: '8px',
      }}>Payment Successful!</h2>
      <p style={{
        color: '#6b8aaa',
        marginBottom: '8px',
      }}>Your payment has been processed successfully.</p>
      {paymentId && (
        <p style={{
          color: '#3a5070',
          fontSize: '14px',
          marginBottom: '24px',
        }}>Payment ID: #{paymentId}</p>
      )}
      <div>
        <button
          onClick={() => navigate('/students/my-bookings')}
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
          View My Bookings
        </button>
        <button
          onClick={() => navigate('/students/homepage')}
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
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;