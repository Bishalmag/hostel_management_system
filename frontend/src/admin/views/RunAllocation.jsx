import React, { useState } from 'react';
import api from '../../api/axios';

const RunAllocation = () => {
  const [loading,  setLoading]  = useState(false);
  const [results,  setResults]  = useState(null);
  const [message,  setMessage]  = useState({ type: '', text: '' });

  const handleRun = async () => {
    if (!confirm('Run auto-allocation for all unallocated students?')) return;
    setLoading(true);
    setResults(null);
    try {
      const { data } = await api.post('/allocation/run/');
      setResults(data);
      setMessage({ type: 'success', text: `Allocated ${data.allocated} students successfully!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Allocation failed.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Auto Room Allocation</h1>
        <p className="text-gray-500 text-sm mt-1">
          Automatically allocate rooms to unallocated students based on preferences.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="space-y-2 text-sm text-gray-400">
          <p>Algorithm considers:</p>
          <ul className="ml-4 space-y-1 text-gray-500">
            <li>• Floor preference</li>
            <li>• Noise tolerance</li>
            <li>• Disability support needs (priority)</li>
            <li>• Discipline history (penalty)</li>
            <li>• Friend preferences</li>
          </ul>
        </div>
        <button onClick={handleRun} disabled={loading}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50 flex items-center gap-2">
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          )}
          {loading ? 'Running...' : '▶ Run Auto Allocation'}
        </button>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm border ${
          message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                     : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      {results && results.results?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">Allocation Results ({results.allocated} allocated)</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                <th className="px-5 py-3 text-left">Student</th>
                <th className="px-5 py-3 text-left">Room</th>
                <th className="px-5 py-3 text-left">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {results.results.map((r, i) => (
                <tr key={i} className="hover:bg-gray-800/50">
                  <td className="px-5 py-3 text-white">{r.student}</td>
                  <td className="px-5 py-3 text-gray-400">{r.room}</td>
                  <td className="px-5 py-3 text-purple-400 font-mono">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RunAllocation;