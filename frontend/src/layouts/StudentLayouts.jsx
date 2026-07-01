import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../components/Auth';
import Sidebar from '../students/components/layouts/Sidebar';
import Navbar from '../students/components/layouts/Navbar';
import Footer from '../students/components/layouts/Footer';

// ── Toast store ───────────────────────────────────────────────────────────────
let _setToasts = null;

export const showToast = (message, type = 'info', duration = 3500) => {
  if (!_setToasts) return;
  const id = Date.now();
  _setToasts((prev) => [...prev, { id, message, type }]);
  setTimeout(() => _setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
};

// ── Component ─────────────────────────────────────────────────────────────────
const StudentLayout = () => {
  const { user } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toastList, setToastList] = useState([]);
  const [visible, setVisible] = useState(false);

  _setToasts = setToastList;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getToastColors = (type) => {
    switch (type) {
      case 'success': return { bg: 'rgba(29, 219, 168, 0.9)', border: 'rgba(29, 219, 168, 0.4)' };
      case 'error': return { bg: 'rgba(248, 113, 113, 0.9)', border: 'rgba(248, 113, 113, 0.4)' };
      case 'info': return { bg: 'rgba(167, 139, 250, 0.9)', border: 'rgba(167, 139, 250, 0.4)' };
      case 'warning': return { bg: 'rgba(245, 166, 35, 0.9)', border: 'rgba(245, 166, 35, 0.4)' };
      default: return { bg: 'rgba(107, 114, 128, 0.9)', border: 'rgba(107, 114, 128, 0.4)' };
    }
  };

  return (
    <>
      <div style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#050d1a',
      }}>
        {/* Sidebar — left column */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Right column — navbar + content + footer */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}>
          {/* Navbar — top */}
          <Navbar
            user={user}
            mobileOpen={mobileOpen}
            onMobileMenuClick={() => setMobileOpen((o) => !o)}
          />

          {/* Scrollable page content */}
          <main style={{
            flex: 1,
            overflowY: 'auto',
            transition: 'all 0.5s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
          }}>
            <div style={{
              width: '100%',
              padding: '24px',
            }}>
              <Outlet />
            </div>
          </main>

          <Footer />
        </div>
      </div>

      {/* Toast container */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}>
        {toastList.map((toast) => {
          const colors = getToastColors(toast.type);
          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#eaf2ff',
                fontWeight: 500,
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                border: `1px solid ${colors.border}`,
                maxWidth: '320px',
                background: colors.bg,
                backdropFilter: 'blur(8px)',
                animation: 'slideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards',
              }}
            >
              <span style={{
                flexShrink: 0,
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: colors.border,
              }} />
              {toast.message}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default StudentLayout;