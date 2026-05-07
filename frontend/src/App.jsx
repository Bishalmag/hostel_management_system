import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { globalStyles } from "./theme";

import LandingPage from "./pages/LandingPage";
import SingleHostelPage from "./pages/SingleHostelPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import StudentHomePage from "./students/components/layouts/HomePage";

import MainLayout from "./layouts/MainLayouts";
import StudentLayout from "./layouts/StudentLayouts";

export default function App() {
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
      <main style={{ flex: 1 }}>
        <Routes>

          {/* MAIN LAYOUT */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/hostel" element={<SingleHostelPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* STUDENT LAYOUT */}
          <Route path="/students" element={<StudentLayout />}>
            <Route index element={<StudentHomePage />} />
            <Route path="homepage" element={<StudentHomePage />} />
          </Route>

        </Routes>
      </main>
    </div>
  );
}