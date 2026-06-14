import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <div className="bg-green-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
      <p className="text-gray-400 mb-2">Your payment has been processed successfully.</p>
      {paymentId && (
        <p className="text-gray-500 text-sm mb-6">Payment ID: #{paymentId}</p>
      )}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/students/my-bookings')}
          className="w-full px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg"
        >
          View My Bookings
        </button>
        <button
          onClick={() => navigate('/students/homepage')}
          className="w-full px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;