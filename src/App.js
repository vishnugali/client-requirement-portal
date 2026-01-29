import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import RoleSelection from "./pages/RoleSelection";
import ClientLogin from "./pages/ClientLogin";
import AdminLogin from "./pages/AdminLogin";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  useEffect(() => {
    // ✅ Apply saved theme safely
    const theme = localStorage.getItem("clientTheme");
    if (theme && document.body) {
      document.body.className = ""; // remove previous theme
      document.body.classList.add(theme);
    }

    // ✅ Make body visible after theme is applied
    document.body.style.visibility = "visible";
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;