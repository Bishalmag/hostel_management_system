import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/Auth";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({
    email: localStorage.getItem("userEmail") || "",
    password: "",
    rememberMe: !!localStorage.getItem("userEmail"),
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate("/login");
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login({ first_name: "User", role: "student" }, "demo");
      navigate("/login");
    }, 800);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#050B18] relative overflow-hidden">

      {/* glow background */}
      <div className="absolute w-[850px] h-[500px] bg-yellow-500/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[850px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

        {/* title */}
        <div className="text-center mb-6">
          <h1 className="text-white text-3xl font-bold">
            Hostel <span className="text-yellow-400">Login</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Access your smart hostel dashboard
          </p>
        </div>

        {/* email */}
        <div className="mb-4">
          <label className="text-gray-300 text-sm">Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-1 p-3 rounded-lg bg-white/10 text-white border border-white/10 focus:border-yellow-400 focus:outline-none"
            placeholder="Enter email"
          />
        </div>

        {/* password */}
        <div className="mb-4">
          <label className="text-gray-300 text-sm">Password</label>

          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/10 focus:border-yellow-400 focus:outline-none pr-10"
              placeholder="Enter password"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* remember */}
        <div className="flex items-center gap-2 mb-6">
          <input type="checkbox" className="accent-yellow-400" />
          <span className="text-gray-400 text-sm">Remember me</span>
        </div>

        {/* button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* links */}
        <div className="flex justify-between text-sm mt-5 text-gray-400">
          <Link to="/forgot-password" className="hover:text-yellow-400">
            Forgot Password
          </Link>
          <Link to="/register" className="hover:text-yellow-400">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;