import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const EditBlock = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ hostel: '', name: '' });
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch hostels
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await api.get('/hostel/hostels/');
        const hostelData = res.data.results ?? res.data;
        setHostels(Array.isArray(hostelData) ? hostelData : []);
      } catch (error) {
        console.error('Error fetching hostels:', error);
      }
    };
    fetchHostels();
  }, []);

  // Fetch block details
  useEffect(() => {
    const fetchBlock = async () => {
      if (!id) {
        setMessage({ type: 'error', text: 'No block ID provided.' });
        setFetching(false);
        return;
      }

      try {
        const response = await api.get(`/hostel/blocks/${id}/`);
        setForm({
          hostel: response.data.hostel || '',
          name: response.data.name || ''
        });
        setFetching(false);
      } catch (error) {
        console.error('Error fetching block:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.status === 404 ? 'Block not found.' : 'Failed to load block details.'
        });
        setFetching(false);
      }
    };

    fetchBlock();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.put(`/hostel/blocks/${id}/`, form);
      setMessage({ type: 'success', text: 'Block updated successfully!' });
      setTimeout(() => navigate('/admin/blocks'), 1500);
    } catch (error) {
      console.error('Error updating block:', error);
      let errorMessage = 'Failed to update block.';
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
    if (!window.confirm('Are you sure you want to delete this block?')) return;
    
    try {
      await api.delete(`/hostel/blocks/${id}/`);
      navigate('/admin/blocks');
    } catch (error) {
      console.error('Error deleting block:', error);
      setMessage({ type: 'error', text: 'Failed to delete block.' });
    }
  };

  if (fetching) {
    return (
      <div className="max-w-lg space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-gray-400">Loading block details...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <button 
          onClick={() => navigate('/admin/blocks')}
          className="text-sm text-gray-500 hover:text-purple-400 mb-3 transition-colors"
        >
          ← Back to Blocks
        </button>
        <h1 className="text-2xl font-bold text-white">Edit Block</h1>
        <p className="text-xs text-gray-500 mt-1">Block ID: {id}</p>
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
            Hostel *
          </label>
          <select 
            value={form.hostel} 
            onChange={e => setForm(f => ({...f, hostel: e.target.value}))}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            required
            disabled={hostels.length === 1}
          >
            <option value="">Select hostel</option>
            {hostels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          {hostels.length === 1 && (
            <p className="text-xs text-gray-500 mt-1">
              {hostels[0]?.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
            Block Name *
          </label>
          <input 
            type="text" 
            value={form.name} 
            onChange={e => setForm(f => ({...f, name: e.target.value}))}
            placeholder="e.g. Block A"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            required 
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Block'}
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/admin/blocks')}
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
            Delete Block
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlock;