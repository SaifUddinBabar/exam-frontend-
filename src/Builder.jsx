import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL;

function Builder() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [chapter, setChapter] = useState("");
  const [limit, setLimit] = useState(20);

  const [examData, setExamData] = useState({
    title: "",
    duration: ""
  });

  const [examCode, setExamCode] = useState("");
  const [ranking, setRanking] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingClear, setLoadingClear] = useState(false);

  const linkRef = useRef(null);

  // ================= LOAD SAVED =================
  useEffect(() => {
    const savedCode = localStorage.getItem("examCode");
    if (savedCode) setExamCode(savedCode);
  }, []);

  // ================= LOAD QUESTIONS =================
  useEffect(() => {
    if (!chapter) return;

    fetch(`${API}/api/questions?chapter=${encodeURIComponent(chapter)}&limit=${limit}`)
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, [chapter, limit]);

  // ================= LOAD STATS =================
  const fetchStats = () => {
    fetch(`${API}/api/exams/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => console.log("Stats error"));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ================= SELECT =================
  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(q => q !== id));
    } else {
      setSelected(prev => [...prev, id]);
    }
  };

  const handleExamChange = (e) => {
    setExamData({ ...examData, [e.target.name]: e.target.value });
  };

  // ================= CREATE EXAM =================
  const createExam = async () => {
    if (!examData.title) return alert("Enter title");
    if (selected.length === 0) return alert("Select questions");

    const res = await fetch(`${API}/api/exams/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: examData.title,
        duration: examData.duration,
        questions: selected
      })
    });

    const data = await res.json();

    setExamCode(data.examCode);
    localStorage.setItem("examCode", data.examCode);

    alert("✅ Exam Created!");

    setTimeout(() => {
      linkRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  // ================= RANKING =================
  useEffect(() => {
    if (!examCode) return;

    const fetchRanking = () => {
      fetch(`${API}/api/exams/ranking/${examCode}`)
        .then(res => res.json())
        .then(data => setRanking(data));
    };

    fetchRanking();
    const interval = setInterval(fetchRanking, 3000);

    return () => clearInterval(interval);
  }, [examCode]);

  // ================= COPY =================
  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/exam/${examCode}`
    );
    alert("Copied!");
  };

  // ================= CLEAR DATA =================
  const clearOldData = async () => {
    if (!confirm("Delete old data?")) return;

    try {
      setLoadingClear(true);

      const res = await fetch(`${API}/api/exams/clear-old`, {
        method: "DELETE"
      });

      const data = await res.json();

      alert(`✅ Deleted ${data.examsDeleted} exams & ${data.submissionsDeleted} submissions`);

      // 🔥 refresh stats
      fetchStats();

    } catch (err) {
      alert("❌ Failed to clear data");
    } finally {
      setLoadingClear(false);
    }
  };

  return (
    <div style={{
      padding: 20,
      maxWidth: 1100,
      margin: "auto",
      fontFamily: "Poppins, sans-serif"
    }}>

      <h1>🎓 Teacher Dashboard</h1>

      {/* CREATE */}
      <div style={{
        padding: 20,
        background: "#f1f5f9",
        borderRadius: 16
      }}>
        <input
          name="title"
          placeholder="Exam Title"
          onChange={handleExamChange}
          style={{
            width: "100%",
            padding: 14,
            marginBottom: 10,
            borderRadius: 10
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <select onChange={(e) => setChapter(e.target.value)}>
            <option value="">Select Chapter</option>
            <option value="Web & HTML">Web</option>
            <option value="Programming & Language">Programming</option>
          </select>

          <button onClick={createExam}>
            🚀 Create Exam
          </button>
        </div>
      </div>

      {/* QUESTIONS */}
      <div style={{ marginTop: 30 }}>
        <h3>🧠 Select Questions</h3>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12
        }}>
          {questions.map((q, index) => {
            const isSelected = selected.includes(q._id);

            return (
              <div
                key={q._id}
                onClick={() => toggleSelect(q._id)}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  cursor: "pointer",
                  border: isSelected ? "2px solid green" : "1px solid #ddd",
                  background: isSelected ? "#dcfce7" : "white"
                }}
              >
                <small>Q{index + 1}</small>
                <p>{q.question}</p>
                <small>
                  {isSelected ? "✅ Selected" : "Click to select"}
                </small>
              </div>
            );
          })}
        </div>
      </div>

      {/* LINK */}
      {examCode && (
        <div ref={linkRef} style={{
          marginTop: 20,
          padding: 20,
          background: "#111827",
          color: "white",
          borderRadius: 12
        }}>
          <p>{window.location.origin}/exam/{examCode}</p>
          <button onClick={copyLink}>📋 Copy</button>
        </div>
      )}

      {/* RANKING */}
      {examCode && (
        <div style={{
          marginTop: 30,
          padding: 20,
          background: "#0f172a",
          color: "white",
          borderRadius: 12
        }}>
          <h2>🏆 Live Ranking</h2>

          {ranking.map((item, index) => (
            <div key={index} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 10,
              marginTop: 6,
              background: index === 0 ? "#22c55e" : "#020617",
              borderRadius: 8
            }}>
              <span>
                {index === 0 && "👑 "}
                #{index + 1} {item.name}
              </span>
              <span>{item.score}</span>
            </div>
          ))}
        </div>
      )}

      {/* STATS */}
      <div style={{
        marginTop: 30,
        padding: 20,
        background: "#020617",
        color: "white",
        borderRadius: 12
      }}>
        <h2>📊 DB Stats</h2>

        {stats && (
          <>
            <p>📘 Exams: {stats.examCount}</p>
            <p>📝 Submissions: {stats.submissionCount}</p>
            <p>📚 Questions: {stats.questionCount}</p>
          </>
        )}

        <button
          onClick={clearOldData}
          disabled={loadingClear}
          style={{
            marginTop: 10,
            padding: "10px 15px",
            background: loadingClear ? "gray" : "red",
            border: "none",
            color: "white",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          {loadingClear ? "Clearing..." : "🧹 Clear Old Data"}
        </button>
      </div>

    </div>
  );
}

export default Builder;