import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../components/Auth';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex-shrink-0 bg-gray-900 border-b border-gray-800 z-40">
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m7-13v4" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-base font-mono tracking-tight">
              Student <span className="text-purple-400">Management</span> System
            </p>
            <p className="text-gray-600 text-[10px] uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Badge */}
          <span className="hidden sm:block text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium">
            {user?.role?.name ?? 'Admin'}
          </span>

          {/* Avatar dropdown */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-all">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {user?.full_name?.charAt(0) ?? 'A'}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-medium text-white truncate max-w-[120px]">{user?.full_name ?? 'Admin'}</p>
                <p className="text-[10px] text-gray-500">{user?.email}</p>
              </div>
              <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{user?.full_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                </div>
                {[
                  { label: 'My Profile',  icon: '👤', to: '/admin/profile'  },
                  { label: 'Settings',    icon: '⚙️', to: '/admin/settings' },
                ].map(item => (
                  <button key={item.label}
                    onClick={() => { setMenuOpen(false); navigate(item.to); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
                    <span>{item.icon}</span>{item.label}
                  </button>
                ))}
                <div className="border-t border-gray-700">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;