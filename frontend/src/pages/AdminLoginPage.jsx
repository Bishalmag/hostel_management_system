import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/Auth';
import { loginUser } from '../api/auth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData,     setFormData]     = useState({ email: '', password: '' });
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await loginUser(formData.email, formData.password);
      const role = data.user?.role?.name ?? '';

      // Only allow admin roles
      if (!['Super Admin', 'Hostel Admin'].includes(role)) {
        setError('Access denied. Admin accounts only.');
        return;
      }

      login(data.user, data.access, data.refresh);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, var(--bg-gradient-1), var(--bg-gradient-2))`
      }}
    >

      {/* Glow Effects */}
      <div
        className="absolute w-[600px] h-[600px] blur-[140px] rounded-full top-[-150px] left-[-150px]"
        style={{ background: "var(--glow-yellow)" }}
      />
      <div
        className="absolute w-[600px] h-[600px] blur-[140px] rounded-full bottom-[-150px] right-[-150px]"
        style={{ background: "var(--glow-blue)" }}
      />

      <div className="relative z-10 w-full max-w-md">

        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center mb-6 transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          ← Back to Portal
        </Link>

        {/* Card */}
        <div
          className="backdrop-blur-xl rounded-2xl shadow-2xl p-8"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)"
          }}
        >

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏢</div>

            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Admin Login
            </h1>

            <p style={{ color: "var(--text-secondary)" }}>
              Hostel Management System
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-lg mb-6 border"
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                borderColor: "var(--accent-danger)",
                color: "#fecaca"
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@hostel.com"
                className="w-full px-4 py-3 rounded-lg outline-none transition"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid var(--card-border)",
                  color: "white"
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg outline-none pr-12"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid var(--card-border)",
                    color: "white"
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2">
              <input type="checkbox" />
              <span style={{ color: "var(--text-secondary)" }}>
                Remember me
              </span>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold transition active:scale-95"
              style={{
                background: `linear-gradient(90deg, var(--accent-primary), #eab308)`,
                color: "#000"
              }}
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              style={{ color: "var(--accent-primary)" }}
              className="hover:opacity-80"
            >
              User Login Instead
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;