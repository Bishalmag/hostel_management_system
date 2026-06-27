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
          // Filter only upcoming and ongoing events
          const now = new Date();
          const filteredEvents = allEvents
            .filter(e => e.is_active && new Date(e.end_date) >= now)
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
            .slice(0, 5); // Show only latest 5 events
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Welcome Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="text-cyan-400">{user?.full_name?.split(' ')[0] || 'Student'}</span>
            </h1>
            <p className="text-gray-500 text-sm">Here's what's happening with your hostel stay</p>
          </div>
        </div>

        {/* Current Booking Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="text-xl">🏠</span> Your Current Stay
            </h2>
          </div>
          
          {currentBooking ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Hostel / Block</p>
                  <p className="text-white font-semibold mt-1">{currentBooking.block_name || 'N/A'}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Room Number</p>
                  <p className="text-white font-semibold mt-1 text-xl">Room {currentBooking.room_number}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Room Type</p>
                  <p className="text-white font-semibold mt-1 capitalize">{currentBooking.room_type || 'Standard'}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Days Remaining</p>
                  <p className="text-cyan-400 font-bold mt-1 text-xl">{getDaysRemaining(currentBooking.check_out_date)} days</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-800">
                <div>
                  <p className="text-gray-500 text-xs">Check-in: {formatDate(currentBooking.check_in_date)}</p>
                  <p className="text-gray-500 text-xs mt-1">Check-out: {formatDate(currentBooking.check_out_date)}</p>
                </div>
                <button 
                  onClick={() => navigate('/students/my-bookings')}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-medium transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🏨</div>
              <p className="text-gray-400 mb-2">No active booking found</p>
              <p className="text-gray-500 text-sm mb-6">Book a hostel room to start your stay</p>
              <button
                onClick={() => navigate('/students/book-hostels')}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition"
              >
                Browse Hostels
              </button>
            </div>
          )}
        </div>

        {/* Events Section */}
        {events.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span className="text-xl">📅</span> Upcoming Events
              </h2>
              <p className="text-gray-500 text-xs mt-1">Stay updated with hostel events</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <div key={event.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getEventTypeIcon(event.event_type)}</span>
                          <h3 className="text-white font-semibold text-sm">{event.title}</h3>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                      
                      <div className="mt-3 pt-3 border-t border-gray-700 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Start:</span>
                          <span className="text-gray-300">{formatEventDate(event.start_date)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">End:</span>
                          <span className="text-gray-300">{formatEventDate(event.end_date)}</span>
                        </div>
                        {event.location && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">📍</span>
                            <span className="text-gray-300">{event.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.is_featured && (
                        <div className="mt-2">
                          <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">⭐ Featured Event</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/students/allevents')}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition"
                >
                  View All Events →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Route Navigator */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="text-xl">🗺️</span> Route Navigator
            </h2>
            <p className="text-gray-500 text-xs mt-1">Find your way to the hostel</p>
          </div>

          <div className="p-6 space-y-4">

            {/* Location Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={detectLocation}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                📍 Auto Detect My Location
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                🔍 Search Location
              </button>
              <button
                onClick={useDefaultLocation}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                📍 Use Default Location (Subedi Gau)
              </button>
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                    placeholder="Search for city, area, or landmark..."
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={searchLocation}
                    disabled={isSearching}
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-medium transition"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectLocation(result)}
                        className="w-full text-left p-2 hover:bg-gray-700 rounded-lg transition text-sm text-gray-300"
                      >
                        {result.place || result.name.substring(0, 100)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Location Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">📍 Your Location</p>
                {currentLocation ? (
                  <>
                    <p className="text-green-400 text-sm font-mono">
                      {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </p>
                    {currentLocation.name && (
                      <p className="text-gray-500 text-xs mt-1 truncate">{currentLocation.name}</p>
                    )}
                  </>
                ) : (
                  <p className="text-yellow-400 text-xs">Click "Auto Detect" or search for your location</p>
                )}
                {locationError && <p className="text-red-400 text-xs mt-1">{locationError}</p>}
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">🏨 Hostel Location</p>
                {hostelLocation ? (
                  <>
                    <p className="text-cyan-400 text-sm font-mono">
                      {hostelLocation.lat.toFixed(6)}, {hostelLocation.lng.toFixed(6)}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{hostelLocation.name}</p>
                  </>
                ) : (
                  <p className="text-gray-500 text-xs">No active booking or coordinates not set</p>
                )}
              </div>
            </div>

            {/* Distance to Hostel */}
            {distance !== null && currentLocation && hostelLocation && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Distance to Hostel (Straight Line)</p>
                  <p className="text-cyan-400 text-2xl font-bold font-mono mt-1">
                    {distance >= 1000
                      ? `${(distance / 1000).toFixed(2)} km`
                      : `${Math.round(distance)} m`}
                  </p>
                </div>
                <span className="text-4xl">📏</span>
              </div>
            )}

            {/* Map */}
            {currentLocation && hostelLocation ? (
              <div className="rounded-xl overflow-hidden border border-gray-700">
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
              <div className="h-48 bg-gray-800/50 border border-gray-700 rounded-xl flex items-center justify-center">
                <p className="text-gray-600 text-sm text-center">
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
                className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                🧭 Open Turn-by-Turn Directions in Google Maps
              </a>
            )}
          </div>
        </div>

        {/* Complaint Updates */}
        {upcomingEvents.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span className="text-xl">⏰</span> Complaint Updates
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{event.icon}</span>
                    <div>
                      <p className="text-white text-sm">{event.title}</p>
                      <p className="text-gray-500 text-xs">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">In Progress</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HomePage;