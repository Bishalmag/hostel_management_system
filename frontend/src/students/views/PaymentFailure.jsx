import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <div className="bg-red-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Payment Failed!</h2>
      <p className="text-gray-400 mb-6">Something went wrong with your payment. Please try again.</p>
      <div className="space-y-3">
        <button
          onClick={() => navigate(-1)}
          className="w-full px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg"
        >
          Try Again
        </button>
        <button
          onClick={() => navigate('/students/my-bookings')}
          className="w-full px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg"
        >
          View My Bookings
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;