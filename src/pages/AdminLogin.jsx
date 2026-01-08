import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "../styles/login.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/admin-dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card admin">
        <h1 className="brand">Cerevyn Solutions</h1>
        <p className="login-subtitle admin-sub">
          Administrator Access
        </p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="admin@cerevyn.com"
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

          <button
            className="login-btn admin-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>

        <p className="login-footer admin-footer">
          Restricted access • Authorized personnel only
        </p>
      </div>
    </div>
  );
}
