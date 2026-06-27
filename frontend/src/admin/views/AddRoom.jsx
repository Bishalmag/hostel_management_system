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
    room_type: 'single',
    room_purpose: 'residential',
    ac_type: 'non_ac',
    bathroom_type: 'shared',
    current_occupancy: 0,
    price_per_month: ''
  });

  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check if room is residential
  const isResidential = form.room_purpose === 'residential';

  // Price suggestions based on room type, AC, and bathroom
  const getSuggestedPrice = (roomType, acType, bathroomType) => {
    const prices = {
      single: { non_ac: { shared: 5000, attached: 6000 }, ac: { shared: 8000, attached: 9000 } },
      double: { non_ac: { shared: 8000, attached: 9500 }, ac: { shared: 12000, attached: 13500 } },
      triple: { non_ac: { shared: 10000, attached: 11500 }, ac: { shared: 15000, attached: 16500 } }
    };
    return prices[roomType]?.[acType]?.[bathroomType] || '';
  };

  // Auto-suggest price when room type, AC, or bathroom changes (only for residential)
  useEffect(() => {
    if (isResidential && form.room_type && form.ac_type && form.bathroom_type) {
      const suggestedPrice = getSuggestedPrice(form.room_type, form.ac_type, form.bathroom_type);
      if (suggestedPrice && !form.price_per_month) {
        setForm(f => ({ ...f, price_per_month: suggestedPrice }));
      }
    }
  }, [form.room_type, form.ac_type, form.bathroom_type, isResidential]);

  // Load hostels
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await api.get('/hostel/hostels/');
        const hostelData = res.data.results ?? res.data;
        const hostelsList = Array.isArray(hostelData) ? hostelData : [];
        setHostels(hostelsList);
        
        if (hostelsList.length === 1) {
          setForm(f => ({ ...f, hostel: hostelsList[0].id }));
        }
      } catch (error) {
        console.error('Error fetching hostels:', error);
      }
    };
    fetchHostels();
  }, []);

  // Load all floors initially
  useEffect(() => {
    const fetchAllFloors = async () => {
      try {
        const res = await api.get('/hostel/floors/');
        const floorsData = res.data.results ?? res.data;
        setAllFloors(Array.isArray(floorsData) ? floorsData : []);
      } catch (error) {
        console.error('Error fetching floors:', error);
      }
    };
    fetchAllFloors();
  }, []);

  // Load blocks when hostel changes
  useEffect(() => {
    if (!form.hostel) {
      setBlocks([]);
      setFilteredFloors([]);
      return;
    }

    const fetchBlocks = async () => {
      try {
        const res = await api.get(`/hostel/blocks/?hostel=${form.hostel}`);
        const blocksData = res.data.results ?? res.data;
        setBlocks(Array.isArray(blocksData) ? blocksData : []);
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    };
    fetchBlocks();
  }, [form.hostel]);

  // Filter floors when block changes
  useEffect(() => {
    if (!form.block) {
      setFilteredFloors([]);
      return;
    }

    const filtered = allFloors.filter(floor => floor.block === parseInt(form.block));
    setFilteredFloors(filtered);
    setForm(f => ({ ...f, floor: '' }));
  }, [form.block, allFloors]);

  // Reset non-residential fields when purpose changes
  useEffect(() => {
    if (!isResidential) {
      // Reset residential-specific fields
      setForm(f => ({
        ...f,
        room_type: 'single',
        ac_type: 'non_ac',
        bathroom_type: 'shared',
        capacity: '',
        current_occupancy: 0,
        price_per_month: ''
      }));
    }
  }, [form.room_purpose]);

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

      await api.post('/hostel/rooms/', payload);

      setMessage({
        type: 'success',
        text: 'Room added successfully!'
      });

      setTimeout(() => navigate('/admin/rooms'), 1500);

    } catch (err) {
      console.error('Error adding room:', err);
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

        {/* HOSTEL - Always visible */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            Hostel *
          </label>

          <select
            value={form.hostel}
            onChange={set('hostel')}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            required
            disabled={hostels.length === 1}
          >
            <option value="">Select hostel</option>
            {hostels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          {hostels.length === 1 && (
            <p className="text-xs text-gray-500 mt-1">{hostels[0]?.name}</p>
          )}
        </div>

        {/* BLOCK - Always visible */}
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
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* FLOOR - Always visible */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            Floor *
          </label>

          <select
            value={form.floor}
            onChange={set('floor')}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            required
            disabled={!form.block || filteredFloors.length === 0}
          >
            <option value="">Select floor</option>
            {filteredFloors.map(f => (
              <option key={f.id} value={f.id}>
                Floor {f.floor_number} {f.description ? `- ${f.description}` : ''}
              </option>
            ))}
          </select>
          {form.block && filteredFloors.length === 0 && (
            <p className="text-xs text-yellow-500 mt-1">
              No floors available for this block. Please add a floor first.
            </p>
          )}
        </div>

        {/* ROOM NUMBER - Always visible */}
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

        {/* ROOM PURPOSE - Always visible */}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            Room Purpose *
          </label>

          <select
            value={form.room_purpose}
            onChange={set('room_purpose')}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            required
          >
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
            {/* ROOM NUMBER + CAPACITY */}
            <div className="grid grid-cols-2 gap-4">
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
                  min="1"
                />
              </div>

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
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                </select>
              </div>
            </div>

            {/* AC TYPE */}
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">
                AC Type *
              </label>
              <select
                value={form.ac_type}
                onChange={set('ac_type')}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              >
                <option value="non_ac">Non-AC</option>
                <option value="ac">AC</option>
              </select>
            </div>

            {/* BATHROOM TYPE */}
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">
                Bathroom Type *
              </label>
              <select
                value={form.bathroom_type}
                onChange={set('bathroom_type')}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              >
                <option value="shared">Shared Bathroom</option>
                <option value="attached">Attached Bathroom</option>
              </select>
            </div>

            {/* PRICE */}
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">
                Price per Month (NPR)
              </label>
              <input
                type="number"
                value={form.price_per_month}
                onChange={set('price_per_month')}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                min="0"
              />
              <p className="text-gray-500 text-xs mt-1">
                Suggested price for {form.room_type}, {form.ac_type}, {form.bathroom_type}: 
                Rs. {getSuggestedPrice(form.room_type, form.ac_type, form.bathroom_type) || 'N/A'}
              </p>
            </div>

            {/* CURRENT OCCUPANCY */}
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">
                Current Occupancy
              </label>
              <input
                type="number"
                value={form.current_occupancy}
                onChange={set('current_occupancy')}
                placeholder="0"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                min="0"
              />
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Room'}
        </button>

      </form>
    </div>
  );
};

export default AddRoom;