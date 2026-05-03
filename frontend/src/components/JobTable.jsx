import { useNavigate } from "react-router-dom";
import { deleteJob } from "../api";

const STATUS_COLORS = {
  pending:   { bg: "#fff8e1", color: "#f59e0b" },
  running:   { bg: "#e3f2fd", color: "#1d4ed8" },
  completed: { bg: "#e8f5e9", color: "#16a34a" },
  failed:    { bg: "#fce4ec", color: "#dc2626" },
};

function StatusBadge({ status }) {
  const style = STATUS_COLORS[status] || { bg: "#eee", color: "#333" };
  return (
    <span style={{
      backgroundColor: style.bg,
      color: style.color,
      padding: "3px 10px",
      borderRadius: "999px",
      fontSize: "0.78rem",
      fontWeight: "600",
      textTransform: "uppercase",
    }}>
      {status}
    </span>
  );
}

function JobTable({ jobs, onRefresh }) {
  const navigate = useNavigate();

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this job and all its data?")) return;
    await deleteJob(id);
    onRefresh();
  };

  if (jobs.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "#aaa", padding: "2rem" }}>
        No crawl jobs yet. Submit one above!
      </p>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Seed URL</th>
          <th>Status</th>
          <th>Pages Crawled</th>
          <th>Depth</th>
          <th>Max Pages</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr
            key={job.id}
            onClick={() => navigate(`/jobs/${job.id}`)}
            style={{ cursor: "pointer" }}
          >
            <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {job.seed_url}
            </td>
            <td><StatusBadge status={job.status} /></td>
            <td>{job.pages_crawled}</td>
            <td>{job.max_depth}</td>
            <td>{job.max_pages}</td>
            <td>{new Date(job.created_at).toLocaleString()}</td>
            <td>
              <button
                onClick={(e) => handleDelete(e, job.id)}
                style={{ backgroundColor: "#fee2e2", color: "#dc2626", padding: "4px 10px", fontSize: "0.8rem" }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default JobTable;
