import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import JobListPage from "./pages/JobListPage";
import JobDetailPage from "./pages/JobDetailPage";

function App() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <Routes>
          <Route path="/" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
