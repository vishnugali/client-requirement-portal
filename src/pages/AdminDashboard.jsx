import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

/* ====== CHART IMPORTS ====== */
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();

  /* ======================
     STATE
  ====================== */
  const [view, setView] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [counts, setCounts] = useState({
    pending: 0,
    ongoing: 0,
    completed: 0,
    rejected: 0
  });

  /* ======================
     FETCH DASHBOARD COUNTS
  ====================== */
  const fetchCounts = async () => {
    const { data } = await supabase.from("submissions").select("status");
    if (!data) return;

    setCounts({
  pending: data.filter(s => s.status === "pending").length,
  ongoing: data.filter(s => s.status === "ongoing").length,
  completed: data.filter(s => s.status === "completed").length,
  rejected: data.filter(s => s.status === "rejected").length,
});
  };

  /* ======================
     FETCH CLIENT DATA
  ====================== */
  const fetchClientSubmissions = async (clientName) => {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("client_name", clientName)
      .order("created_at", { ascending: false });

    setSubmissions(data || []);
  };

  /* ======================
     REALTIME
  ====================== */
  useEffect(() => {
    fetchCounts();

    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        () => {
          fetchCounts();
          if (selectedClient) fetchClientSubmissions(selectedClient);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedClient]);

  /* ======================
     UPDATE STATUS
  ====================== */
 const updateStatus = async (id, status) => {
  const { error } = await supabase
    .from("submissions")
    .update({ status })
    .eq("id", id);

  if (!error) {
    setSubmissions(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status } : item
      )
    );
  }
};

  /* ======================
     LOGOUT
  ====================== */
  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  /* ======================
     CHART DATA
  ====================== */
 const pieData = [
  { name: "Pending", value: counts.pending },
  { name: "Ongoing", value: counts.ongoing },
  { name: "Completed", value: counts.completed },
  { name: "Rejected", value: counts.rejected },
];

  return (
    <div className="admin-container">
      {/* ================= SIDEBAR ================= */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img src="/cerevyn-logo.png" alt="Cerevyn Solutions" />
        </div>

        <button onClick={() => {
          setView("dashboard");
          setSelectedClient(null);
        }}>
          📊 Dashboard
        </button>

        <button onClick={() => {
          setView("clients");
          setSelectedClient(null);
        }}>
          👥 Clients
        </button>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="admin-main">

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <>
            <h1>Status Overview</h1>

            <div className="overview-grid">
              <div className="overview-card pending">
                <h3>Pending</h3>
                <p>{counts.pending}</p>
              </div>

              <div className="overview-card ongoing">
                <h3>Ongoing</h3>
                <p>{counts.ongoing}</p>
              </div>

              <div className="overview-card completed">
                <h3>Completed</h3>
                <p>{counts.completed}</p>
              </div>
                    <div className="overview-card rejected">
        <h3>Rejected</h3>
        <p>{counts.rejected}</p>
      </div>
            </div>

            {/* ====== CHART SECTION ====== */}
            <div className="charts-grid">

              {/* PIE CHART */}
              <div className="chart-card">
                <h2>Request Distribution</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={100}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* BAR VISUALIZATION */}
              <div className="chart-card">
                <h2>Live Workload</h2>

                <div className="progress-row">
                  <label>Pending</label>
                  <div className="progress-bar pending">
                    <div style={{ width: `${counts.pending * 20}px` }} />
                  </div>
                </div>

                <div className="progress-row">
                  <label>Ongoing</label>
                  <div className="progress-bar ongoing">
                    <div style={{ width: `${counts.ongoing * 20}px` }} />
                  </div>
                </div>

                <div className="progress-row">
                  <label>Completed</label>
                  <div className="progress-bar completed">
                    <div style={{ width: `${counts.completed * 20}px` }} />
                  </div>
                </div>

              </div>
            </div>
          </>
        )}

        {/* CLIENT LIST */}
        {view === "clients" && !selectedClient && (
          <>
            <h1>Clients</h1>

            <div className="client-list">
              <div
                className="client-card biofactor"
                onClick={() => {
                  setSelectedClient("biofactor");
                  fetchClientSubmissions("biofactor");
                }}
              >
                Biofactor
              </div>

              <div
                className="client-card ddyadhagiri"
                onClick={() => {
                  setSelectedClient("ddyadhagiri");
                  fetchClientSubmissions("ddyadhagiri");
                }}
              >
                DD Yadhagiri
              </div>
            </div>
          </>
        )}

        {/* CLIENT DATA */}
        {selectedClient && (
          <>
            <h1>
              {selectedClient === "biofactor"
                ? "Biofactor Submissions"
                : "DD Yadhagiri Submissions"}
            </h1>

            <div className="request-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>File</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {submissions.map(s => (
                    <tr key={s.id}>
                      <td>{s.title}</td>
                      <td>{s.description}</td>
                      <td>
                        <a href={s.file_url} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </td>
                      <td>{s.status}</td>
                      <td className="actions">
  {s.status === "pending" && (
    <>
      <button
        className="accept"
        onClick={() => updateStatus(s.id, "ongoing")}
      >
        Accept
      </button>
      <button
        className="reject"
        onClick={() => updateStatus(s.id, "rejected")}
      >
        Reject
      </button>
    </>
  )}

  {s.status === "ongoing" && (
    <button
      className="complete"
      onClick={() => updateStatus(s.id, "completed")}
    >
      Complete
    </button>
  )}

  {s.status === "completed" && (
    <span className="status-pill completed">Completed</span>
  )}

  {s.status === "rejected" && (
    <span className="status-pill rejected">Rejected</span>
  )}
</td>
                    </tr>
                  ))}

                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty">
                        No submissions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}