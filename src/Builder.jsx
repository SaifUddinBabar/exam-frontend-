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
  const [copied, setCopied] = useState(false); // 🔥 new

  // ================= LOAD SAVED CODE =================
  useEffect(() => {
    const savedCode = localStorage.getItem("examCode");
    if (savedCode) {
      setExamCode(savedCode);
    }
  }, []);

  // ================= LOAD QUESTIONS =================
  useEffect(() => {
    if (!chapter) return;

    fetch(`${API}/api/questions?chapter=${encodeURIComponent(chapter)}&limit=${limit}`)
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(err => console.error(err));
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
    try {
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

    } catch (err) {
      console.error(err);
    }
  };

  // ================= COPY LINK =================
  const copyLink = () => {
    const link = `${window.location.origin}/exam/${examCode}`;
    navigator.clipboard.writeText(link);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  // ================= UI =================
  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Teacher Dashboard</h2>

      <input
        name="title"
        placeholder="Exam Title"
        onChange={handleExamChange}
      />

      <br /><br />

      <select onChange={(e) => setChapter(e.target.value)}>
        <option value="">Select Chapter</option>
        <option value="Web & HTML">Web</option>
        <option value="Programming & Language">Programming</option>
      </select>

      <h3>📚 Questions</h3>

      {questions.map((q) => (
        <div key={q._id}>
          <p>{q.question}</p>
          <button onClick={() => toggleSelect(q._id)}>
            {selected.includes(q._id) ? "Selected ✅" : "Select"}
          </button>
        </div>
      ))}

      <br />

      <button onClick={createExam}>🚀 Create Exam</button>

      {/* 🔥 EXAM LINK UI */}
      {examCode && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: "#1e293b",
            color: "white",
            borderRadius: 10
          }}
        >
          <h3>🎯 Exam Link</h3>

          <p>Code: <strong>{examCode}</strong></p>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={`${window.location.origin}/exam/${examCode}`}
              readOnly
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 6,
                border: "none"
              }}
            />

            <button
              onClick={copyLink}
              style={{
                padding: "10px 15px",
                background: "#22c55e",
                border: "none",
                color: "white",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              {copied ? "Copied ✅" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* 🔥 RANKING */}
      {examCode && (
        <div style={{ marginTop: 30 }}>
          <h2>🏆 Ranking</h2>

          {ranking.length === 0 && <p>No submissions yet...</p>}

          {ranking.map((item, index) => (
            <div key={index}>
              #{index + 1} — {item.name} ({item.score})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Builder;