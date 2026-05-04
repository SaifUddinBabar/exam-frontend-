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
      headers: { "Content-Type": "application/json" },
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

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>

      <h1>🎓 Teacher Dashboard</h1>

      {/* CREATE */}
      <div style={{ padding: 20, background: "#f1f5f9", borderRadius: 12 }}>
        <input
          name="title"
          placeholder="Exam Title"
          onChange={handleExamChange}
          style={{ width: "100%", padding: 12 }}
        />

        <select onChange={(e) => setChapter(e.target.value)}>
          <option value="">Select Chapter</option>
          <option value="Web & HTML">Web</option>
          <option value="Programming & Language">Programming</option>
        </select>

        <button onClick={createExam}>🚀 Create Exam</button>
      </div>

      {/* QUESTIONS */}
      <div style={{ marginTop: 20 }}>
        {questions.map((q) => (
          <div key={q._id} onClick={() => toggleSelect(q._id)}>
            {q.question}
          </div>
        ))}
      </div>

      {/* LINK */}
      {examCode && (
        <div style={{ marginTop: 20 }}>
          <p>{window.location.origin}/exam/{examCode}</p>
          <button onClick={copyLink}>Copy</button>
        </div>
      )}

      {/* ================= PREMIUM RANKING ================= */}
      {examCode && (
        <div style={{
          marginTop: 30,
          padding: 20,
          background: "#065f46",
          borderRadius: 15,
          color: "white"
        }}>

          <h2 style={{ textAlign: "center" }}>🏆 Live Ranking</h2>

          {/* TOP 3 */}
          <div style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: 30
          }}>

            {top3[1] && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "4px solid silver"
                }} />
                <p>{top3[1].name}</p>
                <p>{top3[1].score}</p>
              </div>
            )}

            {top3[0] && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "5px solid gold"
                }} />
                <h3>👑 {top3[0].name}</h3>
                <p>{top3[0].score}</p>
              </div>
            )}

            {top3[2] && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "4px solid bronze"
                }} />
                <p>{top3[2].name}</p>
                <p>{top3[2].score}</p>
              </div>
            )}
          </div>

          {/* LIST */}
          <div style={{ marginTop: 30 }}>
            {rest.map((item, index) => (
              <div key={index} style={{
                padding: 10,
                marginTop: 8,
                borderRadius: 8,
                background: "#064e3b",
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span>#{index + 4} {item.name}</span>
                <span>{item.score}</span>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

export default Builder;