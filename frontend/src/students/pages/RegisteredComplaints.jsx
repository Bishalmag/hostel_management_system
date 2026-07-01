import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const RegisteredComplaints = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUserComplaints();
  }, [user]);

  const fetchUserComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/complaints/');
      console.log('API Response:', response.data);
      
      const allComplaints = response.data.results || response.data;
      const userComplaints = allComplaints.filter(c => c.user === user?.id);
      setComplaints(userComplaints);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      
      if (err.response?.status === 401) {
        setError('Please login again to view complaints.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check if the backend server is running.');
      } else {
        setError('Failed to load complaints. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'registered':
        return { bg: 'rgba(245, 166, 35, 0.1)', color: '#f5a623', border: 'rgba(245, 166, 35, 0.3)' };
      case 'in_progress':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case 'resolved':
        return { bg: 'rgba(29, 219, 168, 0.1)', color: '#1ddba8', border: 'rgba(29, 219, 168, 0.3)' };
      case 'rejected':
        return { bg: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'rgba(248, 113, 113, 0.3)' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b8aaa', border: 'rgba(107, 114, 128, 0.3)' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getFilteredComplaints = () => {
    if (filter === 'all') return complaints;
    return complaints.filter(c => c.status === filter);
  };

  const filteredComplaints = getFilteredComplaints();
  const stats = {
    total: complaints.length,
    registered: complaints.filter(c => c.status === 'registered').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <div style={{ textAlign: 'center', color: '#6b8aaa', padding: '48px 0' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          Loading your complaints...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={fetchUserComplaints}
              style={{
                padding: '8px 16px',
                background: '#f87171',
                color: '#0a1628',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fca5a5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f87171'}
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/students/complaints/new')}
              style={{
                padding: '8px 16px',
                background: '#f5a623',
                color: '#0a1628',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e09515'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f5a623'}
            >
              Register Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: 0,
          }}>Registered Complaints</h1>
          <p style={{
            color: '#6b8aaa',
            marginTop: '4px',
          }}>Track and monitor your complaint status</p>
        </div>
        <button
          onClick={() => navigate('/students/complaints/new')}
          style={{
            padding: '8px 20px',
            background: '#f87171',
            color: '#0a1628',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f87171';
          }}
        >
          + New Complaint
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Total</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#eaf2ff', marginTop: '4px' }}>{stats.total}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Registered</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#f5a623', marginTop: '4px' }}>{stats.registered}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>In Progress</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#60a5fa', marginTop: '4px' }}>{stats.in_progress}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Resolved</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#1ddba8', marginTop: '4px' }}>{stats.resolved}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>Rejected</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#f87171', marginTop: '4px' }}>{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        borderBottom: '1px solid #1a3050',
        marginBottom: '24px',
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: filter === 'all' ? '#f87171' : '#6b8aaa',
            borderBottom: filter === 'all' ? '2px solid #f87171' : '2px solid transparent',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (filter !== 'all') e.currentTarget.style.color = '#c8daf0';
          }}
          onMouseLeave={(e) => {
            if (filter !== 'all') e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          All Complaints
          <span style={{
            marginLeft: '8px',
            padding: '0px 6px',
            fontSize: '10px',
            background: 'rgba(107, 114, 128, 0.2)',
            borderRadius: '9999px',
            color: '#6b8aaa',
          }}>{stats.total}</span>
        </button>
        <button
          onClick={() => setFilter('registered')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: filter === 'registered' ? '#f5a623' : '#6b8aaa',
            borderBottom: filter === 'registered' ? '2px solid #f5a623' : '2px solid transparent',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (filter !== 'registered') e.currentTarget.style.color = '#c8daf0';
          }}
          onMouseLeave={(e) => {
            if (filter !== 'registered') e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          Registered
          <span style={{
            marginLeft: '8px',
            padding: '0px 6px',
            fontSize: '10px',
            background: 'rgba(245, 166, 35, 0.2)',
            borderRadius: '9999px',
            color: '#f5a623',
          }}>{stats.registered}</span>
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: filter === 'in_progress' ? '#60a5fa' : '#6b8aaa',
            borderBottom: filter === 'in_progress' ? '2px solid #60a5fa' : '2px solid transparent',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (filter !== 'in_progress') e.currentTarget.style.color = '#c8daf0';
          }}
          onMouseLeave={(e) => {
            if (filter !== 'in_progress') e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          In Progress
          <span style={{
            marginLeft: '8px',
            padding: '0px 6px',
            fontSize: '10px',
            background: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '9999px',
            color: '#60a5fa',
          }}>{stats.in_progress}</span>
        </button>
        <button
          onClick={() => setFilter('resolved')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: filter === 'resolved' ? '#1ddba8' : '#6b8aaa',
            borderBottom: filter === 'resolved' ? '2px solid #1ddba8' : '2px solid transparent',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (filter !== 'resolved') e.currentTarget.style.color = '#c8daf0';
          }}
          onMouseLeave={(e) => {
            if (filter !== 'resolved') e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          Resolved
          <span style={{
            marginLeft: '8px',
            padding: '0px 6px',
            fontSize: '10px',
            background: 'rgba(29, 219, 168, 0.2)',
            borderRadius: '9999px',
            color: '#1ddba8',
          }}>{stats.resolved}</span>
        </button>
        <button
          onClick={() => setFilter('rejected')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: filter === 'rejected' ? '#f87171' : '#6b8aaa',
            borderBottom: filter === 'rejected' ? '2px solid #f87171' : '2px solid transparent',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (filter !== 'rejected') e.currentTarget.style.color = '#c8daf0';
          }}
          onMouseLeave={(e) => {
            if (filter !== 'rejected') e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          Rejected
          <span style={{
            marginLeft: '8px',
            padding: '0px 6px',
            fontSize: '10px',
            background: 'rgba(248, 113, 113, 0.2)',
            borderRadius: '9999px',
            color: '#f87171',
          }}>{stats.rejected}</span>
        </button>
      </div>

      {/* Complaints Table */}
      {filteredComplaints.length === 0 ? (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', color: '#3a5070' }}></div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#eaf2ff', marginBottom: '8px' }}>No Complaints Found</h3>
          <p style={{ color: '#6b8aaa', marginBottom: '24px' }}>
            {filter === 'all' 
              ? "You haven't registered any complaints yet." 
              : `You don't have any ${filter.replace('_', ' ')} complaints.`}
          </p>
          {(filter === 'all' || filter === 'registered') && (
            <button
              onClick={() => navigate('/students/complaints/new')}
              style={{
                padding: '8px 24px',
                background: '#f87171',
                color: '#0a1628',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fca5a5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f87171'}
            >
              Register a Complaint
            </button>
          )}
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{
                background: 'rgba(18, 36, 72, 0.3)',
                borderBottom: '1px solid #1a3050',
              }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted On</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '10px', fontWeight: 500, color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid #1a3050' }}>
                {filteredComplaints.map((complaint) => {
                  const statusStyle = getStatusColor(complaint.status);
                  return (
                    <tr key={complaint.id} style={{
                      borderBottom: '1px solid rgba(26, 48, 80, 0.5)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(18, 36, 72, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ color: '#6b8aaa', fontSize: '14px', margin: 0 }}>#{complaint.id}</p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ color: '#eaf2ff', fontWeight: 500, margin: 0 }}>{complaint.title}</p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{
                          color: '#c8daf0',
                          fontSize: '14px',
                          margin: 0,
                          maxWidth: '300px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>{complaint.description}</p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '2px 12px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: 500,
                          border: '1px solid',
                          display: 'inline-block',
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderColor: statusStyle.border,
                          textTransform: 'capitalize',
                        }}>
                          {complaint.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ color: '#c8daf0', fontSize: '14px', margin: 0 }}>{formatDate(complaint.created_at)}</p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button
                          onClick={() => setSelectedComplaint(complaint)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(18, 36, 72, 0.5)',
                            color: '#f5a623',
                            fontSize: '14px',
                            fontWeight: 500,
                            borderRadius: '8px',
                            border: '1px solid rgba(245, 166, 35, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(18, 36, 72, 0.8)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(18, 36, 72, 0.5)';
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px',
        }}>
          <div style={{
            background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
            border: '1px solid #1a3050',
            borderRadius: '16px',
            maxWidth: '672px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>Complaint Details</h2>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  style={{
                    color: '#6b8aaa',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#eaf2ff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
                >
                  <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '10px', color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Complaint ID</label>
                  <p style={{ color: '#eaf2ff', fontFamily: 'monospace', margin: 0 }}>#{selectedComplaint.id}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '10px', color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Title</label>
                  <p style={{ color: '#eaf2ff', fontWeight: 500, margin: 0 }}>{selectedComplaint.title}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '10px', color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Description</label>
                  <p style={{ color: '#c8daf0', whiteSpace: 'pre-wrap', margin: 0 }}>{selectedComplaint.description}</p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px',
                }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Status</label>
                    <span style={{
                      padding: '2px 12px',
                      borderRadius: '9999px',
                      fontSize: '10px',
                      fontWeight: 500,
                      border: '1px solid',
                      display: 'inline-block',
                      background: getStatusColor(selectedComplaint.status).bg,
                      color: getStatusColor(selectedComplaint.status).color,
                      borderColor: getStatusColor(selectedComplaint.status).border,
                      textTransform: 'capitalize',
                    }}>
                      {selectedComplaint.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Submitted</label>
                    <p style={{ color: '#c8daf0', margin: 0 }}>{formatDate(selectedComplaint.created_at)}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '10px', color: '#6b8aaa', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Last Updated</label>
                  <p style={{ color: '#c8daf0', margin: 0 }}>{formatDate(selectedComplaint.updated_at)}</p>
                </div>

                {selectedComplaint.status === 'resolved' && (
                  <div style={{
                    background: 'rgba(29, 219, 168, 0.1)',
                    border: '1px solid rgba(29, 219, 168, 0.3)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '16px',
                  }}>
                    <p style={{ color: '#1ddba8', fontSize: '14px', margin: 0 }}>✓ Your complaint has been resolved. Thank you for your patience.</p>
                  </div>
                )}

                {selectedComplaint.status === 'rejected' && (
                  <div style={{
                    background: 'rgba(248, 113, 113, 0.1)',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '16px',
                  }}>
                    <p style={{ color: '#f87171', fontSize: '14px', margin: 0 }}>✗ Your complaint has been rejected. Please contact support for more information.</p>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #1a3050',
              }}>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: 'rgba(18, 36, 72, 0.5)',
                    color: '#c8daf0',
                    fontWeight: 500,
                    borderRadius: '8px',
                    border: '1px solid #1a3050',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(18, 36, 72, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(18, 36, 72, 0.5)';
                  }}
                >
                  Close
                </button>
                {selectedComplaint.status === 'registered' && (
                  <button
                    onClick={() => {
                      setSelectedComplaint(null);
                      navigate('/students/complaints/new');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      background: '#f87171',
                      color: '#0a1628',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fca5a5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f87171';
                    }}
                  >
                    Report Another Issue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegisteredComplaints;