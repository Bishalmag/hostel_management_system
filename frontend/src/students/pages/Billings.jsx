import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const Billings = () => {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/bookings/payments/')
      .then(res => setPayments(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total   = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const paid    = payments.filter(p => p.paid_status === 'paid').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const pending = payments.filter(p => p.paid_status === 'pending').reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Billings</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Billed',   value: `₹${total.toLocaleString()}`,   color: 'text-white' },
          { label: 'Paid',           value: `₹${paid.toLocaleString()}`,    color: 'text-green-400' },
          { label: 'Pending',        value: `₹${pending.toLocaleString()}`, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? <div className="text-gray-500 text-center py-10">Loading...</div> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">Amount</th>
                <th className="px-5 py-3 text-left">Due Date</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {payments.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-600">No billing records.</td></tr>
              ) : payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-800/50">
                  <td className="px-5 py-3 text-gray-400 font-mono">#{p.id}</td>
                  <td className="px-5 py-3 text-white font-mono">₹{p.amount}</td>
                  <td className="px-5 py-3 text-gray-400">{p.due_date}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      p.paid_status === 'paid'    ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      p.paid_status === 'overdue' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>{p.paid_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Billings;