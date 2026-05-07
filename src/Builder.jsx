import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL;

function Builder() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [chapter, setChapter] = useState("");
  const [examCode, setExamCode] = useState("");
  const [stats, setStats] = useState(null);

  const [examData, setExamData] = useState({
    title: "",
    duration: "60",
    subject: "ICT",
    className: "HSC",
    version: "Bangla Medium",
    marks: "100"
  });

  const linkRef = useRef(null);

  // Load saved exam
  useEffect(() => {
    const saved = localStorage.getItem("examCode");
    if (saved) setExamCode(saved);
  }, []);

  // Fetch Questions
  useEffect(() => {
    if (!chapter) return;

    fetch(`${API}/api/questions?chapter=${encodeURIComponent(chapter)}`)
      .then((res) => res.json())
      .then((data) => setQuestions(data || []))
      .catch(() => setQuestions([]));
  }, [chapter]);

  // Fetch Stats
  const fetchStats = () => {
    fetch(`${API}/api/exams/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Select Question
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((q) => q !== id)
        : [...prev, id]
    );
  };

  // Input Change
  const handleChange = (e) => {
    setExamData({
      ...examData,
      [e.target.name]: e.target.value
    });
  };

  // Create Exam
  const createExam = async () => {
    if (!examData.title) {
      return alert("পরীক্ষার নাম লিখুন");
    }

    if (selected.length === 0) {
      return alert("প্রশ্ন সিলেক্ট করুন");
    }

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

      setTimeout(() => {
        linkRef.current?.scrollIntoView({
          behavior: "smooth"
        });
      }, 400);

    } catch (err) {
      alert("Create Failed");
    }
  };

  // Copy Link
  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/exam/${examCode}`
    );

    alert("Link Copied");
  };

  // Delete
  const deleteAll = async () => {
    const confirmDelete = confirm(
      "সব exam data delete করতে চান?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${API}/api/exams/clear-old`,
        {
          method: "DELETE"
        }
      );

      const data = await res.json();

      alert(data.message);

      fetchStats();

    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-20">

      {/* TOPBAR */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="text-3xl font-bold text-blue-900">
            📝 প্রশ্নব্যাংক
          </h1>

          <button className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition">
            Dashboard
          </button>

        </div>
      </div>

      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* FORM */}
        <div className="bg-white rounded-3xl shadow-sm border p-8 mb-10">

          <h2 className="text-3xl font-bold text-blue-900 mb-8">
            বেসিক তথ্য পূরণ করুন
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="font-semibold block mb-2">
                শ্রেণী
              </label>

              <select
                name="className"
                onChange={handleChange}
                className="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>HSC</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-2">
                ভার্সন
              </label>

              <select
                name="version"
                onChange={handleChange}
                className="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Bangla Medium</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-2">
                বিষয়
              </label>

              <select
                name="subject"
                onChange={handleChange}
                className="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>ICT</option>
                <option disabled>Physics</option>
                <option disabled>Chemistry</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-2">
                পরীক্ষার নাম
              </label>

              <input
                type="text"
                name="title"
                placeholder="যেমন: HSC ICT Model Test"
                onChange={handleChange}
                className="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">
                পূর্ণমান
              </label>

              <input
                type="number"
                name="marks"
                value={examData.marks}
                onChange={handleChange}
                className="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">
                সময় (মিনিট)
              </label>

              <input
                type="number"
                name="duration"
                value={examData.duration}
                onChange={handleChange}
                className="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>
        </div>

        {/* CHAPTER */}
        <div className="flex flex-wrap gap-4 mb-8">

          <button
            onClick={() => setChapter("Web & HTML")}
            className={`px-6 py-3 rounded-2xl font-semibold transition
            ${chapter === "Web & HTML"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white border hover:bg-blue-50"
              }`}
          >
            🌐 Web & HTML
          </button>

          <button
            onClick={() => setChapter("Programming & Language")}
            className={`px-6 py-3 rounded-2xl font-semibold transition
            ${chapter === "Programming & Language"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white border hover:bg-blue-50"
              }`}
          >
            💻 Programming
          </button>

        </div>

        {/* QUESTIONS */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-3xl font-bold text-gray-800">
                প্রশ্ন সিলেক্ট করুন
              </h2>

              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-semibold">
                {selected.length} Selected
              </div>

            </div>

            <div className="space-y-5">

              {questions.map((q, i) => {
                const active = selected.includes(q._id);

                return (
                  <div
                    key={q._id}
                    onClick={() => toggleSelect(q._id)}
                    className={`border-2 rounded-3xl p-6 cursor-pointer transition-all duration-300
                    ${active
                        ? "border-green-500 bg-green-50 scale-[1.01] shadow-lg"
                        : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-md"
                      }`}
                  >

                    <div className="flex justify-between items-start mb-4">

                      <p className="font-bold text-lg text-gray-700">
                        প্রশ্ন {i + 1}
                      </p>

                      {active && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          Selected
                        </span>
                      )}

                    </div>

                    <p className="text-gray-800 text-lg leading-8">
                      {q.question}
                    </p>

                  </div>
                );
              })}

            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6 sticky top-24 h-fit">

            {/* CREATE */}
            <div className="bg-white rounded-3xl border p-6 shadow-sm">

              <button
                onClick={createExam}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-lg font-bold transition shadow-lg"
              >
                🚀 প্রশ্ন তৈরি করুন
              </button>

            </div>

            {/* LINK */}
            {examCode && (
              <div
                ref={linkRef}
                className="bg-white rounded-3xl border p-6 shadow-sm"
              >

                <h3 className="font-bold text-xl mb-4">
                  Student Link
                </h3>

                <p className="text-sm break-all bg-gray-100 p-4 rounded-xl mb-4">
                  {window.location.origin}/exam/{examCode}
                </p>

                <button
                  onClick={copyLink}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl transition"
                >
                  Copy Link
                </button>

              </div>
            )}

            {/* STATS */}
            <div className="bg-white rounded-3xl border p-6 shadow-sm">

              <h3 className="text-2xl font-bold mb-5">
                📊 Statistics
              </h3>

              {stats && (
                <div className="space-y-4 mb-6">

                  <div className="flex justify-between">
                    <span>📘 Exams</span>
                    <span className="font-bold">
                      {stats.examCount}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>📝 Submissions</span>
                    <span className="font-bold">
                      {stats.submissionCount}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>📚 Questions</span>
                    <span className="font-bold">
                      {stats.questionCount}
                    </span>
                  </div>

                </div>
              )}

              <button
                onClick={deleteAll}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold transition"
              >
                ❌ Delete All Data
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Builder;