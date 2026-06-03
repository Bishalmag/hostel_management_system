import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const Profile = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/students/');
        const all = response.data.results ?? response.data;
        const me = all.find(s => s.user === user?.id);
        if (me) {
          setStudent(me);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header with Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
          {user?.full_name?.charAt(0) ?? 'S'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user?.full_name}</h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <p className="text-gray-500 text-xs mt-1">Student ID: {student?.id || 'N/A'}</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">First Name</label>
              <p className="text-white text-sm">{user?.full_name?.split(' ')[0] || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Middle Name</label>
              <p className="text-white text-sm">{student?.middle_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Last Name</label>
              <p className="text-white text-sm">{user?.full_name?.split(' ').slice(-1)[0] || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</label>
              <p className="text-white text-sm capitalize">{student?.gender || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Email</label>
              <p className="text-white text-sm">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</label>
              <p className="text-white text-sm">{student?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Emergency Contact
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Guardian Name</label>
              <p className="text-white text-sm">{student?.guardian_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Relation</label>
              <p className="text-white text-sm">{student?.guardian_relation || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Contact Number</label>
              <p className="text-white text-sm">{student?.guardian_contact || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Temporary Address */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Temporary Address
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Address</label>
              <p className="text-white text-sm">{student?.temp_address || 'Not provided'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">City</label>
                <p className="text-white text-sm">{student?.temp_city || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">State</label>
                <p className="text-white text-sm">{student?.temp_state || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Pincode</label>
                <p className="text-white text-sm">{student?.temp_pincode || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Permanent Address
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Address</label>
              <p className="text-white text-sm">{student?.perm_address || 'Not provided'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">City</label>
                <p className="text-white text-sm">{student?.perm_city || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">State</label>
                <p className="text-white text-sm">{student?.perm_state || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Pincode</label>
                <p className="text-white text-sm">{student?.perm_pincode || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="bg-gray-800/30 rounded-lg p-4 text-center">
        <p className="text-xs text-gray-500">
          Profile last updated: {student?.updated_at ? new Date(student.updated_at).toLocaleDateString() : 'Never'}
        </p>
      </div>
    </div>
  );
};

export default Profile;