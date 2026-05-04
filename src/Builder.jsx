import { useState, useEffect } from "react";

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

  // ================= LOAD SAVED CODE =================
  useEffect(() => {
    const savedCode = localStorage.getItem("examCode");
    if (savedCode) {
      setExamCode(savedCode);
    }
  }, []);

  // ================= QUESTIONS =================
  useEffect(() => {
    if (!chapter) return;

    fetch(`http://localhost:5000/api/questions?chapter=${encodeURIComponent(chapter)}&limit=${limit}`)
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
    if (!examData.title) return alert("Title দাও");
    if (selected.length === 0) return alert("Question select করো");

    try {
      const res = await fetch("http://localhost:5000/api/exams/create", {
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

      // 🔥 SAVE locally
      localStorage.setItem("examCode", data.examCode);

      alert(`Exam Created!

Code: ${data.examCode}

Student Link:
http://localhost:5173/exam/${data.examCode}`);

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // ================= RANKING =================
  useEffect(() => {
    if (!examCode) return;

    const fetchRanking = () => {
      fetch(`http://localhost:5000/api/exams/ranking/${examCode}`)
        .then(res => res.json())
        .then(data => setRanking(data))
        .catch(err => console.error(err));
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

      <select onChange={(e) => setChapter(e.target.value)}>
        <option value="">Select Chapter</option>
        <option value="Web & HTML">Web</option>
        <option value="Programming & Language">Programming</option>
      </select>

      <h3>Questions</h3>

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

      {/* ================= RANKING ================= */}
      {examCode && (
        <div
          style={{
            marginTop: 30,
            padding: 15,
            background: "#111",
            color: "white",
            borderRadius: 10
          }}
        >
          <h2>🏆 Live Ranking (Code: {examCode})</h2>

          {ranking.length === 0 && (
            <p>⏳ No students submitted yet...</p>
          )}

          {ranking.map((item, index) => (
            <div
              key={index}
              style={{
                padding: 10,
                margin: "8px 0",
                background: index === 0 ? "#16a34a" : "#1e293b",
                borderRadius: 6
              }}
            >
              <strong>#{index + 1}</strong> — {item.name}  
              | Roll: {item.roll}  
              | Score: {item.score}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Builder;