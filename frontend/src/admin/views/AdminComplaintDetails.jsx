import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const AdminComplaintDetails = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/complaints/${complaintId}/`);
      const complaintData = response.data;
      
      // Get student details
      let studentName = `Student ${complaintData.user}`;
      try {
        const studentRes = await api.get('/students/');
        const students = studentRes.data.results || studentRes.data;
        const student = students.find(s => s.user === complaintData.user);
        if (student) {
          studentName = student.user_name || student.user?.full_name || studentName;
        }
      } catch (e) {
        console.log('Could not fetch student name');
      }
      
      setComplaint({
        ...complaintData,
        student_name: studentName,
      });
      
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError('Failed to load complaint details');
      showError('Failed to load complaint details', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (processing) return;
    
    setProcessing(true);
    try {
      await api.patch(`/complaints/${complaintId}/`, { status: newStatus });
      
      setComplaint(prev => ({ ...prev, status: newStatus }));
      
      const statusMessages = {
        in_progress: 'started processing',
        resolved: 'resolved',
        rejected: 'rejected'
      };
      
      showSuccess(
        `Complaint #${complaintId} has been ${statusMessages[newStatus] || newStatus}`,
        'Status Updated'
      );
      
      // Refresh to sync with server
      await fetchComplaintDetails();
      
    } catch (err) {
      console.error('Error updating status:', err);
      showError('Failed to update complaint status', 'Error');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      registered: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'registered': return '⏳';
      case 'in_progress': return '🔧';
      case 'resolved': return '✅';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error || 'Complaint not found'}</p>
          <button
            onClick={() => navigate('/admin/complaints')}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg"
          >
            Back to Complaints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/complaints')}
        className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm"
      >
        ← Back to Complaints
      </button>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Complaint Details</h1>
          <p className="text-gray-400 mt-1">Complaint #{complaint.id}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusBadge(complaint.status)}`}>
          {getStatusIcon(complaint.status)}
          <span className="capitalize">{complaint.status?.replace('_', ' ')}</span>
        </span>
      </div>

      {/* Student Info */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <span className="text-xl">👤</span> Student Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Student Name</p>
              <p className="text-white text-lg font-semibold mt-1">{complaint.student_name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Student ID</p>
              <p className="text-white text-lg font-semibold mt-1">#{complaint.user}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Details */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <span className="text-xl">📋</span> Complaint Information
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Title</p>
            <p className="text-white text-lg font-semibold mt-1">{complaint.title}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Description</p>
            <p className="text-gray-300 mt-1 whitespace-pre-wrap">{complaint.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Submitted On</p>
              <p className="text-white mt-1">{formatDate(complaint.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Last Updated</p>
              <p className="text-white mt-1">{formatDate(complaint.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <span className="text-xl">⚡</span> Actions
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {complaint.status === 'registered' && (
              <>
                <button
                  onClick={() => updateStatus('in_progress')}
                  disabled={processing}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition disabled:opacity-50"
                >
                  Start Processing
                </button>
                <button
                  onClick={() => updateStatus('rejected')}
                  disabled={processing}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition disabled:opacity-50"
                >
                  Reject Complaint
                </button>
              </>
            )}
            
            {complaint.status === 'in_progress' && (
              <button
                onClick={() => updateStatus('resolved')}
                disabled={processing}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                Mark as Resolved
              </button>
            )}
            
            {complaint.status === 'resolved' && (
              <span className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg">
                ✅ This complaint has been resolved
              </span>
            )}
            
            {complaint.status === 'rejected' && (
              <span className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg">
                ❌ This complaint has been rejected
              </span>
            )}
            
            <button
              onClick={() => navigate('/admin/complaints')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintDetails;