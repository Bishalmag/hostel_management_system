import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      // Use the correct endpoint - '/feedback/' not '/notifications/'
      const response = await api.get('/feedback/');
      const allFeedbacks = response.data.results ?? response.data;
      setFeedbacks(allFeedbacks);
      
      // Calculate stats
      const total = allFeedbacks.length;
      const totalRating = allFeedbacks.reduce((sum, f) => sum + f.rating, 0);
      const averageRating = total > 0 ? (totalRating / total).toFixed(1) : 0;
      
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allFeedbacks.forEach(f => {
        distribution[f.rating] = (distribution[f.rating] || 0) + 1;
      });
      
      setStats({ total, averageRating, distribution });
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const getFilteredFeedbacks = () => {
    if (filter === 'all') return feedbacks;
    return feedbacks.filter(f => f.rating === parseInt(filter));
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    };
    return labels[rating];
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredFeedbacks = getFilteredFeedbacks();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Manage Feedbacks</h1>
          <button
            onClick={fetchFeedbacks}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition"
          >
            Refresh
          </button>
        </div>
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          Loading feedbacks...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Manage Feedbacks</h1>
        <button
          onClick={fetchFeedbacks}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Total Feedbacks</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="text-3xl">💬</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Average Rating</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.averageRating}</p>
            </div>
            <div className="text-2xl text-yellow-400">★</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Response Rate</p>
              <p className="text-3xl font-bold text-green-400">
                {feedbacks.length > 0 ? Math.round((feedbacks.length / (feedbacks.length + 10)) * 100) : 0}%
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {feedbacks.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Rating Distribution</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-400">{getRatingLabel(rating)}</div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.distribution[rating] / feedbacks.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-400">{stats.distribution[rating]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium transition ${
            filter === 'all'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          All Feedbacks
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-500/20 rounded-full">{feedbacks.length}</span>
        </button>
        {[5, 4, 3, 2, 1].map(rating => (
          <button
            key={rating}
            onClick={() => setFilter(rating.toString())}
            className={`px-4 py-2 text-sm font-medium transition ${
              filter === rating.toString()
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {renderStars(rating)}
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-500/20 rounded-full">{stats.distribution[rating]}</span>
          </button>
        ))}
      </div>

      {/* Feedbacks Table */}
      {filteredFeedbacks.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Feedbacks Found</h3>
          <p className="text-gray-400">
            {filter === 'all' 
              ? "No feedbacks have been submitted yet." 
              : `No ${getRatingLabel(parseInt(filter)).toLowerCase()} ratings found.`}
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-4 text-left">ID</th>
                  <th className="px-5 py-4 text-left">Student</th>
                  <th className="px-5 py-4 text-left">Rating</th>
                  <th className="px-5 py-4 text-left">Comment</th>
                  <th className="px-5 py-4 text-left">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredFeedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-800/30 transition">
                    <td className="px-5 py-4">
                      <p className="text-gray-400 text-xs font-mono">#{feedback.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-white text-sm">{feedback.user_name || `User ${feedback.user}`}</p>
                        <p className="text-gray-500 text-xs">{feedback.user_email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-sm">{renderStars(feedback.rating)}</span>
                        <span className="text-gray-400 text-xs">({feedback.rating}/5)</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-300 text-sm max-w-md">
                        {feedback.comment || <span className="text-gray-500 italic">No comment provided</span>}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-300 text-xs">{formatDate(feedback.created_at)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFeedbacks;