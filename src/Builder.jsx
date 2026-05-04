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

  // 🔥 NEW: scroll ref
  const linkRef = useRef(null);

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

  // 🔥 UPDATED CREATE EXAM
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

    // ✅ SUCCESS FEEDBACK
    alert("✅ Exam Created Successfully!");

    // ✅ AUTO SCROLL
    setTimeout(() => {
      linkRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
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

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/exam/${examCode}`
    );
    alert("Copied!");
  };

  return (
    <div style={{
      padding: 20,
      maxWidth: 1000,
      margin: "auto",
      fontFamily: "Poppins, sans-serif"
    }}>

      <h1 style={{ marginBottom: 20 }}>🎓 Teacher Dashboard</h1>

      {/* CREATE */}
      <div style={{
        padding: 20,
        background: "#f8fafc",
        borderRadius: 16
      }}>
        <input
          name="title"
          placeholder="📘 Exam Title"
          onChange={handleExamChange}
          style={{
            width: "100%",
            padding: 14,
            marginBottom: 12,
            borderRadius: 10
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <select
            onChange={(e) => setChapter(e.target.value)}
            style={{ padding: 12, borderRadius: 10 }}
          >
            <option value="">Select Chapter</option>
            <option value="Web & HTML">Web</option>
            <option value="Programming & Language">Programming</option>
          </select>

          <button
            onClick={createExam}
            style={{
              padding: "12px 18px",
              background: "linear-gradient(135deg,#6366f1,#4f46e5)",
              color: "white",
              borderRadius: 12,
              border: "none",
              cursor: "pointer"
            }}
          >
            🚀 Create Exam
          </button>
        </div>
      </div>

      {/* QUESTIONS */}
      <div style={{ marginTop: 30 }}>
        <h3>🧠 Select Questions</h3>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 15
        }}>
          {questions.map((q, index) => {
            const isSelected = selected.includes(q._id);

            return (
              <div
                key={q._id}
                onClick={() => toggleSelect(q._id)}
                style={{
                  padding: 15,
                  borderRadius: 14,
                  cursor: "pointer",
                  border: "2px solid",
                  borderColor: isSelected ? "#22c55e" : "#e5e7eb",
                  background: isSelected ? "#dcfce7" : "white"
                }}
              >
                <div style={{ fontSize: 12 }}>
                  Question #{index + 1}
                </div>

                <div>{q.question}</div>

                <div style={{
                  marginTop: 8,
                  fontSize: 12
                }}>
                  {isSelected ? "✅ Selected" : "Click to select"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LINK (SCROLL TARGET) */}
      {examCode && (
        <div
          ref={linkRef}
          style={{
            marginTop: 25,
            padding: 20,
            background: "#111827",
            color: "white",
            borderRadius: 14
          }}
        >
          <p>{window.location.origin}/exam/{examCode}</p>

          <button
            onClick={copyLink}
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 8
            }}
          >
            📋 Copy Link
          </button>
        </div>
      )}

      {/* RANKING */}
      {examCode && (
        <div style={{
          marginTop: 30,
          padding: 25,
          background: "#0f172a",
          borderRadius: 16,
          color: "white"
        }}>
          <h2 style={{ textAlign: "center" }}>🏆 Live Ranking</h2>

          {ranking.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 12,
                marginTop: 8,
                borderRadius: 8,
                background:
                  index === 0
                    ? "#22c55e"
                    : "#020617"
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