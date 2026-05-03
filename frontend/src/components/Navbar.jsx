import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{
      backgroundColor: "#1a1a2e",
      padding: "1rem 2rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    }}>
      <span style={{ fontSize: "1.4rem" }}>🕷️</span>
      <Link to="/" style={{
        color: "white",
        textDecoration: "none",
        fontSize: "1.2rem",
        fontWeight: "700",
        letterSpacing: "0.05em",
      }}>
        WebCrawler
      </Link>
      <span style={{ color: "#aaa", fontSize: "0.85rem", marginLeft: "auto" }}>
        FastAPI + Celery + PostgreSQL
      </span>
    </nav>
  );
}

export default Navbar;
