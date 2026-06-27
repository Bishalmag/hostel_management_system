import React, { useState, useEffect } from 'react';
import { getNodesPublic, findPath } from '../../api/navigationApi';

export default function FindPath() {
  const [nodes,   setNodes]   = useState([]);
  const [from,    setFrom]    = useState('');
  const [to,      setTo]      = useState('');
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getNodesPublic()
      .then(r => setNodes(r.data.results ?? r.data))
      .catch(() => setError('Failed to load locations.'));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await findPath(from, to);
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ??
        'No path found between these locations. Ask admin to check the graph.'
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() { setFrom(''); setTo(''); setResult(null); setError(''); }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Find My Way 🧭</h1>
        <p className="text-gray-400 text-sm mt-1">
          Select where you are and where you want to go — we'll find the shortest path.
        </p>
      </div>

      {/* Form */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                I am at
              </label>
              <select required value={from}
                onChange={e => { setFrom(e.target.value); setResult(null); setError(''); }}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition">
                <option value="">Select your location...</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                I want to go to
              </label>
              <select required value={to}
                onChange={e => { setTo(e.target.value); setResult(null); setError(''); }}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition">
                <option value="">Select destination...</option>
                {nodes.filter(n => n.id !== parseInt(from))
                      .map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
              {loading ? 'Finding...' : 'Find Shortest Path'}
            </button>
            {(result || error) && (
              <button type="button" onClick={reset}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition">
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">❌</div>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Shortest Path</h2>
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
              Distance: {result.total_cost} units
            </span>
          </div>

          {/* Steps */}
          <div className="space-y-0">
            {result.path_names.map((name, i) => {
              const isFirst = i === 0;
              const isLast  = i === result.path_names.length - 1;
              const isOnly  = result.path_names.length === 1;
              return (
                <div key={i} className="flex items-start gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isFirst ? 'bg-emerald-500 text-white'
                      : isLast ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                    }`}>
                      {i + 1}
                    </div>
                    {!isLast && !isOnly && (
                      <div className="w-0.5 h-8 bg-gray-700 mt-1" />
                    )}
                  </div>
                  {/* Label */}
                  <div className="pt-1.5 pb-4">
                    <p className={`text-sm font-medium ${
                      isFirst || isLast ? 'text-white' : 'text-gray-300'
                    }`}>
                      {name}
                    </p>
                    {isFirst && (
                      <span className="text-xs text-emerald-400">Start</span>
                    )}
                    {isLast && !isFirst && (
                      <span className="text-xs text-purple-400">Destination</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary bar */}
          <div className="border-t border-gray-800 pt-4 flex items-center gap-2 text-sm text-gray-400">
            <span>📍 {result.path_names[0]}</span>
            <span className="text-gray-600">→</span>
            <span>🏁 {result.path_names[result.path_names.length - 1]}</span>
            <span className="ml-auto text-gray-500">{result.path.length} stop{result.path.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}