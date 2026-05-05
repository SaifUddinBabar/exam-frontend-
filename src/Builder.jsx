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

  useEffect(() => {
    const saved = localStorage.getItem("examCode");
    if (saved) setExamCode(saved);
  }, []);

  // 🔥 Fetch Questions
  useEffect(() => {
    if (!chapter) return;

    fetch(`${API}/api/questions?chapter=${encodeURIComponent(chapter)}`)
      .then(res => res.json())
      .then(data => setQuestions(data || []));
  }, [chapter]);

  // 🔥 Stats
  useEffect(() => {
    fetch(`${API}/api/exams/stats`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  // 🔥 Ranking
  useEffect(() => {
    if (!examCode) return;

    const fetchRanking = () => {
      fetch(`${API}/api/exams/ranking/${examCode}`)
        .then(res => res.json())
        .then(data => setRanking(data));
    };

    fetchRanking();
    const i = setInterval(fetchRanking, 3000);
    return () => clearInterval(i);
  }, [examCode]);

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

  const createExam = async () => {
    if (!examData.title) return alert("Enter title");
    if (selected.length === 0) return alert("Select questions");

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
  };

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/exam/${examCode}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white px-6 py-10 font-sans">

      {/* HEADER */}
      <h1 className="text-5xl font-extrabold text-center mb-12 tracking-tight">
        🚀 Exam Builder
      </h1>

      {/* CREATE SECTION */}
      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-xl mb-12">

        <input
          name="title"
          placeholder="✨ Enter Exam Title..."
          onChange={handleChange}
          className="w-full p-4 mb-6 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
        />

        <div className="flex flex-wrap gap-4 items-center justify-between">

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
            className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            🚀 Create Exam
          </button>

        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-10">

        {/* QUESTIONS */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl mb-6 font-semibold">🧠 Select Questions</h2>

          {questions.length === 0 && (
            <p className="text-gray-400">Select a chapter to load questions</p>
          )}

          <div className="grid sm:grid-cols-2 gap-5">

            {questions.map((q, i) => {
              const active = selected.includes(q._id);

              return (
                <div
                  key={q._id}
                  onClick={() => toggleSelect(q._id)}
                  className={`p-5 rounded-2xl cursor-pointer transition duration-300
                  ${active
                    ? "bg-green-500/90 scale-[1.03] shadow-lg"
                    : "bg-white/5 hover:bg-white/10 hover:scale-[1.02]"}`}
                >
                  <p className="text-xs text-gray-400 mb-2">
                    Question {i + 1}
                  </p>
                  <p className="font-medium leading-relaxed">
                    {q.question}
                  </p>
                </div>
              );
            })}

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-8">

          {/* LINK */}
          {examCode && (
            <div
              ref={linkRef}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
            >
              <p className="text-sm mb-2 text-gray-400">🔗 Student Link</p>
              <p className="text-xs break-all mb-4">
                {window.location.origin}/exam/{examCode}
              </p>
              <button
                onClick={copyLink}
                className="bg-indigo-500 px-4 py-2 rounded-lg hover:bg-indigo-600"
              >
                Copy Link
              </button>
            </div>
          )}

          {/* RANKING */}
          {examCode && (
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h2 className="mb-4 text-lg font-semibold">🏆 Ranking</h2>

              {ranking.map((r, i) => (
                <div
                  key={i}
                  className={`flex justify-between p-3 rounded-lg mb-2
                  ${i === 0 ? "bg-green-500" : "bg-white/10"}`}
                >
                  <span>#{i + 1} {r.name}</span>
                  <span>{r.score}</span>
                </div>
              ))}
            </div>
          )}

          {/* STATS */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="mb-4 text-lg font-semibold">📊 Stats</h2>

            {stats && (
              <div className="space-y-2 text-sm">
                <p>📘 Exams: {stats.examCount}</p>
                <p>📝 Subs: {stats.submissionCount}</p>
                <p>📚 Questions: {stats.questionCount}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Builder;