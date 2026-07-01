import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [emailForResend, setEmailForResend] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpFromBackend, setOtpFromBackend] = useState('');

  const isValidEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setErrors({});

    if (!email || !isValidEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/auth/forgot-password/', { email });
      console.log('Forgot password response:', response.data);
      
      setResetToken(response.data.reset_token);
      setEmailForResend(email);
      
      if (response.data.otp) {
        setOtpFromBackend(response.data.otp);
        console.log(`OTP for ${email}: ${response.data.otp}`);
      }
      
      setOtpTimer(300);
      setStep(2);
      setMessage({
        type: 'success',
        text: `OTP sent to ${email}. Valid for 5 minutes.`,
      });
    } catch (error) {
      console.error('Forgot password error:', error.response || error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.response) {
        const data = error.response.data;
        if (data.message) {
          errorMessage = data.message;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        if (error.response.status === 404) {
          errorMessage = 'Email not found. Please check your email address.';
        } else if (error.response.status === 400) {
          errorMessage = data.message || 'Invalid request. Please check your email.';
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

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setErrors({});

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter all 6 digits' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/auth/verify-otp/', {
        reset_token: resetToken,
        otp: otpString,
      });
      console.log('Verify OTP response:', response.data);
      
      setResetToken(response.data.verified_token);
      setStep(3);
      setMessage({ type: 'success', text: 'OTP verified successfully' });
    } catch (error) {
      console.error('Verify OTP error:', error.response || error);
      
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (error.response) {
        const data = error.response.data;
        if (data.message) {
          errorMessage = data.message;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
        
        if (error.response.status === 400) {
          if (data.message?.includes('expired')) {
            errorMessage = 'OTP has expired. Please request a new one.';
          }
        }
      }
      
      setErrors({
        otp: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const payload = resetToken 
        ? { reset_token: resetToken }
        : { email: emailForResend || email };
      
      const response = await api.post('/users/auth/resend-otp/', payload);
      console.log('Resend OTP response:', response.data);
      
      if (response.data.otp) {
        setOtpFromBackend(response.data.otp);
        console.log(`New OTP sent: ${response.data.otp}`);
      }
      
      setOtp(['', '', '', '', '', '']);
      setOtpTimer(300);
      setMessage({ type: 'success', text: 'OTP resent successfully' });
    } catch (error) {
      console.error('Resend OTP error:', error.response || error);
      
      let errorMessage = 'Failed to resend OTP. Please try again.';
      
      if (error.response) {
        const data = error.response.data;
        if (data.message) {
          errorMessage = data.message;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
      }
      
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setErrors({});

    let newErrors = {};

    if (!newPassword || newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/auth/reset-password/', {
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      console.log('Reset password response:', response.data);
      
      setMessage({
        type: 'success',
        text: 'Password reset successful! Redirecting to login...',
      });
      
      setResetToken(null);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error.response || error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.response) {
        const data = error.response.data;
        if (data.message) {
          errorMessage = data.message;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
        
        if (error.response.status === 400) {
          if (data.message?.includes('verified')) {
            errorMessage = 'OTP not verified. Please verify your OTP first.';
          } else if (data.message?.includes('expired')) {
            errorMessage = 'Session expired. Please request a new OTP.';
          }
        }
      }
      
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTimer = () => {
    const minutes = Math.floor(otpTimer / 60);
    const seconds = otpTimer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (otpFromBackend && otpFromBackend.length === 6) {
      const otpArray = otpFromBackend.split('');
      setOtp(otpArray);
    }
  }, [otpFromBackend]);

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
            Reset <span style={{ color: '#f5a623' }}>Password</span>
          </h1>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            marginTop: '8px',
          }}>
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Enter the 6-digit OTP sent to your email"}
            {step === 3 && "Create your new password"}
          </p>
          {otpFromBackend && step === 2 && (
            <div style={{
              marginTop: '8px',
              display: 'inline-block',
              background: 'rgba(245, 166, 35, 0.1)',
              border: '1px solid rgba(245, 166, 35, 0.3)',
              borderRadius: '6px',
              padding: '4px 12px',
            }}>
              <span style={{
                fontSize: '12px',
                color: '#f5a623',
              }}>
                OTP: <span style={{ fontWeight: 700 }}>{otpFromBackend}</span>
              </span>
            </div>
          )}
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

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div style={{
              fontSize: '12px',
              color: '#3a5070',
              marginBottom: '8px',
            }}>Step 1 of 3</div>

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
                Email Address <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
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
              {errors.email && (
                <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.email}</p>
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
                  Sending OTP...
                </span>
              ) : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit}>
            <div style={{
              fontSize: '12px',
              color: '#3a5070',
              marginBottom: '8px',
            }}>Step 2 of 3</div>

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
                Enter OTP Code
              </label>
              <p style={{
                fontSize: '12px',
                color: '#6b8aaa',
                marginBottom: '12px',
              }}>OTP sent to {email}</p>

              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
              }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    placeholder="0"
                    disabled={loading}
                    style={{
                      width: '48px',
                      height: '48px',
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                      borderRadius: '6px',
                      background: '#1a2235',
                      border: errors.otp ? '1px solid #f87171' : '1px solid #2a3a55',
                      color: '#c8daf0',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box',
                      opacity: loading ? 0.5 : 1,
                    }}
                    onFocus={(e) => {
                      if (!errors.otp) e.currentTarget.style.borderColor = '#f5a623';
                    }}
                    onBlur={(e) => {
                      if (!errors.otp) e.currentTarget.style.borderColor = '#2a3a55';
                    }}
                  />
                ))}
              </div>

              {errors.otp && (
                <p style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#f87171',
                  textAlign: 'center',
                }}>{errors.otp}</p>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || otpTimer > 0}
                style={{
                  fontSize: '14px',
                  color: '#f5a623',
                  background: 'transparent',
                  border: 'none',
                  cursor: (loading || otpTimer > 0) ? 'not-allowed' : 'pointer',
                  opacity: (loading || otpTimer > 0) ? 0.5 : 1,
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading && otpTimer <= 0) e.currentTarget.style.color = '#e09515';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#f5a623';
                }}
              >
                Resend OTP {otpTimer > 0 && `(${formatTimer()})`}
              </button>
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
                  Verifying...
                </span>
              ) : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset}>
            <div style={{
              fontSize: '12px',
              color: '#3a5070',
              marginBottom: '8px',
            }}>Step 3 of 3</div>

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
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
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
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
                >
                  {showPassword ? '◉' : '○'}
                </button>
              </div>
              {errors.newPassword && (
                <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.newPassword}</p>
              )}
              {newPassword && newPassword.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <p style={{
                    fontSize: '12px',
                    color: newPassword.length >= 8 ? '#1ddba8' : '#f5a623',
                  }}>
                    {newPassword.length >= 8 ? '✓ Strong password' : `${newPassword.length}/8 characters`}
                  </p>
                </div>
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
                Confirm Password <span style={{ color: '#f87171' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
                >
                  {showConfirmPassword ? '◉' : '○'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={{ marginTop: '4px', fontSize: '12px', color: '#f87171' }}>{errors.confirmPassword}</p>
              )}
              {confirmPassword && newPassword && (
                <p style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: confirmPassword === newPassword ? '#1ddba8' : '#f87171',
                }}>
                  {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
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
                  Resetting...
                </span>
              ) : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #1f2d40',
          textAlign: 'center',
        }}>
          <Link
            to="/login"
            style={{
              fontSize: '14px',
              color: '#6b8aaa',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
          >
            ← Back to Login
          </Link>
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

export default ForgotPassword;