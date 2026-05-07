import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = {
  'Quick Links': [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Available Hostels', to: '/hostels' },
    { label: 'My Bookings', to: '/bookings' },
    { label: 'Notices Board', to: '/notices' },
  ],
  'Student Services': [
    { label: 'Room Preferences', to: '/preferences' },
    { label: 'Raise Complaint', to: '/complaints/new' },
    { label: 'Maintenance Request', to: '/maintenance/new' },
    { label: 'Mess Schedule', to: '/mess' },
  ],
  'Support': [
    { label: 'Help Center', to: '/help' },
    { label: 'Contact Warden', to: '/contact' },
    { label: 'Emergency Info', to: '/emergency' },
    { label: 'Hostel Rules', to: '/rules' },
  ],
};

const stats = [
  { label: 'Hostels', value: '3' },
  { label: 'Total Rooms', value: '150' },
  { label: 'Students Housed', value: '420+' },
  { label: 'Satisfaction Rate', value: '94%' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      {/* Stats ribbon */}
      <div className="border-b border-gray-800 bg-gray-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-cyan-400 font-mono">{stat.value}</p>
                <p className="text-xs text-gray-500 tracking-wide uppercase mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/dashboard" className="flex items-center gap-3 mb-4 group w-fit">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m7-13v4" />
                </svg>
              </div>
              <div className="leading-tight">
                <span className="text-white font-bold tracking-tight text-base font-mono">
                  HIVE<span className="text-cyan-400">HMS</span>
                </span>
                <p className="text-gray-500 text-[10px] tracking-widest uppercase font-medium">Hostel Management</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              A smart hostel management platform built for students. Room allocation, maintenance, complaints — all in one place.
            </p>
            {/* Emergency contact */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
              <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1">🚨 Emergency</p>
              <p className="text-sm text-gray-300 font-mono">Warden: +977-9800-000000</p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-3 h-px bg-cyan-500 inline-block" />
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-cyan-500 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {currentYear} <span className="text-gray-500 font-mono">HIVEHMS</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <span className="text-gray-700">·</span>
            <Link to="/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms of Use</Link>
            <span className="text-gray-700">·</span>
            <span className="text-xs text-gray-600">
              v1.0.0 <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mb-0.5 ml-1 animate-pulse" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;