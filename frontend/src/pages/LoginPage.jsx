import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/Auth";
import { loginUser } from '../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({
    email: localStorage.getItem("userEmail") || "",
    password: "",
    rememberMe: !!localStorage.getItem("userEmail"),
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate("/students/homepage");
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const { data } = await loginUser(formData.email, formData.password);
      login(data.user, data.access, data.refresh);

      const role = data.user?.role?.name || '';
      if (role === 'Student') navigate('/students/homepage');

    } catch (err) {
      setErrors({ general: err.response?.data?.detail || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050d1a',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* glow background */}
      <div style={{
        position: 'absolute',
        width: '850px',
        height: '500px',
        background: 'rgba(245, 166, 35, 0.2)',
        filter: 'blur(120px)',
        borderRadius: '50%',
        top: '-100px',
        left: '-100px',
      }} />
      <div style={{
        position: 'absolute',
        width: '850px',
        height: '400px',
        background: 'rgba(59, 130, 246, 0.2)',
        filter: 'blur(120px)',
        borderRadius: '50%',
        bottom: '-100px',
        right: '-100px',
      }} />

      {/* card */}
      <div style={{
        width: '100%',
        maxWidth: '448px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        {/* title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <h1 style={{
            color: '#eaf2ff',
            fontSize: '32px',
            fontWeight: 700,
          }}>
            Hostel <span style={{ color: '#f5a623' }}>Login</span>
          </h1>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            marginTop: '8px',
          }}>
            Access your smart hostel dashboard
          </p>
        </div>

        {/* email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            color: '#c8daf0',
            fontSize: '14px',
          }}>Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              marginTop: '4px',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              color: '#eaf2ff',
              border: '1px solid rgba(255,255,255,0.1)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#f5a623';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
            placeholder="Enter email"
          />
        </div>

        {/* password */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            color: '#c8daf0',
            fontSize: '14px',
          }}>Password</label>
          <div style={{
            position: 'relative',
            marginTop: '4px',
          }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                paddingRight: '40px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                color: '#eaf2ff',
                border: '1px solid rgba(255,255,255,0.1)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f5a623';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
              placeholder="Enter password"
            />
            {errors.general && (
              <p style={{
                color: '#f87171',
                fontSize: '14px',
                marginTop: '8px',
                textAlign: 'center',
              }}>{errors.general}</p>
            )}
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
                color: '#6b8aaa',
                fontSize: '18px',
              }}
            >
              {showPassword ? "◉" : "○"}
            </button>
          </div>
        </div>

        {/* remember */}
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
          <span style={{
            color: '#6b8aaa',
            fontSize: '14px',
          }}>Remember me</span>
        </div>

        {/* button */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            background: '#f5a623',
            color: '#0a1628',
            fontWeight: 700,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#e09515';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#f5a623';
            }
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* links */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '14px',
          marginTop: '20px',
          color: '#6b8aaa',
        }}>
          <Link
            to="/forgot-password"
            style={{
              color: '#6b8aaa',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f5a623';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b8aaa';
            }}
          >
            Forgot Password
          </Link>
          <Link
            to="/signup"
            style={{
              color: '#6b8aaa',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f5a623';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b8aaa';
            }}
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;