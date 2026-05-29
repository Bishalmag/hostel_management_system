import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

/* ---------------- STAT CARD ---------------- */
const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'from-blue-500/15 border-blue-500/20 text-blue-400',
    green: 'from-green-500/15 border-green-500/20 text-green-400',
    orange: 'from-orange-500/15 border-orange-500/20 text-orange-400',
    purple: 'from-purple-500/15 border-purple-500/20 text-purple-400',
    red: 'from-red-500/15 border-red-500/20 text-red-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold">{value ?? 0}</span>
      </div>
      <p className="text-xs text-gray-500 mt-2 uppercase">{label}</p>
    </div>
  );
};

/* ---------------- MAIN DASHBOARD ---------------- */
const AdminHomePage = () => {
  const [stats, setStats] = useState({
    employees: 0,
    students: 0,
    rooms: 0,
    hostels: 0,
  });

  const [loading, setLoading] = useState(true);

  const notices = [
    { id: 1, text: 'Happy New Year Celebration', date: '27 Feb 2015 03:35 PM' },
    { id: 2, text: 'Hostel Meeting Announcement', date: '21 Feb 2015 03:34 PM' },
    { id: 3, text: 'Maintenance Notice', date: 'Today 10:00 AM' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hostelsRes, roomsRes, studentsRes] = await Promise.all([
          api.get('/hostel/hostels/'),
          api.get('/hostel/rooms/'),
          api.get('/students/'),
        ]);

        const hostels = hostelsRes.data.results ?? hostelsRes.data;
        const rooms = roomsRes.data.results ?? roomsRes.data;
        const students = studentsRes.data.results ?? studentsRes.data;

        setStats({
          employees: 2,
          hostels: hostels.length,
          rooms: rooms.length,
          students: students.length,
        });
      } catch (err) {
        console.log('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-gray-400 p-6">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm">Hostel Management Overview</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon="👨‍💼" label="Total Employees" value={stats.employees} color="blue" />
        <StatCard icon="🎓" label="Students" value={stats.students} color="green" />
        <StatCard icon="🏠" label="Hostels" value={stats.hostels} color="orange" />
        <StatCard icon="🚪" label="Rooms" value={stats.rooms} color="purple" />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* NOTICE BOARD */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-white font-semibold">Notice Board</h2>
          </div>

          <div className="p-4 space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-gray-800 rounded-lg p-3 flex justify-between"
              >
                <div>
                  <p className="text-white text-sm">{n.text}</p>
                  <p className="text-gray-500 text-xs">{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CALENDAR */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-3">Calendar</h2>

          <div className="text-center text-gray-400">
            <p className="text-sm mb-2">September 2018</p>

            <div className="grid grid-cols-7 gap-1 text-xs">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className="text-gray-500">{d}</div>
              ))}

              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className={`p-1 rounded ${
                    i + 1 === 27 ? 'bg-red-500 text-white' : ''
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminHomePage;