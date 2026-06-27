import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ManageRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const fetchAllRooms = async () => {
    try {
      setLoading(true);
      let allRooms = [];
      let nextUrl = '/hostel/rooms/';
      let count = 0;

      // Keep fetching until there's no next page
      while (nextUrl) {
        console.log('Fetching from URL:', nextUrl);
        const response = await api.get(nextUrl);
        console.log('Response data:', response.data);
        
        const results = response.data.results || [];
        allRooms = [...allRooms, ...results];
        count = response.data.count || 0;
        nextUrl = response.data.next;
        
        console.log(`Fetched ${results.length} rooms, total so far: ${allRooms.length}`);
      }

      console.log(`Total rooms fetched: ${allRooms.length}`);
      setRooms(allRooms);
      setTotalCount(count);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      // Fallback: try with a different parameter name
      try {
        console.log('Trying alternative approach...');
        const response = await api.get('/hostel/rooms/?limit=1000');
        console.log('Alternative response:', response.data);
        const results = response.data.results || response.data || [];
        setRooms(Array.isArray(results) ? results : []);
        setTotalCount(results.length);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchAllRooms();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this room?')) return;
    try { 
      await api.delete(`/hostel/rooms/${id}/`); 
      // Refresh the list after deletion
      fetchAllRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room.'); 
    }
  };

  // Function to get room status with more details
  const getRoomStatus = (room) => {
    const availableSpots = room.capacity - room.current_occupancy;
    if (availableSpots === 0) {
      return { text: 'Full', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    } else if (availableSpots === room.capacity) {
      return { text: 'Available', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    } else {
      return { text: `Partial (${availableSpots} left)`, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    }
  };

  const filtered = rooms.filter(r =>
    r.room_number?.toString().toLowerCase().includes(search.toLowerCase())
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

      <div className="flex flex-wrap gap-4 items-center">
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by room number..."
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500" 
        />
        
        {/* Show total count */}
        {!loading && (
          <span className="text-gray-400 text-sm">
            Showing {filtered.length} of {totalCount} rooms
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-10">Loading...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-4 text-left">Room No</th>
                  <th className="px-5 py-4 text-left">Type</th>
                  <th className="px-5 py-4 text-left">Capacity</th>
                  <th className="px-5 py-4 text-left">Occupancy</th>
                  <th className="px-5 py-4 text-left">Available Spots</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(room => {
                  const availableSpots = room.capacity - room.current_occupancy;
                  const status = getRoomStatus(room);
                  return (
                    <tr key={room.id} className="hover:bg-gray-800/50 transition">
                      <td className="px-5 py-4 font-mono text-white">Room {room.room_number}</td>
                      <td className="px-5 py-4 text-gray-400 capitalize">{room.room_type}</td>
                      <td className="px-5 py-4 text-gray-400">{room.capacity}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                              style={{ width: `${(room.current_occupancy / room.capacity) * 100}%` }}
                            />
                          </div>
                          <span className="text-gray-400 text-xs">{room.current_occupancy}/{room.capacity}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gray-400">
                          {availableSpots} {availableSpots === 1 ? 'spot' : 'spots'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}
                            className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(room.id)}
                            className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded border border-red-500/30"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                      {rooms.length === 0 ? 'No rooms found in database.' : 'No rooms match your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;