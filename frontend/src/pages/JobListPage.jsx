import { useEffect, useState } from "react";
import { listJobs } from "../api";
import JobForm from "../components/JobForm";
import JobTable from "../components/JobTable";

function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await listJobs();
      setJobs(res.data.jobs);
    } catch (e) {
      console.error("Failed to fetch jobs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>
        Crawl Jobs
      </h1>
      <JobForm onJobCreated={fetchJobs} />
      {loading ? (
        <p style={{ textAlign: "center", color: "#aaa" }}>Loading...</p>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.9rem", color: "#666" }}>
              {jobs.length} job{jobs.length !== 1 ? "s" : ""} total
            </span>
            <button
              onClick={fetchJobs}
              style={{ backgroundColor: "#e2e8f0", color: "#333", fontSize: "0.8rem" }}
            >
              ↻ Refresh
            </button>
          </div>
          <JobTable jobs={jobs} onRefresh={fetchJobs} />
        </>
      )}
    </div>
  );
}

export default JobListPage;
