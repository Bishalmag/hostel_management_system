import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ReferenceLine, ResponsiveContainer,
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

  if (loading) return <p className="text-gray-400 p-6">Crunching numbers...</p>;
  if (error) return <p className="text-red-400 p-6">Failed to load forecast: {error}</p>;
  if (!data || !data.history?.length) return <p className="text-gray-400 p-6">No booking history yet.</p>;

  const { history: fullHistory, forecast, upper = [], lower = [], moving_avg, peak_day_index } = data;

  // Chart only shows the last N days of history — keeps x-axis readable.
  // moving_avg / peak_day_index still come from the full backend history, untouched.
  const HISTORY_WINDOW_DAYS = 120;
  const history = fullHistory.slice(-HISTORY_WINDOW_DAYS);
  const histLen = history.length;

  // Day-relative index: 0 = today (last actual point), negative = past, positive = forecast.
  // History's last point is duplicated with forecast/band values so the lines connect with no gap.
  const chartData = history.map((v, i) => ({ day: i - histLen + 1, actual: v }));
  const junction = chartData[chartData.length - 1];
  junction.forecast = junction.actual;
  if (upper.length) junction.upper = junction.actual;
  if (lower.length) junction.lower = junction.actual;

  forecast.forEach((v, i) => {
    chartData.push({
      day: i + 1,
      forecast: v,
      upper: upper[i] ?? null,
      lower: lower[i] ?? null,
    });
  });

  const dayLabel = (d) => (d === 0 ? "Today" : d > 0 ? `+${d}d` : `${d}d`);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload;
    return (
      <div className="bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-xs space-y-1">
        <p className="text-gray-300 font-semibold">{dayLabel(label)}</p>
        {p.actual != null && (
          <p className="text-purple-300">Actual: {p.actual}</p>
        )}
        {p.forecast != null && (
          <p className="text-pink-300">Predicted: {p.forecast}</p>
        )}
        {p.upper != null && p.lower != null && (
          <p className="text-gray-500">Range: {p.lower}–{p.upper}</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">
          Occupancy Forecasting (next {forecast.length} days)
        </h2>
      </div>

      <div className="flex gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Last 7 days Moving Avg</p>
          <p className="text-2xl font-bold text-purple-400">{moving_avg}</p>
          <p className="text-[10px] text-gray-600">Recent actual occupancy</p>
        </div>
        {peak_day_index !== null && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Peak Day Ahead</p>
            <p className="text-2xl font-bold text-pink-400">{dayLabel(peak_day_index + 1)}</p>
            <p className="text-[10px] text-gray-600">Highest predicted occupancy</p>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f472b6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f472b6" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="day"
              type="number"
              domain={["dataMin", "dataMax"]}
              allowDecimals={false}
              tickCount={10}
              stroke="#6b7280"
              tickFormatter={dayLabel}
              tick={{ fontSize: 11 }}
            />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                { actual: "History", forecast: "Forecast", upper: "Confidence range" }[value] || value
              )}
            />

            <ReferenceLine
              x={0}
              stroke="#9ca3af"
              strokeDasharray="4 4"
              label={{ value: "Today", position: "top", fill: "#9ca3af", fontSize: 11 }}
            />

            {upper.length > 0 && (
              <Area
                dataKey="upper"
                stroke="none"
                fill="url(#bandFill)"
                isAnimationActive={false}
                name="upper"
                connectNulls
              />
            )}
            {lower.length > 0 && (
              <Area
                dataKey="lower"
                stroke="none"
                fill="#111827"
                fillOpacity={1}
                isAnimationActive={false}
                name="lower"
                connectNulls
                legendType="none"
              />
            )}

            <Line type="monotone" dataKey="actual" stroke="#a78bfa" strokeWidth={2} dot={false} name="actual" />
            <Line type="monotone" dataKey="forecast" stroke="#f472b6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="forecast" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}