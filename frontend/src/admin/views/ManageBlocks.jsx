import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const ManageBlocks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hostelId = searchParams.get('hostel');

  const [blocks,  setBlocks]  = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      api.get('/hostel/blocks/'),
      api.get('/hostel/hostels/'),
    ]).then(([b, h]) => {
      setBlocks(b.data.results ?? b.data);
      setHostels(h.data.results ?? h.data);
    }).catch(() => {})
    .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = hostelId ? blocks.filter(b => b.hostel === parseInt(hostelId)) : blocks;

  const handleDelete = async (id) => {
    if (!confirm('Delete this block?')) return;
    try { 
      await api.delete(`/hostel/blocks/${id}/`); 
      fetchData(); 
    } catch { 
      alert('Failed to delete block.'); 
    }
  };

  const handleEdit = (id) => {
    console.log('Navigating to edit block:', id);
    navigate(`/admin/blocks/edit/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Blocks & Floors</h1>
        <button onClick={() => navigate('/admin/blocks/add')}
          className="px-4 py-2 text-sm bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition">
          + Add Block
        </button>
      </div>

      {loading ? <div className="text-gray-500 text-center py-10">Loading...</div> : (
        <div className="space-y-3">
          {filtered.map(block => (
            <div key={block.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{block.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Hostel: {hostels.find(h => h.id === block.hostel)?.name ?? block.hostel}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(block.id)}
                    className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(block.id)}
                    className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-gray-600 text-center py-10">No blocks found.</p>}
        </div>
      )}
    </div>
  );
};

export default ManageBlocks;