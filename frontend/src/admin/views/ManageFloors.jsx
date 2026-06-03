import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ManageFloors = () => {
  const navigate = useNavigate();
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFloors = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/hostel/floors/');
    //   console.log("RAW RESPONSE:", res.data.results); 
      setFloors(res.data.results ?? res.data);
    } catch (err) {
      setError('Failed to load floors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this floor?');
    if (!ok) return;

    try {
      await api.delete(`/hostel/floors/${id}/`);
      fetchFloors(); // refresh list
    } catch {
      alert('Failed to delete floor');
    }
  };

  if (loading) {
    return (
      <div className="text-gray-400 p-6">Loading floors...</div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Floors</h1>

        <button
          onClick={() => navigate('/admin/floors/add')}
          className="px-4 py-2 text-sm bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition"
        >
          + Add Floor
        </button>
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
              <th className="px-4 py-3">Block</th>
              <th className="px-4 py-3">Floor Number</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {floors.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No floors found
                </td>
              </tr>
            ) : (
              floors.map(f => (
                <tr key={f.id} className="border-t border-gray-800">

                  <td className="px-4 py-3">{f.id}</td>
                  
                  <td className="px-4 py-3">
                    {f.block_name || '—'}
                  </td>

                  <td className="px-4 py-3 font-semibold text-white">
                    {f.floor_number}
                  </td>

                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => navigate(`/admin/floors/edit/${f.id}`)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(f.id)}
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

export default ManageFloors;