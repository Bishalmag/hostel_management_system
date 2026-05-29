import React from 'react';

const AdminFooter = () => (
  <footer className="flex-shrink-0 border-t border-gray-800 bg-gray-900 px-6 py-2.5 flex items-center justify-between">
    <p className="text-xs text-gray-600">
      © {new Date().getFullYear()} <span className="font-mono text-gray-500">Student Management System</span> — Admin Portal
    </p>
    <div className="flex items-center gap-3 text-xs text-gray-600">
      <span>v1.0.0</span>
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
    </div>
  </footer>
);

export default AdminFooter;