import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';
import { useNotification } from '../../context/NotificationContext';

const BookHostel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showBooking, showError, showSuccess } = useNotification();
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

  // Check for pre-selected room from RoomDetails navigation
  useEffect(() => {
    const { preSelectedRoom, preSelectedHostel, preSelectedFilters } = location.state || {};
    
    console.log('Location state:', location.state);
    
    if (preSelectedRoom) {
      console.log('Pre-selected room found:', preSelectedRoom);
      setSelectedRoomForBooking(preSelectedRoom);
      setShowBookingForm(true);
      if (preSelectedHostel) {
        setSelectedHostel(preSelectedHostel);
      }
      
      if (preSelectedFilters) {
        console.log('Filters:', preSelectedFilters);
      }
      
      setTimeout(() => {
        document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location.state]);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    middle_name: '',
    gender: '',
    phone: '',
    guardian_name: '',
    guardian_relation: '',
    guardian_contact: '',
    temp_address: '',
    temp_city: '',
    temp_state: '',
    perm_address: '',
    perm_city: '',
    perm_state: '',
    same_as_temp: false,
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
    if (option.rooms.length === 1) {
      setSelectedRoomForBooking(option.rooms[0]);
      setShowBookingForm(true);
      setTimeout(() => {
        document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(`/students/room-details/${selectedHostel.id}`, {
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
    
    const requiredFields = ['phone', 'guardian_name', 'guardian_contact', 'check_in_date', 'check_out_date'];
    const missingFields = requiredFields.filter(field => !bookingForm[field]);
    
    if (missingFields.length > 0) {
      showError(`Please fill in all required fields: ${missingFields.join(', ')}`, 'Validation Error');
      return;
    }
    
    if (new Date(bookingForm.check_in_date) >= new Date(bookingForm.check_out_date)) {
      showError('Check-out date must be after check-in date', 'Validation Error');
      return;
    }

    setSubmitting(true);
    try {
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

      const days = Math.ceil((new Date(bookingForm.check_out_date) - new Date(bookingForm.check_in_date)) / (1000 * 60 * 60 * 24));
      const pricePerMonth = selectedRoomForBooking.price_per_month || 5000;
      const totalAmount = Number(((pricePerMonth / 30) * days).toFixed(2));

      const bookingData = {
        student: studentId,
        room: selectedRoomForBooking.id,
        check_in_date: bookingForm.check_in_date,
        check_out_date: bookingForm.check_out_date,
        total_amount: totalAmount
      };
      
      console.log('Sending booking data:', bookingData);
      
      const bookingResponse = await api.post('/bookings/bookings/', bookingData);
      console.log('Booking response:', bookingResponse.data);

      showBooking(
        `Room ${selectedRoomForBooking.room_number} booked successfully!`,
        'Booking Confirmed',
        `Check-in: ${bookingForm.check_in_date} | Check-out: ${bookingForm.check_out_date}`
      );

      navigate(`/students/pay/${bookingResponse.data.id}`);
      
    } catch (err) {
      console.error('Booking failed:', err);
      console.error('Error response:', err.response?.data);
      
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
      showError(errorMessage, 'Booking Failed');
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
  if (!price || price === 0) return 'Rs. 0';
  const formatted = new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return formatted.replace('NPR', 'Rs.');
};

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinCheckOutDate = () => {
    return bookingForm.check_in_date || getTodayDate();
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '256px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b8aaa' }}>Loading hostels...</p>
        </div>
      </div>
    );
  }

  if (error && !showRoomOptions && !showBookingForm) {
    return (
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#f87171' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#f5a623',
              color: '#0a1628',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e09515'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f5a623'}
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
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '24px' }}>
        <button 
          onClick={handleBackToRooms} 
          style={{
            color: '#6b8aaa',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '14px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
        >
          ← Back to Rooms
        </button>

        <div id="booking-form" style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '32px',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: '0 0 8px 0',
          }}>Complete Your Booking</h2>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            marginBottom: '24px',
          }}>
            Room {selectedRoomForBooking.room_number} • {selectedRoomForBooking.room_type} • {selectedRoomForBooking.ac_type === 'ac' ? 'AC' : 'Non-AC'}
            {selectedRoomForBooking.floor_number && ` • Floor ${selectedRoomForBooking.floor_number}`}
          </p>

          <form onSubmit={handleBookingSubmit}>
            {/* Personal Information */}
            <div style={{
              background: 'rgba(18, 36, 72, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h3 style={{
                color: '#f5a623',
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 16px 0',
              }}>Personal Information</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}>Middle Name</label>
                  <input
                    type="text"
                    name="middle_name"
                    value={bookingForm.middle_name}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#0a1628',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}>Gender *</label>
                  <select
                    name="gender"
                    value={bookingForm.gender}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#0a1628',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingForm.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#0a1628',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div style={{
              background: 'rgba(18, 36, 72, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h3 style={{
                color: '#f5a623',
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 16px 0',
              }}>Emergency Contact</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}>Guardian Name *</label>
                  <input
                    type="text"
                    name="guardian_name"
                    value={bookingForm.guardian_name}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#0a1628',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                    required
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}>Relation *</label>
                  <input
                    type="text"
                    name="guardian_relation"
                    value={bookingForm.guardian_relation}
                    onChange={handleInputChange}
                    placeholder="e.g., Father, Mother"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#0a1628',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                    required
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}>Guardian Contact *</label>
                  <input
                    type="tel"
                    name="guardian_contact"
                    value={bookingForm.guardian_contact}
                    onChange={handleInputChange}
                    placeholder="Enter guardian phone"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#0a1628',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div style={{
              background: 'rgba(18, 36, 72, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h3 style={{
                color: '#f5a623',
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 16px 0',
              }}>Address Details</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  color: '#c8daf0',
                  fontSize: '14px',
                  fontWeight: 500,
                  margin: '0 0 12px 0',
                }}>Temporary Address</p>
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '10px',
                      color: '#6b8aaa',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}>Address</label>
                    <input
                      type="text"
                      name="temp_address"
                      value={bookingForm.temp_address}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: '#0a1628',
                        border: '1px solid #1a3050',
                        borderRadius: '8px',
                        color: '#eaf2ff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                    />
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '10px',
                        color: '#6b8aaa',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}>City</label>
                      <input
                        type="text"
                        name="temp_city"
                        value={bookingForm.temp_city}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: '#0a1628',
                          border: '1px solid #1a3050',
                          borderRadius: '8px',
                          color: '#eaf2ff',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '10px',
                        color: '#6b8aaa',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}>State</label>
                      <input
                        type="text"
                        name="temp_state"
                        value={bookingForm.temp_state}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: '#0a1628',
                          border: '1px solid #1a3050',
                          borderRadius: '8px',
                          color: '#eaf2ff',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}>
                  <input
                    type="checkbox"
                    name="same_as_temp"
                    checked={bookingForm.same_as_temp}
                    onChange={handleSameAsTemp}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: '1px solid #1a3050',
                      background: '#0a1628',
                      accentColor: '#f5a623',
                    }}
                  />
                  <label style={{
                    fontSize: '14px',
                    color: '#6b8aaa',
                  }}>Same as temporary address</label>
                </div>
                
                {!bookingForm.same_as_temp && (
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '10px',
                        color: '#6b8aaa',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}>Permanent Address</label>
                      <input
                        type="text"
                        name="perm_address"
                        value={bookingForm.perm_address}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: '#0a1628',
                          border: '1px solid #1a3050',
                          borderRadius: '8px',
                          color: '#eaf2ff',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                      />
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '12px',
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '10px',
                          color: '#6b8aaa',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}>City</label>
                        <input
                          type="text"
                          name="perm_city"
                          value={bookingForm.perm_city}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: '#0a1628',
                            border: '1px solid #1a3050',
                            borderRadius: '8px',
                            color: '#eaf2ff',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '10px',
                          color: '#6b8aaa',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}>State</label>
                        <input
                          type="text"
                          name="perm_state"
                          value={bookingForm.perm_state}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: '#0a1628',
                            border: '1px solid #1a3050',
                            borderRadius: '8px',
                            color: '#eaf2ff',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Dates */}
            <div style={{
              background: 'rgba(18, 36, 72, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h3 style={{
                color: '#f5a623',
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 16px 0',
              }}>Booking Dates</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}>Check-in Date *</label>
                  <input
                    type="date"
                    name="check_in_date"
                    value={bookingForm.check_in_date}
                    onChange={handleInputChange}
                    min={getTodayDate()}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#0a1628',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                    required
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}>Check-out Date *</label>
                  <input
                    type="date"
                    name="check_out_date"
                    value={bookingForm.check_out_date}
                    onChange={handleInputChange}
                    min={getMinCheckOutDate()}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#0a1628',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#f5a623'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              background: 'rgba(245, 166, 35, 0.05)',
              border: '1px solid rgba(245, 166, 35, 0.2)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h3 style={{
                color: '#f5a623',
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 16px 0',
              }}>Booking Summary</h3>
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                }}>
                  <span style={{ color: '#6b8aaa' }}>Room</span>
                  <span style={{ color: '#eaf2ff' }}>Room {selectedRoomForBooking.room_number}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                }}>
                  <span style={{ color: '#6b8aaa' }}>Room Type</span>
                  <span style={{ color: '#eaf2ff', textTransform: 'capitalize' }}>{selectedRoomForBooking.room_type} • {selectedRoomForBooking.ac_type === 'ac' ? 'AC' : 'Non-AC'}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                }}>
                  <span style={{ color: '#6b8aaa' }}>Floor</span>
                  <span style={{ color: '#eaf2ff' }}>Floor {selectedRoomForBooking.floor_number || 'N/A'}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                }}>
                  <span style={{ color: '#6b8aaa' }}>Stay Duration</span>
                  <span style={{ color: '#eaf2ff' }}>{days} days</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  marginTop: '8px',
                  borderTop: '1px solid #1a3050',
                }}>
                  <span style={{ color: '#6b8aaa', fontWeight: 600 }}>Total Amount</span>
                  <span style={{ color: '#f5a623', fontWeight: 700, fontSize: '20px' }}>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px',
                background: submitting ? '#3a5070' : '#f5a623',
                color: '#0a1628',
                fontWeight: 700,
                borderRadius: '12px',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.5 : 1,
                transition: 'all 0.2s ease',
                fontSize: '16px',
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = '#e09515';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = '#f5a623';
                }
              }}
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
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px' }}>
          <button 
            onClick={handleBackToHostels} 
            style={{
              color: '#6b8aaa',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
          >
            ← Back to Hostels
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 0',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '3px solid #1a3050',
                borderTop: '3px solid #f5a623',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }} />
              <p style={{ color: '#6b8aaa' }}>Loading room options...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <button 
            onClick={handleBackToHostels} 
            style={{
              color: '#6b8aaa',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
          >
            ← Back to Hostels
          </button>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: 0,
          }}>{selectedHostel.name}</h1>
          <p style={{
            color: '#6b8aaa',
            marginTop: '4px',
          }}>Select your preferred room type</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <p style={{ color: '#f87171', margin: 0 }}>{error}</p>
          </div>
        )}

        {roomOptions.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {roomOptions.map((option, index) => (
              <div key={index} style={{
                background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
                border: '1px solid #1a3050',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1a3050';
              }}>
                <div style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #1a3050',
                  background: 'rgba(18, 36, 72, 0.3)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#eaf2ff',
                      textTransform: 'capitalize',
                      margin: 0,
                    }}>{option.room_type_label} Rooms</h2>
                    <span style={{
                      fontSize: '14px',
                      color: '#1ddba8',
                      background: 'rgba(29, 219, 168, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                    }}>
                      {option.count} available
                    </span>
                  </div>
                  <p style={{
                    color: '#6b8aaa',
                    fontSize: '14px',
                    marginTop: '4px',
                  }}>
                    {option.ac_label} • {option.bathroom_label}
                  </p>
                </div>
                
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                  }}>
                    <span style={{
                      fontSize: '24px',
                    }}>{option.ac_type === 'ac' ? '❄️' : '🌡️'}</span>
                    <span style={{
                      color: '#eaf2ff',
                      fontWeight: 500,
                    }}>{option.ac_label}</span>
                  </div>
                  
                  <div style={{
                    paddingTop: '16px',
                    borderTop: '1px solid #1a3050',
                  }}>
                    <p style={{
                      color: '#f5a623',
                      fontWeight: 700,
                      fontSize: '24px',
                      margin: 0,
                    }}>
                      {formatPrice(option.price_per_month)}
                      <span style={{
                        fontSize: '12px',
                        color: '#6b8aaa',
                        marginLeft: '4px',
                      }}>/month</span>
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleBookNow(option)}
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '10px',
                      background: '#f5a623',
                      color: '#0a1628',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e09515';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 166, 35, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f5a623';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {option.count === 1 ? 'Book Now →' : 'View Available Rooms →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '48px 0',
            background: '#0a1628',
            borderRadius: '16px',
          }}>
            <p style={{ color: '#6b8aaa' }}>No rooms available at this hostel.</p>
            <button 
              onClick={handleBackToHostels} 
              style={{
                marginTop: '16px',
                padding: '8px 24px',
                background: '#f5a623',
                color: '#0a1628',
                fontWeight: 500,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e09515'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f5a623'}
            >
              Back to Hostels
            </button>
          </div>
        )}
      </div>
    );
  }

  // Hostels List View
  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: 700,
        color: '#eaf2ff',
        margin: '0 0 24px 0',
      }}>Available Hostels</h1>
      {error && (
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <p style={{ color: '#f87171', margin: 0 }}>{error}</p>
        </div>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
      }}>
        {hostels.map((hostel) => (
          <div 
            key={hostel.id} 
            style={{
              background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
              border: '1px solid #1a3050',
              borderRadius: '16px',
              padding: '24px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1a3050';
            }}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#eaf2ff',
              margin: '0 0 8px 0',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#eaf2ff'}
            >
              {hostel.name}
            </h2>
            <p style={{
              color: '#6b8aaa',
              margin: '0 0 16px 0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>{hostel.address}</p>
            <button
              onClick={() => handleSelectHostel(hostel)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#f5a623',
                color: '#0a1628',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e09515';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 166, 35, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f5a623';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View Rooms →
            </button>
          </div>
        ))}
      </div>

      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BookHostel;