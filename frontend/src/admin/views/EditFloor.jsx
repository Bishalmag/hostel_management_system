// admin/views/EditFloor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const EditFloor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ block: '', floor_number: '', description: '' });
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch blocks list
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await api.get('/hostel/blocks/');
        const data = response.data.results || response.data || [];
        const blocksList = Array.isArray(data) ? data : [];
        setBlocks(blocksList);
        
        // If only one block exists, auto-select it
        if (blocksList.length === 1 && form.block === '') {
          setForm(f => ({ ...f, block: blocksList[0].id }));
        }
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    };
    fetchBlocks();
  }, []);

  // Fetch floor details
  useEffect(() => {
    const fetchFloor = async () => {
      if (!id) {
        setMessage({ type: 'error', text: 'No floor ID provided.' });
        setFetching(false);
        return;
      }

      try {
        console.log(`Fetching floor ${id}...`);
        const response = await api.get(`/hostel/floors/${id}/`);
        console.log('Floor data:', response.data);
        
        setForm({
          block: response.data.block || '',
          floor_number: response.data.floor_number || '',
          description: response.data.description || ''
        });
        setFetching(false);
      } catch (error) {
        console.error('Error fetching floor:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.status === 404 ? 'Floor not found.' : 'Failed to load floor details.'
        });
        setFetching(false);
      }
    };

    fetchFloor();
  }, [id]);

  // Auto-select block if only one exists after floor data is loaded
  useEffect(() => {
    if (!fetching && blocks.length === 1 && !form.block) {
      setForm(f => ({ ...f, block: blocks[0].id }));
    }
  }, [fetching, blocks, form.block]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      console.log('Updating floor:', form);
      await api.put(`/hostel/floors/${id}/`, {
        block: form.block,
        floor_number: form.floor_number,
        description: form.description
      });
      setMessage({ type: 'success', text: 'Floor updated successfully!' });
      setTimeout(() => navigate('/admin/floors'), 1500);
    } catch (error) {
      console.error('Error updating floor:', error);
      let errorMessage = 'Failed to update floor.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).flat().join(', ');
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this floor?')) return;
    
    try {
      await api.delete(`/hostel/floors/${id}/`);
      navigate('/admin/floors');
    } catch (error) {
      console.error('Error deleting floor:', error);
      setMessage({ type: 'error', text: 'Failed to delete floor.' });
    }
  };

  if (fetching) {
    return (
      <div className="max-w-lg space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-gray-400">Loading floor details...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <button 
          onClick={() => navigate('/admin/floors')}
          className="text-sm text-gray-500 hover:text-purple-400 mb-3 transition-colors"
        >
          ← Back to Floors
        </button>
        <h1 className="text-2xl font-bold text-white">Edit Floor</h1>
        <p className="text-xs text-gray-500 mt-1">Floor ID: {id}</p>
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

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
            Block *
          </label>
          <select 
            value={form.block} 
            onChange={e => setForm(f => ({...f, block: e.target.value}))}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            required
            disabled={blocks.length === 1}
          >
            <option value="">Select block</option>
            {blocks.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {blocks.length === 1 && (
            <p className="text-xs text-gray-500 mt-1">
              Auto-selected: {blocks[0]?.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
            Floor Number *
          </label>
          <input 
            type="number" 
            value={form.floor_number} 
            onChange={e => setForm(f => ({...f, floor_number: e.target.value}))}
            placeholder="e.g. 1, 2, 3"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            required 
            min="0"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
            Description (Optional)
          </label>
          <input 
            type="text" 
            value={form.description || ''} 
            onChange={e => setForm(f => ({...f, description: e.target.value}))}
            placeholder="e.g. Ground Floor, First Floor"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Floor'}
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/admin/floors')}
            className="py-2.5 px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm rounded-lg transition"
          >
            Cancel
          </button>
        </div>

        <div className="pt-2 border-t border-gray-800">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
          >
            Delete Floor
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditFloor;