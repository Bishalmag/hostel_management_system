import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const Profile = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/students/');
        const all = response.data.results ?? response.data;
        const me = all.find(s => s.user === user?.id);
        if (me) {
          setStudent(me);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '24px' }}>
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
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#f87171' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '12px',
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
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '768px', margin: '0 auto', padding: '24px' }}>
      {/* Header with Avatar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '12px',
          background: 'linear-gradient(to bottom right, #f5a623, #e09515)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: 700,
          color: '#0a1628',
          boxShadow: '0 4px 20px rgba(245, 166, 35, 0.2)',
          flexShrink: 0,
        }}>
          {user?.full_name?.charAt(0) ?? 'S'}
        </div>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: 0,
          }}>{user?.full_name}</h1>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            marginTop: '4px',
          }}>{user?.email}</p>
          <p style={{
            color: '#3a5070',
            fontSize: '12px',
            marginTop: '4px',
          }}>Student ID: {student?.id || 'N/A'}</p>
        </div>
      </div>

      {/* Personal Information */}
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a3050',
        }}>
          <h3 style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#f5a623',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
          }}>
            Personal Information
          </h3>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '24px',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>First Name</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{user?.full_name?.split(' ')[0] || 'N/A'}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>Middle Name</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.middle_name || 'Not provided'}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>Last Name</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{user?.full_name?.split(' ').slice(-1)[0] || 'N/A'}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>Gender</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', textTransform: 'capitalize', margin: 0 }}>{student?.gender || 'Not specified'}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>Email</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{user?.email || 'N/A'}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>Phone</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a3050',
        }}>
          <h3 style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#f5a623',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
          }}>
            Emergency Contact
          </h3>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '24px',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>Guardian Name</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.guardian_name || 'Not provided'}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>Relation</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.guardian_relation || 'Not provided'}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>Contact Number</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.guardian_contact || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Temporary Address */}
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a3050',
        }}>
          <h3 style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#f5a623',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
          }}>
            Temporary Address
          </h3>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '10px',
              color: '#6b8aaa',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}>Address</label>
            <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.temp_address || 'Not provided'}</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '24px',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>City</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.temp_city || 'Not provided'}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>State</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.temp_state || 'Not provided'}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>Pincode</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.temp_pincode || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a3050',
        }}>
          <h3 style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#f5a623',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
          }}>
            Permanent Address
          </h3>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '10px',
              color: '#6b8aaa',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}>Address</label>
            <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.perm_address || 'Not provided'}</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '24px',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>City</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.perm_city || 'Not provided'}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>State</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.perm_state || 'Not provided'}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                color: '#6b8aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>Pincode</label>
              <p style={{ color: '#eaf2ff', fontSize: '14px', margin: 0 }}>{student?.perm_pincode || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      <div style={{
        background: 'rgba(18, 36, 72, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '12px',
          color: '#3a5070',
          margin: 0,
        }}>
          Profile last updated: {student?.updated_at ? new Date(student.updated_at).toLocaleDateString() : 'Never'}
        </p>
      </div>

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

export default Profile;