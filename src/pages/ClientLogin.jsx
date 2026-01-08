import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "../styles/login.css";

export default function ClientLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  setLoading(false);

  if (error) {
    alert(error.message);
    return;
  }

  // 🔐 CLIENT THEME & IDENTIFIER
 if (data.user.email === "biofactor@client.com") {
  localStorage.setItem("clientTheme", "biofactor");
  localStorage.setItem("clientName", "biofactor");
}
else if (data.user.email === "ddyadhagiri@client.com") {
  localStorage.setItem("clientTheme", "ddyadhagiri");
  localStorage.setItem("clientName", "ddyadhagiri");
}
  else {
    localStorage.removeItem("clientTheme");
    localStorage.removeItem("clientName");
  }

  navigate("/client-dashboard");
};

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="brand">Cerevyn</h1>
        <p className="login-subtitle">Client Login</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="client@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">Authorized clients only</p>
      </div>
    </div>
  );
}