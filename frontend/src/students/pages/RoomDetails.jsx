import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const inputCls =
  'w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition';

const labelCls =
  'block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2';

const RoomDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { roomType, acType, bathroomType, pricePerMonth, roomTypeLabel, acLabel, bathroomLabel } = location.state || {};

  const [hostel, setHostel] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!id) {
      setMessage({ type: 'error', text: 'No hostel selected. Please go back and select a hostel.' });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [hostelRes, blockRes, floorRes, roomRes] = await Promise.all([
          api.get(`/hostel/hostels/${id}/`),
          api.get('/hostel/blocks/'),
          api.get('/hostel/floors/'),
          api.get('/hostel/rooms/'),
        ]);

        const hostelData = hostelRes.data;
        const blockData = blockRes.data.results ?? blockRes.data;
        const floorData = floorRes.data.results ?? floorRes.data;
        const roomData = roomRes.data.results ?? roomRes.data;

        setHostel(hostelData);

        const hostelBlocks = blockData.filter(b => String(b.hostel) === String(id));
        setBlocks(hostelBlocks);

        const hostelBlockIds = hostelBlocks.map(b => b.id);
        const hostelFloors = floorData.filter(f => {
          const blockId = typeof f.block === 'object' ? f.block.id : f.block;
          return hostelBlockIds.includes(blockId);
        });
        setFloors(hostelFloors);
        setRooms(roomData);

      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to load hostel details. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle "Book Now" - Navigate to BookHostel with the selected room
  const handleBookNow = (room) => {
    navigate(`/students/book-hostels`, {
      state: {
        preSelectedRoom: room,
        preSelectedHostel: hostel,
        preSelectedFilters: {
          roomType,
          acType,
          bathroomType
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-400 py-12">Loading hostel details...</div>
      </div>
    );
  }

  // Get available rooms based on filters from BookHostel
  let availableRooms = rooms.filter(r => r.current_occupancy < r.capacity);
  
  // Apply filters from BookHostel
  if (roomType) {
    availableRooms = availableRooms.filter(r => r.room_type === roomType);
  }
  if (acType) {
    availableRooms = availableRooms.filter(r => r.ac_type === acType);
  }
  if (bathroomType) {
    availableRooms = availableRooms.filter(r => r.bathroom_type === bathroomType);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div>
        <button
          onClick={() => navigate('/students/book-hostels')}
          className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm transition"
        >
          ← Back to Hostels
        </button>
        <h1 className="text-3xl font-bold text-white">{hostel?.name || 'Hostel Details'}</h1>
        <p className="text-gray-400 mt-1">
          {roomTypeLabel || (roomType && roomType.charAt(0).toUpperCase() + roomType.slice(1))} Room • 
          {acLabel || (acType === 'ac' ? ' AC' : ' Non-AC')} • 
          {bathroomLabel || (bathroomType === 'attached' ? ' Attached Bathroom' : ' Shared Bathroom')}
        </p>
        <p className="text-gray-400 mt-2">{hostel?.address}</p>
        <p className="text-gray-500 text-sm mt-2">{availableRooms.length} rooms available</p>
      </div>

      {message.text && (
        <div
          className={`px-4 py-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableRooms.length > 0 ? (
          availableRooms.map((room) => (
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
                      {new Intl.NumberFormat('en-NP', {
                        style: 'currency',
                        currency: 'NPR',
                        minimumFractionDigits: 0
                      }).format(room.price_per_month || 5000)}
                      <span className="text-xs text-gray-400">/month</span>
                    </p>
                    <p className="text-gray-500 text-xs">
                      ₹{(room.price_per_month ? room.price_per_month / 30 : 5000 / 30).toFixed(0)}/day
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
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-900 rounded-2xl">
            <p className="text-gray-400">No rooms available for this selection.</p>
            <button
              onClick={() => navigate('/students/book-hostels')}
              className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
            >
              Go back and try different filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetails;