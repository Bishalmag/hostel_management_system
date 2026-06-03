import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/bookings/payments/?paid_status=paid')
      .then(res => setPayments(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Payment History</h1>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
          <p className="text-xs text-gray-500">Total Paid</p>
          <p className="text-lg font-bold font-mono text-green-400">₹{total.toLocaleString()}</p>
        </div>
      </div>

      {loading ? <div className="text-gray-500 text-center py-10">Loading...</div> : (
        payments.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
            <p className="text-4xl mb-3">📜</p>
            <p className="text-gray-500 text-sm">No payment history yet.</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Paid At</th>
                  <th className="px-5 py-3 text-left">Booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-800/50">
                    <td className="px-5 py-3 text-gray-400 font-mono">#{p.id}</td>
                    <td className="px-5 py-3 text-green-400 font-mono font-bold">₹{p.amount}</td>
                    <td className="px-5 py-3 text-gray-400">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-400">#{p.booking ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default PaymentHistory;