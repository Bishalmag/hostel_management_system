import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [processingPayment, setProcessingPayment] = useState(null);

  useEffect(() => {
    fetchUserBookings();
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const studentRes = await api.get('/students/');
      const students = studentRes.data.results || studentRes.data;
      const currentStudent = students.find(s => s.user === user?.id);
      
      if (!currentStudent) {
        setBookings([]);
        setLoading(false);
        return;
      }
      
      const bookingsRes = await api.get('/bookings/bookings/');
      const allBookings = bookingsRes.data.results || bookingsRes.data;
      const userBookings = allBookings.filter(b => b.student === currentStudent.id);
      
      const bookingsWithDetails = await Promise.all(
        userBookings.map(async (booking) => {
          try {
            const roomRes = await api.get(`/hostel/rooms/${booking.room}/`);
            const room = roomRes.data;
            const floorRes = await api.get(`/hostel/floors/${room.floor}/`);
            const floor = floorRes.data;
            const blockRes = await api.get(`/hostel/blocks/${floor.block}/`);
            const block = blockRes.data;
            const hostelRes = await api.get(`/hostel/hostels/${block.hostel}/`);
            const hostel = hostelRes.data;
            
            return {
              ...booking,
              room_number: room.room_number,
              room_type: room.room_type,
              floor_number: floor.floor_number,
              block_name: block.name,
              hostel_name: hostel.name,
              hostel_address: hostel.address,
            };
          } catch (err) {
            console.error('Error fetching details for booking:', booking.id, err);
            return booking;
          }
        })
      );
      
      setBookings(bookingsWithDetails);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    setCancelling(true);
    try {
      await api.delete(`/bookings/bookings/${bookingId}/`);
      await fetchUserBookings();
      alert('Booking cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
      setSelectedBooking(null);
    }
  };

  const handlePayment = async (booking) => {
    setProcessingPayment(booking.id);
    try {
      const response = await api.post('/bookings/payments/initiate/', {
        booking_id: booking.id
      });
      
      // Create a temporary div and submit the form to eSewa
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = response.data.form;
      document.body.appendChild(tempDiv);
      const form = tempDiv.querySelector('form');
      if (form) {
        form.submit();
      }
    } catch (err) {
      console.error('Payment initiation failed:', err);
      alert(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
      setProcessingPayment(null);
    }
  };

  const getStatusColor = (status, isPast) => {
    if (isPast) return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'cancelled':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'completed':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysRemaining = (checkOutDate) => {
    const today = new Date();
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getFilteredBookings = () => {
    const today = new Date();
    if (activeTab === 'upcoming') {
      return bookings.filter(b => new Date(b.check_out_date) >= today);
    } else if (activeTab === 'past') {
      return bookings.filter(b => new Date(b.check_out_date) < today);
    }
    return bookings;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          Loading your bookings...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchUserBookings}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Bookings</h1>
        <p className="text-gray-400 mt-1">View and manage your hostel bookings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'upcoming'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Active & Upcoming
          {bookings.filter(b => new Date(b.check_out_date) >= new Date()).length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-cyan-500/20 rounded-full">
              {bookings.filter(b => new Date(b.check_out_date) >= new Date()).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'past'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Past Bookings
          {bookings.filter(b => new Date(b.check_out_date) < new Date()).length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-500/20 rounded-full">
              {bookings.filter(b => new Date(b.check_out_date) < new Date()).length}
            </span>
          )}
        </button>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Bookings Found</h3>
          <p className="text-gray-400 mb-6">
            {activeTab === 'upcoming' 
              ? "You don't have any active or upcoming bookings." 
              : activeTab === 'past' 
              ? "You don't have any past bookings."
              : "You haven't made any hostel bookings yet."}
          </p>
          {(activeTab === 'upcoming' || activeTab === 'all') && (
            <button
              onClick={() => navigate('/students/book-hostels')}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition"
            >
              Browse Hostels
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Hostel</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Room Details</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Check-in</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Check-out</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredBookings.map((booking) => {
                  const isPast = new Date(booking.check_out_date) < new Date();
                  const isPending = booking.status === 'pending';
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-800/30 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{booking.hostel_name}</p>
                          <p className="text-gray-500 text-sm mt-1">{booking.hostel_address}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-gray-300 text-sm">
                            <span className="text-gray-500">Block:</span> {booking.block_name}
                          </p>
                          <p className="text-gray-300 text-sm">
                            <span className="text-gray-500">Floor:</span> {booking.floor_number}
                          </p>
                          <p className="text-gray-300 text-sm">
                            <span className="text-gray-500">Room:</span> {booking.room_number} ({booking.room_type})
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white">{formatDate(booking.check_in_date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white">{formatDate(booking.check_out_date)}</p>
                        {!isPast && (
                          <p className="text-yellow-400 text-xs mt-1">
                            {getDaysRemaining(booking.check_out_date)} days left
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-block ${getStatusColor(booking.status, isPast)}`}>
                          {isPast ? 'Completed' : (booking.status || 'Confirmed')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* ✅ Updated View button */}
                          <button
                            onClick={() => navigate(`/students/booking/${booking.id}`)}
                            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-400 text-sm font-medium rounded-lg transition"
                          >
                            View Details
                          </button>
                          {!isPast && isPending && (
                            <>
                              <button
                                onClick={() => handlePayment(booking)}
                                disabled={processingPayment === booking.id}
                                className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-1"
                              >
                                {processingPayment === booking.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400"></div>
                                    Processing...
                                  </>
                                ) : (
                                  'Pay Now'
                                )}
                              </button>
                              <button
                                onClick={() => setSelectedBooking(booking)}
                                disabled={cancelling}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg transition disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Cancel Booking?</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to cancel your booking at <span className="text-white">{selectedBooking.hostel_name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancelBooking(selectedBooking.id)}
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

export default MyBookings;