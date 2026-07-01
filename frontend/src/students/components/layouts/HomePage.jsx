import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../components/Auth";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentBooking, setCurrentBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [events, setEvents] = useState([]);
  
  // Location states
  const [hostelLocation, setHostelLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [distance, setDistance] = useState(null);

  const DEFAULT_LOCATION = {
    lat: 27.7429167,
    lng: 85.4360556,
    name: "Subedi Gau"
  };

  // ---------------- FETCH STUDENT DATA ----------------
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        const bookingsRes = await api.get("/bookings/bookings/");
        const bookings = bookingsRes.data.results ?? bookingsRes.data;
        const activeBooking = bookings.find(b => 
          b.status === 'approved' && new Date(b.check_out_date) >= new Date()
        );
        
        if (activeBooking) {
          const roomRes = await api.get(`/hostel/rooms/${activeBooking.room}/`);
          const room = roomRes.data;
          const floorRes = await api.get(`/hostel/floors/${room.floor}/`);
          const floor = floorRes.data;
          const blockRes = await api.get(`/hostel/blocks/${floor.block}/`);
          const block = blockRes.data;
          
          setCurrentBooking({
            ...activeBooking,
            room_number: room.room_number,
            room_type: room.room_type,
            floor_number: floor.floor_number,
            block_name: block.name,
          });
        }
        
        // Fetch complaints for updates
        const complaintsRes = await api.get("/complaints/");
        const complaints = complaintsRes.data.results ?? complaintsRes.data;
        
        const complaintEvents = complaints
          .filter(c => c.status === "in_progress")
          .map(c => ({
            id: `complaint-${c.id}`,
            title: `Complaint Update: ${c.title}`,
            date: c.updated_at,
            icon: "⚠️",
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);
        
        setUpcomingEvents(complaintEvents);

        // ---------------- FETCH EVENTS ----------------
        try {
          const eventsRes = await api.get("/events/");
          const allEvents = eventsRes.data.results ?? eventsRes.data;
          const now = new Date();
          const filteredEvents = allEvents
            .filter(e => e.is_active && new Date(e.end_date) >= now)
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
            .slice(0, 5);
          setEvents(filteredEvents);
        } catch (eventsErr) {
          console.log('No events found or events API not available');
        }
        
      } catch (err) {
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // ---------------- FETCH HOSTEL LOCATION ----------------
  useEffect(() => {
    const fetchHostelLocation = async () => {
      if (!currentBooking?.room) return;

      try {
        const roomRes = await api.get(`/hostel/rooms/${currentBooking.room}/`);
        const floorRes = await api.get(`/hostel/floors/${roomRes.data.floor}/`);
        const blockRes = await api.get(`/hostel/blocks/${floorRes.data.block}/`);
        const hostelRes = await api.get(`/hostel/hostels/${blockRes.data.hostel}/`);

        if (hostelRes.data.latitude && hostelRes.data.longitude) {
          setHostelLocation({
            lat: parseFloat(hostelRes.data.latitude),
            lng: parseFloat(hostelRes.data.longitude),
            name: hostelRes.data.name,
          });
        }
      } catch (err) {
        console.error("Error fetching hostel location:", err);
      }
    };

    fetchHostelLocation();
  }, [currentBooking]);

  // ---------------- AUTO DETECT LOCATION ----------------
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported. Using default location.");
      setCurrentLocation(DEFAULT_LOCATION);
      return;
    }

    setLocationError("Detecting your location...");
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: "Your Location",
        });
        setLocationError("");
        setShowSearch(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocationError("Location access denied. Using default location.");
        setCurrentLocation(DEFAULT_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // ---------------- SEARCH LOCATION ----------------
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      setSearchResults(
        data.map((item) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          name: item.display_name,
          place: item.name,
        }))
      );
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ---------------- SELECT LOCATION ----------------
  const selectLocation = (location) => {
    setCurrentLocation({
      lat: location.lat,
      lng: location.lng,
      name: location.place || location.name,
    });
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    setLocationError("");
  };

  // ---------------- USE DEFAULT LOCATION ----------------
  const useDefaultLocation = () => {
    setCurrentLocation(DEFAULT_LOCATION);
    setShowSearch(false);
    setLocationError("");
  };

  // ---------------- HAVERSINE DISTANCE ----------------
  const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) *
              Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ---------------- CALCULATE DISTANCE ----------------
  useEffect(() => {
    if (currentLocation && hostelLocation) {
      const dist = haversineDistance(
        currentLocation.lat, currentLocation.lng,
        hostelLocation.lat, hostelLocation.lng
      );
      setDistance(dist);
    }
  }, [currentLocation, hostelLocation]);

  // ---------------- HELPERS ----------------
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysRemaining = (checkOutDate) => {
    const today = new Date();
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    
    if (end < now) return { label: 'Past', color: 'text-gray-400 bg-gray-500/20' };
    if (start <= now && end >= now) return { label: 'Ongoing', color: 'text-green-400 bg-green-500/20' };
    return { label: 'Upcoming', color: 'text-blue-400 bg-blue-500/20' };
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      general: '📋',
      academic: '📚',
      cultural: '🎭',
      sports: '⚽',
      maintenance: '🔧',
      emergency: '🚨',
      holiday: '🎉',
      other: '📌',
    };
    return icons[type] || '📅';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '384px',
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
          <p style={{ color: '#6b8aaa' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050d1a',
      padding: '32px 0',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        {/* Welcome Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(to bottom right, #f5a623, #e09515)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 700,
            color: '#0a1628',
            boxShadow: '0 4px 20px rgba(245, 166, 35, 0.2)',
          }}>
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#eaf2ff',
              margin: 0,
            }}>
              Welcome back, <span style={{ color: '#f5a623' }}>{user?.full_name?.split(' ')[0] || 'Student'}</span>
            </h1>
            <p style={{
              color: '#6b8aaa',
              fontSize: '14px',
              margin: 0,
            }}>Here's what's happening with your hostel stay</p>
          </div>
        </div>

        {/* Current Booking Card */}
        <div style={{
          background: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #1a3050',
            background: 'rgba(18, 36, 72, 0.3)',
          }}>
            <h2 style={{
              color: '#eaf2ff',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              margin: 0,
            }}>
              <span style={{ fontSize: '20px' }}>🏠</span> Your Current Stay
            </h2>
          </div>
          
          {currentBooking ? (
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}>
                <div style={{
                  background: 'rgba(18, 36, 72, 0.5)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #1a3050',
                }}>
                  <p style={{
                    color: '#6b8aaa',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 4px 0',
                  }}>Hostel / Block</p>
                  <p style={{
                    color: '#eaf2ff',
                    fontWeight: 600,
                    margin: 0,
                  }}>{currentBooking.block_name || 'N/A'}</p>
                </div>
                <div style={{
                  background: 'rgba(18, 36, 72, 0.5)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #1a3050',
                }}>
                  <p style={{
                    color: '#6b8aaa',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 4px 0',
                  }}>Room Number</p>
                  <p style={{
                    color: '#eaf2ff',
                    fontWeight: 600,
                    fontSize: '20px',
                    margin: 0,
                  }}>Room {currentBooking.room_number}</p>
                </div>
                <div style={{
                  background: 'rgba(18, 36, 72, 0.5)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #1a3050',
                }}>
                  <p style={{
                    color: '#6b8aaa',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 4px 0',
                  }}>Room Type</p>
                  <p style={{
                    color: '#eaf2ff',
                    fontWeight: 600,
                    margin: 0,
                    textTransform: 'capitalize',
                  }}>{currentBooking.room_type || 'Standard'}</p>
                </div>
                <div style={{
                  background: 'rgba(18, 36, 72, 0.5)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #1a3050',
                }}>
                  <p style={{
                    color: '#6b8aaa',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 4px 0',
                  }}>Days Remaining</p>
                  <p style={{
                    color: '#f5a623',
                    fontWeight: 700,
                    fontSize: '20px',
                    margin: 0,
                  }}>{getDaysRemaining(currentBooking.check_out_date)} days</p>
                </div>
              </div>
              
              <div style={{
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #1a3050',
              }}>
                <div>
                  <p style={{
                    color: '#6b8aaa',
                    fontSize: '12px',
                    margin: '0 0 4px 0',
                  }}>Check-in: {formatDate(currentBooking.check_in_date)}</p>
                  <p style={{
                    color: '#6b8aaa',
                    fontSize: '12px',
                    margin: 0,
                  }}>Check-out: {formatDate(currentBooking.check_out_date)}</p>
                </div>
                <button 
                  onClick={() => navigate('/students/my-bookings')}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(245, 166, 35, 0.1)',
                    color: '#f5a623',
                    borderRadius: '8px',
                    border: '1px solid rgba(245, 166, 35, 0.2)',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 166, 35, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 166, 35, 0.1)';
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '48px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏨</div>
              <p style={{ color: '#c8daf0', marginBottom: '8px' }}>No active booking found</p>
              <p style={{ color: '#6b8aaa', fontSize: '14px', marginBottom: '24px' }}>Book a hostel room to start your stay</p>
              <button
                onClick={() => navigate('/students/book-hostels')}
                style={{
                  padding: '8px 24px',
                  background: '#f5a623',
                  color: '#0a1628',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e09515';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5a623';
                }}
              >
                Browse Hostels
              </button>
            </div>
          )}
        </div>

        {/* Events Section */}
        {events.length > 0 && (
          <div style={{
            background: '#0a1628',
            border: '1px solid #1a3050',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '24px',
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #1a3050',
              background: 'rgba(18, 36, 72, 0.3)',
            }}>
              <h2 style={{
                color: '#eaf2ff',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '18px',
                margin: 0,
              }}>
                <span style={{ fontSize: '20px' }}>📅</span> Upcoming Events
              </h2>
              <p style={{
                color: '#6b8aaa',
                fontSize: '12px',
                margin: '4px 0 0 0',
              }}>Stay updated with hostel events</p>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}>
                {events.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <div key={event.id} style={{
                      background: 'rgba(18, 36, 72, 0.5)',
                      border: '1px solid #1a3050',
                      borderRadius: '12px',
                      padding: '16px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#1a3050';
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '24px' }}>{getEventTypeIcon(event.event_type)}</span>
                          <h3 style={{
                            color: '#eaf2ff',
                            fontWeight: 600,
                            fontSize: '14px',
                            margin: 0,
                          }}>{event.title}</h3>
                        </div>
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: status.color.includes('green') ? 'rgba(29, 219, 168, 0.2)' : 
                                     status.color.includes('blue') ? 'rgba(167, 139, 250, 0.2)' : 
                                     'rgba(107, 114, 128, 0.2)',
                          color: status.color.includes('green') ? '#1ddba8' : 
                                 status.color.includes('blue') ? '#a78bfa' : 
                                 '#6b8aaa',
                        }}>
                          {status.label}
                        </span>
                      </div>
                      
                      <p style={{
                        color: '#c8daf0',
                        fontSize: '14px',
                        margin: '0 0 12px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>{event.description}</p>
                      
                      <div style={{
                        paddingTop: '12px',
                        borderTop: '1px solid #1a3050',
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          marginBottom: '4px',
                        }}>
                          <span style={{ color: '#6b8aaa' }}>Start:</span>
                          <span style={{ color: '#c8daf0' }}>{formatEventDate(event.start_date)}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                        }}>
                          <span style={{ color: '#6b8aaa' }}>End:</span>
                          <span style={{ color: '#c8daf0' }}>{formatEventDate(event.end_date)}</span>
                        </div>
                      </div>
                      
                      {event.is_featured && (
                        <div style={{ marginTop: '8px' }}>
                          <span style={{
                            fontSize: '10px',
                            color: '#f5a623',
                            background: 'rgba(245, 166, 35, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                          }}>⭐ Featured Event</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  onClick={() => navigate('/students/allevents')}
                  style={{
                    color: '#f5a623',
                    fontSize: '14px',
                    fontWeight: 500,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#e09515';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#f5a623';
                  }}
                >
                  View All Events →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Route Navigator */}
        <div style={{
          background: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #1a3050',
            background: 'rgba(18, 36, 72, 0.3)',
          }}>
            <h2 style={{
              color: '#eaf2ff',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              margin: 0,
            }}>
              <span style={{ fontSize: '20px' }}>🗺️</span> Route Navigator
            </h2>
            <p style={{
              color: '#6b8aaa',
              fontSize: '12px',
              margin: '4px 0 0 0',
            }}>Find your way to the hostel</p>
          </div>

          <div style={{ padding: '24px' }}>
            {/* Location Actions */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}>
              <button
                onClick={detectLocation}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(245, 166, 35, 0.1)',
                  color: '#f5a623',
                  borderRadius: '8px',
                  border: '1px solid rgba(245, 166, 35, 0.2)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 166, 35, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 166, 35, 0.1)';
                }}
              >
                📍 Auto Detect My Location
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(167, 139, 250, 0.1)',
                  color: '#a78bfa',
                  borderRadius: '8px',
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(167, 139, 250, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)';
                }}
              >
                🔍 Search Location
              </button>
              <button
                onClick={useDefaultLocation}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#c8daf0',
                  borderRadius: '8px',
                  border: '1px solid #1a3050',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
                }}
              >
                📍 Use Default Location (Subedi Gau)
              </button>
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div style={{
                background: 'rgba(18, 36, 72, 0.5)',
                border: '1px solid #1a3050',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                    placeholder="Search for city, area, or landmark..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: '#0a1628',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#f5a623';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#1a3050';
                    }}
                  />
                  <button
                    onClick={searchLocation}
                    disabled={isSearching}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(245, 166, 35, 0.1)',
                      color: '#f5a623',
                      borderRadius: '8px',
                      border: '1px solid rgba(245, 166, 35, 0.2)',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: isSearching ? 'not-allowed' : 'pointer',
                      opacity: isSearching ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSearching) e.currentTarget.style.background = 'rgba(245, 166, 35, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 166, 35, 0.1)';
                    }}
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div style={{
                    marginTop: '8px',
                    maxHeight: '192px',
                    overflowY: 'auto',
                  }}>
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectLocation(result)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          color: '#c8daf0',
                          fontSize: '14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#122448';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {result.place || result.name.substring(0, 100)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Location Status */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}>
              <div style={{
                background: 'rgba(18, 36, 72, 0.5)',
                border: '1px solid #1a3050',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <p style={{
                  color: '#6b8aaa',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '0 0 4px 0',
                }}>📍 Your Location</p>
                {currentLocation ? (
                  <>
                    <p style={{
                      color: '#1ddba8',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      margin: '0 0 4px 0',
                    }}>
                      {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </p>
                    {currentLocation.name && (
                      <p style={{
                        color: '#6b8aaa',
                        fontSize: '12px',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>{currentLocation.name}</p>
                    )}
                  </>
                ) : (
                  <p style={{
                    color: '#f5a623',
                    fontSize: '12px',
                    margin: 0,
                  }}>Click "Auto Detect" or search for your location</p>
                )}
                {locationError && (
                  <p style={{
                    color: '#f87171',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                  }}>{locationError}</p>
                )}
              </div>
              <div style={{
                background: 'rgba(18, 36, 72, 0.5)',
                border: '1px solid #1a3050',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <p style={{
                  color: '#6b8aaa',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '0 0 4px 0',
                }}>🏨 Hostel Location</p>
                {hostelLocation ? (
                  <>
                    <p style={{
                      color: '#f5a623',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      margin: '0 0 4px 0',
                    }}>
                      {hostelLocation.lat.toFixed(6)}, {hostelLocation.lng.toFixed(6)}
                    </p>
                    <p style={{
                      color: '#6b8aaa',
                      fontSize: '12px',
                      margin: 0,
                    }}>{hostelLocation.name}</p>
                  </>
                ) : (
                  <p style={{
                    color: '#6b8aaa',
                    fontSize: '12px',
                    margin: 0,
                  }}>No active booking or coordinates not set</p>
                )}
              </div>
            </div>

            {/* Distance to Hostel */}
            {distance !== null && currentLocation && hostelLocation && (
              <div style={{
                background: 'rgba(245, 166, 35, 0.05)',
                border: '1px solid rgba(245, 166, 35, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <div>
                  <p style={{
                    color: '#6b8aaa',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 4px 0',
                  }}>Distance to Hostel (Straight Line)</p>
                  <p style={{
                    color: '#f5a623',
                    fontSize: '24px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    margin: 0,
                  }}>
                    {distance >= 1000
                      ? `${(distance / 1000).toFixed(2)} km`
                      : `${Math.round(distance)} m`}
                  </p>
                </div>
                <span style={{ fontSize: '32px' }}>📏</span>
              </div>
            )}

            {/* Map */}
            {currentLocation && hostelLocation ? (
              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #1a3050',
                marginBottom: '16px',
              }}>
                <iframe
                  title="Route Map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    Math.min(currentLocation.lng, hostelLocation.lng) - 0.01
                  },${
                    Math.min(currentLocation.lat, hostelLocation.lat) - 0.01
                  },${
                    Math.max(currentLocation.lng, hostelLocation.lng) + 0.01
                  },${
                    Math.max(currentLocation.lat, hostelLocation.lat) + 0.01
                  }&layer=mapnik&marker=${hostelLocation.lat},${hostelLocation.lng}&marker=${currentLocation.lat},${currentLocation.lng}`}
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : (
              <div style={{
                height: '192px',
                background: 'rgba(18, 36, 72, 0.5)',
                border: '1px solid #1a3050',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <p style={{
                  color: '#6b8aaa',
                  fontSize: '14px',
                  textAlign: 'center',
                  margin: 0,
                }}>
                  {!hostelLocation 
                    ? "Book a hostel to see map" 
                    : !currentLocation 
                    ? "Click 'Auto Detect' or search for your location to see route" 
                    : "Getting your location..."}
                </p>
              </div>
            )}

            {/* Google Maps Link */}
            {currentLocation && hostelLocation && (
              <a
                href={`https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${hostelLocation.lat},${hostelLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  color: '#60a5fa',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                }}
              >
                🧭 Open Turn-by-Turn Directions in Google Maps
              </a>
            )}
          </div>
        </div>

        {/* Complaint Updates */}
        {upcomingEvents.length > 0 && (
          <div style={{
            background: '#0a1628',
            border: '1px solid #1a3050',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #1a3050',
            }}>
              <h2 style={{
                color: '#eaf2ff',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '18px',
                margin: 0,
              }}>
                <span style={{ fontSize: '20px' }}>⏰</span> Complaint Updates
              </h2>
            </div>
            <div style={{ padding: '24px' }}>
              {upcomingEvents.map(event => (
                <div key={event.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(26, 48, 80, 0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{event.icon}</span>
                    <div>
                      <p style={{
                        color: '#eaf2ff',
                        fontSize: '14px',
                        margin: 0,
                      }}>{event.title}</p>
                      <p style={{
                        color: '#6b8aaa',
                        fontSize: '12px',
                        margin: 0,
                      }}>{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    color: '#f5a623',
                    background: 'rgba(245, 166, 35, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}>In Progress</span>
                </div>
              ))}
            </div>
          </div>
        )}

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

export default HomePage;