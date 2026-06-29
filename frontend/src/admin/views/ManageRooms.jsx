// src/admin/pages/ManageRooms.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const ManageRooms = () => {
  const { showSuccess, showError } = useNotification();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, residential, common

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching from URL: /hostel/rooms/');
      const response = await api.get('/hostel/rooms/');
      console.log('Response data:', response.data);
      
      // Handle both array and paginated responses
      let roomsData = response.data;
      if (response.data.results) {
        roomsData = response.data.results;
      }
      
      // Ensure it's an array
      if (!Array.isArray(roomsData)) {
        console.error('Expected array but got:', typeof roomsData);
        roomsData = [];
      }
      
      console.log(`Fetched ${roomsData.length} rooms`);
      setRooms(roomsData);
      
    } catch (err) {
      console.error('Error fetching rooms:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load rooms';
      setError(errorMsg);
      showError(errorMsg, 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/hostel/rooms/${roomId}/`);
      showSuccess('Room deleted successfully!', 'Success');
      fetchRooms(); // Refresh the list
    } catch (err) {
      console.error('Error deleting room:', err);
      showError(err.response?.data?.detail || 'Failed to delete room', 'Error');
    }
  };

  const getFilteredRooms = () => {
    if (filter === 'all') return rooms;
    if (filter === 'residential') {
      return rooms.filter(room => room.room_purpose === 'residential');
    }
    if (filter === 'common') {
      return rooms.filter(room => room.room_purpose !== 'residential');
    }
    return rooms;
  };

  const filteredRooms = getFilteredRooms();
  
  // Statistics
  const stats = {
    total: rooms.length,
    residential: rooms.filter(r => r.room_purpose === 'residential').length,
    common: rooms.filter(r => r.room_purpose !== 'residential').length,
    occupied: rooms.filter(r => r.current_occupancy > 0).length,
    available: rooms.filter(r => r.current_occupancy < r.capacity && r.capacity > 0).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <p className="text-red-400">Error: {error}</p>
        <button
          onClick={fetchRooms}
          className="mt-3 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Rooms</h1>
          <p className="text-gray-400 text-sm mt-1">
            Total: {stats.total} rooms • {stats.residential} residential • {stats.common} common areas
          </p>
        </div>
        <button
          onClick={() => {/* Navigate to add room page */}}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Room
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Total Rooms</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Residential</p>
          <p className="text-2xl font-bold text-blue-400">{stats.residential}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Common Areas</p>
          <p className="text-2xl font-bold text-purple-400">{stats.common}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Occupied</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.occupied}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium transition ${
            filter === 'all'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('residential')}
          className={`px-4 py-2 text-sm font-medium transition ${
            filter === 'residential'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Residential ({stats.residential})
        </button>
        <button
          onClick={() => setFilter('common')}
          className={`px-4 py-2 text-sm font-medium transition ${
            filter === 'common'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Common Areas ({stats.common})
        </button>
      </div>

      {/* Rooms Table */}
      {filteredRooms.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Rooms Found</h3>
          <p className="text-gray-400 text-sm">
            {filter === 'all' 
              ? "No rooms have been added yet." 
              : filter === 'residential'
              ? "No residential rooms found."
              : "No common areas found."}
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-4 text-left">Room</th>
                  <th className="px-5 py-4 text-left">Type</th>
                  <th className="px-5 py-4 text-left">Purpose</th>
                  <th className="px-5 py-4 text-left">Capacity</th>
                  <th className="px-5 py-4 text-left">Occupancy</th>
                  <th className="px-5 py-4 text-left">Price/Month</th>
                  <th className="px-5 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredRooms.map((room) => {
                  const isOccupied = room.current_occupancy > 0;
                  const isFull = room.current_occupancy >= room.capacity;
                  const isResidential = room.room_purpose === 'residential';
                  
                  return (
                    <tr key={room.id} className="hover:bg-gray-800/30 transition">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-white font-medium">Room {room.room_number}</p>
                          <p className="text-gray-500 text-xs">Floor {room.floor_number || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="capitalize text-gray-300">
                          {room.room_type}
                          {room.ac_type && (
                            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded ${
                              room.ac_type === 'ac' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {room.ac_type.toUpperCase()}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          isResidential 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}>
                          {room.room_purpose || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-300">{room.capacity}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-1.5 w-16">
                            <div 
                              className={`h-1.5 rounded-full transition-all ${
                                isFull ? 'bg-red-500' : isOccupied ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(room.current_occupancy / room.capacity) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs ${
                            isFull ? 'text-red-400' : isOccupied ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {room.current_occupancy}/{room.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-cyan-400 font-medium">
                          {room.price_per_month ? `Rs. ${room.price_per_month}` : 'N/A'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {/* Navigate to edit room */}}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;