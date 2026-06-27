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
  
  const { hostel, roomType, acType, bathroomType, pricePerMonth, roomTypeLabel, acLabel, bathroomLabel } = location.state || {};

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

  // Handle "Book Now" - navigate to the existing BookHostel page
  const handleBookNow = (room) => {
    // Navigate back to BookHostel with the selected room
    navigate(`/students/book-hostels`, {
      state: {
        preSelectedHostel: hostel,
        preSelectedRoom: room,
        preSelectedFilters: {
          roomType,
          acType,
          bathroomType
        }
      }
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPricePerDay = (room) => {
    return room.price_per_month ? room.price_per_month / 30 : 5000 / 30;
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
          className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm transition"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-white">{hostel?.name || 'Hostel'}</h1>
        <p className="text-gray-400 mt-1">
          {roomTypeLabel || (roomType && roomType.charAt(0).toUpperCase() + roomType.slice(1))} Room • 
          {acLabel || (acType === 'ac' ? ' AC' : ' Non-AC')} • 
          {bathroomLabel || (bathroomType === 'attached' ? ' Attached Bathroom' : ' Shared Bathroom')}
        </p>
        <p className="text-gray-500 text-sm mt-2">{rooms.length} rooms available</p>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5 transition-all hover:border-cyan-500/50"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold text-white">Room {room.room_number}</h3>
                <p className="text-gray-400 text-sm">Floor {room.floor_number}</p>
              </div>
              {room.current_occupancy >= room.capacity ? (
                <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full">Full</span>
              ) : (
                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                  {room.capacity - room.current_occupancy} spots
                </span>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-cyan-400 font-bold text-xl">
                    {formatPrice(room.price_per_month || 5000)}
                    <span className="text-xs text-gray-400">/month</span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    ₹{getPricePerDay(room).toFixed(0)}/day
                  </p>
                </div>
                <button
                  onClick={() => handleBookNow(room)}
                  disabled={room.current_occupancy >= room.capacity}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                    room.current_occupancy >= room.capacity
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                  }`}
                >
                  Book Now
                </button>
              </div>
            </div>

            {/* Room Details Tags */}
            <div className="mt-3 pt-3 border-t border-gray-800 flex flex-wrap gap-2">
              <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-400 capitalize">
                {room.room_type}
              </span>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-400 capitalize">
                {room.ac_type === 'ac' ? 'AC' : 'Non-AC'}
              </span>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-400 capitalize">
                {room.bathroom_type}
              </span>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12 bg-gray-900 rounded-2xl">
          <p className="text-gray-400">No rooms available for this selection.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
          >
            Go back and try different filters
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomSelection;