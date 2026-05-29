import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AddRoom = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    hostel: '',
    block: '',
    floor: '',
    room_number: '',
    capacity: '',
    room_type: 'Single',
    current_occupancy: 0
  });

  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // ✅ Load hostels
  useEffect(() => {
    api.get('/hostel/hostels/')
      .then(res => setHostels(res.data.results ?? res.data))
      .catch(() => {});
  }, []);

  // ✅ Load blocks when hostel changes
  useEffect(() => {
    if (!form.hostel) {
      setBlocks([]);
      return;
    }

    api.get(`/hostel/blocks/?hostel=${form.hostel}`)
      .then(res => setBlocks(res.data.results ?? res.data))
      .catch(() => {});
  }, [form.hostel]);

  // ✅ Load floors when block changes
  useEffect(() => {
    if (!form.block) {
      setFloors([]);
      return;
    }

    api.get(`/hostel/floors/?block=${form.block}`)
      .then(res => setFloors(res.data.results ?? res.data))
      .catch(() => {});
  }, [form.block]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/hostel/rooms/', {
        floor: form.floor,
        room_number: form.room_number,
        capacity: form.capacity,
        room_type: form.room_type,
        current_occupancy: form.current_occupancy
      });

      setMessage({
        type: 'success',
        text: 'Room added successfully!'
      });

      setTimeout(() => navigate('/admin/rooms'), 1500);

    } catch (err) {
      const msg = Object.values(err.response?.data ?? {})
        .flat()
        .join(', ');

      setMessage({
        type: 'error',
        text: msg || 'Failed to add room.'
      });

    } finally {
      setLoading(false);
    }
  };

  const set = field => e =>
    setForm(f => ({
      ...f,
      [field]: e.target.value
    }));

  return (
    <div className="max-w-lg space-y-6">

      <div>
        <button
          onClick={() => navigate('/admin/rooms')}
          className="text-sm text-gray-500 hover:text-purple-400 mb-3"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-white">
          Add Room
        </h1>
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

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
      >

        {/* HOSTEL */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            Hostel *
          </label>

          <select
            value={form.hostel}
            onChange={set('hostel')}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            required
          >
            <option value="">Select hostel</option>

            {hostels.map(h => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* BLOCK */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            Block *
          </label>

          <select
            value={form.block}
            onChange={set('block')}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            required
            disabled={!form.hostel}
          >
            <option value="">Select block</option>

            {blocks.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* FLOOR */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            Floor *
          </label>

          <select
            value={form.floor}
            onChange={set('floor')}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            required
            disabled={!form.block}
          >
            <option value="">Select floor</option>

            {floors.map(f => (
              <option key={f.id} value={f.id}>
                Floor {f.floor_number}
              </option>
            ))}
          </select>
        </div>

        {/* ROOM NUMBER + CAPACITY */}
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Room Number *
            </label>

            <input
              type="text"
              value={form.room_number}
              onChange={set('room_number')}
              placeholder="e.g. 101"
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Capacity *
            </label>

            <input
              type="number"
              value={form.capacity}
              onChange={set('capacity')}
              placeholder="e.g. 2"
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              required
            />
          </div>
        </div>

        {/* ROOM TYPE */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            Room Type *
          </label>

          <select
            value={form.room_type}
            onChange={set('room_type')}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="single">Single</option>
            <option value="shared">Shared</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-lg"
        >
          {loading ? 'Adding...' : 'Add Room'}
        </button>

      </form>
    </div>
  );
};

export default AddRoom;