import { useState } from "react";
import { createJob } from "../api";

function JobForm({ onJobCreated }) {
  const [seedUrl, setSeedUrl] = useState("");
  const [maxDepth, setMaxDepth] = useState(2);
  const [maxPages, setMaxPages] = useState(20);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!seedUrl) return setError("Please enter a URL");
    setError("");
    setLoading(true);
    try {
      await createJob({
        seed_url: seedUrl,
        max_depth: maxDepth,
        max_pages: maxPages,
        is_scheduled: isScheduled,
        schedule_interval: isScheduled ? scheduleInterval : null,
      });
      setSeedUrl("");
      setIsScheduled(false);
      onJobCreated();
    } catch (e) {
      setError("Failed to create job. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "white",
      borderRadius: "8px",
      padding: "1.5rem",
      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      marginBottom: "2rem",
    }}>
      <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>🕷️ New Crawl Job</h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 3, minWidth: "200px" }}>
          <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: "4px" }}>
            Seed URL
          </label>
          <input
            type="text"
            placeholder="https://example.com"
            value={seedUrl}
            onChange={(e) => setSeedUrl(e.target.value)}
          />
        </div>
        <div style={{ flex: 1, minWidth: "80px" }}>
          <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: "4px" }}>
            Max Depth
          </label>
          <input
            type="number"
            min={1}
            max={5}
            value={maxDepth}
            onChange={(e) => setMaxDepth(Number(e.target.value))}
          />
        </div>
        <div style={{ flex: 1, minWidth: "80px" }}>
          <label style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: "4px" }}>
            Max Pages
          </label>
          <input
            type="number"
            min={1}
            max={200}
            value={maxPages}
            onChange={(e) => setMaxPages(Number(e.target.value))}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ backgroundColor: "#4a90e2", color: "white", padding: "9px 20px" }}
        >
          {loading ? "Submitting..." : "Crawl"}
        </button>
      </div>

      {/* Scheduled crawl option */}
      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isScheduled}
            onChange={(e) => setIsScheduled(e.target.checked)}
            style={{ width: "auto" }}
          />
          Schedule re-crawl
        </label>
        {isScheduled && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", color: "#666" }}>Every</label>
            <input
              type="number"
              min={1}
              max={168}
              value={scheduleInterval}
              onChange={(e) => setScheduleInterval(Number(e.target.value))}
              style={{ width: "70px" }}
            />
            <label style={{ fontSize: "0.85rem", color: "#666" }}>hours</label>
          </div>
        )}
      </div>

      {error && <p style={{ color: "red", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
    </div>
  );
}

export default JobForm;
