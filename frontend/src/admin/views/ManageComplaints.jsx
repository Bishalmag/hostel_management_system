import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ManageComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('all');

  useEffect(() => {
    api.get('/discipline/complaints/')
      .then(res => setComplaints(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/discipline/complaints/${id}/`, { status });
      setComplaints(c => c.map(x => x.id === id ? {...x, status} : x));
    } catch { alert('Failed.'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Manage Complaints</h1>

      <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1 w-fit">
        {['all','pending','resolved','rejected'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 text-xs rounded-md font-medium capitalize transition-all ${
              filter === tab ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? <div className="text-gray-500 text-center py-10">Loading...</div> : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono">#{c.id}</span>
                    <span className="text-xs text-gray-500">Student: {c.student}</span>
                  </div>
                  <p className="text-sm text-gray-200">{c.description}</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    c.status === 'resolved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    c.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>{c.status}</span>
                  {c.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(c.id, 'resolved')}
                        className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30">
                        Resolve
                      </button>
                      <button onClick={() => updateStatus(c.id, 'rejected')}
                        className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-gray-600 text-center py-10">No complaints.</p>}
        </div>
      )}
    </div>
  );
};

export default ManageComplaints;