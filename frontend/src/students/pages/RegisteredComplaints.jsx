import React, { useEffect, useState } from "react";
import axios from "axios";

const RegisteredComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Replace this with your real backend API
  const API_URL = "/complaints/new";

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        setComplaints(response.data);
      } catch (err) {
        setError("Failed to load complaints.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Registered Complaints</h1>

      {loading && <p className="text-gray-500">Loading complaints...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && complaints.length === 0 && (
        <p className="text-gray-500">No complaints registered yet.</p>
      )}

      {!loading && !error && complaints.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Subject</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c, index) => (
                <tr key={c.id || index} className="text-center">
                  <td className="px-4 py-2 border">{c.id}</td>
                  <td className="px-4 py-2 border">{c.name}</td>
                  <td className="px-4 py-2 border">{c.subject}</td>
                  <td className="px-4 py-2 border">
                    <span
                      className={`px-2 py-1 rounded text-white text-sm ${
                        c.status === "pending"
                          ? "bg-yellow-500"
                          : c.status === "resolved"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RegisteredComplaints;