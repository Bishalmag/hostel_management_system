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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '256px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b8aaa' }}>Crunching numbers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        color: '#f87171',
        padding: '24px',
      }}>
        Failed to load forecast: {error}
      </div>
    );
  }

  if (!data || !data.history?.length) {
    return (
      <div style={{
        color: '#6b8aaa',
        padding: '24px',
      }}>
        No booking history yet.
      </div>
    );
  }

  const { history: fullHistory, forecast, upper = [], lower = [], moving_avg, peak_day_index } = data;

  const HISTORY_WINDOW_DAYS = 120;
  const history = fullHistory.slice(-HISTORY_WINDOW_DAYS);
  const histLen = history.length;

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
      <div style={{
        background: '#0a1628',
        border: '1px solid #1a3050',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <p style={{ color: '#c8daf0', fontWeight: 600, margin: 0 }}>{dayLabel(label)}</p>
        {p.actual != null && (
          <p style={{ color: '#a78bfa', margin: 0 }}>Actual: {p.actual}</p>
        )}
        {p.forecast != null && (
          <p style={{ color: '#f472b6', margin: 0 }}>Predicted: {p.forecast}</p>
        )}
        {p.upper != null && p.lower != null && (
          <p style={{ color: '#6b8aaa', margin: 0 }}>Range: {p.lower}–{p.upper}</p>
        )}
      </div>
    );
  };

  return (
    <div style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>
          Occupancy Forecasting (next {forecast.length} days)
        </h2>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{
          background: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '8px',
          padding: '12px 16px',
        }}>
          <p style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#6b8aaa',
            margin: 0,
          }}>Last 7 days Moving Avg</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#a78bfa',
            margin: '4px 0 0 0',
          }}>{moving_avg}</p>
          <p style={{
            fontSize: '10px',
            color: '#3a5070',
            margin: '4px 0 0 0',
          }}>Recent actual occupancy</p>
        </div>
        {peak_day_index !== null && (
          <div style={{
            background: '#0a1628',
            border: '1px solid #1a3050',
            borderRadius: '8px',
            padding: '12px 16px',
          }}>
            <p style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#6b8aaa',
              margin: 0,
            }}>Peak Day Ahead</p>
            <p style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#f472b6',
              margin: '4px 0 0 0',
            }}>{dayLabel(peak_day_index + 1)}</p>
            <p style={{
              fontSize: '10px',
              color: '#3a5070',
              margin: '4px 0 0 0',
            }}>Highest predicted occupancy</p>
          </div>
        )}
      </div>

      <div style={{
        background: '#0a1628',
        border: '1px solid #1a3050',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f472b6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f472b6" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1a3050" />
            <XAxis
              dataKey="day"
              type="number"
              domain={["dataMin", "dataMax"]}
              allowDecimals={false}
              tickCount={10}
              stroke="#6b8aaa"
              tickFormatter={dayLabel}
              tick={{ fontSize: 11 }}
            />
            <YAxis stroke="#6b8aaa" tick={{ fontSize: 11 }} />
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
                fill="#0a1628"
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

      {/* Add spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}