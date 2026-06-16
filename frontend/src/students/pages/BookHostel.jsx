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
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    // Personal info
    middle_name: '',
    gender: '',
    phone: '',
    
    // Emergency contact
    guardian_name: '',
    guardian_relation: '',
    guardian_contact: '',
    
    // Temporary address
    temp_address: '',
    temp_city: '',
    temp_state: '',
    
    // Permanent address
    perm_address: '',
    perm_city: '',
    perm_state: '',
    same_as_temp: false,
    
    // Booking dates
    check_in_date: '',
    check_out_date: '',
  });

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/hostel/hostels/');
        const hostelData = response.data.results || response.data;
        setHostels(hostelData);
      } catch (err) {
        console.error('Error fetching hostels:', err);
        setError(err.response?.status === 401 
          ? 'Please login to view hostels' 
          : 'Failed to load hostels. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchHostels();
  }, []);

  // Fetch student profile on load
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await api.get('/students/');
        const students = response.data.results || response.data;
        const currentStudent = students.find(s => s.user === user?.id);
        if (currentStudent) {
          setStudentProfile(currentStudent);
          // Pre-fill form with existing student data
          setBookingForm(prev => ({
            ...prev,
            middle_name: currentStudent.middle_name || '',
            gender: currentStudent.gender || '',
            phone: currentStudent.phone || '',
            guardian_name: currentStudent.guardian_name || '',
            guardian_relation: currentStudent.guardian_relation || '',
            guardian_contact: currentStudent.guardian_contact || '',
            temp_address: currentStudent.temp_address || '',
            temp_city: currentStudent.temp_city || '',
            temp_state: currentStudent.temp_state || '',
            perm_address: currentStudent.perm_address || '',
            perm_city: currentStudent.perm_city || '',
            perm_state: currentStudent.perm_state || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
      }
    };
    if (user?.id) {
      fetchStudentProfile();
    }
  }, [user]);

  const fetchAvailableRooms = async (hostelId) => {
    setLoadingRoomTypes(true);
    setError(null);
    try {
      const response = await api.get(`/hostel/rooms/available_rooms/?hostel_id=${hostelId}`);
      
      if (!Array.isArray(response.data)) {
        setRoomOptions([]);
        setError('Invalid response from server');
        return;
      }
      
      if (response.data.length === 0) {
        setRoomOptions([]);
        return;
      }
      
      // Group rooms by type, AC, bathroom
      const grouped = {};
      response.data.forEach((room) => {
        if (!room.room_type) return;
        
        const key = `${room.room_type}_${room.ac_type || 'non_ac'}_${room.bathroom_type || 'shared'}`;
        if (!grouped[key]) {
          const roomTypeLabel = room.room_type === 'single' ? 'Single' : 
                              room.room_type === 'double' ? 'Double' : 
                              room.room_type === 'triple' ? 'Triple' : room.room_type;
          
          grouped[key] = {
            room_type: room.room_type,
            ac_type: room.ac_type || 'non_ac',
            bathroom_type: room.bathroom_type || 'shared',
            count: 0,
            price_per_month: room.price_per_month || 0,
            room_type_label: roomTypeLabel.charAt(0).toUpperCase() + roomTypeLabel.slice(1),
            ac_label: (room.ac_type || 'non_ac') === 'ac' ? 'AC' : 'Non-AC',
            bathroom_label: (room.bathroom_type || 'shared') === 'attached' ? 'Attached Bathroom' : 'Shared Bathroom',
            rooms: []
          };
        }
        grouped[key].count++;
        grouped[key].rooms.push(room);
        if (room.price_per_month) {
          grouped[key].price_per_month = room.price_per_month;
        }
      });
      
      setRoomOptions(Object.values(grouped));
    } catch (err) {
      console.error('Error fetching available rooms:', err);
      setError('Failed to load rooms. Please try again.');
      setRoomOptions([]);
    } finally {
      setLoadingRoomTypes(false);
    }
  };

  const handleSelectHostel = async (hostel) => {
    setSelectedHostel(hostel);
    setShowRoomOptions(true);
    setError(null);
    await fetchAvailableRooms(hostel.id);
  };

  const handleBookNow = (option) => {
    // If there's only one room in this group, show booking form
    if (option.rooms.length === 1) {
      setSelectedRoomForBooking(option.rooms[0]);
      setShowBookingForm(true);
    } else {
      // If multiple rooms, navigate to room selection
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
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSameAsTemp = (e) => {
    const checked = e.target.checked;
    setBookingForm(prev => ({
      ...prev,
      same_as_temp: checked,
      perm_address: checked ? prev.temp_address : '',
      perm_city: checked ? prev.temp_city : '',
      perm_state: checked ? prev.temp_state : '',
    }));
  };

  const handleBookingSubmit = async (e) => {
  e.preventDefault();
  
  // Validate required fields
  const requiredFields = ['phone', 'guardian_name', 'guardian_contact', 'check_in_date', 'check_out_date'];
  const missingFields = requiredFields.filter(field => !bookingForm[field]);
  
  if (missingFields.length > 0) {
    alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
    return;
  }
  
  if (new Date(bookingForm.check_in_date) >= new Date(bookingForm.check_out_date)) {
    alert('Check-out date must be after check-in date');
    return;
  }

  setSubmitting(true);
  try {
    // 1. Update or create student profile
    let studentId;
    const studentData = {
      middle_name: bookingForm.middle_name || null,
      gender: bookingForm.gender || null,
      phone: bookingForm.phone,
      guardian_name: bookingForm.guardian_name,
      guardian_relation: bookingForm.guardian_relation || null,
      guardian_contact: bookingForm.guardian_contact,
      temp_address: bookingForm.temp_address || null,
      temp_city: bookingForm.temp_city || null,
      temp_state: bookingForm.temp_state || null,
      perm_address: bookingForm.same_as_temp ? bookingForm.temp_address : bookingForm.perm_address || null,
      perm_city: bookingForm.same_as_temp ? bookingForm.temp_city : bookingForm.perm_city || null,
      perm_state: bookingForm.same_as_temp ? bookingForm.temp_state : bookingForm.perm_state || null,
    };

    if (studentProfile) {
      await api.patch(`/students/${studentProfile.id}/`, studentData);
      studentId = studentProfile.id;
    } else {
      const response = await api.post('/students/', {
        user: user.id,
        ...studentData
      });
      studentId = response.data.id;
      setStudentProfile(response.data);
    }

    // 2. Calculate total amount (use decimal with 2 decimal places)
    const days = Math.ceil((new Date(bookingForm.check_out_date) - new Date(bookingForm.check_in_date)) / (1000 * 60 * 60 * 24));
    const pricePerMonth = selectedRoomForBooking.price_per_month || 5000;
    const totalAmount = Number(((pricePerMonth / 30) * days).toFixed(2)); // Keep 2 decimal places

    // 3. Create booking - validate all fields
    const bookingData = {
      student: studentId,
      room: selectedRoomForBooking.id,
      check_in_date: bookingForm.check_in_date,
      check_out_date: bookingForm.check_out_date,
      total_amount: totalAmount  // Send as number, not string
    };
    
    console.log('Sending booking data:', bookingData);
    
    const bookingResponse = await api.post('/bookings/bookings/', bookingData);
    console.log('Booking response:', bookingResponse.data);

    // 4. Navigate to payment
    navigate(`/students/pay/${bookingResponse.data.id}`);
    
  } catch (err) {
    console.error('Booking failed:', err);
    console.error('Error response:', err.response?.data);
    
    // Show detailed error message
    let errorMessage = 'Failed to create booking. ';
    if (err.response?.data) {
      const errorData = err.response.data;
      if (typeof errorData === 'object') {
        const messages = Object.values(errorData).flat();
        errorMessage += messages.join(', ');
      } else {
        errorMessage += errorData;
      }
    } else {
      errorMessage += 'Please try again.';
    }
    alert(errorMessage);
  } finally {
    setSubmitting(false);
  }
};

  const handleBackToRooms = () => {
    setShowBookingForm(false);
    setSelectedRoomForBooking(null);
    setError(null);
  };

  const handleBackToHostels = () => {
    setShowRoomOptions(false);
    setSelectedHostel(null);
    setRoomOptions([]);
    setError(null);
    setShowBookingForm(false);
    setSelectedRoomForBooking(null);
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Price not set';
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinCheckOutDate = () => {
    return bookingForm.check_in_date || getTodayDate();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading hostels...</p>
        </div>
      </div>
    );
  }

  if (error && !showRoomOptions) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Booking Form View
  if (showBookingForm && selectedRoomForBooking) {
    const days = bookingForm.check_in_date && bookingForm.check_out_date 
      ? Math.ceil((new Date(bookingForm.check_out_date) - new Date(bookingForm.check_in_date)) / (1000 * 60 * 60 * 24))
      : 0;
    const totalAmount = days > 0 && selectedRoomForBooking.price_per_month
      ? (selectedRoomForBooking.price_per_month / 30) * days
      : 0;

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <button 
          onClick={handleBackToRooms} 
          className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm"
        >
          ← Back to Rooms
        </button>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Complete Your Booking</h2>
          <p className="text-gray-400 text-sm mb-6">
            Room {selectedRoomForBooking.room_number} • {selectedRoomForBooking.room_type} • {selectedRoomForBooking.ac_type === 'ac' ? 'AC' : 'Non-AC'}
          </p>

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Middle Name</label>
                  <input
                    type="text"
                    name="middle_name"
                    value={bookingForm.middle_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={bookingForm.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingForm.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Guardian Name *</label>
                  <input
                    type="text"
                    name="guardian_name"
                    value={bookingForm.guardian_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Relation *</label>
                  <input
                    type="text"
                    name="guardian_relation"
                    value={bookingForm.guardian_relation}
                    onChange={handleInputChange}
                    placeholder="e.g., Father, Mother"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Guardian Contact *</label>
                  <input
                    type="tel"
                    name="guardian_contact"
                    value={bookingForm.guardian_contact}
                    onChange={handleInputChange}
                    placeholder="Enter guardian phone"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">Address Details</h3>
              
              {/* Temporary Address */}
              <div className="mb-4">
                <p className="text-gray-300 text-sm font-medium mb-3">Temporary Address</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 uppercase mb-1">Address</label>
                    <input
                      type="text"
                      name="temp_address"
                      value={bookingForm.temp_address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 uppercase mb-1">City</label>
                      <input
                        type="text"
                        name="temp_city"
                        value={bookingForm.temp_city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase mb-1">State</label>
                      <input
                        type="text"
                        name="temp_state"
                        value={bookingForm.temp_state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Permanent Address */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    name="same_as_temp"
                    checked={bookingForm.same_as_temp}
                    onChange={handleSameAsTemp}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-cyan-500"
                  />
                  <label className="text-sm text-gray-400">Same as temporary address</label>
                </div>
                
                {!bookingForm.same_as_temp && (
                  <div className="space-y-4 mt-3">
                    <div>
                      <label className="block text-xs text-gray-400 uppercase mb-1">Permanent Address</label>
                      <input
                        type="text"
                        name="perm_address"
                        value={bookingForm.perm_address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1">City</label>
                        <input
                          type="text"
                          name="perm_city"
                          value={bookingForm.perm_city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 uppercase mb-1">State</label>
                        <input
                          type="text"
                          name="perm_state"
                          value={bookingForm.perm_state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Dates */}
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">Booking Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Check-in Date *</label>
                  <input
                    type="date"
                    name="check_in_date"
                    value={bookingForm.check_in_date}
                    onChange={handleInputChange}
                    min={getTodayDate()}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Check-out Date *</label>
                  <input
                    type="date"
                    name="check_out_date"
                    value={bookingForm.check_out_date}
                    onChange={handleInputChange}
                    min={getMinCheckOutDate()}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
              <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">Booking Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Room</span>
                  <span className="text-white">Room {selectedRoomForBooking.room_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Room Type</span>
                  <span className="text-white capitalize">{selectedRoomForBooking.room_type} • {selectedRoomForBooking.ac_type === 'ac' ? 'AC' : 'Non-AC'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stay Duration</span>
                  <span className="text-white">{days} days</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-700">
                  <span className="text-gray-400 font-semibold">Total Amount</span>
                  <span className="text-cyan-400 font-bold text-xl">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-bold rounded-xl transition"
            >
              {submitting ? 'Processing...' : 'Confirm Booking & Pay'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Room Options View
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
          <button onClick={handleBackToHostels} className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm">
            ← Back to Hostels
          </button>
          <h1 className="text-3xl font-bold text-white">{selectedHostel.name}</h1>
          <p className="text-gray-400 mt-1">Select your preferred room type</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {roomOptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomOptions.map((option, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all group">
                <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-white capitalize">{option.room_type_label} Rooms</h2>
                    <span className="text-sm text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                      {option.count} available
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {option.ac_label} • {option.bathroom_label}
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {option.ac_type === 'ac' ? (
                      <span className="text-blue-400 text-xl">❄️</span>
                    ) : (
                      <span className="text-orange-400 text-xl">🌡️</span>
                    )}
                    <span className="text-white font-medium">{option.ac_label}</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-cyan-400 font-bold text-2xl">
                      {formatPrice(option.price_per_month)}
                      <span className="text-xs text-gray-400 ml-1">/month</span>
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleBookNow(option)}
                    className="w-full mt-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition group-hover:shadow-lg group-hover:shadow-cyan-500/20"
                  >
                    {option.count === 1 ? 'Book Now →' : 'View Available Rooms →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900 rounded-2xl">
            <p className="text-gray-400">No rooms available at this hostel.</p>
            <button onClick={handleBackToHostels} className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg">
              Back to Hostels
            </button>
          </div>
        )}
      </div>
    );
  }

  // Hostels List View
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Available Hostels</h1>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostels.map((hostel) => (
          <div 
            key={hostel.id} 
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer group"
          >
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              {hostel.name}
            </h2>
            <p className="text-gray-400 mb-4 line-clamp-2">{hostel.address}</p>
            <button
              onClick={() => handleSelectHostel(hostel)}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition group-hover:shadow-lg group-hover:shadow-cyan-500/20"
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