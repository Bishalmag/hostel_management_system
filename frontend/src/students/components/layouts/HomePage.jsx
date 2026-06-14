import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../components/Auth";

// ---------- DIJKSTRA'S ALGORITHM IMPLEMENTATION ----------
class Graph {
  constructor() {
    this.nodes = new Map();
  }

  addNode(nodeId, nodeData) {
    this.nodes.set(nodeId, { ...nodeData, edges: [] });
  }

  addEdge(fromNode, toNode, weight) {
    const from = this.nodes.get(fromNode);
    const to = this.nodes.get(toNode);
    if (from && to) {
      from.edges.push({ node: toNode, weight });
      to.edges.push({ node: fromNode, weight });
    }
  }

  // Dijkstra's Algorithm - finds shortest path from start to end
  findShortestPath(startNode, endNode) {
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();
    const visitedOrder = [];

    // Initialize distances
    for (const [nodeId] of this.nodes) {
      distances.set(nodeId, Infinity);
      unvisited.add(nodeId);
    }
    distances.set(startNode, 0);

    while (unvisited.size > 0) {
      // Find node with smallest distance
      let current = null;
      let smallestDistance = Infinity;
      for (const nodeId of unvisited) {
        const dist = distances.get(nodeId);
        if (dist < smallestDistance) {
          smallestDistance = dist;
          current = nodeId;
        }
      }

      if (current === null || current === endNode) break;

      unvisited.delete(current);
      visitedOrder.push(current);
      
      const currentNode = this.nodes.get(current);

      for (const edge of currentNode.edges) {
        const alt = distances.get(current) + edge.weight;
        if (alt < distances.get(edge.node)) {
          distances.set(edge.node, alt);
          previous.set(edge.node, current);
        }
      }
    }

    // Reconstruct path
    const path = [];
    let current = endNode;
    while (current !== startNode && previous.has(current)) {
      path.unshift(current);
      current = previous.get(current);
    }
    path.unshift(startNode);

    return {
      path,
      totalDistance: distances.get(endNode),
      visitedNodes: visitedOrder.length,
      algorithmName: "Dijkstra's Algorithm"
    };
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  getAllNodes() {
    return Array.from(this.nodes.keys());
  }
}

// Initialize the hostel internal map graph
const initializeHostelGraph = () => {
  const graph = new Graph();

  // Define nodes (locations within the hostel)
  const locations = {
    main_gate: { name: "Main Gate", type: "entry", lat: 27.7429, lng: 85.4360 },
    reception: { name: "Reception", type: "service", lat: 27.7430, lng: 85.4361 },
    block_a: { name: "Block A", type: "block", lat: 27.7431, lng: 85.4362 },
    block_b: { name: "Block B", type: "block", lat: 27.7432, lng: 85.4363 },
    block_c: { name: "Block C", type: "block", lat: 27.7433, lng: 85.4364 },
    mess_hall: { name: "Mess Hall", type: "facility", lat: 27.7434, lng: 85.4365 },
    library: { name: "Library", type: "facility", lat: 27.7435, lng: 85.4366 },
    gym: { name: "Gym", type: "facility", lat: 27.7436, lng: 85.4367 },
    warden_office: { name: "Warden's Office", type: "admin", lat: 27.7437, lng: 85.4368 },
    medical_room: { name: "Medical Room", type: "emergency", lat: 27.7438, lng: 85.4369 },
    parking: { name: "Parking Area", type: "facility", lat: 27.7439, lng: 85.4370 },
    laundry: { name: "Laundry Room", type: "facility", lat: 27.7440, lng: 85.4371 },
  };

  // Add nodes to graph
  Object.entries(locations).forEach(([id, data]) => {
    graph.addNode(id, data);
  });

  // Define edges (hallways/paths with distances in meters)
  const edges = [
    { from: "main_gate", to: "reception", weight: 15 },
    { from: "reception", to: "block_a", weight: 25 },
    { from: "reception", to: "block_b", weight: 30 },
    { from: "reception", to: "block_c", weight: 35 },
    { from: "reception", to: "warden_office", weight: 40 },
    { from: "block_a", to: "mess_hall", weight: 20 },
    { from: "block_b", to: "mess_hall", weight: 20 },
    { from: "block_c", to: "mess_hall", weight: 20 },
    { from: "block_a", to: "library", weight: 30 },
    { from: "block_b", to: "gym", weight: 25 },
    { from: "block_c", to: "medical_room", weight: 15 },
    { from: "mess_hall", to: "laundry", weight: 35 },
    { from: "library", to: "gym", weight: 40 },
    { from: "parking", to: "main_gate", weight: 10 },
    { from: "laundry", to: "parking", weight: 25 },
  ];

  edges.forEach(edge => {
    graph.addEdge(edge.from, edge.to, edge.weight);
  });

  return { graph, locations };
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentBooking, setCurrentBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // Location states
  const [hostelLocation, setHostelLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [distance, setDistance] = useState(null);
  
  // Dijkstra pathfinding states
  const [hostelGraph, setHostelGraph] = useState(null);
  const [hostelLocations, setHostelLocations] = useState(null);
  const [shortestPath, setShortestPath] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState("mess_hall");
  const [showPathfinding, setShowPathfinding] = useState(false);
  const [pathfindingStatus, setPathfindingStatus] = useState("");

  // Default location (Subedi Gau)
  const DEFAULT_LOCATION = {
    lat: 27.7429167,
    lng: 85.4360556,
    name: "Subedi Gau"
  };

  // Initialize graph on component mount
  useEffect(() => {
    const { graph, locations } = initializeHostelGraph();
    setHostelGraph(graph);
    setHostelLocations(locations);
  }, []);

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
        
        const complaintsRes = await api.get("/complaints/");
        const complaints = complaintsRes.data.results ?? complaintsRes.data;
        
        const events = complaints
          .filter(c => c.status === "in_progress")
          .map(c => ({
            id: `complaint-${c.id}`,
            title: `Complaint Update: ${c.title}`,
            date: c.updated_at,
            icon: "⚠️",
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);
        
        setUpcomingEvents(events);
        
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

  // ---------------- FIND SHORTEST PATH USING DIJKSTRA ----------------
  const findShortestPathToDestination = () => {
    if (!hostelGraph) {
      setPathfindingStatus("Graph not initialized");
      return;
    }

    setPathfindingStatus("🧮 Running Dijkstra's Algorithm to find shortest path...");
    setShowPathfinding(true);

    // Simulate algorithm processing (for UI feedback)
    setTimeout(() => {
      const startNode = "main_gate";
      const endNode = selectedDestination;
      
      const result = hostelGraph.findShortestPath(startNode, endNode);
      
      if (result.totalDistance < Infinity) {
        setShortestPath(result);
        setPathfindingStatus(
          `✅ Shortest path found! Distance: ${result.totalDistance} meters | ` +
          `Algorithm: ${result.algorithmName} | Nodes visited: ${result.visitedNodes}`
        );
      } else {
        setPathfindingStatus("❌ No path found to destination");
      }
    }, 500);
  };

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

        {/* Route Navigator with Dijkstra's Algorithm */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="text-xl">🗺️</span> Dijkstra's Algorithm - Shortest Path Routing
            </h2>
            <p className="text-gray-500 text-xs mt-1">Finds the optimal route using Dijkstra's shortest path algorithm</p>
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

            {/* Dijkstra's Algorithm - Internal Pathfinding */}
            <div className="border-t border-gray-800 pt-4 mt-2">
              <h3 className="text-cyan-400 text-sm font-semibold mb-3">🧮 Internal Pathfinding (Dijkstra's Algorithm)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Select Destination within Hostel:</label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  >
                    {hostelLocations && Object.entries(hostelLocations).map(([id, loc]) => (
                      <option key={id} value={id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={findShortestPathToDestination}
                    className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition"
                  >
                    🚀 Find Shortest Path (Dijkstra)
                  </button>
                </div>
              </div>

              {pathfindingStatus && (
                <div className="bg-gray-800/30 rounded-lg p-3 mb-3">
                  <p className="text-xs text-cyan-400">{pathfindingStatus}</p>
                </div>
              )}

              {shortestPath && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-400 text-sm font-semibold mb-2">✓ Shortest Path Result</h4>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {shortestPath.path.map((node, idx) => (
                        <React.Fragment key={node}>
                          <span className="text-white text-xs px-2 py-1 bg-gray-800 rounded">
                            {hostelLocations?.[node]?.name || node}
                          </span>
                          {idx < shortestPath.path.length - 1 && (
                            <span className="text-gray-500">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-green-500/30">
                      <span className="text-gray-400">Total Distance</span>
                      <span className="text-green-400 font-bold">{shortestPath.totalDistance} meters</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Algorithm</span>
                      <span className="text-cyan-400">{shortestPath.algorithmName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Nodes Visited</span>
                      <span className="text-cyan-400">{shortestPath.visitedNodes} locations</span>
                    </div>
                  </div>
                </div>
              )}
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

            {/* Algorithm Explanation */}
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
              <details className="cursor-pointer">
                <summary className="text-cyan-400 text-xs font-medium">ℹ️ How Dijkstra's Algorithm Works</summary>
                <div className="mt-2 text-gray-400 text-xs space-y-2">
                  <p>Dijkstra's Algorithm finds the shortest path between nodes in a weighted graph:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Initialize distances from source to all nodes as infinity, source distance = 0</li>
                    <li>Mark all nodes as unvisited</li>
                    <li>Select unvisited node with smallest distance (current node)</li>
                    <li>For each neighbor, calculate alternative distance = current distance + edge weight</li>
                    <li>If alternative distance is smaller, update the neighbor's distance</li>
                    <li>Mark current node as visited and repeat until destination is reached</li>
                  </ol>
                  <p className="text-gray-500 mt-2">Time Complexity: O(V²) or O(E log V) with priority queue</p>
                  <p className="text-gray-500">Space Complexity: O(V)</p>
                </div>
              </details>
            </div>

            {/* Google Maps Link (Optional) */}
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Announcements */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span className="text-xl">📢</span> Announcements
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-800">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-lg">📅</div>
                <div>
                  <p className="text-white text-sm font-medium">Semester Break</p>
                  <p className="text-gray-500 text-xs">Hostel will remain open during break</p>
                  <p className="text-gray-600 text-xs mt-1">December 25 - January 5</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-gray-800">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center text-lg">🔧</div>
                <div>
                  <p className="text-white text-sm font-medium">Maintenance Notice</p>
                  <p className="text-gray-500 text-xs">Water supply maintenance on Sunday</p>
                  <p className="text-gray-600 text-xs mt-1">December 22, 9:00 AM - 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-lg">🎉</div>
                <div>
                  <p className="text-white text-sm font-medium">Year End Party</p>
                  <p className="text-gray-500 text-xs">Hostel celebration at common hall</p>
                  <p className="text-gray-600 text-xs mt-1">December 28, 7:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span className="text-xl">💬</span> Need Help?
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-lg">👨‍💼</div>
                  <div>
                    <p className="text-white text-sm font-medium">Hostel Warden</p>
                    <p className="text-gray-500 text-xs">Mr. Rajesh Kumar</p>
                    <p className="text-gray-600 text-xs mt-1">+91 98765 43210</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-lg">🛠️</div>
                  <div>
                    <p className="text-white text-sm font-medium">Maintenance Team</p>
                    <p className="text-gray-500 text-xs">24/7 Support Available</p>
                    <p className="text-gray-600 text-xs mt-1">+91 98765 43211</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-lg">🚨</div>
                  <div>
                    <p className="text-white text-sm font-medium">Emergency</p>
                    <p className="text-gray-500 text-xs">Security / Medical Emergency</p>
                    <p className="text-gray-600 text-xs mt-1">+91 98765 43212</p>
                  </div>
                </div>
              </div>
            </div>
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