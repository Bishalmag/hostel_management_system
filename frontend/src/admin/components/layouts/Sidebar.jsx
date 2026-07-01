// src/admin/components/layouts/AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Hostels',
    to: '/admin/hostels',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4" />
      </svg>
    ),
  },
  {
    label: 'Blocks',
    to: '/admin/blocks',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4" />
      </svg>
    ),
  },
  {
    label: 'Floors',
    to: '/admin/floors',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: 'Rooms',
    to: '/admin/rooms',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    label: 'Students',
    to: '/admin/students',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Allocations',
    to: '/admin/students/allocation',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Bookings',
    to: '/admin/bookings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Complaints',
    to: '/admin/complaints',
    badge: 3,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  {
    label: 'Feedbacks',
    to: '/admin/feedbacks',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    label: 'Events',
    to: '/admin/events',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Procurement',
    to: '/admin/procurement',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: 'Forecast',
    to: '/admin/forecast',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Navigation',
    to: '/admin/navigation',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
];

const AdminSidebar = ({ collapsed: controlledCollapsed, mobileOpen, onMobileClose, onToggleCollapse }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(controlledCollapsed);

  useEffect(() => {
    setCollapsed(controlledCollapsed);
  }, [controlledCollapsed]);

  const handleToggle = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    if (onToggleCollapse) {
      onToggleCollapse(nextState);
    }
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ item, onClick }) => {
    const active = isActive(item.to);

    return (
      <Link
        to={item.to}
        onClick={onClick}
        title={collapsed ? item.label : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '10px 12px' : '10px 16px',
          borderRadius: '12px',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          backgroundColor: active ? '#122448' : 'transparent',
          color: active ? '#eaf2ff' : '#c8daf0',
          borderLeft: active ? '3px solid #f5a623' : '3px solid transparent',
          justifyContent: collapsed ? 'center' : 'flex-start',
          position: 'relative',
          textDecoration: 'none',
          marginBottom: '6px',
          width: '100%',
          gap: collapsed ? '0px' : '12px',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = '#122448';
            e.currentTarget.style.color = '#eaf2ff';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#c8daf0';
          }
        }}
      >
        {/* Icon - Always visible */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            flexShrink: 0,
            color: active ? '#f5a623' : '#6b8aaa',
            transition: 'color 0.2s ease',
          }}
        >
          {item.icon}
        </span>

        {/* Text - Hidden when collapsed */}
        <span 
          style={{
            fontSize: '15px',
            letterSpacing: '0.025em',
            whiteSpace: 'nowrap',
            opacity: collapsed ? 0 : 1,
            transform: collapsed ? 'scale(0)' : 'scale(1)',
            transition: 'all 0.2s ease',
            width: collapsed ? 0 : 'auto',
            pointerEvents: collapsed ? 'none' : 'auto',
            display: collapsed ? 'none' : 'block',
          }}
        >
          {item.label}
        </span>

        {/* Badge - Only show when expanded */}
        {!collapsed && item.badge && (
          <span
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '20px',
              padding: '0 10px',
              fontSize: '10px',
              fontWeight: 700,
              color: '#f5a623',
              backgroundColor: 'rgba(245, 166, 35, 0.1)',
              border: '1px solid rgba(245, 166, 35, 0.3)',
              borderRadius: '9999px',
            }}
          >
            {item.badge}
          </span>
        )}

        {/* Badge on icon when collapsed */}
        {collapsed && item.badge && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '16px',
              padding: '0 6px',
              fontSize: '8px',
              fontWeight: 700,
              color: '#0a1628',
              backgroundColor: '#f5a623',
              borderRadius: '9999px',
            }}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 30,
            backdropFilter: 'blur(4px)',
          }}
          onClick={onMobileClose}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        style={{
          width: collapsed ? '80px' : '280px',
          minWidth: collapsed ? '80px' : '280px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a1628',
          borderRight: '1px solid #1a3050',
          position: 'relative',
          transition: 'all 0.3s ease',
          height: '100%',
          overflow: 'hidden',
        }}
        className="hidden md:flex"
      >
        {/* Collapse Toggle Button - Gold (floating on top) */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: collapsed ? '50%' : '-5px',
            transform: collapsed ? 'translateX(50%)' : 'none',
            zIndex: 10,
          }}
        >
          <button
            onClick={handleToggle}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#f5a623',
              border: '2px solid #f5a623',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245,166,35,0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e09515';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(245,166,35,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f5a623';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(245,166,35,0.3)';
            }}
          >
            <svg
              style={{
                width: '14px',
                height: '14px',
                color: '#0a1628',
                transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.3s ease',
                fontWeight: 'bold',
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: collapsed ? '60px 8px 12px' : '20px 12px 16px',
          }}
        >
          {navItems.map(item => (
            <NavLink key={item.to} item={item} />
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <aside
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            width: '280px',
            zIndex: 40,
            backgroundColor: '#0a1628',
            borderRight: '1px solid #1a3050',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          }}
          className="md:hidden"
        >
          <nav style={{ flex: 1, padding: '60px 12px 16px' }}>
            {navItems.map(item => (
              <NavLink key={item.to} item={item} onClick={onMobileClose} />
            ))}
          </nav>
        </aside>
      )}
    </>
  );
};

export default AdminSidebar;