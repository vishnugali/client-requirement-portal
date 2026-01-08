import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "../styles/dashboard.css";
import MySubmissionsTable from "../components/MySubmissionsTable";

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ClientDashboard() {
  const navigate = useNavigate();

  /* =========================
     STATE
  ========================= */
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    ongoing: 0,
    completed: 0,
  });

  const [clientName, setClientName] = useState("");

  /* =========================
     APPLY CLIENT THEME + NAME
  ========================= */
  useEffect(() => {
    const theme = localStorage.getItem("clientTheme");

    document.body.className = "";
    if (theme) {
      document.body.classList.add(theme);
    }

    // 🔥 Map theme → client_name
    if (theme === "biofactor") {
      setClientName("biofactor");
    } else if (theme === "ddyadhagiri") {
      setClientName("ddyadhagiri");
    }
  }, []);

  /* =========================
     AUTH + REALTIME
  ========================= */
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        navigate("/client-login");
        return;
      }

      setUser(data.user);
      fetchStats(data.user.id);

      supabase
        .channel("client-dashboard")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "submissions",
            filter: `client_id=eq.${data.user.id}`,
          },
          () => fetchStats(data.user.id)
        )
        .subscribe();
    };

    init();
  }, [navigate]);

  /* =========================
     FETCH KPI DATA
  ========================= */
  const fetchStats = async (userId) => {
    const { data } = await supabase
      .from("submissions")
      .select("status")
      .eq("client_id", userId);

    if (!data) return;

    setStats({
      total: data.length,
      pending: data.filter(d => d.status === "pending").length,
      ongoing: data.filter(d => d.status === "ongoing").length,
      completed: data.filter(d => d.status === "completed").length,
    });
  };

  /* =========================
     SUBMIT REQUIREMENT
  ========================= */
  const handleSubmit = async () => {
    if (!title || !file) {
      alert("Title and file are required");
      return;
    }

    setSubmitting(true);

    const fileName = `${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("client-files")
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      setSubmitting(false);
      return;
    }

    const { data: fileData } = supabase.storage
      .from("client-files")
      .getPublicUrl(fileName);

    const { error } = await supabase.from("submissions").insert({
      client_id: user.id,
      client_name: clientName, // ✅ PHASE-2 CORE CHANGE
      title,
      description,
      file_url: fileData.publicUrl,
      status: "pending",
    });

    if (error) {
      alert(error.message);
    } else {
      setTitle("");
      setDescription("");
      setFile(null);
      setActiveTab("dashboard");
    }

    setSubmitting(false);
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("clientTheme");
    document.body.className = "";
    navigate("/client-login");
  };

  if (!user) return <div className="loading">Loading...</div>;

  const chartData = [
    { name: "Pending", value: stats.pending },
    { name: "Ongoing", value: stats.ongoing },
    { name: "Completed", value: stats.completed },
  ];

  return (
    <div className="layout">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="logo-container">
          <img src="/client-logo.png" alt="Client Logo" />
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button onClick={() => setActiveTab("new")}>New Submission</button>
          <button onClick={() => setActiveTab("submissions")}>My Submissions</button>
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
                <span>Total Submissions</span>
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
            </div>

            <div className="graph-card">
              <h3>Project Status Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
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
          <div className="placeholder">Settings (Coming soon)</div>
        )}
      </main>
    </div>
  );
}