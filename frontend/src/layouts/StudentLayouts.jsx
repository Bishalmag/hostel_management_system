import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../components/Auth';
import Sidebar from '../students/components/layouts/Sidebar';
import Navbar  from '../students/components/layouts/Navbar';
import Footer  from '../students/components/layouts/Footer';

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

  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toastList,  setToastList]  = useState([]);
  const [visible,    setVisible]    = useState(false);

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

  return (
    <>
      <div className="flex h-screen overflow-hidden" style={{ background: '#030712' }}>

        {/* Sidebar — left column */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Right column — navbar + content + footer */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Navbar — top */}
          <Navbar
            user={user}
            mobileOpen={mobileOpen}
            onMobileMenuClick={() => setMobileOpen((o) => !o)}
          />

          {/* Scrollable page content */}
          <main
            className={`flex-1 overflow-y-auto transition-all duration-500 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
              <Outlet />
            </div>
          </main>

          <Footer />
        </div>
      </div>

      {/* Toast container */}
      <div className="fixed top-5 right-5 z-[10000] flex flex-col gap-2.5 pointer-events-none">
        {toastList.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3
              px-4 py-3 rounded-xl text-sm text-white font-medium
              shadow-2xl shadow-black/40 border animate-slideIn max-w-xs
              ${toast.type === 'success' ? 'bg-green-600/90  border-green-500/40'  : ''}
              ${toast.type === 'error'   ? 'bg-red-600/90    border-red-500/40'    : ''}
              ${toast.type === 'info'    ? 'bg-indigo-600/90 border-indigo-500/40' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-600/90 border-yellow-500/40' : ''}
            `}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <span className="flex-shrink-0">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error'   && '❌'}
              {toast.type === 'info'    && 'ℹ️'}
              {toast.type === 'warning' && '⚠️'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default StudentLayout;