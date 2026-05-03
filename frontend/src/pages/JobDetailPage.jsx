import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJob, getJobPages, getJobChanges } from "../api";
import PageTable from "../components/PageTable";

const STATUS_COLORS = {
  pending:   { bg: "#fff8e1", color: "#f59e0b" },
  running:   { bg: "#e3f2fd", color: "#1d4ed8" },
  completed: { bg: "#e8f5e9", color: "#16a34a" },
  failed:    { bg: "#fce4ec", color: "#dc2626" },
};

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [pages, setPages] = useState([]);
  const [changes, setChanges] = useState([]);
  const [tab, setTab] = useState("pages");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [jobRes, pagesRes, changesRes] = await Promise.all([
        getJob(id),
        getJobPages(id),
        getJobChanges(id),
      ]);
      setJob(jobRes.data);
      setPages(pagesRes.data.pages);
      setChanges(changesRes.data);
    } catch (e) {
      console.error("Failed to fetch job detail", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <p style={{ textAlign: "center", color: "#aaa" }}>Loading...</p>;
  if (!job) return <p style={{ color: "red" }}>Job not found.</p>;

  const statusStyle = STATUS_COLORS[job.status] || { bg: "#eee", color: "#333" };

  return (
    <div>
      <button
        onClick={() => navigate("/")}
        style={{ backgroundColor: "#e2e8f0", color: "#333", marginBottom: "1.5rem" }}
      >
        ← Back
      </button>

      {/* Job Summary Card */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        padding: "1.5rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        marginBottom: "2rem",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              {job.seed_url}
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#aaa" }}>ID: {job.id}</p>
          </div>
          <span style={{
            backgroundColor: statusStyle.bg,
            color: statusStyle.color,
            padding: "4px 14px",
            borderRadius: "999px",
            fontSize: "0.85rem",
            fontWeight: "700",
            textTransform: "uppercase",
          }}>
            {job.status}
          </span>
        </div>

        <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          {[
            ["Pages Crawled", job.pages_crawled],
            ["Max Depth", job.max_depth],
            ["Max Pages", job.max_pages],
            ["Created", new Date(job.created_at).toLocaleString()],
            ["Updated", new Date(job.updated_at).toLocaleString()],
          ].map(([label, value]) => (
            <div key={label}>
              <p style={{ fontSize: "0.75rem", color: "#aaa", marginBottom: "2px" }}>{label}</p>
              <p style={{ fontSize: "1rem", fontWeight: "600" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {["pages", "changes"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              backgroundColor: tab === t ? "#1a1a2e" : "#e2e8f0",
              color: tab === t ? "white" : "#333",
              padding: "8px 20px",
            }}
          >
            {t === "pages" ? `Pages (${pages.length})` : `Changes (${changes.length})`}
          </button>
        ))}
        <button
          onClick={fetchData}
          style={{ backgroundColor: "#e2e8f0", color: "#333", marginLeft: "auto" }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Tab Content */}
      {tab === "pages" && <PageTable pages={pages} />}
      {tab === "changes" && (
        changes.length === 0
          ? <p style={{ color: "#aaa", padding: "1rem" }}>No changes detected yet. Re-crawl the same URL to detect changes.</p>
          : <PageTable pages={changes} />
      )}
    </div>
  );
}

export default JobDetailPage;
