import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    api.get('/notifications/')
      .then(res => {
        const all = res.data.results ?? res.data;
        setFeedbacks(all.filter(n => n.message?.startsWith('[FEEDBACK')));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Feedbacks</h1>

      {loading ? <div className="text-gray-500 text-center py-10">Loading...</div> : (
        <div className="space-y-3">
          {feedbacks.length === 0 ? (
            <p className="text-gray-600 text-center py-10">No feedbacks yet.</p>
          ) : feedbacks.map(f => (
            <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm text-gray-200">{f.message}</p>
              <p className="text-xs text-gray-600 mt-2">{new Date(f.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageFeedbacks;