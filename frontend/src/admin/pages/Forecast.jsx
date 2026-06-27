import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer
} from "recharts";

export default function Forecast() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/forecasting/forecast/occupancy/", { params: { horizon: 14 } })
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.detail || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-400 p-6">Crunching numbers...</p>;
  }
  if (error) {
    return <p className="text-red-400 p-6">Failed to load forecast: {error}</p>;
  }
  if (!data || !data.history?.length) {
    return <p className="text-gray-400 p-6">No booking history yet.</p>;
  }

  const chartData = [
    ...data.history.map((v, i) => ({ idx: i, actual: v })),
    ...data.forecast.map((v, i) => ({ idx: data.history.length + i, forecast: v })),
  ];

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-white">
        Occupancy Forecast (next {data.forecast.length} days)
      </h2>

      <div className="flex gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">7-day Moving Avg</p>
          <p className="text-2xl font-bold text-purple-400">{data.moving_avg}</p>
        </div>
        {data.peak_day_index !== null && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Peak Day Ahead</p>
            <p className="text-2xl font-bold text-pink-400">Day {data.peak_day_index + 1}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="idx" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151" }} />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#a78bfa" dot={false} name="History" />
            <Line type="monotone" dataKey="forecast" stroke="#f472b6" strokeDasharray="5 5" dot={false} name="Forecast" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
