import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: '📊',
    children: null,
  },

  /* HOSTEL MANAGEMENT */
  {
  label: 'Hostel',
  icon: '🏨',
  to: '/admin/hostels',
  children: null,
  },
  // Blocks
  {
    label: 'Blocks',
    icon: '🏢',
    children: [
      { label: 'All Blocks', to: '/admin/blocks' },
      { label: 'Add Block', to: '/admin/blocks/add' },
    ],
  },
  // floor
  {
    label: 'Floor',
    icon: '🏢',
    children: [
      { label: 'All Floors', to: '/admin/floors' },
      { label: 'Add Floor', to: '/admin/floors/add' },
    ],
  },
  /* ROOMS */
  {
    label: 'Rooms',
    icon: '🚪',
    children: [
      { label: 'All Rooms', to: '/admin/rooms' },
      { label: 'Add Room', to: '/admin/rooms/add' },
    ],
  },

  /* STUDENTS */
  {
    label: 'Students',
    icon: '🎓',
    children: [
      { label: 'All Students', to: '/admin/students' },
      { label: 'Add Student', to: '/admin/students/add' },
      { label: 'Allocations', to: '/admin/students/allocation' },
    ],
  },

  /* BOOKINGS */
  {
    label: 'Bookings',
    icon: '📋',
    children: [
      { label: 'All Bookings', to: '/admin/bookings' },
      { label: 'Pending Approval', to: '/admin/bookings/pending' },
    ],
  },

  /* COMPLAINTS */
  {
    label: 'Complaints',
    icon: '⚠️',
    children: [
      { label: 'All Complaints', to: '/admin/complaints' },
      { label: 'Pending', to: '/admin/complaints/pending' },
      { label: 'Resolved', to: '/admin/complaints/resolved' },
    ],
  },

  /* FEEDBACK */
  {
    label: 'Feedbacks',
    icon: '💬',
    children: [
      { label: 'All Feedbacks', to: '/admin/feedbacks' },
      { label: 'Analytics', to: '/admin/feedbacks/analytics' },
    ],
  },
];

const AdminSidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (item) =>
    item.children?.some(c => location.pathname.startsWith(c.to));

  return (
    <aside
      style={{ width: collapsed ? '72px' : '240px', minWidth: collapsed ? '72px' : '240px' }}
      className="hidden md:flex sticky top-0 h-screen z-50 flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300"
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex-shrink-0" />

      {/* Logo row */}
      <div className={`flex items-center h-16 flex-shrink-0 border-b border-gray-800 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <span className="text-white font-bold font-mono text-sm">
            ADMIN <span className="text-purple-400">PANEL</span>
          </span>
        )}
        <button onClick={onToggle}
          className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-gray-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5">
        {!collapsed && (
          <p className="text-[9px] uppercase tracking-widest text-gray-600 font-semibold px-3 pb-2">
            Navigation
          </p>
        )}

        {navItems.map(item => {
          const parentActive = isParentActive(item);

          // No children — simple link
          if (!item.children) {
            return (
              <Link key={item.label} to={item.to}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive(item.to)
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent'}
                  ${collapsed ? 'justify-center' : ''}
                `}>
                <span className="flex-shrink-0 text-base">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          }

          // Has children — accordion
          const isOpen = openMenus[item.label];
          return (
            <div key={item.label}>
              <button onClick={() => !collapsed && toggleMenu(item.label)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border
                  ${parentActive
                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800 border-transparent'}
                  ${collapsed ? 'justify-center' : 'justify-between'}
                `}>
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 text-base">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && (
                  <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Dropdown */}
              {!collapsed && isOpen && (
                <div className="ml-4 mt-0.5 pl-3 border-l border-gray-800 space-y-0.5">
                  {item.children.map(child => (
                    <Link key={child.to} to={child.to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                        ${isActive(child.to)
                          ? 'text-purple-400 bg-purple-500/10'
                          : 'text-gray-500 hover:text-white hover:bg-gray-800'}
                      `}>
                      <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Collapsed tooltip with children */}
              {collapsed && (
                <div className="group relative">
                  {/* tooltip handled by title above */}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;