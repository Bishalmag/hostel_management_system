import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const AddFloor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    hostel: searchParams.get('hostel') ?? '',
    block: searchParams.get('block') ?? '',
    floor_number: ''
  });

  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // ✅ Fetch hostels
  useEffect(() => {
    api.get('/hostel/hostels/')
      .then(res => setHostels(res.data.results ?? res.data))
      .catch(() => {});
  }, []);

  // ✅ Fetch blocks when hostel changes
  useEffect(() => {
    if (!form.hostel) {
      setBlocks([]);
      return;
    }

    api.get(`/hostel/blocks/?hostel=${form.hostel}`)
      .then(res => setBlocks(res.data.results ?? res.data))
      .catch(() => {});
  }, [form.hostel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/hostel/floors/', form);
      setMessage({ type: 'success', text: 'Floor added!' });

      setTimeout(() => navigate('/admin/floors/'), 1500);
    } catch {
      setMessage({ type: 'error', text: 'Failed to add floor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">

      <div>
        <button onClick={() => navigate('/admin/floors')}
          className="text-sm text-gray-500 hover:text-purple-400 mb-3">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-white">Add Floor</h1>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm border ${
          message.type === 'success'
            ? 'bg-green-500/10 text-green-400 border-green-500/30'
            : 'bg-red-500/10 text-red-400 border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">

        {/* ✅ HOSTEL SELECT */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Hostel *</label>
          <select
            value={form.hostel}
            onChange={(e) =>
              setForm(f => ({ ...f, hostel: e.target.value, block: '' }))
            }
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            required
          >
            <option value="">Select hostel</option>
            {hostels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* ✅ BLOCK SELECT */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Block *</label>
          <select
            value={form.block}
            onChange={e => setForm(f => ({ ...f, block: e.target.value }))}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            required
            disabled={!form.hostel}
          >
            <option value="">Select block</option>
            {blocks.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* FLOOR NUMBER */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Floor Number *</label>
          <input
            type="number"
            value={form.floor_number}
            onChange={e => setForm(f => ({ ...f, floor_number: e.target.value }))}
            placeholder="e.g. 1"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-lg"
        >
          {loading ? 'Adding...' : 'Add Floor'}
        </button>
      </form>
    </div>
  );
};

export default AddFloor;