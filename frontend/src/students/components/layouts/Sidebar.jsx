import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    label: 'Dashboard',
    to: '/students/homepage',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    label: 'Book Hostel',
    to: '/students/book-hostels',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>,
  },
  {
    label: 'My Bookings',
    to: '/students/my-bookings',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    label: 'Billings',
    to: '/students/billings',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>,
  },
  {
    label: 'Pay Rent',
    to: '/students/pay-rent',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  },
  {
    label: 'Payment History',
    to: '/students/payment-history',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    label: 'Complaint Registration',
    to: '/students/complaints/new',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    label: 'Registered Complaints',
    to: '/students/complaints',
    badge: 2,
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
  },
  {
    label: 'Feedback',
    to: '/students/feedback',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  },
  {
    label: 'Profile',
    to: '/students/profile',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  },
  {
    label: 'Find My Way',
    to: '/students/find-path',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  },
];

const Sidebar = ({ collapsed, mobileOpen, onMobileClose }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ item, onClick }) => {
    const active = isActive(item.to);

    return (
      <Link
        to={item.to}
        onClick={onClick}
        title={collapsed ? item.label : undefined}
        className={`
          flex items-center gap-4 px-4 py-3.5 rounded-lg text-[15px] font-medium
          transition-all duration-200 group relative
          ${active
            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
            : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent'}
          ${collapsed ? 'justify-center' : ''}
        `}
      >
        {/* Active indicator */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full" />
        )}

        <span className="flex-shrink-0">{item.icon}</span>

        {!collapsed && (
          <span className="truncate flex-1">{item.label}</span>
        )}

        {!collapsed && item.badge && (
          <span className="ml-auto text-[11px] font-bold px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {item.badge}
          </span>
        )}

        {/* Tooltip for collapsed */}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-800 border border-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            {item.label}
            {item.badge && (
              <span className="ml-1.5 text-cyan-400 font-bold">
                ({item.badge})
              </span>
            )}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        style={{
          width: collapsed ? '72px' : '240px',
          minWidth: collapsed ? '72px' : '240px',
        }}
        className="hidden md:flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out h-full overflow-y-auto"
      >
        <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 flex-shrink-0" />

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-5 px-2 space-y-2">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold px-3 pb-3">
              Navigation
            </p>
          )}

          {navItems.map(item => (
            <NavLink key={item.to} item={item} />
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-56 z-40 md:hidden bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
          <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

          <nav className="flex-1 py-5 px-2 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold px-3 pb-3">
              Navigation
            </p>

            {navItems.map(item => (
              <NavLink key={item.to} item={item} onClick={onMobileClose} />
            ))}
          </nav>
        </aside>
      )}
    </>
  );
};

export default Sidebar;