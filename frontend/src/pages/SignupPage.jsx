import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/Auth';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const validateForm = () => {
    const e = {};
    if (!formData.first_name.trim()) e.first_name = 'First name is required';
    if (!formData.last_name.trim()) e.last_name = 'Last name is required';
    if (!formData.email) e.email = 'Email is required';
    else if (!isValidEmail(formData.email)) e.email = 'Invalid email address';
    if (!formData.phone_number) e.phone_number = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(formData.phone_number)) e.phone_number = 'Enter valid phone (10-15 digits)';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 8) e.password = 'Min 8 characters';
    if (formData.password !== formData.password_confirm) e.password_confirm = 'Passwords do not match';
    if (!formData.agreeTerms) e.agreeTerms = 'You must agree to terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'password') setPasswordStrength(checkPasswordStrength(value));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (!validateForm()) return;
    setLoading(true);
    try {
      await api.post('/users/auth/register/', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        password_confirm: formData.password_confirm,
        role: 'Student',
      });
      setMessage({ type: 'success', text: 'Account created! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        const msg = Object.values(errorData).flat().join(', ');
        setMessage({ type: 'error', text: msg || 'Registration failed.' });
      } else {
        setMessage({ type: 'error', text: 'Cannot connect to server.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const strengthConfig = [
    { label: '', color: '' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#fb923c' },
    { label: 'Good', color: '#f5a623' },
    { label: 'Strong', color: '#1ddba8' },
  ];

  if (user) { navigate('/students/homepage'); return null; }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #0d1117, #0f1e2e, #1a1a2e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      paddingTop: '40px',
      paddingBottom: '40px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '672px',
        background: 'rgba(17, 24, 39, 0.9)',
        border: '1px solid #1f2d40',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 32px 16px 32px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
          }}>
            Create <span style={{ color: '#f5a623' }}>Account</span>
          </h1>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            marginTop: '4px',
          }}>Join the Smart Hostel Management System</p>
          <div style={{
            marginTop: '12px',
            display: 'inline-block',
            background: 'rgba(245, 166, 35, 0.1)',
            border: '1px solid rgba(245, 166, 35, 0.3)',
            padding: '6px 16px',
            borderRadius: '9999px',
          }}>
            <span style={{
              color: '#f5a623',
              fontSize: '10px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Student Registration
            </span>
          </div>
        </div>

        <div style={{ padding: '0 32px 32px 32px' }}>
          {/* Alert */}
          {message.text && (
            <div style={{
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              border: '1px solid',
              background: message.type === 'success'
                ? 'rgba(29, 219, 168, 0.1)'
                : 'rgba(248, 113, 113, 0.1)',
              color: message.type === 'success'
                ? '#1ddba8'
                : '#f87171',
              borderColor: message.type === 'success'
                ? 'rgba(29, 219, 168, 0.3)'
                : 'rgba(248, 113, 113, 0.3)',
            }}>
              <span style={{ fontWeight: 700 }}>{message.type === 'success' ? '✓' : '✕'}</span>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* First + Last name */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 500,
                  color: '#6b8aaa',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  First Name <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    background: '#1a2235',
                    border: `1px solid ${errors.first_name ? '#f87171' : '#2a3a55'}`,
                    color: '#c8daf0',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onFocus={(e) => {
                    if (!errors.first_name) e.currentTarget.style.borderColor = '#f5a623';
                  }}
                  onBlur={(e) => {
                    if (!errors.first_name) e.currentTarget.style.borderColor = '#2a3a55';
                  }}
                />
                {errors.first_name && <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.first_name}</p>}
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 500,
                  color: '#6b8aaa',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Last Name <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    background: '#1a2235',
                    border: `1px solid ${errors.last_name ? '#f87171' : '#2a3a55'}`,
                    color: '#c8daf0',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onFocus={(e) => {
                    if (!errors.last_name) e.currentTarget.style.borderColor = '#f5a623';
                  }}
                  onBlur={(e) => {
                    if (!errors.last_name) e.currentTarget.style.borderColor = '#2a3a55';
                  }}
                />
                {errors.last_name && <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.last_name}</p>}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 500,
                color: '#6b8aaa',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Email <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  background: '#1a2235',
                  border: `1px solid ${errors.email ? '#f87171' : '#2a3a55'}`,
                  color: '#c8daf0',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.5 : 1,
                }}
                onFocus={(e) => {
                  if (!errors.email) e.currentTarget.style.borderColor = '#f5a623';
                }}
                onBlur={(e) => {
                  if (!errors.email) e.currentTarget.style.borderColor = '#2a3a55';
                }}
              />
              {errors.email && <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 500,
                color: '#6b8aaa',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Phone <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Phone number"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  background: '#1a2235',
                  border: `1px solid ${errors.phone_number ? '#f87171' : '#2a3a55'}`,
                  color: '#c8daf0',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.5 : 1,
                }}
                onFocus={(e) => {
                  if (!errors.phone_number) e.currentTarget.style.borderColor = '#f5a623';
                }}
                onBlur={(e) => {
                  if (!errors.phone_number) e.currentTarget.style.borderColor = '#2a3a55';
                }}
              />
              {errors.phone_number && <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.phone_number}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 500,
                color: '#6b8aaa',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Password <span style={{ color: '#f87171' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    paddingRight: '40px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    background: '#1a2235',
                    border: `1px solid ${errors.password ? '#f87171' : '#2a3a55'}`,
                    color: '#c8daf0',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onFocus={(e) => {
                    if (!errors.password) e.currentTarget.style.borderColor = '#f5a623';
                  }}
                  onBlur={(e) => {
                    if (!errors.password) e.currentTarget.style.borderColor = '#2a3a55';
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
                    color: '#6b8aaa',
                    fontSize: '14px',
                  }}
                >
                  {showPassword ? '◉' : '○'}
                </button>
              </div>
              {formData.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '4px',
                  }}>
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        style={{
                          height: '4px',
                          flex: 1,
                          borderRadius: '9999px',
                          transition: 'all 0.3s ease',
                          background: i <= passwordStrength
                            ? strengthConfig[passwordStrength].color
                            : '#2a3a55',
                        }}
                      />
                    ))}
                  </div>
                  {passwordStrength > 0 && (
                    <p style={{
                      fontSize: '12px',
                      color: '#6b8aaa',
                    }}>
                      Strength: <span style={{ color: '#f5a623', fontWeight: 500 }}>{strengthConfig[passwordStrength].label}</span>
                    </p>
                  )}
                </div>
              )}
              {errors.password && <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 500,
                color: '#6b8aaa',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Confirm Password <span style={{ color: '#f87171' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    paddingRight: '40px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    background: '#1a2235',
                    border: `1px solid ${errors.password_confirm ? '#f87171' : '#2a3a55'}`,
                    color: '#c8daf0',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onFocus={(e) => {
                    if (!errors.password_confirm) e.currentTarget.style.borderColor = '#f5a623';
                  }}
                  onBlur={(e) => {
                    if (!errors.password_confirm) e.currentTarget.style.borderColor = '#2a3a55';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b8aaa',
                    fontSize: '14px',
                  }}
                >
                  {showConfirmPassword ? '◉' : '○'}
                </button>
              </div>
              {errors.password_confirm && <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.password_confirm}</p>}
            </div>

            {/* Terms */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '16px',
            }}>
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                disabled={loading}
                style={{
                  marginTop: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: '1px solid #2a3a55',
                  background: '#1a2235',
                  accentColor: '#f5a623',
                }}
              />
              <label style={{
                fontSize: '14px',
                color: '#6b8aaa',
              }}>
                I agree to the{' '}
                <a href="/terms" style={{ color: '#f5a623', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#e09515'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#f5a623'}>
                  Terms
                </a>
                {' '}and{' '}
                <a href="/privacy" style={{ color: '#f5a623', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#e09515'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#f5a623'}>
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeTerms && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '-8px', marginBottom: '8px' }}>{errors.agreeTerms}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                background: loading ? '#3a5070' : '#f5a623',
                color: loading ? '#6b8aaa' : '#0a1628',
                fontWeight: 700,
                fontSize: '14px',
                borderRadius: '6px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.5 : 1,
                marginTop: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#e09515';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#f5a623';
              }}
            >
              {loading ? (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #0a1628',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Creating Account...
                </span>
              ) : 'Register'}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #1f2d40',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6b8aaa',
            }}>
              Already have an account?{' '}
              <Link
                to="/loginPortal"
                style={{
                  color: '#f5a623',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#e09515'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#f5a623'}
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;