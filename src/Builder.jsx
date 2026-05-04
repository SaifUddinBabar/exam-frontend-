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

  // ================= FETCH QUESTIONS =================
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

      {/* ================= CREATE CARD ================= */}
      <div style={{
        padding: 20,
        background: "#f1f5f9",
        borderRadius: 12,
        marginBottom: 20
      }}>
        <h2>Create Exam</h2>

        <input
          name="title"
          placeholder="Exam Title"
          onChange={handleExamChange}
          style={{ width: "100%", padding: 12, marginBottom: 10 }}
        />

        <select onChange={(e) => setChapter(e.target.value)}>
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
            borderRadius: 10
          }}
        >
          🚀 Create Exam
        </button>
      </div>

      {/* ================= QUESTIONS ================= */}
      <div style={{
        padding: 20,
        background: "#fff",
        borderRadius: 12
      }}>
        <h3>Select Questions</h3>

        {questions.map((q) => (
          <div
            key={q._id}
            onClick={() => toggleSelect(q._id)}
            style={{
              padding: 12,
              marginTop: 10,
              borderRadius: 10,
              cursor: "pointer",
              border: "2px solid",
              borderColor: selected.includes(q._id)
                ? "#22c55e"
                : "#ddd",
              background: selected.includes(q._id)
                ? "#dcfce7"
                : "white"
            }}
          >
            {q.question}
          </div>
        ))}
      </div>

      {/* ================= LINK ================= */}
      {examCode && (
        <div style={{
          marginTop: 20,
          padding: 20,
          background: "#111",
          color: "white",
          borderRadius: 10
        }}>
          <h3>📎 Exam Link</h3>

          <p>{window.location.origin}/exam/{examCode}</p>

          <button onClick={copyLink}>
            📋 Copy Link
          </button>
        </div>
      )}

      {/* ================= RANKING ================= */}
      {examCode && (
        <div style={{
          marginTop: 20,
          padding: 20,
          background: "#0f172a",
          color: "white",
          borderRadius: 10
        }}>
          <h2>🏆 Live Ranking</h2>

          {ranking.length === 0 && <p>No submissions yet</p>}

          {ranking.map((item, index) => (
            <div
              key={index}
              style={{
                padding: 12,
                marginTop: 10,
                borderRadius: 8,
                background:
                  index === 0 ? "#16a34a" : "#1e293b"
              }}
            >
              #{index + 1} — {item.name} | {item.score}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Builder;