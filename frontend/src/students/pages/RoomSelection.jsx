import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const RoomSelection = () => {
  const { hostelId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { hostel, roomType, acType, bathroomType } = location.state || {};

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hostel/rooms/available_rooms/`, {
        params: {
          hostel_id: hostelId,
          room_type: roomType,
          ac_type: acType,
          bathroom_type: bathroomType
        }
      });
      setRooms(response.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedRoom) {
      alert('Please select a room');
      return;
    }
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    setSubmitting(true);
    try {
      // Get student profile
      const studentRes = await api.get('/students/');
      const students = studentRes.data.results || studentRes.data;
      const currentStudent = students.find(s => s.user === user?.id);

      if (!currentStudent) {
        alert('Student profile not found');
        setSubmitting(false);
        return;
      }

      // Calculate total amount
      const days = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
      const selectedRoomData = rooms.find(r => r.id === selectedRoom);
      const totalAmount = selectedRoomData?.price_per_month 
        ? (selectedRoomData.price_per_month / 30) * days 
        : 5000;

      // Create booking
      const bookingResponse = await api.post('/bookings/bookings/', {
        student: currentStudent.id,
        room: selectedRoom,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_amount: totalAmount
      });

      // Navigate to payment
      navigate(`/students/pay/${bookingResponse.data.id}`);
      
    } catch (err) {
      console.error('Booking failed:', err);
      alert(err.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-white">{hostel?.name}</h1>
        <p className="text-gray-400 mt-1">
          {roomType && roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room • 
          {acType === 'ac' ? ' AC' : ' Non-AC'} • 
          {bathroomType === 'attached' ? ' Attached Bathroom' : ' Shared Bathroom'}
        </p>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room.id)}
            className={`bg-gradient-to-br from-gray-900 to-gray-950 border rounded-xl p-5 text-left transition-all ${
              selectedRoom === room.id
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-gray-800 hover:border-cyan-500/50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-white">Room {room.room_number}</h3>
              {room.current_occupancy >= room.capacity ? (
                <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full">Full</span>
              ) : (
                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                  {room.capacity - room.current_occupancy} spots left
                </span>
              )}
            </div>
            
            <p className="text-gray-400 text-sm mb-3">Floor {room.floor_number}</p>
            
            <div className="mt-3 pt-3 border-t border-gray-800">
              <p className="text-cyan-400 font-bold text-xl">
                {formatPrice(room.price_per_month || 5000)}
                <span className="text-xs text-gray-400">/month</span>
              </p>
            </div>
          </button>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12 bg-gray-900 rounded-2xl">
          <p className="text-gray-400">No rooms available for this selection.</p>
        </div>
      )}

      {/* Booking Form */}
      {selectedRoom && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Complete Booking</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-2">Check-in Date</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-2">Check-out Date</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                required
              />
            </div>
          </div>

          {checkInDate && checkOutDate && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Total Stay</p>
                  <p className="text-white font-semibold">
                    {Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Total Amount</p>
                  <p className="text-cyan-400 font-bold text-xl">
                    {formatPrice(
                      (rooms.find(r => r.id === selectedRoom)?.price_per_month || 5000) / 30 * 
                      Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={submitting}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-bold rounded-xl transition"
          >
            {submitting ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomSelection;