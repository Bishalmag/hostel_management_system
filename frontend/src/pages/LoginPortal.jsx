import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPortal = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'admin') navigate('/adminlogin');
    if (role === 'user') navigate('/login');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, var(--bg-gradient-1), var(--bg-gradient-2))`
      }}
    >

      {/* Glow Effects */}
      <div
        className="absolute w-[600px] h-[600px] blur-[140px] rounded-full top-[-150px] left-[-150px]"
        style={{ background: "var(--glow-admin)" }}
      />
      <div
        className="absolute w-[600px] h-[600px] blur-[140px] rounded-full bottom-[-150px] right-[-150px]"
        style={{ background: "var(--glow-user)" }}
      />

      <div className="w-full max-w-4xl relative z-10">

        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            🔐 Login Portal
          </h1>

          <p
            className="text-xl"
            style={{ color: "var(--text-secondary)" }}
          >
            Select your account type to continue
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* ADMIN CARD */}
          <div
            onClick={() => handleRoleSelect('admin')}
            className={`rounded-2xl p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 backdrop-blur-xl ${
              selectedRole === 'admin' ? 'scale-105' : ''
            }`}
            style={{
              background: "var(--card-bg)",
              borderColor: selectedRole === 'admin'
                ? "var(--accent-admin)"
                : "var(--card-border)"
            }}
          >
            <div className="text-center">

              <div className="text-6xl mb-6">👨‍💼</div>

              <h2
                className="text-3xl font-bold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Admin Portal
              </h2>

              <p
                className="text-lg mb-8"
                style={{ color: "var(--text-secondary)" }}
              >
                Access admin dashboard and manage system
              </p>

              <button
                className="w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(90deg, var(--accent-admin), #b91c1c)`,
                  color: "white"
                }}
              >
                Admin Login →
              </button>
            </div>
          </div>

          {/* USER CARD */}
          <div
            onClick={() => handleRoleSelect('user')}
            className={`rounded-2xl p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 backdrop-blur-xl ${
              selectedRole === 'user' ? 'scale-105' : ''
            }`}
            style={{
              background: "var(--card-bg)",
              borderColor: selectedRole === 'user'
                ? "var(--accent-user)"
                : "var(--card-border)"
            }}
          >
            <div className="text-center">

              <div className="text-6xl mb-6">👤</div>

              <h2
                className="text-3xl font-bold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                User Portal
              </h2>

              <p
                className="text-lg mb-8"
                style={{ color: "var(--text-secondary)" }}
              >
                Access your personal user dashboard
              </p>

              <button
                className="w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(90deg, var(--accent-user), #15803d)`,
                  color: "white"
                }}
              >
                User Login →
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center">
          <p style={{ color: "var(--text-primary)" }} className="text-lg">
            Don't have an account?
            <a
              href="/signup"
              className="ml-2 font-bold transition-colors"
              style={{ color: "var(--accent-warning)" }}
            >
              Create one here
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPortal;