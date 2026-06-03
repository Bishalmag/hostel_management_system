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

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoading(true);
        const response = await api.get('/hostel/hostels/');
        const hostelData = response.data.results || response.data;
        setHostels(hostelData);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load hostels');
      } finally {
        setLoading(false);
      }
    };
    fetchHostels();
  }, []);

  const handleBookNow = (hostelId) => {
    // IMPORTANT: Pass the ID in the URL
    navigate(`/students/room-details/${hostelId}`);
  };

  if (loading) return <div className="text-center p-6 text-gray-400">Loading hostels...</div>;
  if (error) return <div className="text-center p-6 text-red-400">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Available Hostels</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostels.map((hostel) => (
          <div key={hostel.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-2">{hostel.name}</h2>
            <p className="text-gray-400 mb-4">{hostel.address}</p>
            <button
              onClick={() => handleBookNow(hostel.id)}
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg"
            >
              Book This Hostel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookHostel;