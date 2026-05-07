import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockHostels = [
  {
    id: 1, name: 'Rosewood Hostel', address: 'North Campus, Block A',
    rooms: 50, available: 12, rating: 4.5, price: 2500,
    type: 'Mixed', amenities: ['WiFi', 'Laundry', 'Gym', 'Mess'],
  },
  {
    id: 2, name: 'Maple Hall', address: 'East Campus, Block B',
    rooms: 40, available: 8, rating: 4.2, price: 2200,
    type: 'Boys', amenities: ['WiFi', 'Mess', 'Study Room'],
  },
  {
    id: 3, name: 'Pine Valley', address: 'South Campus, Block C',
    rooms: 60, available: 25, rating: 4.7, price: 2800,
    type: 'Girls', amenities: ['WiFi', 'Laundry', 'Mess', 'Recreation'],
  },
];

const mockNotices = [
  {
    id: 1, title: 'Mess Timings Updated', date: '2026-04-15',
    tag: 'Mess', tagColor: 'cyan',
    content: 'Breakfast will now be served from 7:00 AM to 9:00 AM.',
  },
  {
    id: 2, title: 'Maintenance Notice', date: '2026-04-14',
    tag: 'Maintenance', tagColor: 'yellow',
    content: 'Water supply will be interrupted in Wing B tomorrow from 10 AM to 2 PM.',
  },
  {
    id: 3, title: 'Cultural Event', date: '2026-04-20',
    tag: 'Event', tagColor: 'purple',
    content: 'Annual cultural fest on 20th April. All residents are welcome.',
  },
];

const tagColorMap = {
  cyan:   'bg-cyan-500/10   text-cyan-400   border-cyan-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  green:  'bg-green-500/10  text-green-400  border-green-500/20',
};

// ─── Helper Components ────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, color }) => {
  const variants = {
    cyan:   'from-cyan-500/15 to-transparent border-cyan-500/20   text-cyan-400',
    indigo: 'from-indigo-500/15 to-transparent border-indigo-500/20 text-indigo-400',
    green:  'from-green-500/15 to-transparent border-green-500/20  text-green-400',
    yellow: 'from-yellow-500/15 to-transparent border-yellow-500/20 text-yellow-400',
  };
  return (
    <div className={`bg-gradient-to-br ${variants[color]} border rounded-xl p-4 flex flex-col items-center gap-2`}>
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold font-mono text-white">{value}</p>
      <p className="text-xs text-gray-500 tracking-wide uppercase">{label}</p>
    </div>
  );
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map((s) => (
      <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-xs text-gray-500 ml-1">{rating}</span>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const StudentHomePage = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooking({
        hostel: mockHostels[0],
        roomNumber: '305',
        floor: '3rd Floor, Block A',
        checkIn: '2026-04-01',
        checkOut: '2026-05-31',
        status: 'Active',
        roomType: 'Shared',
        capacity: 2,
        occupancy: 2,
      });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = activeTab === 'all'
    ? mockHostels
    : mockHostels.filter((h) => h.type.toLowerCase() === activeTab);

  const totalRooms = mockHostels.reduce((s, h) => s + h.rooms, 0);
  const totalAvailable = mockHostels.reduce((s, h) => s + h.available, 0);
  const avgRating = (mockHostels.reduce((s, h) => s + h.rating, 0) / mockHostels.length).toFixed(1);

  return (
    <div className="w-full bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Header Section ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase">Welcome Back</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Hi, <span className="text-cyan-400">Aakash</span> 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/maintenance/new')}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-all">
                + Maintenance
              </button>
              <button onClick={() => navigate('/complaints/new')}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 transition-all">
                + Complaint
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick Stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🏨" label="Total Hostels" value={mockHostels.length} color="cyan" />
          <StatCard icon="🚪" label="Total Rooms" value={totalRooms} color="indigo" />
          <StatCard icon="✅" label="Available Rooms" value={totalAvailable} color="green" />
          <StatCard icon="⭐" label="Average Rating" value={avgRating} color="yellow" />
        </div>

        {/* ── Current Booking Card ──────────────────────────────────────── */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Your Current Booking
            </h2>
            {booking && (
              <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-medium">
                {booking.status}
              </span>
            )}
          </div>

          {loading ? (
            <div className="px-6 py-12 flex items-center justify-center gap-3 text-gray-600">
              <svg className="w-5 h-5 animate-spin text-cyan-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm">Loading booking...</span>
            </div>
          ) : booking ? (
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Hostel', value: booking.hostel.name },
                  { label: 'Room', value: booking.roomNumber },
                  { label: 'Location', value: booking.floor },
                  { label: 'Check-in', value: booking.checkIn },
                  { label: 'Check-out', value: booking.checkOut },
                  { label: 'Room Type', value: `${booking.roomType} (${booking.occupancy}/${booking.capacity})` },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-800/50 rounded-lg px-4 py-3 border border-gray-700">
                    <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-white font-mono truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Occupancy bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-600">Room Occupancy</span>
                  <span className="text-xs text-gray-500 font-mono">{booking.occupancy}/{booking.capacity}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${(booking.occupancy / booking.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <button onClick={() => navigate('/bookings')}
                className="w-full py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 text-sm font-medium transition-all">
                View Full Booking Details →
              </button>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-3xl">🏠</div>
              <p className="text-sm text-gray-500 mb-4">No active bookings found.</p>
              <Link to="/hostels"
                className="inline-block px-6 py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-all">
                Browse Hostels
              </Link>
            </div>
          )}
        </section>

        {/* ── Available Hostels Section ────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Available Hostels</h2>
            <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1">
              {['all', 'boys', 'girls', 'mixed'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((hostel) => (
              <div key={hostel.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group flex flex-col">

                {/* Card Header */}
                <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden flex items-end p-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-indigo-500/5" />
                  <div className="relative flex items-center justify-between w-full">
                    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                      hostel.type === 'Boys'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : hostel.type === 'Girls'
                        ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    }`}>
                      {hostel.type}
                    </span>
                    <span className="text-sm font-bold text-white font-mono">
                      ₹{hostel.price.toLocaleString()}<span className="text-gray-500 text-xs font-normal">/mo</span>
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div>
                    <h3 className="font-semibold text-white text-base">{hostel.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {hostel.address}
                    </p>
                  </div>

                  <StarRating rating={hostel.rating} />

                  {/* Availability */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-600">Availability</span>
                      <span className="text-xs text-gray-500 font-mono">{hostel.available}/{hostel.rooms}</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                        style={{ width: `${(hostel.available / hostel.rooms) * 100}%` }} />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2">
                    {hostel.amenities.map((a) => (
                      <span key={a} className="text-xs px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-500">
                        {a}
                      </span>
                    ))}
                  </div>

                  <Link to={`/hostel/${hostel.id}`}
                    className="mt-auto pt-3 block text-center py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-cyan-500/20 border border-gray-700 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-400 transition-all">
                    View Details & Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Notice Board Section ──────────────────────────────────────── */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Notice Board</h2>
            <Link to="/notices" className="text-xs text-gray-600 hover:text-cyan-400 transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-800">
            {mockNotices.map((notice) => (
              <div key={notice.id} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-lg flex-shrink-0">
                    {notice.tag === 'Mess' ? '🍽️' : notice.tag === 'Maintenance' ? '🔧' : '🎉'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-medium text-white">{notice.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tagColorMap[notice.tagColor]}`}>
                        {notice.tag}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{notice.content}</p>
                    <p className="text-xs text-gray-600 font-mono mt-2">{notice.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default StudentHomePage;