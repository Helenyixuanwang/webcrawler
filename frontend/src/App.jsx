import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import JobListPage from "./pages/JobListPage";
import JobDetailPage from "./pages/JobDetailPage";

function App() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: "1100px", margin: "0 auto", padding: "2rem", width: "100%" }}>
        <Routes>
          <Route path="/" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
        </Routes>
      </div>
      <footer style={{
        backgroundColor: "#1a1a2e",
        color: "#aaa",
        textAlign: "center",
        padding: "1rem",
        fontSize: "0.85rem",
      }}>
        Built by Helen (Yixuan Wang) &nbsp;|&nbsp;
        <a href="https://github.com/Helenyixuanwang" target="_blank" rel="noreferrer"
          style={{ color: "#4a90e2", textDecoration: "none", marginRight: "12px" }}>
          GitHub
        </a>
        <a href="https://www.linkedin.com/in/helenyixuanwang/" target="_blank" rel="noreferrer"
          style={{ color: "#4a90e2", textDecoration: "none" }}>
          LinkedIn
        </a>
      </footer>
    </div>
  );
}

export default App;
