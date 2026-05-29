import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../components/Auth";

const StatCard = ({ icon, label, value, color }) => {
  const variants = {
    cyan:   "from-cyan-500/15 to-transparent border-cyan-500/20 text-cyan-400",
    indigo: "from-indigo-500/15 to-transparent border-indigo-500/20 text-indigo-400",
    green:  "from-green-500/15 to-transparent border-green-500/20 text-green-400",
    yellow: "from-yellow-500/15 to-transparent border-yellow-500/20 text-yellow-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${variants[color]} border rounded-xl p-4 flex flex-col items-center gap-2`}
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold text-white">{value ?? "—"}</p>
      <p className="text-xs text-gray-500 uppercase">{label}</p>
    </div>
  );
};

const StudentHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hostels, setHostels] = useState([]);
  const [booking, setBooking] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [hostelRes, notifRes, bookingRes] = await Promise.all([
          api.get("/hostel/hostels/"),
          api.get("/notifications/"),
          api.get("/bookings/bookings/?status=approved"),
        ]);

        setHostels(hostelRes.data.results ?? hostelRes.data);
        setNotifications(notifRes.data.results ?? notifRes.data);

        const bookings = bookingRes.data.results ?? bookingRes.data;
        setBooking(bookings?.length ? bookings[0] : null);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derived values (important: no need to store in state)
  const totalRooms = hostels.reduce(
    (sum, h) => sum + (h.total_rooms ?? 0),
    0
  );

  const availableRooms = hostels.reduce(
    (sum, h) => sum + (h.available_rooms ?? 0),
    0
  );

  const filteredHostels =
    activeTab === "all"
      ? hostels
      : hostels.filter((h) =>
          h.name?.toLowerCase().includes(activeTab)
        );

  if (error) {
    return (
      <div className="text-red-400 p-6">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-white font-bold">
              Hi, {user?.full_name?.split(" ")[0] ?? "Student"} 👋
            </h1>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate("/students/maintenance/new")}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg">
              + Maintenance
            </button>
            <button onClick={() => navigate("/students/complaints/new")}
              className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
              + Complaint
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🏨" label="Hostels" value={hostels.length} color="cyan" />
          <StatCard icon="🚪" label="Rooms" value={totalRooms} color="indigo" />
          <StatCard icon="✅" label="Available" value={availableRooms} color="green" />
          <StatCard icon="📢" label="Notices" value={notifications.length} color="yellow" />
        </div>

        {/* Booking */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">
            Current Booking
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : booking ? (
            <div className="text-gray-300">
              Room: {booking.room} | Status: {booking.status}
            </div>
          ) : (
            <p className="text-gray-500">No active booking</p>
          )}
        </section>

        {/* Hostels */}
        <section>
          <h2 className="text-white mb-3">Hostels</h2>

          {loading ? (
            <p className="text-gray-500">Loading hostels...</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {filteredHostels.map((h) => (
                <div key={h.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                  <h3 className="text-white">{h.name}</h3>
                  <p className="text-gray-500 text-sm">{h.address}</p>

                  <Link
                    to={`/students/hostels/${h.id}`}
                    className="text-cyan-400 text-sm"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notifications */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white mb-3">Notifications</h2>

          {notifications.slice(0, 5).map((n) => (
            <div key={n.id} className="text-gray-400 text-sm py-1">
              {n.message}
            </div>
          ))}
        </section>

      </div>
    </div>
  );
};

export default StudentHomePage;