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
    if (savedCode) {
      setExamCode(savedCode);
    }
  }, []);

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

      alert(`Exam Created!

Code: ${data.examCode}

Student Link:
${window.location.origin}/exam/${data.examCode}`);
    } catch (err) {
      console.error(err);
    }
  };

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

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Teacher Dashboard</h2>

      <input name="title" placeholder="Exam Title" onChange={handleExamChange} />

      <select onChange={(e) => setChapter(e.target.value)}>
        <option value="">Select Chapter</option>
        <option value="Web & HTML">Web</option>
        <option value="Programming & Language">Programming</option>
      </select>

      {questions.map((q) => (
        <div key={q._id}>
          <p>{q.question}</p>
          <button onClick={() => toggleSelect(q._id)}>
            {selected.includes(q._id) ? "Selected ✅" : "Select"}
          </button>
        </div>
      ))}

      <button onClick={createExam}>🚀 Create Exam</button>

      {examCode && (
        <div>
          <h2>🏆 Ranking</h2>
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