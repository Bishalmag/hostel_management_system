import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const statusColors = {
  registered: { bg: 'rgba(245, 166, 35, 0.2)', text: '#f5a623', border: 'rgba(245, 166, 35, 0.3)' },
  in_progress: { bg: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
  resolved: { bg: 'rgba(29, 219, 168, 0.2)', text: '#1ddba8', border: 'rgba(29, 219, 168, 0.3)' },
  rejected: { bg: 'rgba(248, 113, 113, 0.2)', text: '#f87171', border: 'rgba(248, 113, 113, 0.3)' },
};

const ManageComplaints = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const complaintsRes = await api.get('/complaints/');
      const allComplaints = complaintsRes.data.results ?? complaintsRes.data;
      
      const studentsRes = await api.get('/students/');
      const allStudents = studentsRes.data.results ?? studentsRes.data;
      
      const studentMap = {};
      allStudents.forEach(student => {
        studentMap[student.user] = {
          name: student.user_name || student.user?.full_name || `Student ${student.user}`,
          id: student.id
        };
      });
      
      const complaintsWithNames = allComplaints.map(complaint => ({
        ...complaint,
        student_name: studentMap[complaint.user]?.name || `Student ${complaint.user}`,
        student_id: studentMap[complaint.user]?.id
      }));
      
      setComplaints(complaintsWithNames);
    } catch (err) {
      console.error('Error fetching data:', err);
      showError('Failed to load complaints', 'Error');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (id, newStatus) => {
    if (processing === id) return;
    
    setProcessing(id);
    
    const originalComplaint = complaints.find(c => c.id === id);
    if (!originalComplaint) {
      showError('Complaint not found', 'Error');
      setProcessing(null);
      return;
    }
    
    setComplaints(prevComplaints => 
      prevComplaints.map(complaint => 
        complaint.id === id 
          ? { ...complaint, status: newStatus }
          : complaint
      )
    );
    
    try {
      await api.patch(`/complaints/${id}/`, { 
        status: newStatus 
      });
      
      const statusMessages = {
        in_progress: 'started processing',
        resolved: 'resolved',
        rejected: 'rejected'
      };
      
      showSuccess(
        `Complaint #${id} has been ${statusMessages[newStatus] || newStatus}`,
        'Status Updated'
      );
      
      await fetchData();
      
    } catch (err) {
      console.error('Error updating status:', err);
      
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint.id === id 
            ? { ...complaint, status: originalComplaint.status }
            : complaint
        )
      );
      
      let errorMsg = 'Failed to update complaint status. ';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const messages = Object.values(errorData).flat();
          errorMsg += messages.join(', ');
        } else {
          errorMsg += errorData;
        }
      } else {
        errorMsg += 'Please try again.';
      }
      
      showError(errorMsg, 'Update Failed');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    
    setProcessing(id);
    try {
      await api.delete(`/complaints/${id}/`);
      setComplaints(prev => prev.filter(c => c.id !== id));
      showSuccess(`Complaint #${id} has been deleted`, 'Deleted');
    } catch (err) {
      console.error('Error deleting complaint:', err);
      showError('Failed to delete complaint', 'Delete Failed');
    } finally {
      setProcessing(null);
    }
  };

  const getFilteredComplaints = () => {
    if (filter === 'all') return complaints;
    return complaints.filter(c => c.status === filter);
  };

  const filtered = getFilteredComplaints();

  const getStatusBadge = (status) => {
    const colors = {
      registered: { bg: 'rgba(245, 166, 35, 0.2)', text: '#f5a623', border: 'rgba(245, 166, 35, 0.3)' },
      in_progress: { bg: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
      resolved: { bg: 'rgba(29, 219, 168, 0.2)', text: '#1ddba8', border: 'rgba(29, 219, 168, 0.3)' },
      rejected: { bg: 'rgba(248, 113, 113, 0.2)', text: '#f87171', border: 'rgba(248, 113, 113, 0.3)' },
    };
    return colors[status] || { bg: 'rgba(107, 138, 170, 0.2)', text: '#6b8aaa', border: 'rgba(107, 138, 170, 0.3)' };
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const stats = {
    total: complaints.length,
    registered: complaints.filter(c => c.status === 'registered').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>Manage Complaints</h1>
        </div>
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
          Loading complaints...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>Manage Complaints</h1>
        <button
          onClick={fetchData}
          style={{
            padding: '8px 16px',
            background: '#0f2040',
            color: '#eaf2ff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#122448';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0f2040';
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Total</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: '4px 0 0 0',
          }}>{stats.total}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Registered</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#f5a623',
            margin: '4px 0 0 0',
          }}>{stats.registered}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>In Progress</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#60a5fa',
            margin: '4px 0 0 0',
          }}>{stats.in_progress}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Resolved</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1ddba8',
            margin: '4px 0 0 0',
          }}>{stats.resolved}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Rejected</p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#f87171',
            margin: '4px 0 0 0',
          }}>{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        borderBottom: '1px solid #1a3050',
      }}>
        {['all', 'registered', 'in_progress', 'resolved', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'capitalize',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: filter === tab ? '#f5a623' : '#6b8aaa',
              borderBottom: filter === tab ? '2px solid #f5a623' : '2px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (filter !== tab) {
                e.currentTarget.style.color = '#c8daf0';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== tab) {
                e.currentTarget.style.color = '#6b8aaa';
              }
            }}
          >
            {tab === 'all' ? 'All Complaints' : tab.replace('_', ' ')}
            <span style={{
              marginLeft: '8px',
              padding: '2px 6px',
              fontSize: '12px',
              background: 'rgba(107, 138, 170, 0.2)',
              borderRadius: '20px',
            }}>
              {tab === 'all' ? stats.total : stats[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Complaints Table */}
      {filtered.length === 0 ? (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>◇</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#eaf2ff',
            marginBottom: '8px',
          }}>No Complaints Found</h3>
          <p style={{
            color: '#6b8aaa',
            margin: 0,
          }}>
            {filter === 'all' 
              ? "No complaints have been registered yet." 
              : `No ${filter.replace('_', ' ')} complaints found.`}
          </p>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              fontSize: '14px',
              borderCollapse: 'collapse',
            }}>
              <thead style={{
                background: 'rgba(15, 32, 64, 0.5)',
                borderBottom: '1px solid #1a3050',
              }}>
                <tr style={{
                  color: '#6b8aaa',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Student Name</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Title</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Submitted</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((complaint) => {
                  const statusStyle = getStatusBadge(complaint.status);
                  return (
                    <tr
                      key={complaint.id}
                      style={{
                        borderBottom: '1px solid #1a3050',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(18, 36, 72, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ color: '#6b8aaa', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>#{complaint.id}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ color: '#eaf2ff', fontSize: '14px', fontWeight: 500, margin: 0 }}>{complaint.student_name}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ color: '#eaf2ff', fontSize: '14px', fontWeight: 500, margin: 0 }}>{complaint.title}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{
                          color: '#c8daf0',
                          fontSize: '14px',
                          maxWidth: '384px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          margin: 0,
                        }}>{complaint.description}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ color: '#c8daf0', fontSize: '12px', margin: 0 }}>{formatDate(complaint.created_at)}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: `1px solid ${statusStyle.border}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: statusStyle.bg,
                          color: statusStyle.text,
                          textTransform: 'capitalize',
                        }}>
                          {complaint.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {complaint.status === 'registered' && (
                            <>
                              <button
                                onClick={() => updateStatus(complaint.id, 'in_progress')}
                                disabled={processing === complaint.id}
                                style={{
                                  padding: '4px 12px',
                                  background: 'rgba(96, 165, 250, 0.2)',
                                  color: '#60a5fa',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  cursor: processing === complaint.id ? 'not-allowed' : 'pointer',
                                  transition: 'background 0.3s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  opacity: processing === complaint.id ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (processing !== complaint.id) {
                                    e.currentTarget.style.background = 'rgba(96, 165, 250, 0.3)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)';
                                }}
                              >
                                <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Start
                              </button>
                              <button
                                onClick={() => updateStatus(complaint.id, 'rejected')}
                                disabled={processing === complaint.id}
                                style={{
                                  padding: '4px 12px',
                                  background: 'rgba(248, 113, 113, 0.2)',
                                  color: '#f87171',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  cursor: processing === complaint.id ? 'not-allowed' : 'pointer',
                                  transition: 'background 0.3s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  opacity: processing === complaint.id ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (processing !== complaint.id) {
                                    e.currentTarget.style.background = 'rgba(248, 113, 113, 0.3)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)';
                                }}
                              >
                                <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </>
                          )}
                          
                          {complaint.status === 'in_progress' && (
                            <button
                              onClick={() => updateStatus(complaint.id, 'resolved')}
                              disabled={processing === complaint.id}
                              style={{
                                padding: '4px 12px',
                                background: 'rgba(29, 219, 168, 0.2)',
                                color: '#1ddba8',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: processing === complaint.id ? 'not-allowed' : 'pointer',
                                transition: 'background 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: processing === complaint.id ? 0.5 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (processing !== complaint.id) {
                                  e.currentTarget.style.background = 'rgba(29, 219, 168, 0.3)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(29, 219, 168, 0.2)';
                              }}
                            >
                              <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Resolve
                            </button>
                          )}
                          
                          <button
                            onClick={() => navigate(`/admin/complaint/${complaint.id}`)}
                            style={{
                              padding: '4px 12px',
                              background: '#0f2040',
                              color: '#c8daf0',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'background 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#122448';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#0f2040';
                            }}
                          >
                            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          
                          {(complaint.status === 'registered' || complaint.status === 'rejected') && (
                            <button
                              onClick={() => handleDelete(complaint.id)}
                              disabled={processing === complaint.id}
                              style={{
                                padding: '4px 12px',
                                background: 'rgba(248, 113, 113, 0.2)',
                                color: '#f87171',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: processing === complaint.id ? 'not-allowed' : 'pointer',
                                transition: 'background 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: processing === complaint.id ? 0.5 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (processing !== complaint.id) {
                                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.3)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)';
                              }}
                            >
                              <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          )}
                          
                          {complaint.status === 'resolved' && (
                            <span style={{
                              fontSize: '12px',
                              color: '#1ddba8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}>
                              <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ManageComplaints;