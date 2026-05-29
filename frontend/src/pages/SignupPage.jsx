import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/Auth';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    first_name:       '',
    last_name:        '',
    email:            '',
    phone_number:     '',
    password:         '',
    password_confirm: '',
    role:             'Student',
    agreeTerms:       false,
  });

  const [errors,              setErrors]              = useState({});
  const [loading,             setLoading]             = useState(false);
  const [message,             setMessage]             = useState({ type: '', text: '' });
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength,    setPasswordStrength]    = useState(0);

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
    if (!formData.first_name.trim())  e.first_name = 'First name is required';
    if (!formData.last_name.trim())   e.last_name  = 'Last name is required';
    if (!formData.email)              e.email      = 'Email is required';
    else if (!isValidEmail(formData.email)) e.email = 'Invalid email address';
    if (!formData.phone_number)       e.phone_number = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(formData.phone_number)) e.phone_number = 'Enter valid phone (10-15 digits)';
    if (!formData.password)           e.password   = 'Password is required';
    else if (formData.password.length < 8) e.password = 'Min 8 characters';
    if (formData.password !== formData.password_confirm) e.password_confirm = 'Passwords do not match';
    if (!formData.agreeTerms)         e.agreeTerms = 'You must agree to terms';
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
        first_name:       formData.first_name,
        last_name:        formData.last_name,
        email:            formData.email,
        phone_number:     formData.phone_number,
        password:         formData.password,
        password_confirm: formData.password_confirm,
        role:             formData.role,
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
    { label: '',       color: '' },
    { label: 'Weak',   color: 'bg-red-500' },
    { label: 'Fair',   color: 'bg-orange-400' },
    { label: 'Good',   color: 'bg-yellow-400' },
    { label: 'Strong', color: 'bg-green-500' },
  ];

  const inputBase  = 'w-full px-3 py-2.5 text-sm rounded-md bg-[#1a2235] border border-[#2a3a55] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition disabled:opacity-50';
  const inputError = 'border-red-500 focus:border-red-500 focus:ring-red-500';

  if (user) { navigate('/students/homepage'); return null; }

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
            <div className={`mb-5 px-4 py-3 rounded-md text-sm flex items-start gap-2 border ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              <span className="font-bold">{message.type === 'success' ? '✓' : '✕'}</span>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* First + Last name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input type="text" name="first_name" value={formData.first_name}
                  onChange={handleChange} placeholder="First name" disabled={loading}
                  className={`${inputBase} ${errors.first_name ? inputError : ''}`} />
                {errors.first_name && <p className="mt-1 text-xs text-red-400">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input type="text" name="last_name" value={formData.last_name}
                  onChange={handleChange} placeholder="Last name" disabled={loading}
                  className={`${inputBase} ${errors.last_name ? inputError : ''}`} />
                {errors.last_name && <p className="mt-1 text-xs text-red-400">{errors.last_name}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Email <span className="text-red-400">*</span>
              </label>
              <input type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="Enter your email" disabled={loading}
                className={`${inputBase} ${errors.email ? inputError : ''}`} />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Phone + Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input type="tel" name="phone_number" value={formData.phone_number}
                  onChange={handleChange} placeholder="Phone number" disabled={loading}
                  className={`${inputBase} ${errors.phone_number ? inputError : ''}`} />
                {errors.phone_number && <p className="mt-1 text-xs text-red-400">{errors.phone_number}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                  Account Type
                </label>
                <select name="role" value={formData.role} onChange={handleChange}
                  disabled={loading} className={`${inputBase} cursor-pointer`}>
                  <option value="Student">Student</option>
                  <option value="Hostel Admin">Hostel Admin</option>
                  <option value="Warden">Warden</option>
                  <option value="Discipline Incharge">Discipline Incharge</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="Min 8 characters" disabled={loading}
                  className={`${inputBase} pr-10 ${errors.password ? inputError : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-400 text-sm">
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                        i <= passwordStrength ? strengthConfig[passwordStrength].color : 'bg-[#2a3a55]'
                      }`} />
                    ))}
                  </div>
                  {passwordStrength > 0 && (
                    <p className="text-xs text-gray-500">
                      Strength: <span className="text-yellow-400 font-medium">{strengthConfig[passwordStrength].label}</span>
                    </p>
                  )}
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} name="password_confirm"
                  value={formData.password_confirm} onChange={handleChange}
                  placeholder="Confirm your password" disabled={loading}
                  className={`${inputBase} pr-10 ${errors.password_confirm ? inputError : ''}`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-400 text-sm">
                  {showConfirmPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password_confirm && <p className="mt-1 text-xs text-red-400">{errors.password_confirm}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms}
                onChange={handleChange} disabled={loading}
                className="mt-1 w-4 h-4 rounded border-[#2a3a55] bg-[#1a2235] text-yellow-400 focus:ring-yellow-400 focus:ring-offset-0" />
              <label className="text-sm text-gray-400">
                I agree to the{' '}
                <a href="/terms" className="text-yellow-400 hover:text-yellow-300">Terms</a>
                {' '}and{' '}
                <a href="/privacy" className="text-yellow-400 hover:text-yellow-300">Privacy Policy</a>
              </label>
            </div>
            {errors.agreeTerms && <p className="text-xs text-red-400">{errors.agreeTerms}</p>}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm rounded-md transition disabled:opacity-50 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating Account...
                </span>
              ) : 'Register'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-[#1f2d40] text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;