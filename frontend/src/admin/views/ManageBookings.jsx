import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const statusColors = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved:  'bg-green-500/20  text-green-400  border-green-500/30',
  rejected:  'bg-red-500/20    text-red-400    border-red-500/30',
  cancelled: 'bg-gray-500/20   text-gray-400   border-gray-500/30',
};

const ManageBookings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [processing, setProcessing] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/bookings/');
      const allBookings = response.data.results ?? response.data;
      
      // Fetch room details for each booking
      const bookingsWithDetails = await Promise.all(
        allBookings.map(async (booking) => {
          try {
            const roomRes = await api.get(`/hostel/rooms/${booking.room}/`);
            const room = roomRes.data;
            
            const floorRes = await api.get(`/hostel/floors/${room.floor}/`);
            const floor = floorRes.data;
            
            const blockRes = await api.get(`/hostel/blocks/${floor.block}/`);
            const block = blockRes.data;
            
            let studentName = `Student ${booking.student}`;
            try {
              const studentRes = await api.get(`/students/${booking.student}/`);
              studentName = studentRes.data.user_name || studentRes.data.user?.full_name || studentName;
            } catch (e) {
              console.log('Could not fetch student name');
            }
            
            return {
              ...booking,
              room_number: room.room_number,
              room_type: room.room_type,
              floor_number: floor.floor_number,
              block_name: block.name,
              capacity: room.capacity,
              current_occupancy: room.current_occupancy,
              student_name: studentName,
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
      showError('Failed to load bookings', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (processing === bookingId) return;
    
    setProcessing(bookingId);
    console.log(`🔄 Updating booking ${bookingId} to status: ${newStatus}`);
    
    try {
      // Find the booking
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        showError('Booking not found', 'Error');
        setProcessing(null);
        return;
      }

      console.log(`📋 Current booking status: ${booking.status}`);

      // ✅ UPDATE BOOKING STATUS FIRST
      const updateData = { status: newStatus };
      console.log(`📤 Updating booking status to: ${newStatus}`);
      
      const patchResponse = await api.patch(`/bookings/bookings/${bookingId}/`, updateData);
      console.log(`✅ Booking status updated:`, patchResponse.data);

      // ✅ UPDATE ROOM OCCUPANCY
      if (newStatus === 'approved' && booking.status === 'pending') {
        try {
          const roomRes = await api.get(`/hostel/rooms/${booking.room}/`);
          const room = roomRes.data;
          
          // Check if room has available capacity
          if (room.current_occupancy >= room.capacity) {
            showError(`Room ${room.room_number} is fully occupied!`, 'Cannot Approve');
            setProcessing(null);
            return;
          }
          
          await api.patch(`/hostel/rooms/${booking.room}/`, {
            current_occupancy: room.current_occupancy + 1
          });
          console.log(`✅ Room ${room.room_number} occupancy increased`);
        } catch (roomErr) {
          console.error('Error updating room occupancy:', roomErr);
        }
      } 
      else if (newStatus === 'rejected' && booking.status === 'approved') {
        try {
          const roomRes = await api.get(`/hostel/rooms/${booking.room}/`);
          const room = roomRes.data;
          
          await api.patch(`/hostel/rooms/${booking.room}/`, {
            current_occupancy: Math.max(0, room.current_occupancy - 1)
          });
          console.log(`✅ Room ${room.room_number} occupancy decreased`);
        } catch (roomErr) {
          console.error('Error updating room occupancy:', roomErr);
        }
      }

      // ✅ UPDATE LOCAL STATE IMMEDIATELY
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === bookingId 
            ? { ...b, status: newStatus }
            : b
        )
      );

      // Show success message
      if (newStatus === 'approved') {
        showSuccess(`Booking #${bookingId} has been approved`, 'Approved');
      } else if (newStatus === 'rejected') {
        showSuccess(`Booking #${bookingId} has been rejected`, 'Rejected');
      }

      // ✅ REFRESH FROM API TO ENSURE CONSISTENCY
      await fetchBookings();

    } catch (err) {
      console.error('❌ Error updating booking status:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMsg = 'Failed to update booking status. ';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const messages = Object.values(errorData).flat();
          errorMsg += messages.join(', ');
        } else {
          errorMsg += errorData;
        }
      } else {
        errorMsg += 'Please try again.';
      }
      
      showError(errorMsg, 'Update Failed');
      
      // ✅ Revert optimistic update if API call failed
      await fetchBookings();
    } finally {
      setProcessing(null);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate counts for display
  const getCount = (status) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Manage Bookings</h1>
        </div>
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          Loading bookings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Manage Bookings</h1>
        <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1">
          {['all','pending','approved','rejected'].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 text-xs rounded-md font-medium capitalize transition-all ${
                filter === tab ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {tab} ({getCount(tab)})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 border-b border-gray-800">
              <tr className="text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-4 text-left">ID</th>
                <th className="px-5 py-4 text-left">Student</th>
                <th className="px-5 py-4 text-left">Block</th>
                <th className="px-5 py-4 text-left">Room No.</th>
                <th className="px-5 py-4 text-left">Room Type</th>
                <th className="px-5 py-4 text-left">Check-in</th>
                <th className="px-5 py-4 text-left">Check-out</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-800/30 transition">
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{booking.id}</td>
                  <td className="px-5 py-4">
                    <p className="text-white text-sm">{booking.student_name || `Student ${booking.student}`}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-300 text-sm">{booking.block_name || 'N/A'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-white font-medium">{booking.room_number || booking.room}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-300 text-sm capitalize">{booking.room_type || 'Standard'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-300 text-sm">{formatDate(booking.check_in_date)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-300 text-sm">{formatDate(booking.check_out_date)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full border capitalize ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'approved')}
                            disabled={processing === booking.id}
                            className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                            disabled={processing === booking.id}
                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === 'approved' && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approved
                        </span>
                      )}
                      {booking.status === 'rejected' && (
                        <span className="text-xs text-red-400 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rejected
                        </span>
                      )}
                      <button
                        onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && bookings.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-white">{bookings.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {bookings.filter(b => b.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Approved</p>
            <p className="text-2xl font-bold text-green-400">
              {bookings.filter(b => b.status === 'approved').length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Rejected</p>
            <p className="text-2xl font-bold text-red-400">
              {bookings.filter(b => b.status === 'rejected').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;