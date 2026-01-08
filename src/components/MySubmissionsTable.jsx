import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function MySubmissionsTable({ userId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();

    // 🔴 REALTIME SYNC
    const channel = supabase
      .channel("client-submissions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        fetchSubmissions
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchSubmissions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setRows(data || []);
    setLoading(false);
  }

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div className="table-card">
      <h3 className="table-title">My Submissions</h3>

      <table className="submissions-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Submitted On</th>
            <th>File</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="title-cell">{row.title}</td>

              <td>
                <span
                  className={`status-badge ${row.status.toLowerCase()}`}
                >
                  {row.status}
                </span>
              </td>

              <td className="date-cell">
                {new Date(row.created_at).toLocaleDateString()}
              </td>

              <td>
                {row.file_url ? (
                  <a
                    href={row.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="download-link"
                  >
                    Download
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="placeholder">
          No submissions yet. Click <b>New Submission</b> to get started.
        </div>
      )}
    </div>
  );
}