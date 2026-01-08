import { NavLink, useNavigate } from "react-router-dom";
import "../styles/admin.css";

export default function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h2 className="logo">Cerevyn</h2>

      <NavLink to="/admin-dashboard">Dashboard</NavLink>
      <NavLink to="/admin-new">New Requests</NavLink>
      <NavLink to="/admin-ongoing">In Progress</NavLink>
      <NavLink to="/admin-completed">Completed</NavLink>

      <div className="sidebar-bottom">
        <button
          className="logout-btn"
          onClick={() => navigate("/")}
        >
          Logout
        </button>
      </div>
    </div>
  );
}