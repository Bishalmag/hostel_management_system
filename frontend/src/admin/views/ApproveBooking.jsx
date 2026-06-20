import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const Row = ({ label, value }) => (
  <div className="flex items-start gap-4 py-2.5 border-b border-gray-800 last:border-0">
    <span className="text-xs text-gray-500 uppercase tracking-wide w-36 flex-shrink-0">{label}</span>
    <span className="text-sm text-white">{value ?? '—'}</span>
  </div>
);

const ApproveBooking = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const [booking, setBooking] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      
      // Get booking details
      const bookingRes = await api.get(`/bookings/bookings/${id}/`);
      const bookingData = bookingRes.data;
      setBooking(bookingData);
      
      // Get room details
      if (bookingData.room) {
        const roomRes = await api.get(`/hostel/rooms/${bookingData.room}/`);
        setRoomDetails(roomRes.data);
      }
      
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setMessage({ type: 'error', text: 'Failed to load booking details.' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    if (submitting) return;
    
    // If approving, check room availability first
    if (status === 'approved' && roomDetails) {
      if (roomDetails.current_occupancy >= roomDetails.capacity) {
        setMessage({ 
          type: 'error', 
          text: `Room ${roomDetails.room_number} is fully occupied! Capacity: ${roomDetails.capacity}/${roomDetails.current_occupancy}` 
        });
        return;
      }
    }
    
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      // 1. Update booking status
      await api.patch(`/bookings/bookings/${id}/`, { status });
      
      // 2. If approved, update room occupancy
      if (status === 'approved' && booking && roomDetails) {
        try {
          await api.patch(`/hostel/rooms/${booking.room}/`, {
            current_occupancy: roomDetails.current_occupancy + 1
          });
          console.log(`✅ Room ${roomDetails.room_number} occupancy increased to ${roomDetails.current_occupancy + 1}`);
        } catch (roomErr) {
          console.error('Error updating room occupancy:', roomErr);
        }
        
        // 3. Create allocation
        try {
          await api.post('/allocation/allocations/', {
            student: booking.student,
            room: booking.room,
            status: 'active',
          });
        } catch (allocationErr) {
          console.error('Allocation creation error:', allocationErr);
          // Don't fail the booking if allocation fails
        }
      }
      
      setMessage({ 
        type: 'success', 
        text: `Booking ${status} successfully!` 
      });
      
      showSuccess(`Booking #${id} has been ${status}`, 'Success');
      
      // Refresh data
      await fetchBookingDetails();
      
      setTimeout(() => {
        navigate('/admin/bookings');
      }, 2000);
      
    } catch (err) {
      console.error('Error updating booking:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update booking.';
      setMessage({ type: 'error', text: errorMsg });
      showError(errorMsg, 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          Loading booking details...
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">Booking not found.</p>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const isRoomFull = roomDetails && roomDetails.current_occupancy >= roomDetails.capacity;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <button onClick={() => navigate('/admin/bookings')}
          className="text-sm text-gray-500 hover:text-purple-400 mb-3 flex items-center gap-1">
          ← Back to Bookings
        </button>
        <h1 className="text-2xl font-bold text-white">Booking #{booking.id}</h1>
        <p className="text-gray-400 text-sm mt-1">Review and manage booking details</p>
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

      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Booking Details</h2>
        <div className="space-y-1">
          <Row label="Student" value={booking.student} />
          <Row label="Room" value={booking.room} />
          <Row label="Room Number" value={roomDetails?.room_number || 'N/A'} />
          <Row label="Check-in" value={booking.check_in_date} />
          <Row label="Check-out" value={booking.check_out_date} />
          <Row label="Amount" value={booking.total_amount ? `₹${booking.total_amount}` : '—'} />
          <Row label="Status" value={booking.status} />
        </div>
      </div>

      {roomDetails && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Room Status</h2>
          <div className="space-y-1">
            <Row label="Room Number" value={roomDetails.room_number} />
            <Row label="Capacity" value={roomDetails.capacity} />
            <Row label="Current Occupancy" value={roomDetails.current_occupancy} />
            <Row label="Available Spots" value={roomDetails.capacity - roomDetails.current_occupancy} />
            <Row 
              label="Status" 
              value={
                isRoomFull ? (
                  <span className="text-red-400 font-medium">FULL</span>
                ) : (
                  <span className="text-green-400 font-medium">AVAILABLE</span>
                )
              } 
            />
          </div>
        </div>
      )}

      {booking.status === 'pending' && (
        <div className="flex gap-3">
          <button 
            onClick={() => updateStatus('approved')} 
            disabled={submitting || isRoomFull}
            className={`flex-1 py-3 font-bold text-sm rounded-lg transition flex items-center justify-center gap-2
              ${isRoomFull 
                ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                : 'bg-green-500 hover:bg-green-400 text-white'
              }`}
            title={isRoomFull ? 'Room is fully occupied' : ''}
          >
            {isRoomFull ? '🔴 Room Full' : '✅ Approve'}
          </button>
          <button 
            onClick={() => updateStatus('rejected')} 
            disabled={submitting}
            className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            ❌ Reject
          </button>
        </div>
      )}

      {booking.status !== 'pending' && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">
            This booking has already been <span className="font-medium text-white">{booking.status}</span>.
            {booking.status === 'approved' && ' ✅'}
            {booking.status === 'rejected' && ' ❌'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ApproveBooking;