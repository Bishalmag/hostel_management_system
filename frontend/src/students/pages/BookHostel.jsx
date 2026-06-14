import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const BookHostel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [roomOptions, setRoomOptions] = useState([]);
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoading(true);
        const response = await api.get('/hostel/hostels/');
        const hostelData = response.data.results || response.data;
        setHostels(hostelData);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load hostels');
      } finally {
        setLoading(false);
      }
    };
    fetchHostels();
  }, []);

  // Alternative approach: Fetch available rooms directly instead of using summary
  const fetchAvailableRooms = async (hostelId) => {
    setLoadingRoomTypes(true);
    try {
      // Fetch available rooms for this hostel
      const response = await api.get(`/hostel/rooms/available_rooms/?hostel_id=${hostelId}`);
      console.log('Available rooms response:', response.data);
      
      // Group rooms by type, AC, bathroom
      const grouped = {};
      response.data.forEach(room => {
        const key = `${room.room_type}_${room.ac_type}_${room.bathroom_type}`;
        if (!grouped[key]) {
          grouped[key] = {
            room_type: room.room_type,
            ac_type: room.ac_type,
            bathroom_type: room.bathroom_type,
            count: 0,
            price_per_month: room.price_per_month,
            room_type_label: room.room_type === 'single' ? 'Single' : room.room_type === 'double' ? 'Double' : 'Triple',
            ac_label: room.ac_type === 'ac' ? 'AC' : 'Non-AC',
            bathroom_label: room.bathroom_type === 'attached' ? 'Attached Bathroom' : 'Shared Bathroom'
          };
        }
        grouped[key].count++;
      });
      
      setRoomOptions(Object.values(grouped));
    } catch (err) {
      console.error('Error fetching available rooms:', err);
      setRoomOptions([]);
    } finally {
      setLoadingRoomTypes(false);
    }
  };

  const handleSelectHostel = async (hostel) => {
    setSelectedHostel(hostel);
    setShowRoomOptions(true);
    await fetchAvailableRooms(hostel.id);
  };

  const handleRoomTypeSelect = (option) => {
    navigate(`/students/room-selection/${selectedHostel.id}`, {
      state: {
        hostel: selectedHostel,
        roomType: option.room_type,
        acType: option.ac_type,
        bathroomType: option.bathroom_type,
        pricePerMonth: option.price_per_month,
        roomTypeLabel: option.room_type_label,
        acLabel: option.ac_label,
        bathroomLabel: option.bathroom_label
      }
    });
  };

  const handleBackToHostels = () => {
    setShowRoomOptions(false);
    setSelectedHostel(null);
    setRoomOptions([]);
  };

  if (loading) return <div className="text-center p-6 text-gray-400">Loading hostels...</div>;
  if (error) return <div className="text-center p-6 text-red-400">{error}</div>;

  if (showRoomOptions && selectedHostel) {
    if (loadingRoomTypes) {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <button onClick={handleBackToHostels} className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm">
            ← Back to Hostels
          </button>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading room options...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <button
            onClick={handleBackToHostels}
            className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm"
          >
            ← Back to Hostels
          </button>
          <h1 className="text-3xl font-bold text-white">{selectedHostel.name}</h1>
          <p className="text-gray-400 mt-1">Select your preferred room type</p>
        </div>

        {roomOptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomOptions.map((option, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all">
                <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
                  <h2 className="text-xl font-bold text-white capitalize">{option.room_type_label} Rooms</h2>
                  <p className="text-gray-500 text-sm mt-1">{option.ac_label} • {option.bathroom_label}</p>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {option.ac_type === 'ac' ? (
                          <span className="text-blue-400 text-xl">❄️</span>
                        ) : (
                          <span className="text-orange-400 text-xl">🌡️</span>
                        )}
                        <span className="text-white font-semibold">
                          {option.ac_label}
                        </span>
                      </div>
                      <span className="text-sm text-green-400 bg-green-500/20 px-3 py-1 rounded-full">
                        {option.count} rooms available
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      {option.bathroom_type === 'attached' ? '🚽 Attached Bathroom' : '🚻 Shared Bathroom'}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-cyan-400 font-bold text-2xl">
                      ₹{option.price_per_month?.toLocaleString()}
                      <span className="text-xs text-gray-400">/month</span>
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleRoomTypeSelect(option)}
                    className="w-full mt-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition"
                  >
                    View Available Rooms →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900 rounded-2xl">
            <p className="text-gray-400">No rooms available at this hostel.</p>
            <button
              onClick={handleBackToHostels}
              className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg"
            >
              Back to Hostels
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Available Hostels</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostels.map((hostel) => (
          <div 
            key={hostel.id} 
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer group"
          >
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              {hostel.name}
            </h2>
            <p className="text-gray-400 mb-4">{hostel.address}</p>
            <button
              onClick={() => handleSelectHostel(hostel)}
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition"
            >
              View Rooms →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookHostel;