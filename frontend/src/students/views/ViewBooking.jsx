// src/students/views/ViewBooking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';
import { useNotification } from '../../context/NotificationContext';

const ViewBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get booking details
      const bookingRes = await api.get(`/bookings/bookings/${bookingId}/`);
      const bookingData = bookingRes.data;
      
      // Get room details
      const roomRes = await api.get(`/hostel/rooms/${bookingData.room}/`);
      const room = roomRes.data;
      
      // Get floor details
      const floorRes = await api.get(`/hostel/floors/${room.floor}/`);
      const floor = floorRes.data;
      
      // Get block details
      const blockRes = await api.get(`/hostel/blocks/${floor.block}/`);
      const block = blockRes.data;
      
      // Get hostel details
      const hostelRes = await api.get(`/hostel/hostels/${block.hostel}/`);
      const hostel = hostelRes.data;
      
      // Get payment details
      let payment = null;
      try {
        const paymentRes = await api.get(`/bookings/payments/?booking=${bookingId}`);
        const payments = paymentRes.data.results || paymentRes.data;
        payment = payments.length > 0 ? payments[0] : null;
      } catch (e) {
        console.log('No payment found for this booking');
      }
      
      setBooking({
        ...bookingData,
        room_number: room.room_number,
        room_type: room.room_type,
        floor_number: floor.floor_number,
        block_name: block.name,
        hostel_name: hostel.name,
        hostel_address: hostel.address,
        capacity: room.capacity,
        current_occupancy: room.current_occupancy,
        payment: payment,
      });
      
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      await api.patch(`/bookings/bookings/${bookingId}/`, {
        status: 'cancelled'
      });
      
      // Update local state
      setBooking(prev => ({
        ...prev,
        status: 'cancelled'
      }));
      
      showSuccess('Booking cancelled successfully!', 'Cancelled');
      setShowCancelModal(false);
      
      // Refresh booking details
      await fetchBookingDetails();
      
    } catch (err) {
      console.error('Error cancelling booking:', err);
      showError(err.response?.data?.message || 'Failed to cancel booking.', 'Error');
    } finally {
      setCancelling(false);
    }
  };

  const handlePayment = () => {
    navigate(`/students/pay/${bookingId}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'cancelled': return '🚫';
      default: return '📋';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getDaysRemaining = () => {
    if (!booking) return 0;
    const today = new Date();
    const checkOut = new Date(booking.check_out_date);
    const diffTime = checkOut - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStayDuration = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const diffTime = checkOut - checkIn;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error || 'Booking not found'}</p>
          <button
            onClick={() => navigate('/students/my-bookings')}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const isActive = booking.status === 'approved' && new Date(booking.check_out_date) >= new Date();
  const isPending = booking.status === 'pending';
  const isPast = new Date(booking.check_out_date) < new Date();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/students/my-bookings')}
        className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm"
      >
        ← Back to My Bookings
      </button>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Booking Details</h1>
          <p className="text-gray-400 mt-1">Booking #{booking.id}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(booking.status)}`}>
          {getStatusIcon(booking.status)}
          <span className="capitalize">{booking.status}</span>
        </span>
      </div>

      {/* Booking Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Hostel</p>
          <p className="text-white font-semibold mt-1">{booking.hostel_name}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Room</p>
          <p className="text-white font-semibold mt-1">Room {booking.room_number}</p>
          <p className="text-gray-500 text-xs">Block: {booking.block_name}</p>
          <p className="text-gray-500 text-xs">Floor: {booking.floor_number}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Stay Duration</p>
          <p className="text-white font-semibold mt-1">{getStayDuration()} days</p>
          <p className="text-gray-500 text-xs">Check-in: {formatDate(booking.check_in_date)}</p>
          <p className="text-gray-500 text-xs">Check-out: {formatDate(booking.check_out_date)}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Amount</p>
          <p className="text-cyan-400 font-bold text-2xl mt-1">{formatPrice(booking.total_amount)}</p>
          {isActive && (
            <p className="text-yellow-400 text-xs mt-1">{getDaysRemaining()} days remaining</p>
          )}
        </div>
      </div>

      {/* Room Details */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <span className="text-xl">🏠</span> Room Details
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Room Number</p>
              <p className="text-white text-lg font-semibold">Room {booking.room_number}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Room Type</p>
              <p className="text-white capitalize">{booking.room_type}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Block / Floor</p>
              <p className="text-white">{booking.block_name} / Floor {booking.floor_number}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Capacity</p>
              <p className="text-white">{booking.capacity} persons</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Current Occupancy</p>
              <p className="text-white">{booking.current_occupancy} occupants</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Hostel Address</p>
              <p className="text-white text-sm">{booking.hostel_address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      {booking.payment && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="text-xl">💰</span> Payment Details
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Amount</p>
                <p className="text-white text-lg font-semibold">{formatPrice(booking.payment.amount)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-block ${getStatusColor(booking.payment.paid_status)}`}>
                  {booking.payment.paid_status}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Paid On</p>
                <p className="text-white">{booking.payment.paid_at ? formatDate(booking.payment.paid_at) : 'Not paid yet'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {isPending && (
          <button
            onClick={handlePayment}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition shadow-lg shadow-green-500/25 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pay Now
          </button>
        )}
        
        {isActive && (
          <button
            onClick={() => navigate(`/students/pay-rent`)}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition"
          >
            Pay Rent
          </button>
        )}
        
        {(isPending || isActive) && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={cancelling}
            className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition disabled:opacity-50"
          >
            Cancel Booking
          </button>
        )}
        
        <button
          onClick={() => navigate('/students/my-bookings')}
          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition"
        >
          View All Bookings
        </button>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Cancel Booking?</h2>
            <p className="text-gray-400 mb-2">
              Are you sure you want to cancel your booking at <span className="text-white">{booking.hostel_name}</span>?
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Room {booking.room_number} • {formatDate(booking.check_in_date)} to {formatDate(booking.check_out_date)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBooking;