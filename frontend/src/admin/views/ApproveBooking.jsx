import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const Row = ({ label, value }) => (
  <div className="flex items-start gap-4 py-2.5 border-b border-gray-800 last:border-0">
    <span className="text-xs text-gray-500 uppercase tracking-wide w-36 flex-shrink-0">{label}</span>
    <span className="text-sm text-white">{value ?? '—'}</span>
  </div>
);

const ApproveBooking = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking,    setBooking]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message,    setMessage]    = useState({ type: '', text: '' });

  useEffect(() => {
    api.get(`/bookings/bookings/${id}/`)
      .then(res => setBooking(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    setSubmitting(true);
    try {
      await api.patch(`/bookings/bookings/${id}/`, { status });
      setMessage({ type: 'success', text: `Booking ${status} successfully!` });

      // If approved → create allocation
      if (status === 'approved' && booking) {
        try {
          await api.post('/allocation/allocations/', {
            student: booking.student,
            room:    booking.room,
            status:  'active',
          });
        } catch { /* allocation may already exist */ }
      }

      setTimeout(() => navigate('/admin/registrations'), 1500);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update booking.' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="text-gray-500 text-center py-10">Loading...</div>;
  if (!booking) return <div className="text-gray-500 text-center py-10">Booking not found.</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <button onClick={() => navigate('/admin/registrations')}
          className="text-sm text-gray-500 hover:text-purple-400 mb-3">← Back</button>
        <h1 className="text-2xl font-bold text-white">Booking #{booking.id}</h1>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm border ${
          message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                     : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-1">
        <Row label="Student"    value={booking.student} />
        <Row label="Room"       value={booking.room} />
        <Row label="Check-in"   value={booking.check_in_date} />
        <Row label="Check-out"  value={booking.check_out_date} />
        <Row label="Amount"     value={booking.total_amount ? `₹${booking.total_amount}` : '—'} />
        <Row label="Status"     value={booking.status} />
      </div>

      {booking.status === 'pending' && (
        <div className="flex gap-3">
          <button onClick={() => updateStatus('approved')} disabled={submitting}
            className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50">
            ✅ Approve
          </button>
          <button onClick={() => updateStatus('rejected')} disabled={submitting}
            className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50">
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default ApproveBooking;