// src/admin/components/layouts/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      flexShrink: 0,
      borderTop: '1px solid #1a3050',
      backgroundColor: '#0a1628',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '48px',
      flexWrap: 'wrap',
      gap: '8px',
    }}>
      {/* Left Section - Copyright */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <p style={{
          fontSize: '11px',
          color: '#6b8aaa',
          margin: 0,
        }}>
          © {new Date().getFullYear()} <span style={{ 
            fontFamily: 'monospace', 
            color: '#6b8aaa',
            fontWeight: 600,
          }}>HOSTEL MANAGEMENT</span>
        </p>
        <span style={{
          width: '1px',
          height: '14px',
          backgroundColor: '#1a3050',
        }} />
        <p style={{
          fontSize: '11px',
          color: '#3a5070',
          margin: 0,
        }}>
          SYSTEM
        </p>
      </div>

      {/* Center Section - Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <a href="#" style={{
          fontSize: '11px',
          color: '#6b8aaa',
          textDecoration: 'none',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
        >
          Dashboard
        </a>
        <span style={{
          width: '1px',
          height: '12px',
          backgroundColor: '#1a3050',
        }} />
        <a href="#" style={{
          fontSize: '11px',
          color: '#6b8aaa',
          textDecoration: 'none',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
        >
          Manage
        </a>
        <span style={{
          width: '1px',
          height: '12px',
          backgroundColor: '#1a3050',
        }} />
        <a href="#" style={{
          fontSize: '11px',
          color: '#6b8aaa',
          textDecoration: 'none',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
        >
          Reports
        </a>
        <span style={{
          width: '1px',
          height: '12px',
          backgroundColor: '#1a3050',
        }} />
        <a href="#" style={{
          fontSize: '11px',
          color: '#6b8aaa',
          textDecoration: 'none',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#f5a623'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6b8aaa'}
        >
          Support
        </a>
      </div>

      {/* Right Section - Version & Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{
          fontSize: '11px',
          color: '#3a5070',
        }}>
          v2.0.0
        </span>
        <span style={{
          width: '1px',
          height: '12px',
          backgroundColor: '#1a3050',
        }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#1ddba8',
            display: 'inline-block',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '10px',
            color: '#3a5070',
          }}>
            Admin Online
          </span>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.5; 
            transform: scale(0.8); 
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;