import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL;

function Builder() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [chapter, setChapter] = useState("");
  const [examCode, setExamCode] = useState("");
  const [ranking, setRanking] = useState([]);
  const [stats, setStats] = useState(null);

  const [examData, setExamData] = useState({
    title: "",
    duration: ""
  });

  const linkRef = useRef(null);

  // Load saved exam
  useEffect(() => {
    const saved = localStorage.getItem("examCode");
    if (saved) setExamCode(saved);
  }, []);

  // Fetch questions
  useEffect(() => {
    if (!chapter) return;

    fetch(`${API}/api/questions?chapter=${encodeURIComponent(chapter)}`)
      .then(res => res.json())
      .then(data => setQuestions(data || []))
      .catch(() => setQuestions([]));
  }, [chapter]);

  // Fetch stats
  const fetchStats = () => {
    fetch(`${API}/api/exams/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Ranking
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

  // Select question
  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(q => q !== id)
        : [...prev, id]
    );
  };

  const handleChange = (e) => {
    setExamData({ ...examData, [e.target.name]: e.target.value });
  };

  // Create exam
  const createExam = async () => {
    if (!examData.title) return alert("Enter title");
    if (selected.length === 0) return alert("Select questions");

    try {
      const res = await fetch(`${API}/api/exams/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...examData,
          questions: selected
        })
      });

      const data = await res.json();

      setExamCode(data.examCode);
      localStorage.setItem("examCode", data.examCode);

      setTimeout(() => {
        linkRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);

    } catch (err) {
      alert("Failed to create exam");
    }
  };

  // Copy link
  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/exam/${examCode}`
    );
  };

  // 🔥 CLEAR / DELETE (INSTANT FIXED)
  const clearOld = async () => {
    try {
      const res = await fetch(`${API}/api/exams/clear-old`, {
        method: "DELETE"
      });

      const data = await res.json();

      alert(data.message || "Deleted successfully");
      fetchStats();

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // Same function (instant delete)
  const deleteAll = async () => {
    const confirmDelete = confirm("Delete ALL data?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API}/api/exams/clear-old`, {
        method: "DELETE"
      });

      const data = await res.json();

      alert("All data deleted");
      fetchStats();

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white px-6 py-10">

      <h1 className="text-5xl font-bold text-center mb-12">
        🚀 Exam Builder
      </h1>

      {/* CREATE */}
      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl mb-12">

        <input
          name="title"
          placeholder="✨ Enter Exam Title..."
          onChange={handleChange}
          className="w-full p-4 mb-6 rounded-xl bg-white/10 border border-white/20 outline-none"
        />

        <div className="flex gap-4 flex-wrap justify-between">

          <select
            onChange={(e) => setChapter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/10 border border-white/20"
          >
            <option value="">📚 Select Chapter</option>
            <option value="Web & HTML">Web</option>
            <option value="Programming & Language">Programming</option>
          </select>

          <button
            onClick={createExam}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 rounded-xl hover:scale-105 transition"
          >
            🚀 Create Exam
          </button>

        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">

        {/* QUESTIONS */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl mb-6">🧠 Select Questions</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {questions.map((q, i) => {
              const active = selected.includes(q._id);

              return (
                <div
                  key={q._id}
                  onClick={() => toggleSelect(q._id)}
                  className={`p-5 rounded-2xl cursor-pointer transition
                  ${active
                    ? "bg-green-500 scale-[1.03]"
                    : "bg-white/5 hover:bg-white/10"}`}
                >
                  <p className="text-xs text-gray-400 mb-2">
                    Question {i + 1}
                  </p>
                  <p>{q.question}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-8">

          {examCode && (
            <div ref={linkRef} className="bg-white/5 p-6 rounded-2xl">
              <p className="text-sm mb-2 text-gray-400">Student Link</p>
              <p className="text-xs break-all mb-4">
                {window.location.origin}/exam/{examCode}
              </p>
              <button
                onClick={copyLink}
                className="bg-indigo-500 px-4 py-2 rounded-lg"
              >
                Copy Link
              </button>
            </div>
          )}

          {/* STATS */}
          <div className="bg-white/5 p-6 rounded-2xl">
            <h2 className="mb-4 text-lg">📊 Stats</h2>

            {stats && (
              <div className="space-y-2 mb-5">
                <p>📘 Exams: {stats.examCount}</p>
                <p>📝 Subs: {stats.submissionCount}</p>
                <p>📚 Questions: {stats.questionCount}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={clearOld}
                className="bg-yellow-500 px-4 py-2 rounded-lg hover:bg-yellow-600"
              >
                🧹 Clear Old
              </button>

              <button
                onClick={deleteAll}
                className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
              >
                ❌ Delete All
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Builder;