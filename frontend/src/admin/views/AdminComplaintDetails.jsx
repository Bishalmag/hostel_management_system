import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

const AdminComplaintDetails = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/complaints/${complaintId}/`);
      const complaintData = response.data;
      
      let studentName = `Student ${complaintData.user}`;
      try {
        const studentRes = await api.get('/students/');
        const students = studentRes.data.results || studentRes.data;
        const student = students.find(s => s.user === complaintData.user);
        if (student) {
          studentName = student.user_name || student.user?.full_name || studentName;
        }
      } catch (e) {
        console.log('Could not fetch student name');
      }
      
      setComplaint({
        ...complaintData,
        student_name: studentName,
      });
      
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError('Failed to load complaint details');
      showError('Failed to load complaint details', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (processing) return;
    
    setProcessing(true);
    try {
      await api.patch(`/complaints/${complaintId}/`, { status: newStatus });
      
      setComplaint(prev => ({ ...prev, status: newStatus }));
      
      const statusMessages = {
        in_progress: 'started processing',
        resolved: 'resolved',
        rejected: 'rejected'
      };
      
      showSuccess(
        `Complaint #${complaintId} has been ${statusMessages[newStatus] || newStatus}`,
        'Status Updated'
      );
      
      await fetchComplaintDetails();
      
    } catch (err) {
      console.error('Error updating status:', err);
      showError('Failed to update complaint status', 'Error');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusStyle = (status) => {
    const colors = {
      registered: { bg: 'rgba(245, 166, 35, 0.2)', text: '#f5a623', border: 'rgba(245, 166, 35, 0.3)' },
      in_progress: { bg: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
      resolved: { bg: 'rgba(29, 219, 168, 0.2)', text: '#1ddba8', border: 'rgba(29, 219, 168, 0.3)' },
      rejected: { bg: 'rgba(248, 113, 113, 0.2)', text: '#f87171', border: 'rgba(248, 113, 113, 0.3)' },
    };
    return colors[status] || { bg: 'rgba(107, 138, 170, 0.2)', text: '#6b8aaa', border: 'rgba(107, 138, 170, 0.3)' };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'registered': return '◆';
      case 'in_progress': return '◈';
      case 'resolved': return '✓';
      case 'rejected': return '✕';
      default: return '◇';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '256px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b8aaa' }}>Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div style={{
        maxWidth: '896px',
        margin: '0 auto',
        padding: '24px',
      }}>
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#f87171', marginBottom: '16px' }}>{error || 'Complaint not found'}</p>
          <button
            onClick={() => navigate('/admin/complaints')}
            style={{
              padding: '8px 16px',
              background: '#f5a623',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e09515';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5a623';
            }}
          >
            Back to Complaints
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(complaint.status);

  return (
    <div style={{
      maxWidth: '896px',
      margin: '0 auto',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/complaints')}
        style={{
          color: '#6b8aaa',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '14px',
          marginBottom: '16px',
          transition: 'color 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#f5a623';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#6b8aaa';
        }}
      >
        ← Back to Complaints
      </button>

      {/* Header */}
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
            margin: 0,
          }}>Complaint Details</h1>
          <p style={{
            color: '#6b8aaa',
            marginTop: '4px',
            marginBottom: 0,
          }}>Complaint #{complaint.id}</p>
        </div>
        <span style={{
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 500,
          border: `1px solid ${statusStyle.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: statusStyle.bg,
          color: statusStyle.text,
          textTransform: 'capitalize',
        }}>
          {getStatusIcon(complaint.status)}
          {complaint.status?.replace('_', ' ')}
        </span>
      </div>

      {/* Student Info */}
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a3050',
          background: 'rgba(15, 32, 64, 0.3)',
        }}>
          <h2 style={{
            color: '#eaf2ff',
            fontWeight: 600,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
          }}>
            <span style={{ fontSize: '20px' }}>◉</span> Student Information
          </h2>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            <div>
              <p style={{
                color: '#6b8aaa',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
              }}>Student Name</p>
              <p style={{
                color: '#eaf2ff',
                fontSize: '18px',
                fontWeight: 600,
                marginTop: '4px',
                marginBottom: 0,
              }}>{complaint.student_name}</p>
            </div>
            <div>
              <p style={{
                color: '#6b8aaa',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
              }}>Student ID</p>
              <p style={{
                color: '#eaf2ff',
                fontSize: '18px',
                fontWeight: 600,
                marginTop: '4px',
                marginBottom: 0,
              }}>#{complaint.user}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Details */}
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a3050',
          background: 'rgba(15, 32, 64, 0.3)',
        }}>
          <h2 style={{
            color: '#eaf2ff',
            fontWeight: 600,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
          }}>
            <span style={{ fontSize: '20px' }}>◇</span> Complaint Information
          </h2>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{
              color: '#6b8aaa',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: 0,
            }}>Title</p>
            <p style={{
              color: '#eaf2ff',
              fontSize: '18px',
              fontWeight: 600,
              marginTop: '4px',
              marginBottom: 0,
            }}>{complaint.title}</p>
          </div>
          <div>
            <p style={{
              color: '#6b8aaa',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: 0,
            }}>Description</p>
            <p style={{
              color: '#c8daf0',
              marginTop: '4px',
              marginBottom: 0,
              whiteSpace: 'pre-wrap',
            }}>{complaint.description}</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            <div>
              <p style={{
                color: '#6b8aaa',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
              }}>Submitted On</p>
              <p style={{
                color: '#eaf2ff',
                marginTop: '4px',
                marginBottom: 0,
              }}>{formatDate(complaint.created_at)}</p>
            </div>
            <div>
              <p style={{
                color: '#6b8aaa',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
              }}>Last Updated</p>
              <p style={{
                color: '#eaf2ff',
                marginTop: '4px',
                marginBottom: 0,
              }}>{formatDate(complaint.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a3050',
          background: 'rgba(15, 32, 64, 0.3)',
        }}>
          <h2 style={{
            color: '#eaf2ff',
            fontWeight: 600,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
          }}>
            <span style={{ fontSize: '20px' }}>◆</span> Actions
          </h2>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {complaint.status === 'registered' && (
              <>
                <button
                  onClick={() => updateStatus('in_progress')}
                  disabled={processing}
                  style={{
                    padding: '8px 16px',
                    background: '#60a5fa',
                    color: '#0a1628',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    cursor: processing ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s ease',
                    opacity: processing ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!processing) {
                      e.currentTarget.style.background = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!processing) {
                      e.currentTarget.style.background = '#60a5fa';
                    }
                  }}
                >
                  Start Processing
                </button>
                <button
                  onClick={() => updateStatus('rejected')}
                  disabled={processing}
                  style={{
                    padding: '8px 16px',
                    background: '#f87171',
                    color: '#0a1628',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    cursor: processing ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s ease',
                    opacity: processing ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!processing) {
                      e.currentTarget.style.background = '#ef4444';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!processing) {
                      e.currentTarget.style.background = '#f87171';
                    }
                  }}
                >
                  Reject Complaint
                </button>
              </>
            )}
            
            {complaint.status === 'in_progress' && (
              <button
                onClick={() => updateStatus('resolved')}
                disabled={processing}
                style={{
                  padding: '8px 16px',
                  background: '#1ddba8',
                  color: '#0a1628',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 500,
                  cursor: processing ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s ease',
                  opacity: processing ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!processing) {
                    e.currentTarget.style.background = '#16c39a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!processing) {
                    e.currentTarget.style.background = '#1ddba8';
                  }
                }}
              >
                Mark as Resolved
              </button>
            )}
            
            {complaint.status === 'resolved' && (
              <span style={{
                padding: '8px 16px',
                background: 'rgba(29, 219, 168, 0.2)',
                color: '#1ddba8',
                border: '1px solid rgba(29, 219, 168, 0.3)',
                borderRadius: '8px',
              }}>
                ✓ This complaint has been resolved
              </span>
            )}
            
            {complaint.status === 'rejected' && (
              <span style={{
                padding: '8px 16px',
                background: 'rgba(248, 113, 113, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: '8px',
              }}>
                ✕ This complaint has been rejected
              </span>
            )}
            
            <button
              onClick={() => navigate('/admin/complaints')}
              style={{
                padding: '8px 16px',
                background: '#0f2040',
                color: '#c8daf0',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#122448';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0f2040';
              }}
            >
              Back to List
            </button>
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
    </div>
  );
};

export default AdminComplaintDetails;