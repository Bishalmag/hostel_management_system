import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const EditRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form,    setForm]    = useState({ floor: '', room_number: '', capacity: '', room_type: '', current_occupancy: 0 });
  const [floors,  setFloors]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    Promise.all([
      api.get(`/hostel/rooms/${id}/`),
      api.get('/hostel/floors/'),
    ]).then(([r, f]) => {
      setForm(r.data);
      setFloors(f.data.results ?? f.data);
    }).catch(() => {});
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/hostel/rooms/${id}/`, form);
      setMessage({ type: 'success', text: 'Room updated!' });
      setTimeout(() => navigate('/admin/rooms'), 1500);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update.' });
    } finally { setLoading(false); }
  };

  const set = field => e => setForm(f => ({...f, [field]: e.target.value}));

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <button onClick={() => navigate('/admin/rooms')}
          className="text-sm text-gray-500 hover:text-purple-400 mb-3">← Back</button>
        <h1 className="text-2xl font-bold text-white">Edit Room</h1>
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
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Floor</label>
          <select value={form.floor} onChange={set('floor')}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
            {floors.map(f => <option key={f.id} value={f.id}>Floor {f.floor_number}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Room Number</label>
            <input type="text" value={form.room_number} onChange={set('room_number')}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Capacity</label>
            <input type="number" value={form.capacity} onChange={set('capacity')}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Room Type</label>
            <select value={form.room_type} onChange={set('room_type')}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
              <option value="single">Single</option>
              <option value="shared">Shared</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Current Occupancy</label>
            <input type="number" value={form.current_occupancy} onChange={set('current_occupancy')}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditRoom;