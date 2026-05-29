import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel,  setHostel]  = useState(null);
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ room: '', check_in_date: '', check_out_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    Promise.all([
      api.get(`/hostel/hostels/${id}/`),
      api.get(`/hostel/rooms/?floor__block__hostel=${id}`),
    ]).then(([hRes, rRes]) => {
      setHostel(hRes.data);
      setRooms(rRes.data.results ?? rRes.data);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/bookings/bookings/', { ...booking });
      setMessage({ type: 'success', text: 'Booking submitted! Awaiting approval.' });
      setTimeout(() => navigate('/students/homepage'), 2000);
    } catch (err) {
      const msg = Object.values(err.response?.data ?? {}).flat().join(', ');
      setMessage({ type: 'error', text: msg || 'Booking failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-600">
      <svg className="w-6 h-6 animate-spin text-cyan-500 mr-3" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Loading...
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate('/students/book-hostels')}
        className="text-sm text-gray-500 hover:text-cyan-400 transition flex items-center gap-2">
        ← Back to Hostels
      </button>

      {/* Hostel info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white">{hostel?.name}</h1>
        <p className="text-gray-500 text-sm mt-1">📍 {hostel?.address}</p>
      </div>

      {/* Rooms */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Available Rooms</h2>
        {rooms.length === 0 ? (
          <p className="text-gray-600 text-sm">No rooms found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => (
              <div key={room.id}
                onClick={() => setBooking(b => ({ ...b, room: room.id }))}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  booking.room === room.id
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold">Room {room.room_number}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    room.current_occupancy < room.capacity
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {room.current_occupancy < room.capacity ? 'Available' : 'Full'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Type: {room.room_type}</p>
                <p className="text-xs text-gray-500">Occupancy: {room.current_occupancy}/{room.capacity}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking form */}
      {booking.room && (
        <div className="bg-gray-900 border border-cyan-500/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Book Room</h2>

          {message.text && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleBook} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Check-in Date</label>
                <input type="date" value={booking.check_in_date}
                  onChange={e => setBooking(b => ({ ...b, check_in_date: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  required />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Check-out Date</label>
                <input type="date" value={booking.check_out_date}
                  onChange={e => setBooking(b => ({ ...b, check_out_date: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  required />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-lg transition disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoomDetails;