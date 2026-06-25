import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
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
      
      // Store the token and email for later use
      setResetToken(response.data.reset_token);
      setEmailForResend(email);
      
      // Store OTP for display (development only)
      if (response.data.otp) {
        setOtpFromBackend(response.data.otp);
        console.log(`📧 OTP for ${email}: ${response.data.otp}`);
      }
      
      setOtpTimer(300);
      setStep(2);
      setMessage({
        type: 'success',
        text: `OTP sent to ${email}. Valid for 5 minutes.`,
      });
    } catch (error) {
      console.error('Forgot password error:', error.response || error);
      
      // Handle specific error cases
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
        
        // Handle 404 Not Found
        if (error.response.status === 404) {
          errorMessage = 'Email not found. Please check your email address.';
        }
        // Handle 400 Bad Request
        else if (error.response.status === 400) {
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
      
      // Store the verified token
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
        
        // Handle specific status codes
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
      
      // Store new OTP if returned
      if (response.data.otp) {
        setOtpFromBackend(response.data.otp);
        console.log(`📧 New OTP sent: ${response.data.otp}`);
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
      
      // Clear the token after successful reset
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
        
        // Handle specific error cases
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

  // Auto-fill OTP if it's available from backend response
  useEffect(() => {
    if (otpFromBackend && otpFromBackend.length === 6) {
      const otpArray = otpFromBackend.split('');
      setOtp(otpArray);
    }
  }, [otpFromBackend]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#0f1e2e] to-[#1a1a2e] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-[#111827]/90 border border-[#1f2d40] rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            Reset <span className="text-yellow-400">Password</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Enter the 6-digit OTP sent to your email"}
            {step === 3 && "Create your new password"}
          </p>
          {otpFromBackend && step === 2 && (
            <div className="mt-2 inline-block bg-yellow-400/10 border border-yellow-400/30 rounded-md px-3 py-1">
              <span className="text-xs text-yellow-400">
                📧 OTP: <span className="font-bold">{otpFromBackend}</span>
              </span>
            </div>
          )}
        </div>

        {message.text && (
          <div className={`mb-4 px-4 py-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="text-xs text-gray-500 mb-2">Step 1 of 3</div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                disabled={loading}
                className={`w-full px-3 py-2.5 text-sm rounded-md bg-[#1a2235] border ${
                  errors.email ? 'border-red-500' : 'border-[#2a3a55]'
                } text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition disabled:opacity-50`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm rounded-md transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Sending OTP...
                </span>
              ) : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-xs text-gray-500 mb-2">Step 2 of 3</div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Enter OTP Code
              </label>
              <p className="text-xs text-gray-500 mb-3">OTP sent to {email}</p>

              <div className="flex gap-2 justify-center">
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
                    className="w-12 h-12 text-center text-lg font-bold rounded-md bg-[#1a2235] border border-[#2a3a55] text-gray-200 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition disabled:opacity-50"
                  />
                ))}
              </div>

              {errors.otp && (
                <p className="mt-2 text-xs text-red-400 text-center">{errors.otp}</p>
              )}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || otpTimer > 0}
                className="text-sm text-yellow-400 hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend OTP {otpTimer > 0 && `(${formatTimer()})`}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm rounded-md transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="text-xs text-gray-500 mb-2">Step 3 of 3</div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  disabled={loading}
                  className={`w-full px-3 py-2.5 text-sm rounded-md bg-[#1a2235] border ${
                    errors.newPassword ? 'border-red-500' : 'border-[#2a3a55]'
                  } text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition disabled:opacity-50 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-400"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.newPassword}</p>
              )}
              {newPassword && newPassword.length > 0 && (
                <div className="mt-1">
                  <p className={`text-xs ${newPassword.length >= 8 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {newPassword.length >= 8 ? '✓ Strong password' : `${newPassword.length}/8 characters`}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={loading}
                  className={`w-full px-3 py-2.5 text-sm rounded-md bg-[#1a2235] border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-[#2a3a55]'
                  } text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition disabled:opacity-50 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-400"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
              {confirmPassword && newPassword && (
                <p className={`mt-1 text-xs ${confirmPassword === newPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm rounded-md transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Resetting...
                </span>
              ) : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-[#1f2d40] text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-yellow-400 transition">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;