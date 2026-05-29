import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageAllocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    api.get('/allocation/allocations/')
      .then(res => setAllocations(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this allocation?')) return;
    try {
      await api.patch(`/allocation/allocations/${id}/`, { status: 'cancelled' });
      setAllocations(a => a.map(x => x.id === id ? {...x, status: 'cancelled'} : x));
    } catch { alert('Failed.'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Room Allocations</h1>

      {loading ? <div className="text-gray-500 text-center py-10">Loading...</div> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Student</th>
                <th className="px-5 py-3 text-left">Room</th>
                <th className="px-5 py-3 text-left">Allocated On</th>
                <th className="px-5 py-3 text-left">Valid Until</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {allocations.map(a => (
                <tr key={a.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3 text-white">{a.student}</td>
                  <td className="px-5 py-3 text-gray-400">{a.room}</td>
                  <td className="px-5 py-3 text-gray-400">{a.allocated_on}</td>
                  <td className="px-5 py-3 text-gray-400">{a.valid_until ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      a.status === 'active'    ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      a.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    {a.status === 'active' && (
                      <button onClick={() => handleCancel(a.id)}
                        className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded border border-red-500/30">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {allocations.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-600">No allocations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageAllocations;