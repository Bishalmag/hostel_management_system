import React from 'react';

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="flex-shrink-0 border-t border-gray-800 bg-gray-900 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
      {/* Left - Copyright */}
      <p>© {currentYear} <span className="text-gray-400">Hostel Management</span></p>
      
      {/* Center - Status */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Live</span>
        </span>
        <span className="hidden sm:inline text-gray-700">|</span>
        <span className="hidden sm:inline">v2.0.0</span>
      </div>
      
      {/* Right - Quick Links */}
      <div className="flex items-center gap-3">
        <a href="#" className="hover:text-gray-300 transition-colors">Docs</a>
        <span className="text-gray-700">|</span>
        <a href="#" className="hover:text-gray-300 transition-colors">Support</a>
        <span className="text-gray-700">|</span>
        <span className="text-gray-600">Admin</span>
      </div>
    </footer>
  );
};

export default AdminFooter;