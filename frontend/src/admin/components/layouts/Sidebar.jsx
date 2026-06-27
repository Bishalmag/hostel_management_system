import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: '📊',
  },
  {
    label: 'Hostel',
    to: '/admin/hostels',
    icon: '🏨',
  },
  {
    label: 'Blocks',
    to: '/admin/blocks',
    icon: '🏢',
  },
  {
    label: 'Floor',
    to: '/admin/floors',
    icon: '🏢',
  },
  {
    label: 'Rooms',
    to: '/admin/rooms',
    icon: '🚪',
  },
  {
    label: 'Students',
    icon: '🎓',
    children: [
      { label: 'All Students', to: '/admin/students' },
      { label: 'Allocations', to: '/admin/students/allocation' },
    ],
  },
  {
    label: 'Bookings',
    to: '/admin/bookings',
    icon: '📋',
  },
  {
    label: 'Complaints',
    to: '/admin/complaints',
    icon: '⚠️',
  },
  {
    label: 'Feedbacks',
    to: '/admin/feedbacks',
    icon: '💬',
  },
  {
    label: 'Events',
    to: '/admin/events',
    icon: '📅',
  },
  {
    label: 'Procurement',
    to: '/admin/procurement',
    icon: '⚡',
  },
  {
    label: 'Navigation',
    to: '/admin/navigation',
    icon: '🗺️',
  },
];

const AdminSidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (item) => {
    if (!item.children) return false;
    return item.children.some(c => location.pathname.startsWith(c.to));
  };

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
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1">
        {!collapsed && (
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold px-2 pb-3">
            Main Menu
          </p>
        )}

        {navItems.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const parentActive = isParentActive(item);
          const isOpen = openMenus[item.label];

          // For items without children (regular links)
          if (!hasChildren) {
            return (
              <Link 
                key={item.label} 
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(item.to)
                    ? 'bg-purple-500/15 text-purple-400 shadow-lg shadow-purple-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/80'}
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <span className="flex-shrink-0 text-lg">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="truncate flex-1">{item.label}</span>
                    {isActive(item.to) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </>
                )}
              </Link>
            );
          }

          // STUDENTS with dropdown
          return (
            <div key={item.label} className="space-y-1">
              <button 
                onClick={() => !collapsed && toggleMenu(item.label)}
                title={collapsed ? item.label : undefined}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${parentActive
                    ? 'bg-purple-500/15 text-purple-400 shadow-lg shadow-purple-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/80'}
                  ${collapsed ? 'justify-center' : 'justify-between'}
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0 text-lg">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && (
                  <svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Dropdown - Students only */}
              {!collapsed && isOpen && (
                <div className="ml-6 mt-1 pl-3 border-l-2 border-purple-500/20 space-y-1">
                  {item.children.map(child => {
                    const isChildActive = location.pathname === child.to;
                    const isAllocation = child.label === 'Allocations';
                    
                    return (
                      <Link 
                        key={child.to} 
                        to={child.to}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                          ${isChildActive
                            ? 'text-purple-400 bg-purple-500/10 shadow-sm'
                            : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}
                          ${isAllocation ? 'relative' : ''}
                        `}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                          isChildActive 
                            ? 'bg-purple-400 shadow-lg shadow-purple-400/30' 
                            : 'bg-gray-600 group-hover:bg-gray-400'
                        }`} />
                        <span className="truncate flex-1">{child.label}</span>
                        {isAllocation && (
                          <span className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded
                            ${isChildActive 
                              ? 'text-purple-400 bg-purple-500/20' 
                              : 'text-purple-400/60 bg-purple-500/10'
                            }
                          `}>
                            Featured
                          </span>
                        )}
                        {isChildActive && (
                          <span className="w-1 h-4 rounded-full bg-purple-400/50" />
                        )}
                      </Link>
                    );
                  })}
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