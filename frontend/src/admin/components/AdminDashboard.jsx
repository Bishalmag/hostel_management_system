import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import AdminNavbar from './layouts/Navbar';
import AdminSidebar from './layouts/Sidebar';
import AdminFooter from './layouts/Footer';

import AdminHomePage from './AdminHomePage';
import { Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(false);

  const location = useLocation();
  // console.log("PATHNAME:", location.pathname);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const isHome = location.pathname === "/admin/dashboard";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#030712' }}>

      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminNavbar />

        <main className={`flex-1 overflow-y-auto transition-all duration-500 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">

            {/* 🔥 HOME PAGE INSIDE DASHBOARD */}
            {isHome ? <AdminHomePage /> : <Outlet />}

          </div>
        </main>

        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminDashboard;