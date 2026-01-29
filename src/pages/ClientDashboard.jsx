import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "../styles/dashboard.css";
import MySubmissionsTable from "../components/MySubmissionsTable";

import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

export default function ClientDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [clientTheme, setClientTheme] = useState("");
  const [clientName, setClientName] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    ongoing: 0,
    completed: 0,
    rejected: 0,
  });

  /* =========================
     APPLY THEME + CLIENT NAME
  ========================= */
  useEffect(() => {
    const theme = localStorage.getItem("clientTheme");

    document.body.className = "";
    if (theme) {
      document.body.classList.add(theme);
      setClientTheme(theme);
    }

    if (theme === "biofactor-theme") setClientName("biofactor");
    if (theme === "ddyadhagiri-theme") setClientName("ddyadhagiri");
  }, []);

  /* =========================
     AUTH
  ========================= */
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        navigate("/"); // ✅ ROLE SELECTION PAGE
        return;
      }

      setUser(data.user);
      fetchStats(data.user.id);
    };

    init();
  }, [navigate]);

  /* =========================
     FETCH KPI
  ========================= */
  const fetchStats = async (userId) => {
    const { data } = await supabase
      .from("submissions")
      .select("status")
      .eq("client_id", userId);

    if (!data) return;

    setStats({
      total: data.length,
      pending: data.filter((d) => d.status === "pending").length,
      ongoing: data.filter((d) => d.status === "ongoing").length,
      completed: data.filter((d) => d.status === "completed").length,
      rejected: data.filter(d => d.status === "rejected").length,
    });
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!title || !file) {
      alert("Title and file are required");
      return;
    }

    setSubmitting(true);
    const fileName = `${Date.now()}_${file.name}`;

    await supabase.storage.from("client-files").upload(fileName, file);

    const { data: fileData } = supabase.storage
      .from("client-files")
      .getPublicUrl(fileName);

    await supabase.from("submissions").insert({
      client_id: user.id,
      client_name: clientName,
      title,
      description,
      file_url: fileData.publicUrl,
      status: "pending",
    });

    await fetchStats(user.id);

    setTitle("");
    setDescription("");
    setFile(null);
    setActiveTab("dashboard");
    setSubmitting(false);
  };

  /* =========================
     LOGOUT (✅ FIXED)
  ========================= */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("clientTheme");
    document.body.className = "";
    navigate("/"); // ✅ ROLE SELECTION PAGE
  };

  if (!user) return <div className="loading">Loading...</div>;

  const chartData = [
    { name: "Pending", value: stats.pending },
    { name: "Ongoing", value: stats.ongoing },
    { name: "Completed", value: stats.completed },
    { name: "Rejected", value: stats.rejected },
  ];

  return (
    <div className="layout">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="logo-container">
          {clientTheme === "biofactor-theme" && (
            <img src="/biofactor-logo.png" alt="Biofactor Logo" />
          )}
          {clientTheme === "ddyadhagiri-theme" && (
            <img src="/ddyadhagiri-logo.png" alt="DD Yadhagiri Logo" />
          )}
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button onClick={() => setActiveTab("new")}>New Submission</button>
          <button onClick={() => setActiveTab("submissions")}>
            My Submissions
          </button>
          <button onClick={() => setActiveTab("settings")}>Settings</button>
        </nav>

        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* ================= CONTENT ================= */}
      <main className="content">
        {activeTab === "dashboard" && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card">
                <span>Total</span>
                <h1>{stats.total}</h1>
              </div>
              <div className="kpi-card">
                <span>Pending</span>
                <h1>{stats.pending}</h1>
              </div>
              <div className="kpi-card">
                <span>Ongoing</span>
                <h1>{stats.ongoing}</h1>
              </div>
              <div className="kpi-card">
                <span>Completed</span>
                <h1>{stats.completed}</h1>
              </div>
              <div className="kpi-card rejected">
  <span>Rejected</span>
  <h1>{stats.rejected}</h1>
</div>
            </div>

            <div className="graph-card">
              <h3>Project Status Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={110}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === "new" && (
          <div className="form-card">
            <h2>Submit New Requirement</h2>
            <input
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Requirement"}
            </button>
          </div>
        )}

        {activeTab === "submissions" && (
          <MySubmissionsTable userId={user.id} />
        )}

        {activeTab === "settings" && (
          <div className="settings-card">
            <h2>Support & Help</h2>
            <p className="muted">
              For any assistance regarding submissions or services, reach out to
              us.
            </p>

            <div className="support-item">
              📧 <span>support@cerevyn.com</span>
            </div>

            <div className="support-item">
              📞 <span>+91 98765 43210</span>
            </div>

            <div className="support-item">
              🕒 <span>Mon – Fri, 10:00 AM – 6:00 PM</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}