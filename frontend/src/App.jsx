import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { globalStyles } from "./theme";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import LandingPage from "./pages/LandingPage";
import SingleHostelPage from "./pages/SingleHostelPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";


export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");

  // Inject global styles once
  useEffect(() => {
    const id = "hostel-mgmt-global-styles";

    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = globalStyles;
    document.head.prepend(style);

    return () => style.remove();
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/hostel" element={<SingleHostelPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </main>

      <Footer />
      
    </div>
  );
}