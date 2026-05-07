import React, { useState } from "react";
import Sidebar from "./layouts/Sidebar";
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";
import HomePage from "./layouts/HomePage";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 72 : 220;

  return (
    <div className="bg-gray-950 min-h-screen flex">

      {/* Sidebar */}
      <div
        style={{ width: sidebarWidth }}
        className="fixed top-0 left-0 h-screen z-50"
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* RIGHT SIDE (IMPORTANT CHANGE) */}
      <div
        className="flex flex-col min-h-screen w-full"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <HomePage />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;