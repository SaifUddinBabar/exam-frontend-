import { Routes, Route, Link, useLocation } from "react-router-dom";
import Builder from "./Builder";
import ExamPage from "./ExamPage";
import Ranking from "./RankingPage";

function App() {
  const location = useLocation();

  // 🔥 check if exam page
  const isExamPage = location.pathname.includes("/exam");

  return (
    <div>

      {/* 🔥 Navbar hide during exam */}
      {!isExamPage && (
        <nav style={{ padding: 10, background: "#111" }}>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            🏠 Home
          </Link>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Builder />} />
        <Route path="/exam/:code" element={<ExamPage />} />
        <Route path="/ranking/:code" element={<Ranking />} />
      </Routes>

    </div>
  );
}

export default App;