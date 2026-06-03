import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const PayRent = () => {
  const [payments,   setPayments]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [message,    setMessage]    = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/bookings/payments/?paid_status=pending')
      .then(res => setPayments(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async (id) => {
    setSubmitting(id);
    try {
      await api.patch(`/bookings/payments/${id}/`, {
        paid_status: 'paid',
        paid_at: new Date().toISOString(),
      });
      setPayments(p => p.filter(x => x.id !== id));
      setMessage({ type: 'success', text: 'Payment recorded successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Payment failed. Try again.' });
    } finally { setSubmitting(null); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Pay Rent</h1>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm border ${
          message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                     : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      {loading ? <div className="text-gray-500 text-center py-10">Loading...</div> :
       payments.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500 text-sm">No pending payments.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(p => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-bold font-mono text-lg">₹{p.amount}</p>
                <p className="text-xs text-gray-500 mt-1">Due: {p.due_date}</p>
                <p className="text-xs text-gray-600">Payment #{p.id}</p>
              </div>
              <button onClick={() => handlePay(p.id)} disabled={submitting === p.id}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-lg transition disabled:opacity-50">
                {submitting === p.id ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PayRent;