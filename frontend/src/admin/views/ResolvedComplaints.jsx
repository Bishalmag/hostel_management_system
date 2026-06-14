import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ResolvedComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all complaints
      const complaintsRes = await api.get('/complaints/');
      const allComplaints = complaintsRes.data.results ?? complaintsRes.data;
      
      // Filter only resolved complaints (resolved and rejected)
      const resolvedComplaints = allComplaints.filter(c => 
        c.status === 'resolved' || c.status === 'rejected'
      );
      
      // Fetch all students to get user names
      const studentsRes = await api.get('/students/');
      const allStudents = studentsRes.data.results ?? studentsRes.data;
      
      // Create a map of user_id -> student details
      const studentMap = {};
      allStudents.forEach(student => {
        studentMap[student.user] = {
          name: student.user_name || student.user?.full_name || `Student ${student.user}`,
          id: student.id
        };
      });
      
      // Add student names to complaints
      const complaintsWithNames = resolvedComplaints.map(complaint => ({
        ...complaint,
        student_name: studentMap[complaint.user]?.name || `Student ${complaint.user}`,
        student_id: studentMap[complaint.user]?.id
      }));
      
      setComplaints(complaintsWithNames);
      setStudents(studentMap);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    
    setProcessing(id);
    try {
      await api.delete(`/complaints/${id}/`);
      await fetchData();
    } catch (err) {
      console.error('Error deleting complaint:', err);
      alert('Failed to delete complaint.');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusIcon = (status) => {
    return status === 'resolved' ? '✅' : '❌';
  };

  const stats = {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Resolved Complaints</h1>
        </div>
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          Loading complaints...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Resolved Complaints</h1>
          <p className="text-gray-400 text-sm mt-1">Complaints that have been completed</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Total Completed</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Resolved</p>
          <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Rejected</p>
          <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Complaints Table */}
      {complaints.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Resolved Complaints</h3>
          <p className="text-gray-400">Resolved complaints will appear here once processed.</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-4 text-left">ID</th>
                  <th className="px-5 py-4 text-left">Student Name</th>
                  <th className="px-5 py-4 text-left">Title</th>
                  <th className="px-5 py-4 text-left">Description</th>
                  <th className="px-5 py-4 text-left">Submitted</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-left">Resolved On</th>
                  <th className="px-5 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-800/30 transition">
                    <td className="px-5 py-4">
                      <p className="text-gray-400 text-xs font-mono">#{complaint.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-white text-sm font-medium">{complaint.student_name}</p>
                        <p className="text-gray-500 text-xs">ID: {complaint.user}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">{complaint.title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-300 text-sm max-w-md line-clamp-2">{complaint.description}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-300 text-xs">{formatDate(complaint.created_at)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusBadge(complaint.status)}`}>
                        <span>{getStatusIcon(complaint.status)}</span>
                        <span className="capitalize">{complaint.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-300 text-xs">{formatDate(complaint.updated_at)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {/* View Details Button */}
                        <button
                          onClick={() => {
                            alert(`Complaint #${complaint.id}\nStudent: ${complaint.student_name}\nTitle: ${complaint.title}\nStatus: ${complaint.status}\n\nDescription:\n${complaint.description}`);
                          }}
                          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded transition flex items-center gap-1"
                          title="View Details"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(complaint.id)}
                          disabled={processing === complaint.id}
                          className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded transition disabled:opacity-50 flex items-center gap-1"
                          title="Delete Complaint"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
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

export default ResolvedComplaints;