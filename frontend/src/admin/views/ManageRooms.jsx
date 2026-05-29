import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ManageRooms = () => {
  const navigate = useNavigate();
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const fetchRooms = () => {
    api.get('/hostel/rooms/')
      .then(res => setRooms(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this room?')) return;
    try { await api.delete(`/hostel/rooms/${id}/`); fetchRooms(); }
    catch { alert('Failed.'); }
  };

  const filtered = rooms.filter(r =>
    r.room_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Rooms</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin/rooms/add')}
            className="px-4 py-2 text-sm bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition">
            + Add Room
          </button>
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by room number..."
        className="w-full max-w-sm px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500" />

      {loading ? <div className="text-gray-500 text-center py-10">Loading...</div> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Room No</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Capacity</th>
                <th className="px-5 py-3 text-left">Occupancy</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(room => (
                <tr key={room.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3 font-mono text-white">Room {room.room_number}</td>
                  <td className="px-5 py-3 text-gray-400 capitalize">{room.room_type}</td>
                  <td className="px-5 py-3 text-gray-400">{room.capacity}</td>
                  <td className="px-5 py-3 text-gray-400">{room.current_occupancy}/{room.capacity}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      room.current_occupancy < room.capacity
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {room.current_occupancy < room.capacity ? 'Available' : 'Full'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}
                        className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(room.id)}
                        className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded border border-red-500/30">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-600">No rooms found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;