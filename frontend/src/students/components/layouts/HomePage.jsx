import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../components/Auth";

const ActionCard = ({ title, icon, onClick, description }) => (
  <button
    onClick={onClick}
    className="group bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 text-left hover:shadow-lg hover:shadow-cyan-500/20"
  >
    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
    {description && <p className="text-gray-400 text-xs">{description}</p>}
  </button>
);

const StudentHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    registeredStudents: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    allocatedStudents: 0
  });
  const [rooms, setRooms] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingRes, notifRes, hostelRes, roomsRes, studentsRes] = await Promise.all([
          api.get("/bookings/bookings/"),
          api.get("/notifications/"),
          api.get("/hostel/hostels/"),
          api.get("/hostel/rooms/"),
          api.get("/students/"),
        ]);

        const bookings = bookingRes.data.results ?? bookingRes.data;
        const currentBooking = bookings.find(b => b.status === 'approved' || b.status === 'confirmed');
        
        setBooking(currentBooking || null);
        setNotifications(notifRes.data.results ?? notifRes.data);
        setHostels(hostelRes.data.results ?? hostelRes.data);
        
        const allRooms = roomsRes.data.results ?? roomsRes.data;
        setRooms(allRooms);
        
        const allStudents = studentsRes.data.results ?? studentsRes.data;
        
        // Calculate stats
        const totalRooms = allRooms.length;
        const occupiedRooms = allRooms.filter(r => r.current_occupancy > 0).length;
        const availableRooms = allRooms.filter(r => r.current_occupancy < r.capacity).length;
        const totalCapacity = allRooms.reduce((sum, r) => sum + r.capacity, 0);
        const currentOccupancy = allRooms.reduce((sum, r) => sum + r.current_occupancy, 0);
        
        setStats({
          totalRooms,
          registeredStudents: allStudents.length,
          availableRooms,
          occupiedRooms,
          allocatedStudents: currentOccupancy
        });
        
        // Generate recent activities from bookings and complaints
        const activities = [];
        
        // Add recent bookings
        bookings.slice(0, 5).forEach(b => {
          activities.push({
            id: `booking-${b.id}`,
            type: 'booking',
            title: 'New Booking',
            description: `Room ${b.room} booked`,
            date: b.created_at,
            icon: '📅'
          });
        });
        
        // Add recent complaints from localStorage or API
        try {
          const complaintsRes = await api.get("/complaints/");
          const complaints = complaintsRes.data.results || complaintsRes.data;
          complaints.slice(0, 5).forEach(c => {
            activities.push({
              id: `complaint-${c.id}`,
              type: 'complaint',
              title: 'Complaint Registered',
              description: c.title,
              date: c.created_at,
              icon: '⚠️'
            });
          });
        } catch (e) {
          console.log('No complaints data');
        }
        
        // Sort by date and get latest 5
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivities(activities.slice(0, 5));
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysLeft = () => {
    const semesterEnd = new Date(2025, 11, 24); // December 24, 2025
    const today = new Date();
    const diffTime = semesterEnd - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.floor_number || 'Other';
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* WELCOME BACK SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-r from-cyan-600/20 via-indigo-600/20 to-purple-600/20 border border-cyan-500/30 rounded-3xl p-8 md:p-12">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>   
          <div className="relative z-10">
            <p className="text-cyan-400 text-sm font-medium mb-2">Welcome back,</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              {user?.full_name ?? "Student"} 👋
            </h1>
            
            <div className="mt-6 flex flex-wrap gap-6">
              <div>
                <p className="text-gray-400 text-sm">2026-2027 Academic Year</p>
                <p className="text-white font-semibold">Semester Two</p>
              </div>
              <div className="w-px h-10 bg-gray-700"></div>
              <div>
                <p className="text-gray-400 text-sm">Started: December 05, 2025</p>
                <p className="text-gray-400 text-sm">Ends: December 24, 2025</p>
              </div>
              <div className="w-px h-10 bg-gray-700"></div>
              <div>
                <p className="text-gray-400 text-sm">DAYS LEFT</p>
                <p className="text-3xl font-bold text-cyan-400">{getDaysLeft()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Total Rooms</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalRooms}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Registered Students</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.registeredStudents}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Available Rooms</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{stats.availableRooms}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Occupied Rooms</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.occupiedRooms}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Allocated Students</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{stats.allocatedStudents}</p>
          </div>
        </div>

        {/* ROOMS STATUS SECTION */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-bold">Rooms Status</h2>
            <p className="text-gray-500 text-sm">Real-time Room Status</p>
          </div>
          
          <div className="space-y-6">
            {Object.entries(roomsByFloor).map(([floor, floorRooms]) => (
              <div key={floor} className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-cyan-400 font-semibold mb-4">{floor} Floor</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {floorRooms.slice(0, 8).map((room) => (
                    <div key={room.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold">ROOM {room.room_number}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          room.current_occupancy >= room.capacity 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {room.current_occupancy >= room.capacity ? 'OCCUPIED' : 'AVAILABLE'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {room.current_occupancy >= room.capacity 
                          ? 'Available Spots: Full' 
                          : `Available Spots: ${room.capacity - room.current_occupancy}`}
                      </p>
                      {room.current_occupancy === 0 && (
                        <p className="text-gray-500 text-xs mt-2">No Occupants</p>
                      )}
                      <p className="text-gray-500 text-xs mt-2">Capacity: {room.capacity}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TWO COLUMN LAYOUT FOR RECENT ACTIVITY AND CALENDAR */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* RECENT ACTIVITY */}
          <section className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-xl font-bold">Recent Activity</h2>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                  View All →
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-800 last:border-0">
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-white font-medium">{activity.title}</h4>
                          <span className="text-gray-500 text-xs">
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* CALENDAR SECTION */}
          <section>
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white text-xl font-bold mb-4">Calendar</h2>
              
              {/* Mini Calendar */}
              <div className="text-center">
                <div className="flex justify-between items-center mb-4">
                  <button className="text-gray-400 hover:text-white p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="text-white font-medium">December 2025</h3>
                  <button className="text-gray-400 hover:text-white p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-gray-500 text-xs py-1">{day}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {[30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3].slice(0, 35).map((date, idx) => {
                    const isCurrentMonth = date >= 1 && date <= 31;
                    const isToday = date === 15 && isCurrentMonth;
                    const isEvent = date === 5 || date === 24;
                    
                    return (
                      <div
                        key={idx}
                        className={`text-center py-2 rounded-lg text-sm ${
                          !isCurrentMonth ? 'text-gray-600' : 'text-gray-300'
                        } ${isToday ? 'bg-cyan-500/20 text-cyan-400 font-bold' : ''} ${
                          isEvent ? 'bg-indigo-500/20 text-indigo-400' : ''
                        } hover:bg-gray-800 cursor-pointer transition-colors`}
                      >
                        {date}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Upcoming Events */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-3">Upcoming Events</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-400 text-xs">5</span>
                    </div>
                    <div>
                      <p className="text-white text-sm">Semester Starts</p>
                      <p className="text-gray-500 text-xs">December 5, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-cyan-400 text-xs">24</span>
                    </div>
                    <div>
                      <p className="text-white text-sm">Semester Ends</p>
                      <p className="text-gray-500 text-xs">December 24, 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionCard
            title="Book Hostel"
            icon="🏨"
            onClick={() => navigate("/students/book-hostels")}
            description="Find and book available rooms"
          />
          <ActionCard
            title="My Bookings"
            icon="📋"
            onClick={() => navigate("/students/my-bookings")}
            description="View your booking history"
          />
          <ActionCard
            title="Register Complaint"
            icon="⚠️"
            onClick={() => navigate("/students/complaints/new")}
            description="Report an issue"
          />
          <ActionCard
            title="Pay Rent"
            icon="💰"
            onClick={() => navigate("/students/pay-rent")}
            description="Pay your monthly rent"
          />
        </div>

      </div>
    </div>
  );
};

export default StudentHomePage;