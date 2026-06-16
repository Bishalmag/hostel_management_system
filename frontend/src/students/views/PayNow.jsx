// src/students/views/PayNow.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';
import PayNowButton from '../components/PayNowButton';

const PayNowPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/bookings/${bookingId}/`);
      setBooking(response.data);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error || 'Booking not found'}</p>
          <button
            onClick={() => navigate('/students/my-bookings')}
            className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        onClick={() => navigate('/students/my-bookings')}
        className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm"
      >
        ← Back to Bookings
      </button>

      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
          <h2 className="text-xl font-bold text-white">Payment Details</h2>
          <p className="text-gray-400 text-sm mt-1">Complete your payment to confirm your booking</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Booking Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Room</p>
              <p className="text-white font-bold text-lg mt-1">Room {booking.room_number || booking.room}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Status</p>
              <p className="text-yellow-400 font-bold text-lg mt-1 capitalize">{booking.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Check-in</p>
              <p className="text-white font-semibold mt-1">{formatDate(booking.check_in_date)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Check-out</p>
              <p className="text-white font-semibold mt-1">{formatDate(booking.check_out_date)}</p>
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Total Amount</p>
                <p className="text-cyan-400 font-bold text-3xl">{formatPrice(booking.total_amount)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Payment Method</p>
                <div className="flex items-center gap-2 mt-1">
                  <img 
                    src="https://esewa.com.np/common/images/esewa_logo.png" 
                    alt="eSewa" 
                    className="h-8 w-auto"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <span className="text-white font-medium">eSewa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pay Now Button */}
          <PayNowButton 
            bookingId={booking.id} 
            amount={booking.total_amount}
            className="w-full py-4 text-lg font-bold shadow-xl shadow-green-500/30 hover:shadow-green-500/50"
          />

          <p className="text-gray-500 text-xs text-center">
            You will be redirected to eSewa secure payment gateway to complete the transaction
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayNowPage;