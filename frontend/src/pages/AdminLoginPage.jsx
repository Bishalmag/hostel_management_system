import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/Auth';
import { loginUser } from '../api/auth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #050d1a, #0a1628)',
      }}
    >
      {/* Glow Effects */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          filter: 'blur(140px)',
          borderRadius: '50%',
          top: '-150px',
          left: '-150px',
          background: 'rgba(245, 166, 35, 0.15)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          filter: 'blur(140px)',
          borderRadius: '50%',
          bottom: '-150px',
          right: '-150px',
          background: 'rgba(59, 130, 246, 0.15)',
        }}
      />

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '448px',
      }}>
        {/* Back Button */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: '24px',
            color: '#eaf2ff',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f5a623';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#eaf2ff';
          }}
        >
          ← Back to Portal
        </Link>

        {/* Card */}
        <div
          style={{
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            padding: '32px',
            background: 'rgba(10, 22, 40, 0.8)',
            border: '1px solid #1a3050',
          }}
        >
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              color: '#eaf2ff',
            }}>◆</div>
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 700,
                marginBottom: '8px',
                color: '#eaf2ff',
              }}
            >
              Admin Login
            </h1>
            <p style={{
              color: '#6b8aaa',
            }}>
              Hostel Management System
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #dc2626',
                background: 'rgba(220, 38, 38, 0.15)',
                color: '#fca5a5',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  marginBottom: '8px',
                  color: '#6b8aaa',
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@hostel.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid #1a3050',
                  color: '#eaf2ff',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#f5a623';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  marginBottom: '8px',
                  color: '#6b8aaa',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '48px',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid #1a3050',
                    color: '#eaf2ff',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#f5a623';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#1a3050';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#3a5070',
                    fontSize: '18px',
                  }}
                >
                  {showPassword ? '◉' : '○'}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
            }}>
              <input
                type="checkbox"
                style={{
                  accentColor: '#f5a623',
                  width: '16px',
                  height: '16px',
                }}
              />
              <span style={{ color: '#6b8aaa' }}>
                Remember me
              </span>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                background: loading ? '#3a5070' : 'linear-gradient(90deg, #f5a623, #c47d0e)',
                color: loading ? '#6b8aaa' : '#0a1628',
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #e09515, #b06d0a)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #f5a623, #c47d0e)';
                }
              }}
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
          }}>
            <Link
              to="/login"
              style={{
                color: '#f5a623',
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
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