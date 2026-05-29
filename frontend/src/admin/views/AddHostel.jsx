import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AddHostel = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/hostel/hostels/', form);
      setMessage({ type: 'success', text: 'Hostel added successfully!' });
      setTimeout(() => navigate('/admin/hostels'), 1500);
    } catch (err) {
      const msg = Object.values(err.response?.data ?? {}).flat().join(', ');
      setMessage({ type: 'error', text: msg || 'Failed to add hostel.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <button onClick={() => navigate('/admin/rooms')}
          className="text-sm text-gray-500 hover:text-purple-400 mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-white">Add Hostel</h1>
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
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Hostel Name *</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
            placeholder="e.g. Rosewood Hostel"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            required />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Address</label>
          <textarea value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))}
            placeholder="Full address"
            rows={3}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 resize-none" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50">
          {loading ? 'Adding...' : 'Add Hostel'}
        </button>
      </form>
    </div>
  );
};

export default AddHostel;