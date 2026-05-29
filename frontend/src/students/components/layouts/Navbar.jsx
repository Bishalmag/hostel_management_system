import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../components/Auth';
import api from '../../../api/axios';



const Navbar = ({ mobileOpen = false, onMobileMenuClick = () => {} }) => {
  const { user, logout } = useAuth();
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs,    setNotifs]    = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notifications/')
      .then(res => setNotifs(res.data.results ?? res.data))
      .catch(() => {});
  }, []);

  const unreadCount = notifs.filter(n => !n.read_status).length;
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex-shrink-0 bg-gray-900 border-b border-gray-800 z-40">
      <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/students/homepage" className="hidden sm:flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m7-13v4" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-white font-bold tracking-tight text-base font-mono uppercase">hostel<span className="text-cyan-400"> MANAGEMENT</span></span>
              <p className="text-gray-500 text-[10px] tracking-widest uppercase font-medium">System</p>
            </div>
          </Link>

          {/* Mobile menu btn */}
          <button onClick={onMobileMenuClick} className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Right: notif + avatar */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[10px] font-bold text-white bg-cyan-500 rounded-full ring-2 ring-gray-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <span className="text-xs text-cyan-400 cursor-pointer">Mark all read</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <p className="text-xs text-gray-600 text-center py-6">No notifications</p>
                    ) : notifs.slice(0, 5).map(notif => (
                      <div key={notif.id}
                        className={`px-4 py-3 border-b border-gray-700/50 hover:bg-gray-700 transition-colors cursor-pointer ${!notif.read_status ? 'bg-cyan-500/10' : ''}`}>
                        <div className="flex items-start gap-2">
                          {!notif.read_status && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />}
                          <div className={!notif.read_status ? '' : 'pl-3.5'}>
                            <p className="text-sm text-gray-200">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 text-center border-t border-gray-700">
                    <Link to="/students/notices" className="text-xs text-cyan-400 hover:text-cyan-300" onClick={() => setNotifOpen(false)}>
                      View all →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-all">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {user?.full_name?.charAt(0) ?? 'S'}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-medium text-white truncate max-w-[100px]">{user?.full_name ?? 'Student'}</p>
                  <p className="text-[10px] text-gray-500">{user?.role?.name ?? 'Student'}</p>
                </div>
                <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 bg-gray-800">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user?.full_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  </div>
                  {[
                    { to: '/students/profile',  label: 'View Profile', icon: '👤' },
                    { to: '/students/settings', label: 'Settings',     icon: '⚙️' },
                    { to: '/help',              label: 'Help & Support',icon: '❓' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
                      <span>{item.icon}</span>{item.label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-700">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;