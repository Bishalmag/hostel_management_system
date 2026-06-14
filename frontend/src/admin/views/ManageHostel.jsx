import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ManageHostel = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHostels = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/hostel/hostels/');
      setHostels(res.data.results ?? res.data);
    } catch (err) {
      setError('Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this hostel?');
    if (!ok) return;

    try {
      await api.delete(`/hostel/hostels/${id}/`);
      fetchHostels(); // refresh list
    } catch {
      alert('Failed to delete hostel');
    }
  };

  if (loading) {
    return (
      <div className="text-gray-400 p-6">Loading hostels...</div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Hostels</h1>

        {/* <button
          onClick={() => navigate('/admin/hostels/add')}
          className="px-4 py-2 text-sm bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition"
        >
          + Add Hostel
        </button> */}
      </div>

      {/* ERROR */}
      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-gray-800 text-gray-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {hostels.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No hostels found
                </td>
              </tr>
            ) : (
              hostels.map(h => (
                <tr key={h.id} className="border-t border-gray-800">
                  <td className="px-4 py-3">{h.id}</td>
                  <td className="px-4 py-3">{h.name}</td>
                  <td className="px-4 py-3">{h.address}</td>

                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => navigate(`/admin/hostels/edit/${h.id}`)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(h.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageHostel;