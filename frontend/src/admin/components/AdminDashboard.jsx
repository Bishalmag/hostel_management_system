// src/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./layouts/Sidebar";
import AdminNavbar from "./layouts/Navbar";
import AdminFooter from "./layouts/Footer";
import AdminHomePage from "./AdminHomePage";

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = collapsed ? "90px" : "280px";
  
  // Layout Constants
  const navbarHeight = "56px";
  const footerHeight = "48px";
  const middleLayoutHeight = `calc(100vh - ${navbarHeight} - ${footerHeight})`;

  const isHome = location.pathname === "/admin/dashboard";

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#050d1a',
      overflow: 'hidden'
    }}>
      {/* NAVBAR - Fixed at top, full width */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: navbarHeight,
        backgroundColor: '#0a1628',
        borderBottom: '1px solid #1a3050',
        flexShrink: 0,
      }}>
        <AdminNavbar
          mobileOpen={mobileOpen}
          onMobileMenuClick={() => setMobileOpen(!mobileOpen)}
        />
      </div>

      {/* MAIN LAYOUT - Sandwiched vertically between navbar and footer */}
      <div style={{ 
        display: 'flex', 
        flex: 1,
        marginTop: navbarHeight,
        height: middleLayoutHeight,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* SIDEBAR - Fixed on left, ending above the footer */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: navbarHeight,
            zIndex: 40,
            width: sidebarWidth,
            height: middleLayoutHeight,
            backgroundColor: '#0a1628',
            borderRight: '1px solid #1a3050',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            display: isMobile ? 'none' : 'block',
            flexShrink: 0,
          }}
        >
          <AdminSidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
        </div>

        {/* MOBILE SIDEBAR - Overlay, ending above the footer */}
        {mobileOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                top: navbarHeight,
                left: 0,
                zIndex: 45,
                width: '280px',
                height: middleLayoutHeight,
                backgroundColor: '#0a1628',
                borderRight: '1px solid #1a3050',
              }}
            >
              <AdminSidebar
                collapsed={false}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
              />
            </div>
            {/* Backdrop bounded between navbar and footer */}
            <div
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                top: navbarHeight,
                bottom: footerHeight,
                backgroundColor: 'rgba(0,0,0,0.6)',
                zIndex: 44,
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setMobileOpen(false)}
            />
          </>
        )}

        {/* MAIN CONTENT - With scrollable area */}
        <div
          style={{
            flex: 1,
            marginLeft: isMobile ? '0px' : sidebarWidth,
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            height: middleLayoutHeight,
            backgroundColor: '#050d1a',
          }}
        >
          {/* Scrollable content area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px',
            backgroundColor: '#050d1a',
          }}>
            {isHome ? <AdminHomePage /> : <Outlet />}
          </div>
        </div>
      </div>

      {/* FOOTER - Fixed at bottom, full width from left to right (like Navbar) */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        height: footerHeight,
        backgroundColor: '#0a1628',
        borderTop: '1px solid #1a3050',
        flexShrink: 0,
        transition: 'all 0.3s ease',
      }}>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminDashboard;