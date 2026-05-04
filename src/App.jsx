import { Routes, Route, Link } from "react-router-dom";
import Builder from "./Builder";
import ExamPage from "./ExamPage";
import Ranking from "./RankingPage"; // ✅ correct

function App() {
  return (
    <div>

      <nav style={{ padding: 10, background: "#111" }}>
        <Link to="/">🏠 Home</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Builder />} />
        <Route path="/exam/:code" element={<ExamPage />} />
        <Route path="/ranking/:code" element={<Ranking />} />
      </Routes>

    </div>
  );
}

export default App;