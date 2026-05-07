import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/Auth';

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    role: 'student',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

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
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(formData.phone_number)) newErrors.phone_number = 'Please enter a valid phone number (10-15 digits)';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.password_confirm) newErrors.password_confirm = 'Passwords do not match';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (name === 'password') setPasswordStrength(checkPasswordStrength(value));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (!validateForm()) return;
    setLoading(true);
    try {
      await mockAuthService.register({
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        password_confirm: formData.password_confirm,
        role: formData.role,
      });
      setMessage({ type: 'success', text: 'Registration successful! Please verify your email with the OTP.' });
      setStep(2);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`).focus();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter all 6 digits of OTP' });
      return;
    }
    setLoading(true);
    try {
      await mockAuthService.verifyEmail(formData.email, otpString);
      setMessage({ type: 'success', text: 'Email verified successfully! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'OTP verification failed' });
    } finally {
      setLoading(false);
    }
  };

  const strengthConfig = [
    { label: '', color: '' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-orange-400' },
    { label: 'Good', color: 'bg-yellow-400' },
    { label: 'Strong', color: 'bg-yellow-400' },
  ];

  const inputBase =
    'w-full px-3 py-2.5 text-sm rounded-md bg-[#1a2235] border border-[#2a3a55] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed';
  const inputError = 'border-red-500 focus:border-red-500 focus:ring-red-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#0f1e2e] to-[#1a1a2e] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-2xl bg-[#111827]/90 border border-[#1f2d40] rounded-xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <h1 className="text-2xl font-bold text-white">
            Create <span className="text-yellow-400">Account</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Join the Smart Hostel Management System</p>
        </div>

        <div className="px-8 pb-8">

          {/* Alert */}
          {message.text && (
            <div
              className={`mb-5 px-4 py-3 rounded-md text-sm flex items-start gap-2 border ${
                message.type === 'success'
                  ? 'bg-yellow-400/10 text-yellow-300 border-yellow-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            >
              <span className="font-bold">{message.type === 'success' ? '✓' : '✕'}</span>
              {message.text}
            </div>
          )}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Username</label>
                  <input
                    type="text" name="username" value={formData.username}
                    onChange={handleChange} placeholder="Choose a username"
                    disabled={loading}
                    className={`${inputBase} ${errors.username ? inputError : ''}`}
                  />
                  {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Account Type</label>
                  <select
                    name="role" value={formData.role}
                    onChange={handleChange} disabled={loading}
                    className={`${inputBase} cursor-pointer`}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                    <option value="director">Director</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">First Name</label>
                  <input
                    type="text" name="first_name" value={formData.first_name}
                    onChange={handleChange} placeholder="Enter first name"
                    disabled={loading}
                    className={`${inputBase} ${errors.first_name ? inputError : ''}`}
                  />
                  {errors.first_name && <p className="mt-1 text-xs text-red-400">{errors.first_name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Last Name</label>
                  <input
                    type="text" name="last_name" value={formData.last_name}
                    onChange={handleChange} placeholder="Enter last name"
                    disabled={loading}
                    className={`${inputBase} ${errors.last_name ? inputError : ''}`}
                  />
                  {errors.last_name && <p className="mt-1 text-xs text-red-400">{errors.last_name}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="Enter your email"
                  disabled={loading}
                  className={`${inputBase} ${errors.email ? inputError : ''}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Phone Number</label>
                <input
                  type="tel" name="phone_number" value={formData.phone_number}
                  onChange={handleChange} placeholder="Enter your phone number"
                  disabled={loading}
                  className={`${inputBase} ${errors.phone_number ? inputError : ''}`}
                />
                {errors.phone_number && <p className="mt-1 text-xs text-red-400">{errors.phone_number}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={formData.password}
                    onChange={handleChange} placeholder="Create a strong password"
                    disabled={loading}
                    className={`${inputBase} pr-10 ${errors.password ? inputError : ''}`}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-400 transition text-sm"
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthConfig[passwordStrength].color : 'bg-[#2a3a55]'}`} />
                      ))}
                    </div>
                    {passwordStrength > 0 && (
                      <p className="text-xs text-gray-500">Strength: <span className="text-yellow-400 font-medium">{strengthConfig[passwordStrength].label}</span></p>
                    )}
                  </div>
                )}
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirm" value={formData.password_confirm}
                    onChange={handleChange} placeholder="Confirm your password"
                    disabled={loading}
                    className={`${inputBase} pr-10 ${errors.password_confirm ? inputError : ''}`}
                  />
                  <button
                    type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-400 transition text-sm"
                  >
                    {showConfirmPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password_confirm && <p className="mt-1 text-xs text-red-400">{errors.password_confirm}</p>}
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-bold text-sm rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-3">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white">
                  Email <span className="text-yellow-400">Verification</span>
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  OTP sent to <span className="text-gray-200 font-medium">{formData.email}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-3 text-center uppercase tracking-wide">Enter 6-digit OTP</label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text" maxLength="1" value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      placeholder="0" disabled={loading}
                      className="w-11 h-12 text-center text-lg font-bold bg-[#1a2235] border-2 border-[#2a3a55] text-yellow-400 rounded-md focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition disabled:opacity-50 placeholder-gray-600"
                    />
                  ))}
                </div>
                <p className="text-center mt-3 text-xs text-gray-500">Tip: Any 6-digit number works (e.g., 123456)</p>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-bold text-sm rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying...
                  </span>
                ) : 'Verify Email'}
              </button>

              <div className="text-center">
                <button
                  type="button" onClick={() => setStep(1)} disabled={loading}
                  className="text-sm text-gray-400 hover:text-yellow-400 transition disabled:opacity-50"
                >
                  ← Back to form
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-[#1f2d40] text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition">
                Login here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;