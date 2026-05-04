import { useState, useEffect } from "react";

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

  useEffect(() => {
    const savedCode = localStorage.getItem("examCode");
    if (savedCode) setExamCode(savedCode);
  }, []);

  useEffect(() => {
    if (!chapter) return;

    fetch(`${API}/api/questions?chapter=${encodeURIComponent(chapter)}&limit=${limit}`)
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, [chapter, limit]);

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

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/exam/${examCode}`
    );
    alert("Copied!");
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>

      <h1>🎓 Teacher Dashboard</h1>

      {/* CREATE */}
      <div style={{
        padding: 20,
        background: "#f1f5f9",
        borderRadius: 12
      }}>
        <input
          name="title"
          placeholder="Exam Title"
          onChange={handleExamChange}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 10,
            borderRadius: 8
          }}
        />

        <select
          onChange={(e) => setChapter(e.target.value)}
          style={{ padding: 10, borderRadius: 8 }}
        >
          <option value="">Select Chapter</option>
          <option value="Web & HTML">Web</option>
          <option value="Programming & Language">Programming</option>
        </select>

        <button
          onClick={createExam}
          style={{
            marginTop: 15,
            padding: 12,
            background: "#6366f1",
            color: "white",
            borderRadius: 10,
            border: "none",
            cursor: "pointer"
          }}
        >
          🚀 Create Exam
        </button>
      </div>

      {/* QUESTIONS */}
      <div style={{ marginTop: 20 }}>
        {questions.map((q) => (
          <div
            key={q._id}
            onClick={() => toggleSelect(q._id)}
            style={{
              padding: 10,
              marginTop: 8,
              borderRadius: 8,
              cursor: "pointer",
              background: selected.includes(q._id)
                ? "#dbeafe"
                : "#f8fafc"
            }}
          >
            {q.question}
          </div>
        ))}
      </div>

      {/* LINK */}
      {examCode && (
        <div style={{
          marginTop: 20,
          padding: 15,
          background: "#111827",
          color: "white",
          borderRadius: 10
        }}>
          <p>{window.location.origin}/exam/{examCode}</p>

          <button
            onClick={copyLink}
            style={{
              marginTop: 10,
              padding: 8,
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            📋 Copy Link
          </button>
        </div>
      )}

      {/* ================= CLEAN RANKING ================= */}
      {examCode && (
        <div style={{
          marginTop: 30,
          padding: 25,
          background: "#0f172a",
          borderRadius: 16,
          color: "white"
        }}>

          <h2 style={{ textAlign: "center", marginBottom: 20 }}>
            🏆 Live Ranking
          </h2>

          {ranking.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 16px",
                marginTop: 8,
                borderRadius: 8,
                background:
                  index === 0
                    ? "#22c55e"
                    : index === 1
                    ? "#334155"
                    : index === 2
                    ? "#1e293b"
                    : "#020617",
                fontWeight: index === 0 ? "bold" : "normal"
              }}
            >
              <span>
                {index === 0 && "👑 "}
                #{index + 1} — {item.name || "Anonymous"}
              </span>

              <span>{item.score}</span>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Builder;