import { useNavigate } from "react-router-dom";
import "../styles/role.css";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="role-container">
      <div className="role-wrapper">
        <h1 className="company-name">Cerevyn Solutions</h1>
        <p className="subtitle">Client Requirement Portal</p>

        <div className="role-grid">
          <div
            className="role-box"
            onClick={() => navigate("/client-login")}
          >
            <h2>Client</h2>
            <p>Submit requirements & track progress</p>
            <span>Continue →</span>
          </div>

          <div
            className="role-box"
            onClick={() => navigate("/admin-login")}
          >
            <h2>Admin</h2>
            <p>Review, manage & complete requests</p>
            <span>Continue →</span>
          </div>
        </div>
      </div>
    </div>
  );
}