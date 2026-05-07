import React, { useState, useEffect, useRef } from 'react';
import Sidebar from "../students/components/layouts/Sidebar";
import Navbar from "../students/components/layouts/Navbar";
import Footer from "../students/components/layouts/Footer";
import { Outlet } from "react-router-dom";

// ─── Mock user — replace with auth context / API ──────────────────────────────
const mockUser = {
  id: 1,
  name: 'Aakash Sharma',
  email: 'aakash.sharma@college.edu',
  rollNo: 'CS2024051',
  role: 'student',
};

// ─── Toast store (mirrors Vue useToast composable) ────────────────────────────
let _setToasts = null;
export const toasts = [];

export const showToast = (message, type = 'info', duration = 3500) => {
  if (!_setToasts) return;
  const id = Date.now();
  _setToasts((prev) => [...prev, { id, message, type }]);
  setTimeout(() => {
    _setToasts((prev) => prev.filter((t) => t.id !== id));
  }, duration);
};

const StudentLayout = () => {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [toastList,   setToastList]   = useState([]);
  const [visible,     setVisible]     = useState(false);

  // Wire toast store
  _setToasts = setToastList;

  const SIDEBAR_W   = 220;   // px — expanded
  const SIDEBAR_COL = 72;    // px — collapsed
  const sidebarWidth = collapsed ? SIDEBAR_COL : SIDEBAR_W;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Close mobile sidebar on route change / resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      {/* ── Sidebar (fixed left) ────────────────────────────────────────── */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ── Main content area (offset by sidebar) ───────────────────────── */}
      <div
        className="flex min-h-screen w-full"
        style={{ background: '#030712' }}   // gray-950
      >
        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <Navbar
          user={mockUser}
          mobileOpen={mobileOpen}
          onMobileMenuClick={() => setMobileOpen((o) => !o)}
        />

        {/* ── Page content ────────────────────────────────────────────────── */}
        <main
          className={`flex-1 flex flex-col transition-all duration-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {/* Inner padding wrapper — mirrors .main-content from Vue */}
          <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <Footer />
      </div>

      {/* ── Toast Container (mirrors Vue toast-container) ───────────────── */}
      <div className="fixed top-5 right-5 z-[10000] flex flex-col gap-2.5 pointer-events-none">
        {toastList.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3
              px-4 py-3 rounded-xl text-sm text-white font-medium
              shadow-2xl shadow-black/40 border
              animate-slideIn max-w-xs
              ${toast.type === 'success' ? 'bg-green-600/90  border-green-500/40'  : ''}
              ${toast.type === 'error'   ? 'bg-red-600/90    border-red-500/40'    : ''}
              ${toast.type === 'info'    ? 'bg-indigo-600/90 border-indigo-500/40' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-600/90 border-yellow-500/40' : ''}
            `}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            {/* Icon */}
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

      {/* ── Tailwind keyframe for toast slide-in ────────────────────────── */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* Mobile: sidebar takes full margin reset */
        @media (max-width: 767px) {
          .main-offset {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </>
  );
};

export default StudentLayout;