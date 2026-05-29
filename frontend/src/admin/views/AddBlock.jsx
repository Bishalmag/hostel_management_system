import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AddBlock = () => {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ hostel: '', name: '' });
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/hostel/hostels/')
      .then(res => setHostels(res.data.results ?? res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/hostel/blocks/', form);
      setMessage({ type: 'success', text: 'Block added!' });
      setTimeout(() => navigate('/admin/hostels'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add block.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <button onClick={() => navigate('/admin/blocks')}
          className="text-sm text-gray-500 hover:text-purple-400 mb-3">← Back</button>
        <h1 className="text-2xl font-bold text-white">Add Block</h1>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm border ${
          message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                     : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Hostel *</label>
          <select value={form.hostel} onChange={e => setForm(f => ({...f, hostel: e.target.value}))}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            required>
            <option value="">Select hostel</option>
            {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Block Name *</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
            placeholder="e.g. Block A"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            required />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50">
          {loading ? 'Adding...' : 'Add Block'}
        </button>
      </form>
    </div>
  );
};

export default AddBlock;