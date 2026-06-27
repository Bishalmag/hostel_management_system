import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const EditRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    floor: '',
    room_number: '',
    capacity: '',
    room_type: 'single',
    room_purpose: 'residential',
    ac_type: 'non_ac',
    bathroom_type: 'shared',
    current_occupancy: 0,
    price_per_month: ''
  });
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check if room is residential
  const isResidential = form.room_purpose === 'residential';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomRes, floorsRes] = await Promise.all([
          api.get(`/hostel/rooms/${id}/`),
          api.get('/hostel/floors/')
        ]);
        
        setForm(roomRes.data);
        setFloors(floorsRes.data.results ?? floorsRes.data);
        setFetching(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to load room details.' });
        setFetching(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const payload = {
        floor: form.floor,
        room_number: form.room_number,
        room_purpose: form.room_purpose,
      };

      // Only add residential fields if room is residential
      if (isResidential) {
        payload.capacity = form.capacity;
        payload.room_type = form.room_type;
        payload.ac_type = form.ac_type;
        payload.bathroom_type = form.bathroom_type;
        payload.current_occupancy = form.current_occupancy;
        payload.price_per_month = form.price_per_month;
      } else {
        // Set default values for non-residential rooms
        payload.capacity = 0;
        payload.room_type = 'single';
        payload.ac_type = 'non_ac';
        payload.bathroom_type = 'shared';
        payload.current_occupancy = 0;
        payload.price_per_month = 0;
      }

      await api.patch(`/hostel/rooms/${id}/`, payload);
      setMessage({ type: 'success', text: 'Room updated successfully!' });
      setTimeout(() => navigate('/admin/rooms'), 1500);
    } catch (err) {
      console.error('Error updating room:', err);
      const msg = Object.values(err.response?.data ?? {}).flat().join(', ');
      setMessage({ type: 'error', text: msg || 'Failed to update room.' });
    } finally { 
      setLoading(false); 
    }
  };

  // Reset residential fields when purpose changes to non-residential
  const handlePurposeChange = (e) => {
    const newPurpose = e.target.value;
    const isRes = newPurpose === 'residential';
    
    setForm(f => ({
      ...f,
      room_purpose: newPurpose,
      // Reset residential fields if switching to non-residential
      ...(!isRes && {
        capacity: '',
        room_type: 'single',
        ac_type: 'non_ac',
        bathroom_type: 'shared',
        current_occupancy: 0,
        price_per_month: ''
      })
    }));
  };

  const set = field => e => setForm(f => ({...f, [field]: e.target.value}));

  if (fetching) {
    return (
      <div className="max-w-lg space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-gray-400">Loading room details...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <button onClick={() => navigate('/admin/rooms')}
          className="text-sm text-gray-500 hover:text-purple-400 mb-3">← Back to Rooms</button>
        <h1 className="text-2xl font-bold text-white">Edit Room</h1>
        <p className="text-xs text-gray-500 mt-1">Room ID: {id}</p>
      </div>
      
      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm border ${
          message.type === 'success' 
            ? 'bg-green-500/10 text-green-400 border-green-500/30'
            : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        
        {/* FLOOR */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Floor *</label>
          <select value={form.floor} onChange={set('floor')}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            required>
            <option value="">Select floor</option>
            {floors.map(f => <option key={f.id} value={f.id}>Floor {f.floor_number}</option>)}
          </select>
        </div>

        {/* ROOM NUMBER */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Room Number *</label>
          <input type="text" value={form.room_number} onChange={set('room_number')}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            required />
        </div>

        {/* ROOM PURPOSE */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Room Purpose *</label>
          <select 
            value={form.room_purpose} 
            onChange={handlePurposeChange}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            required>
            <option value="residential">Residential</option>
            <option value="reception">Reception</option>
            <option value="office">Office</option>
            <option value="lobby">Lobby</option>
            <option value="DI_room">DI Room</option>
            <option value="library">Library</option>
            <option value="canteen">Canteen</option>
            <option value="hall">Hall</option>
          </select>
          <p className={`text-xs mt-1 ${isResidential ? 'text-green-400' : 'text-yellow-400'}`}>
            {isResidential 
              ? '✓ Residential rooms are available for student booking.' 
              : '⚠ Non-residential rooms are not available for student booking.'}
          </p>
        </div>

        {/* ===== RESIDENTIAL-ONLY FIELDS ===== */}
        {isResidential && (
          <>
            {/* CAPACITY */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Capacity *</label>
              <input type="number" value={form.capacity} onChange={set('capacity')}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                required min="1" />
            </div>

            {/* ROOM TYPE */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Room Type *</label>
              <select value={form.room_type} onChange={set('room_type')}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
              </select>
            </div>

            {/* AC TYPE */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">AC Type *</label>
              <select value={form.ac_type} onChange={set('ac_type')}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
                <option value="non_ac">Non-AC</option>
                <option value="ac">AC</option>
              </select>
            </div>

            {/* BATHROOM TYPE */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Bathroom Type *</label>
              <select value={form.bathroom_type} onChange={set('bathroom_type')}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
                <option value="shared">Shared Bathroom</option>
                <option value="attached">Attached Bathroom</option>
              </select>
            </div>

            {/* PRICE PER MONTH */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Price per Month (NPR)</label>
              <input type="number" value={form.price_per_month || ''} onChange={set('price_per_month')}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" 
                min="0" />
            </div>

            {/* CURRENT OCCUPANCY */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Current Occupancy</label>
              <input type="number" value={form.current_occupancy} onChange={set('current_occupancy')}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" 
                min="0" />
            </div>
          </>
        )}

        {/* ===== NON-RESIDENTIAL MESSAGE ===== */}
        {!isResidential && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              <span className="text-yellow-400">ℹ️</span> This is a non-residential room. 
              It will be used for pathfinding and navigation only. 
              Students cannot book this room.
            </p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditRoom;