import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import CreateAnnouncementModal from '../components/CreateAnnouncementModal';

const AdminHomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHostels: 0,
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalStudents: 0,
    pendingBookings: 0,
    pendingComplaints: 0,
    occupancyRate: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [hostelsRes, roomsRes, studentsRes, bookingsRes, complaintsRes] = await Promise.all([
          api.get('/hostel/hostels/'),
          api.get('/hostel/rooms/'),
          api.get('/students/'),
          api.get('/bookings/bookings/'),
          api.get('/complaints/'),
        ]);

        const hostels = hostelsRes.data.results ?? hostelsRes.data;
        const rooms = roomsRes.data.results ?? roomsRes.data;
        const students = studentsRes.data.results ?? studentsRes.data;
        const bookings = bookingsRes.data.results ?? bookingsRes.data;
        const complaints = complaintsRes.data.results ?? complaintsRes.data;

        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.current_occupancy > 0).length;
        const availableRooms = rooms.filter(r => r.current_occupancy < r.capacity).length;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
        
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;
        const pendingComplaints = complaints.filter(c => c.status === 'registered').length;
        
        const recent = [...bookings]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        
        const recentComp = [...complaints]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        const calendarEvents = [
          ...bookings.map(b => ({
            date: b.check_in_date,
            title: `Booking: Room ${b.room}`,
            type: 'booking'
          })),
          ...complaints.map(c => ({
            date: c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            title: `Complaint: ${c.title}`,
            type: 'complaint'
          }))
        ];
        
        setEvents(calendarEvents);

        setStats({
          totalHostels: hostels.length,
          totalRooms,
          availableRooms,
          occupiedRooms,
          totalStudents: students.length,
          pendingBookings,
          pendingComplaints,
          occupancyRate,
        });
        
        setRecentBookings(recent);
        setRecentComplaints(recentComp);
        
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const hasEventOnDate = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isToday = (day) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f5a623',
      approved: '#1ddba8',
      rejected: '#f87171',
      registered: '#f5a623',
      in_progress: '#60a5fa',
      resolved: '#1ddba8',
    };
    return colors[status] || '#6b8aaa';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      pending: 'rgba(245, 166, 35, 0.15)',
      approved: 'rgba(29, 219, 168, 0.15)',
      rejected: 'rgba(248, 113, 113, 0.15)',
      registered: 'rgba(245, 166, 35, 0.15)',
      in_progress: 'rgba(96, 165, 250, 0.15)',
      resolved: 'rgba(29, 219, 168, 0.15)',
    };
    return colors[status] || 'rgba(107, 138, 170, 0.15)';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '384px',
      }}>
        <div style={{
          textAlign: 'center',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b8aaa' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
    }}>
      {/* Welcome Section */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(to right, rgba(245, 166, 35, 0.15), rgba(167, 139, 250, 0.15), rgba(245, 166, 35, 0.1))',
        border: '1px solid rgba(245, 166, 35, 0.3)',
        borderRadius: '16px',
        padding: '32px',
      }}>
        <div style={{
          position: 'absolute',
          right: '-80px',
          top: '-80px',
          width: '160px',
          height: '160px',
          background: 'rgba(245, 166, 35, 0.05)',
          borderRadius: '50%',
          filter: 'blur(48px)',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#eaf2ff',
                marginBottom: '8px',
              }}>
                Welcome back, Admin
              </h1>
              <p style={{ color: '#6b8aaa' }}>Here's what's happening with your hostel management system today.</p>
            </div>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              style={{
                padding: '8px 16px',
                background: '#f5a623',
                color: '#0a1628',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(245, 166, 35, 0.25)',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e09515';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(245, 166, 35, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f5a623';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 166, 35, 0.25)';
              }}
            >
              <span style={{ fontSize: '18px' }}>◆</span>
              Send Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        <button
          onClick={() => navigate('/admin/rooms/add')}
          style={{
            background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
            border: '1px solid #1a3050',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1a3050';
          }}
        >
          <div style={{
            fontSize: '24px',
            marginBottom: '8px',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >◇</div>
          <p style={{ color: '#eaf2ff', fontWeight: 500, fontSize: '14px', margin: 0 }}>Add Room</p>
          <p style={{ color: '#3a5070', fontSize: '12px', margin: '4px 0 0 0' }}>Create new room</p>
        </button>
        <button
          onClick={() => navigate('/admin/bookings')}
          style={{
            background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
            border: '1px solid #1a3050',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1a3050';
          }}
        >
          <div style={{
            fontSize: '24px',
            marginBottom: '8px',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >▣</div>
          <p style={{ color: '#eaf2ff', fontWeight: 500, fontSize: '14px', margin: 0 }}>Manage Bookings</p>
          <p style={{ color: '#3a5070', fontSize: '12px', margin: '4px 0 0 0' }}>View all bookings</p>
        </button>
        <button
          onClick={() => setShowAnnouncementModal(true)}
          style={{
            background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
            border: '1px solid #1a3050',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1a3050';
          }}
        >
          <div style={{
            fontSize: '24px',
            marginBottom: '8px',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >◈</div>
          <p style={{ color: '#eaf2ff', fontWeight: 500, fontSize: '14px', margin: 0 }}>Send Announcement</p>
          <p style={{ color: '#3a5070', fontSize: '12px', margin: '4px 0 0 0' }}>Notify all students</p>
        </button>
        <button
          onClick={() => navigate('/admin/students')}
          style={{
            background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
            border: '1px solid #1a3050',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1a3050';
          }}
        >
          <div style={{
            fontSize: '24px',
            marginBottom: '8px',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >◉</div>
          <p style={{ color: '#eaf2ff', fontWeight: 500, fontSize: '14px', margin: 0 }}>Manage Students</p>
          <p style={{ color: '#3a5070', fontSize: '12px', margin: '4px 0 0 0' }}>View all students</p>
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#1a3050';
        }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(167, 139, 250, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>◇</div>
            <span style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#eaf2ff',
            }}>{stats.totalRooms}</span>
          </div>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Total Rooms</p>
          <div style={{
            marginTop: '8px',
            height: '4px',
            width: '100%',
            background: '#1a3050',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: '50%',
              background: '#a78bfa',
              borderRadius: '4px',
            }}></div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(29, 219, 168, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#1a3050';
        }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(29, 219, 168, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>◉</div>
            <span style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#eaf2ff',
            }}>{stats.totalStudents}</span>
          </div>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Registered Students</p>
          <div style={{
            marginTop: '8px',
            height: '4px',
            width: '100%',
            background: '#1a3050',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: '75%',
              background: '#1ddba8',
              borderRadius: '4px',
            }}></div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#1a3050';
        }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(245, 166, 35, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>◈</div>
            <span style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#eaf2ff',
            }}>{stats.occupancyRate}%</span>
          </div>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Occupancy Rate</p>
          <div style={{
            marginTop: '8px',
            height: '4px',
            width: '100%',
            background: '#1a3050',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${stats.occupancyRate}%`,
              background: '#f5a623',
              borderRadius: '4px',
            }}></div>
          </div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Available Rooms</p>
              <p style={{ color: '#1ddba8', fontSize: '28px', fontWeight: 700, margin: '4px 0 0 0' }}>{stats.availableRooms}</p>
            </div>
            <div style={{ fontSize: '28px' }}>●</div>
          </div>
          <p style={{ color: '#3a5070', fontSize: '12px', marginTop: '8px' }}>Out of {stats.totalRooms} total rooms</p>
        </div>

        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Occupied Rooms</p>
              <p style={{ color: '#f5a623', fontSize: '28px', fontWeight: 700, margin: '4px 0 0 0' }}>{stats.occupiedRooms}</p>
            </div>
            <div style={{ fontSize: '28px' }}>○</div>
          </div>
          <p style={{ color: '#3a5070', fontSize: '12px', marginTop: '8px' }}>Currently occupied rooms</p>
        </div>

        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Pending Actions</p>
              <p style={{ color: '#f87171', fontSize: '28px', fontWeight: 700, margin: '4px 0 0 0' }}>{stats.pendingBookings + stats.pendingComplaints}</p>
            </div>
            <div style={{ fontSize: '28px' }}>◆</div>
          </div>
          <p style={{ color: '#3a5070', fontSize: '12px', marginTop: '8px' }}>{stats.pendingBookings} bookings, {stats.pendingComplaints} complaints</p>
        </div>
      </div>

      {/* Calendar and Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '24px',
      }}>
        {/* Calendar */}
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #1a3050',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h2 style={{ color: '#eaf2ff', fontWeight: 600, margin: 0, fontSize: '16px' }}>Calendar</h2>
            <button
              onClick={goToToday}
              style={{
                fontSize: '12px',
                color: '#f5a623',
                background: 'rgba(245, 166, 35, 0.1)',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#e09515';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#f5a623';
              }}
            >
              Today
            </button>
          </div>
          
          <div style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}>
              <button
                onClick={prevMonth}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#6b8aaa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0f2040';
                  e.currentTarget.style.color = '#eaf2ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6b8aaa';
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 style={{ color: '#eaf2ff', fontWeight: 500, margin: 0, fontSize: '16px' }}>
                {monthNames[month]} {year}
              </h3>
              <button
                onClick={nextMonth}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#6b8aaa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0f2040';
                  e.currentTarget.style.color = '#eaf2ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6b8aaa';
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: '8px',
            }}>
              {weekDays.map(day => (
                <div key={day} style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#3a5070',
                  padding: '8px 0',
                }}>
                  {day}
                </div>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
            }}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} style={{
                  textAlign: 'center',
                  padding: '8px 0',
                  fontSize: '12px',
                  color: '#1a3050',
                }}></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = hasEventOnDate(year, month, day);
                const isCurrentDay = isToday(day);
                
                return (
                  <div
                    key={day}
                    style={{
                      textAlign: 'center',
                      padding: '8px 0',
                      fontSize: '12px',
                      borderRadius: '8px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: isCurrentDay ? 'rgba(245, 166, 35, 0.2)' : 'transparent',
                      color: isCurrentDay ? '#f5a623' : '#c8daf0',
                      fontWeight: isCurrentDay ? 700 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentDay) {
                        e.currentTarget.style.background = '#0f2040';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentDay) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {day}
                    {dayEvents.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '2px',
                      }}>
                        {dayEvents.slice(0, 2).map((event, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: event.type === 'booking' ? '#1ddba8' : '#f87171',
                            }}
                            title={event.title}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #1a3050',
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1ddba8' }}></div>
                <span style={{ fontSize: '12px', color: '#6b8aaa' }}>Booking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }}></div>
                <span style={{ fontSize: '12px', color: '#6b8aaa' }}>Complaint</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f5a623' }}></div>
                <span style={{ fontSize: '12px', color: '#6b8aaa' }}>Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity - Takes 2 columns */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          {/* Recent Bookings */}
          <div style={{
            background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
            border: '1px solid #1a3050',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #1a3050',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ color: '#eaf2ff', fontWeight: 600, margin: 0, fontSize: '16px' }}>Recent Bookings</h2>
              <button onClick={() => navigate('/admin/bookings')} style={{
                color: '#f5a623',
                fontSize: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#e09515';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#f5a623';
              }}
              >
                View All →
              </button>
            </div>
            <div>
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} style={{
                    padding: '12px 24px',
                    borderBottom: '1px solid #1a3050',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>Booking #{booking.id}</p>
                      <p style={{ color: '#6b8aaa', fontSize: '12px', margin: '4px 0 0 0' }}>Room: {booking.room}</p>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: getStatusColor(booking.status),
                      background: getStatusBgColor(booking.status),
                    }}>
                      {booking.status}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '32px 24px',
                  textAlign: 'center',
                  color: '#6b8aaa',
                }}>No recent bookings</div>
              )}
            </div>
          </div>

          {/* Recent Complaints */}
          <div style={{
            background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
            border: '1px solid #1a3050',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #1a3050',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ color: '#eaf2ff', fontWeight: 600, margin: 0, fontSize: '16px' }}>Recent Complaints</h2>
              <button onClick={() => navigate('/admin/complaints')} style={{
                color: '#f5a623',
                fontSize: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#e09515';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#f5a623';
              }}
              >
                View All →
              </button>
            </div>
            <div>
              {recentComplaints.length > 0 ? (
                recentComplaints.map((complaint) => (
                  <div key={complaint.id} style={{
                    padding: '12px 24px',
                    borderBottom: '1px solid #1a3050',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}>
                      <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{complaint.title}</p>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: getStatusColor(complaint.status),
                        background: getStatusBgColor(complaint.status),
                      }}>
                        {complaint.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p style={{
                      color: '#6b8aaa',
                      fontSize: '12px',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{complaint.description}</p>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '32px 24px',
                  textAlign: 'center',
                  color: '#6b8aaa',
                }}>No recent complaints</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        onSuccess={() => {
          // Refresh or update if needed
        }}
      />
    </div>
  );
};

export default AdminHomePage;