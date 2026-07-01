import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPortal = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'admin') navigate('/adminlogin');
    if (role === 'user') navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #050d1a, #0a1628)',
      }}
    >
      {/* Glow Effects */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          filter: 'blur(140px)',
          borderRadius: '50%',
          top: '-150px',
          left: '-150px',
          background: 'rgba(220, 38, 38, 0.15)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          filter: 'blur(140px)',
          borderRadius: '50%',
          bottom: '-150px',
          right: '-150px',
          background: 'rgba(245, 166, 35, 0.15)',
        }}
      />

      <div style={{
        width: '100%',
        maxWidth: '896px',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
        }}>
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 700,
              marginBottom: '8px',
              color: '#eaf2ff',
            }}
          >
            Login Portal
          </h1>
          <p
            style={{
              fontSize: '20px',
              color: '#6b8aaa',
            }}
          >
            Select your account type to continue
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {/* ADMIN CARD */}
          <div
            onClick={() => handleRoleSelect('admin')}
            style={{
              borderRadius: '16px',
              padding: '32px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedRole === 'admin' ? 'scale(1.05)' : 'scale(1)',
              background: 'rgba(10, 22, 40, 0.8)',
              backdropFilter: 'blur(12px)',
              border: `2px solid ${selectedRole === 'admin' ? '#dc2626' : '#1a3050'}`,
            }}
            onMouseEnter={(e) => {
              if (selectedRole !== 'admin') {
                e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== 'admin') {
                e.currentTarget.style.borderColor = '#1a3050';
              }
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '24px',
                color: '#eaf2ff',
              }}>◆</div>
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#eaf2ff',
                }}
              >
                Admin Portal
              </h2>
              <p
                style={{
                  fontSize: '18px',
                  marginBottom: '32px',
                  color: '#6b8aaa',
                }}
              >
                Access admin dashboard and manage system
              </p>
              <button
                style={{
                  width: '100%',
                  fontWeight: 700,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(90deg, #dc2626, #991b1b)',
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
              >
                Admin Login →
              </button>
            </div>
          </div>

          {/* USER CARD */}
          <div
            onClick={() => handleRoleSelect('user')}
            style={{
              borderRadius: '16px',
              padding: '32px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedRole === 'user' ? 'scale(1.05)' : 'scale(1)',
              background: 'rgba(10, 22, 40, 0.8)',
              backdropFilter: 'blur(12px)',
              border: `2px solid ${selectedRole === 'user' ? '#f5a623' : '#1a3050'}`,
            }}
            onMouseEnter={(e) => {
              if (selectedRole !== 'user') {
                e.currentTarget.style.borderColor = 'rgba(245, 166, 35, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== 'user') {
                e.currentTarget.style.borderColor = '#1a3050';
              }
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '24px',
                color: '#eaf2ff',
              }}>●</div>
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#eaf2ff',
                }}
              >
                User Portal
              </h2>
              <p
                style={{
                  fontSize: '18px',
                  marginBottom: '32px',
                  color: '#6b8aaa',
                }}
              >
                Access your personal user dashboard
              </p>
              <button
                style={{
                  width: '100%',
                  fontWeight: 700,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(90deg, #f5a623, #c47d0e)',
                  color: '#0a1628',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
              >
                User Login →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#eaf2ff', fontSize: '18px' }}>
            Don't have an account?
            <a
              href="/signup"
              style={{
                marginLeft: '8px',
                fontWeight: 700,
                color: '#f5a623',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#e09515';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#f5a623';
              }}
            >
              Create one here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;