import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import RoleSelection from "./pages/RoleSelection";
import ClientLogin from "./pages/ClientLogin";
import AdminLogin from "./pages/AdminLogin";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {

  // 🔥 STEP 4: Restore theme on refresh
  useEffect(() => {
    const savedTheme = localStorage.getItem("clientTheme");
    if (savedTheme === "biofactor") {
      document.body.classList.add("biofactor-theme");
    }
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