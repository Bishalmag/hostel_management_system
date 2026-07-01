import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (formData.currentPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'newPassword') {
      setPasswordStrength(checkPasswordStrength(value));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/auth/change-password/', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      });

      console.log('Change password response:', response.data);

      setMessage({
        type: 'success',
        text: 'Password changed successfully! Redirecting to login...',
      });

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
        sessionStorage.clear();
        navigate('/login');
      }, 2500);
    } catch (error) {
      console.error('Change password error:', error.response || error);
      
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error.response) {
        const data = error.response.data;
        
        if (data.message) {
          errorMessage = data.message;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.current_password) {
          errorMessage = data.current_password[0];
        } else if (data.new_password) {
          errorMessage = data.new_password[0];
        } else if (data.confirm_password) {
          errorMessage = data.confirm_password[0];
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthLabel = () => {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[passwordStrength];
  };

  const getStrengthColor = () => {
    const colors = ['', '#ef4444', '#fb923c', '#f5a623', '#1ddba8'];
    return colors[passwordStrength];
  };

  const handleBackToDashboard = () => {
    const userRole = localStorage.getItem('user_role');
    if (userRole === 'admin' || userRole === 'Super Admin' || userRole === 'Hostel Admin') {
      navigate('/admin/dashboard');
    } else if (userRole === 'student' || userRole === 'Student') {
      navigate('/students/homepage');
    } else {
      navigate('/dashboard');
    }
  };

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
        maxWidth: '448px',
        background: 'rgba(17, 24, 39, 0.9)',
        border: '1px solid #1f2d40',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        padding: '32px',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
          }}>
            Change <span style={{ color: '#f5a623' }}>Password</span>
          </h1>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            marginTop: '8px',
          }}>Update your account password</p>
        </div>

        {message.text && (
          <div style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '14px',
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
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              Current Password <span style={{ color: '#f87171' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  paddingRight: '40px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  background: '#1a2235',
                  border: `1px solid ${errors.currentPassword ? '#f87171' : '#2a3a55'}`,
                  color: '#c8daf0',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.5 : 1,
                }}
                onFocus={(e) => {
                  if (!errors.currentPassword) e.currentTarget.style.borderColor = '#f5a623';
                }}
                onBlur={(e) => {
                  if (!errors.currentPassword) e.currentTarget.style.borderColor = '#2a3a55';
                }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b8aaa',
                  transition: 'color 0.2s ease',
                }}
                disabled={loading}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
              >
                {showCurrentPassword ? (
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.currentPassword}</p>
            )}
          </div>

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
              New Password <span style={{ color: '#f87171' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Create a new password"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  paddingRight: '40px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  background: '#1a2235',
                  border: `1px solid ${errors.newPassword ? '#f87171' : '#2a3a55'}`,
                  color: '#c8daf0',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.5 : 1,
                }}
                onFocus={(e) => {
                  if (!errors.newPassword) e.currentTarget.style.borderColor = '#f5a623';
                }}
                onBlur={(e) => {
                  if (!errors.newPassword) e.currentTarget.style.borderColor = '#2a3a55';
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b8aaa',
                  transition: 'color 0.2s ease',
                }}
                disabled={loading}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
              >
                {showNewPassword ? (
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {formData.newPassword && (
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '4px',
                }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: '4px',
                        flex: 1,
                        borderRadius: '9999px',
                        transition: 'all 0.3s ease',
                        background: i <= passwordStrength
                          ? getStrengthColor()
                          : '#2a3a55',
                      }}
                    />
                  ))}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b8aaa',
                  }}>
                    Strength: <span style={{
                      fontWeight: 500,
                      color: passwordStrength >= 3 ? '#1ddba8' : 
                             passwordStrength >= 2 ? '#f5a623' : 
                             passwordStrength >= 1 ? '#fb923c' : '#6b8aaa',
                    }}>
                      {getPasswordStrengthLabel()}
                    </span>
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b8aaa',
                  }}>
                    {formData.newPassword.length}/8+ characters
                  </p>
                </div>
              </div>
            )}
            {errors.newPassword && (
              <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.newPassword}</p>
            )}
          </div>

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
              Confirm New Password <span style={{ color: '#f87171' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  paddingRight: '40px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  background: '#1a2235',
                  border: `1px solid ${errors.confirmPassword ? '#f87171' : '#2a3a55'}`,
                  color: '#c8daf0',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.5 : 1,
                }}
                onFocus={(e) => {
                  if (!errors.confirmPassword) e.currentTarget.style.borderColor = '#f5a623';
                }}
                onBlur={(e) => {
                  if (!errors.confirmPassword) e.currentTarget.style.borderColor = '#2a3a55';
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
                  transition: 'color 0.2s ease',
                }}
                disabled={loading}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
              >
                {showConfirmPassword ? (
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.newPassword && (
              <p style={{
                marginTop: '4px',
                fontSize: '12px',
                color: formData.confirmPassword === formData.newPassword ? '#1ddba8' : '#f87171',
              }}>
                {formData.confirmPassword === formData.newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
            {errors.confirmPassword && (
              <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.confirmPassword}</p>
            )}
          </div>

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
              marginTop: '16px',
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
                Updating Password...
              </span>
            ) : 'Change Password'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #1f2d40',
          textAlign: 'center',
        }}>
          <button
            onClick={handleBackToDashboard}
            style={{
              fontSize: '14px',
              color: '#6b8aaa',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
          >
            ← Back to Dashboard
          </button>
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

export default ChangePassword;