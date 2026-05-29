import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const statusColors = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved:  'bg-green-500/20  text-green-400  border-green-500/30',
  rejected:  'bg-red-500/20    text-red-400    border-red-500/30',
  cancelled: 'bg-gray-500/20   text-gray-400   border-gray-500/30',
};

const ManageBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  const fetchBookings = () => {
    api.get('/bookings/bookings/')
      .then(res => setBookings(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Manage Bookings</h1>

      <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1 w-fit">
        {['all','pending','approved','rejected'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 text-xs rounded-md font-medium capitalize transition-all ${
              filter === tab ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? <div className="text-gray-500 text-center py-10">Loading...</div> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Student</th>
                <th className="px-5 py-3 text-left">Room</th>
                <th className="px-5 py-3 text-left">Check-in</th>
                <th className="px-5 py-3 text-left">Check-out</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3 text-gray-400 font-mono">#{b.id}</td>
                  <td className="px-5 py-3 text-white">{b.student}</td>
                  <td className="px-5 py-3 text-gray-400">{b.room}</td>
                  <td className="px-5 py-3 text-gray-400">{b.check_in_date}</td>
                  <td className="px-5 py-3 text-gray-400">{b.check_out_date}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border capitalize ${statusColors[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => navigate(`/admin/registrations/${b.id}`)}
                      className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-600">No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;