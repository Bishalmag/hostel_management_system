import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AdminHomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHostels: 0,
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalStudents: 0,
    pendingBookings: 0,
    pendingComplaints: 0,
    occupancyRate: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [hostelsRes, roomsRes, studentsRes, bookingsRes, complaintsRes] = await Promise.all([
          api.get('/hostel/hostels/'),
          api.get('/hostel/rooms/'),
          api.get('/students/'),
          api.get('/bookings/bookings/'),
          api.get('/complaints/'),  // Fixed: removed duplicate 'complaints'
        ]);

        const hostels = hostelsRes.data.results ?? hostelsRes.data;
        const rooms = roomsRes.data.results ?? roomsRes.data;
        const students = studentsRes.data.results ?? studentsRes.data;
        const bookings = bookingsRes.data.results ?? bookingsRes.data;
        const complaints = complaintsRes.data.results ?? complaintsRes.data;

        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.current_occupancy > 0).length;
        const availableRooms = rooms.filter(r => r.current_occupancy < r.capacity).length;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
        
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;
        const pendingComplaints = complaints.filter(c => c.status === 'registered').length;
        
        // Get recent bookings (last 5)
        const recent = [...bookings]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        
        // Get recent complaints (last 5)
        const recentComp = [...complaints]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        // Create calendar events from bookings and complaints
        const calendarEvents = [
          ...bookings.map(b => ({
            date: b.check_in_date,
            title: `Booking: Room ${b.room}`,
            type: 'booking'
          })),
          ...complaints.map(c => ({
            date: c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            title: `Complaint: ${c.title}`,
            type: 'complaint'
          }))
        ];
        
        setEvents(calendarEvents);

        setStats({
          totalHostels: hostels.length,
          totalRooms,
          availableRooms,
          occupiedRooms,
          totalStudents: students.length,
          pendingBookings,
          pendingComplaints,
          occupancyRate,
        });
        
        setRecentBookings(recent);
        setRecentComplaints(recentComp);
        
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const hasEventOnDate = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isToday = (day) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      registered: 'bg-yellow-500/20 text-yellow-400',
      in_progress: 'bg-blue-500/20 text-blue-400',
      resolved: 'bg-green-500/20 text-green-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600/20 via-indigo-600/20 to-purple-600/20 border border-cyan-500/30 rounded-2xl p-8">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, Admin 👋
          </h1>
          <p className="text-gray-400">Here's what's happening with your hostel management system today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-xl">🏨</div>
            <span className="text-2xl font-bold text-white">{stats.totalHostels}</span>
          </div>
          <p className="text-gray-400 text-sm">Total Hostels</p>
          <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full w-full bg-cyan-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-xl">🚪</div>
            <span className="text-2xl font-bold text-white">{stats.totalRooms}</span>
          </div>
          <p className="text-gray-400 text-sm">Total Rooms</p>
          <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-purple-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-xl">🎓</div>
            <span className="text-2xl font-bold text-white">{stats.totalStudents}</span>
          </div>
          <p className="text-gray-400 text-sm">Registered Students</p>
          <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-xl">📊</div>
            <span className="text-2xl font-bold text-white">{stats.occupancyRate}%</span>
          </div>
          <p className="text-gray-400 text-sm">Occupancy Rate</p>
          <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full bg-orange-500 rounded-full`} style={{ width: `${stats.occupancyRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Available Rooms</p>
              <p className="text-2xl font-bold text-green-400">{stats.availableRooms}</p>
            </div>
            <div className="text-3xl">🟢</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Out of {stats.totalRooms} total rooms</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Occupied Rooms</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.occupiedRooms}</p>
            </div>
            <div className="text-3xl">🟡</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Currently occupied rooms</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Actions</p>
              <p className="text-2xl font-bold text-red-400">{stats.pendingBookings + stats.pendingComplaints}</p>
            </div>
            <div className="text-3xl">🔴</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats.pendingBookings} bookings, {stats.pendingComplaints} complaints</p>
        </div>
      </div>

      {/* Calendar and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Calendar</h2>
              <button
                onClick={goToToday}
                className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 bg-cyan-500/10 rounded-lg"
              >
                Today
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-white font-medium">
                {monthNames[month]} {year}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="text-center py-2 text-xs text-gray-600"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = hasEventOnDate(year, month, day);
                const isCurrentDay = isToday(day);
                
                return (
                  <div
                    key={day}
                    className={`
                      text-center py-2 text-xs rounded-lg relative
                      ${isCurrentDay ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-gray-300 hover:bg-gray-800'}
                      cursor-pointer transition
                    `}
                  >
                    {day}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 2).map((event, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              event.type === 'booking' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            title={event.title}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500">Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-500">Complaint</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                <span className="text-xs text-gray-500">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Bookings */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-white font-semibold">Recent Bookings</h2>
              <button onClick={() => navigate('/admin/bookings')} className="text-cyan-400 text-xs hover:underline">
                View All →
              </button>
            </div>
            <div className="divide-y divide-gray-800">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm">Booking #{booking.id}</p>
                      <p className="text-gray-500 text-xs">Room: {booking.room}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">No recent bookings</div>
              )}
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-white font-semibold">Recent Complaints</h2>
              <button onClick={() => navigate('/admin/complaints')} className="text-cyan-400 text-xs hover:underline">
                View All →
              </button>
            </div>
            <div className="divide-y divide-gray-800">
              {recentComplaints.length > 0 ? (
                recentComplaints.map((complaint) => (
                  <div key={complaint.id} className="px-6 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-sm">{complaint.title}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(complaint.status)}`}>
                        {complaint.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs truncate">{complaint.description}</p>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">No recent complaints</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;