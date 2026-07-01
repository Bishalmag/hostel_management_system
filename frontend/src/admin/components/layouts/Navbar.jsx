import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../components/Auth';
import api from '../../../api/axios';

const AdminNavbar = ({ mobileOpen = false, onMobileMenuClick = () => {} }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifs(res.data.results ?? res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAllAsReadSimple = async () => {
    const unreadIds = notifs.filter(n => !n.read_status).map(n => n.id);
    
    if (unreadIds.length === 0) {
      return;
    }

    setLoading(true);
    
    try {
      const promises = unreadIds.map(id => 
        api.patch(`/notifications/${id}/`, { read_status: true })
      );
      await Promise.all(promises);
      
      setNotifs(prev => prev.map(n => ({ ...n, read_status: true })));
      setLoading(false);
      setTimeout(() => setNotifOpen(false), 1000);
      
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      setLoading(false);
      alert('Failed to mark notifications as read. Please try again.');
    }
  };

  const markSingleAsRead = async (notifId) => {
    try {
      await api.patch(`/notifications/${notifId}/`, { read_status: true });
      
      setNotifs(prev => prev.map(n => 
        n.id === notifId ? { ...n, read_status: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifs.filter(n => !n.read_status).length;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/loginPortal');
  };

  return (
    <nav style={{
      flexShrink: 0,
      backgroundColor: '#0a1628',
      borderBottom: '1px solid #1a3050',
      zIndex: 40,
    }}>
      {/* Gold gradient bar */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(to right, #f5a623, #e09515, #f5a623)',
      }} />

      <div style={{
        padding: '0 16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}>
          {/* Brand - Shifted right with margin-left */}
          <Link to="/admin/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            marginLeft: '25px',
          }}
          className="hidden sm:flex"
          >
            <div style={{
              lineHeight: 1.2,
            }}>
              <span style={{
                color: '#eaf2ff',
                fontWeight: 700,
                fontSize: '16px',
                fontFamily: 'monospace',
                letterSpacing: '-0.5px',
                textTransform: 'uppercase',
              }}>
                HOSTEL<span style={{ color: '#f5a623' }}> MANAGEMENT</span>
              </span>
              <p style={{
                color: '#6b8aaa',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: 500,
                margin: 0,
              }}>
                ADMIN PORTAL
              </p>
            </div>
          </Link>

          {/* Mobile menu btn - Hidden on desktop */}
          <button onClick={onMobileMenuClick} style={{
            display: 'none',
            padding: '8px',
            borderRadius: '8px',
            color: '#c8daf0',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          className="sm:hidden"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#eaf2ff';
            e.currentTarget.style.backgroundColor = '#122448';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#c8daf0';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Right: notif + avatar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>


            {/* User menu */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px 6px 8px',
                  borderRadius: '8px',
                  border: '1px solid #1a3050',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f5a623';
                  e.currentTarget.style.backgroundColor = '#122448';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1a3050';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'linear-gradient(to bottom right, #f5a623, #e09515)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0a1628',
                }}>
                  {user?.full_name?.charAt(0) ?? 'A'}
                </div>
                <div style={{
                  display: 'none',
                  textAlign: 'left',
                  lineHeight: 1.2,
                }}
                className="hidden sm:block"
                >
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#eaf2ff',
                    margin: 0,
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user?.full_name ?? 'Admin'}
                  </p>
                  <p style={{
                    fontSize: '10px',
                    color: '#6b8aaa',
                    margin: 0,
                  }}>
                    {user?.role?.name ?? 'Admin'}
                  </p>
                </div>
                <svg style={{
                  width: '14px',
                  height: '14px',
                  color: '#6b8aaa',
                  transition: 'transform 0.2s ease',
                  transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* DROPDOWN MENU - WITH TEXT AND BULLET POINTS */}
              {menuOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '8px',
                  width: '224px',
                  backgroundColor: '#0a1628',
                  border: '1px solid #1a3050',
                  borderRadius: '12px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  zIndex: 50,
                }}>
                  {/* Top Section - Admin and Email */}
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #1a3050',
                  }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#eaf2ff',
                      margin: 0,
                    }}>
                      {user?.full_name ?? 'Admin'}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b8aaa',
                      marginTop: '2px',
                      marginBottom: 0,
                    }}>
                      {user?.email ?? 'admin@gmail.com'}
                    </p>
                  </div>
                  
                  {/* Menu Items - No icons, just text */}
                  <Link to="/admin/profile" onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      fontSize: '14px',
                      color: '#c8daf0',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#eaf2ff';
                      e.currentTarget.style.backgroundColor = '#122448';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#c8daf0';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    My Profile
                  </Link>
                  
                  <Link to="/admin/settings" onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      fontSize: '14px',
                      color: '#c8daf0',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#eaf2ff';
                      e.currentTarget.style.backgroundColor = '#122448';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#c8daf0';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Settings
                  </Link>
                  
                  {/* Logout - Red */}
                  <div style={{
                    borderTop: '1px solid #1a3050',
                  }}>
                    <button onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 16px',
                        fontSize: '14px',
                        color: '#f87171',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#fca5a5';
                        e.currentTarget.style.backgroundColor = '#122448';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#f87171';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Log Out
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

export default AdminNavbar;