import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HomePage from "./HomePage";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? "64px" : "260px";

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col">

      {/* TOP NAVBAR - Full width */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar 
          mobileOpen={mobileOpen}
          onMobileMenuClick={() => setMobileOpen(!mobileOpen)}
        />
      </div>

      {/* MAIN LAYOUT BELOW NAVBAR */}
      <div className="flex flex-1 pt-16">
        {/* SIDEBAR */}
        <div
          className="fixed left-0 top-16 z-40 hidden md:block transition-all duration-300"
          style={{
            width: sidebarWidth,
            height: "calc(100vh - 64px)",
          }}
        >
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
        </div>

        {/* MOBILE SIDEBAR */}
        <div className="md:hidden">
          <Sidebar
            collapsed={false}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
        </div>

        {/* MAIN CONTENT */}
        <div
          className="flex-1 transition-all duration-300"
          style={{
            marginLeft: window.innerWidth >= 768 ? sidebarWidth : "0px",
          }}
        >
          <main className="min-h-[calc(100vh-64px)] p-6">
            <HomePage />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
