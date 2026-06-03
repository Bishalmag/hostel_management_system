import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const RegisteredComplaints = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUserComplaints();
  }, [user]);

  const fetchUserComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct endpoint - matches your urls.py configuration
      const response = await api.get('/complaints/');
      console.log('API Response:', response.data);
      
      const allComplaints = response.data.results || response.data;
      
      // The backend already filters by user, but we'll filter again to be safe
      const userComplaints = allComplaints.filter(c => c.user === user?.id);
      setComplaints(userComplaints);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      
      if (err.response?.status === 401) {
        setError('Please login again to view complaints.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check if the backend server is running.');
      } else {
        setError('Failed to load complaints. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'registered':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'in_progress':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'resolved':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'rejected':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'registered':
        return '⏳';
      case 'in_progress':
        return '🔧';
      case 'resolved':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getFilteredComplaints = () => {
    if (filter === 'all') return complaints;
    return complaints.filter(c => c.status === filter);
  };

  const filteredComplaints = getFilteredComplaints();
  const stats = {
    total: complaints.length,
    registered: complaints.filter(c => c.status === 'registered').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          Loading your complaints...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchUserComplaints}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/students/complaints/new')}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition"
            >
              Register Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-xl">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Registered Complaints</h1>
            <p className="text-gray-400 mt-1">Track and monitor your complaint status</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/students/complaints/new')}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Complaint
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="text-2xl">📋</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Registered</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.registered}</p>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">{stats.in_progress}</p>
            </div>
            <div className="text-2xl">🔧</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            </div>
            <div className="text-2xl">❌</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium transition ${
            filter === 'all'
              ? 'text-red-400 border-b-2 border-red-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          All Complaints
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-500/20 rounded-full">{stats.total}</span>
        </button>
        <button
          onClick={() => setFilter('registered')}
          className={`px-4 py-2 text-sm font-medium transition ${
            filter === 'registered'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Registered
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-500/20 rounded-full">{stats.registered}</span>
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 text-sm font-medium transition ${
            filter === 'in_progress'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          In Progress
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 rounded-full">{stats.in_progress}</span>
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 text-sm font-medium transition ${
            filter === 'resolved'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Resolved
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-500/20 rounded-full">{stats.resolved}</span>
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 text-sm font-medium transition ${
            filter === 'rejected'
              ? 'text-red-400 border-b-2 border-red-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Rejected
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500/20 rounded-full">{stats.rejected}</span>
        </button>
      </div>

      {/* Complaints Table */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Complaints Found</h3>
          <p className="text-gray-400 mb-6">
            {filter === 'all' 
              ? "You haven't registered any complaints yet." 
              : `You don't have any ${filter.replace('_', ' ')} complaints.`}
          </p>
          {(filter === 'all' || filter === 'registered') && (
            <button
              onClick={() => navigate('/students/complaints/new')}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
            >
              Register a Complaint
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted On</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Last Updated</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">#{complaint.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{complaint.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm max-w-md line-clamp-2">{complaint.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusColor(complaint.status)}`}>
                        <span>{getStatusIcon(complaint.status)}</span>
                        <span className="capitalize">{complaint.status?.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">{formatDate(complaint.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">{formatDate(complaint.updated_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-400 text-sm font-medium rounded-lg transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Complaint Details</h2>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Complaint ID</label>
                  <p className="text-white font-mono">#{selectedComplaint.id}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Title</label>
                  <p className="text-white font-medium">{selectedComplaint.title}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Description</label>
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Status</label>
                    <span className={`mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedComplaint.status)}`}>
                      <span>{getStatusIcon(selectedComplaint.status)}</span>
                      <span className="capitalize">{selectedComplaint.status?.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Submitted</label>
                    <p className="text-gray-300">{formatDate(selectedComplaint.created_at)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Last Updated</label>
                  <p className="text-gray-300">{formatDate(selectedComplaint.updated_at)}</p>
                </div>

                {selectedComplaint.status === 'resolved' && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-green-400 text-sm">Your complaint has been resolved. Thank you for your patience.</p>
                    </div>
                  </div>
                )}

                {selectedComplaint.status === 'rejected' && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-400 text-sm">Your complaint has been rejected. Please contact support for more information.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition"
                >
                  Close
                </button>
                {selectedComplaint.status === 'registered' && (
                  <button
                    onClick={() => {
                      setSelectedComplaint(null);
                      navigate('/students/complaints/new');
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
                  >
                    Report Another Issue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredComplaints;