import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

const API = import.meta.env.VITE_API_URL;

function Builder() {

  // ==============================
  // ANTI-COPY / ANTI-SCREENSHOT PROTECTION
  // ==============================
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();

    const handleKeyDown = (e) => {
      if (
        e.ctrlKey &&
        ["c", "u", "s", "a", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
      if (e.key === "PrintScreen") {
        e.preventDefault();
        navigator.clipboard.writeText("");
      }
    };

    const handleDragStart = (e) => e.preventDefault();
    const handleBeforePrint = (e) => e.preventDefault();

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);
    window.addEventListener("beforeprint", handleBeforePrint);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("beforeprint", handleBeforePrint);
    };
  }, []);

  // ==============================
  // STATES
  // ==============================
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [chapter, setChapter] = useState("");
  const [examCode, setExamCode] = useState("");

  const [boardYear, setBoardYear] = useState("");
  const [boardName, setBoardName] = useState("");
  const [pdfCompact, setPdfCompact] = useState(false);

  const [examData, setExamData] = useState({
    academy: "",
    title: "",
    duration: "60",
    subject: "ICT",
    marks: "25"
  });

  // ==============================
  // EXAM LIST STATES
  // ==============================
  const [examList, setExamList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingExams, setLoadingExams] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");

  // ==============================
  // FETCH EXAM LIST
  // ==============================
  const fetchExamList = async () => {
    setLoadingExams(true);
    try {
      const [examsRes, statsRes] = await Promise.all([
        fetch(`${API}/api/exams/list`),
        fetch(`${API}/api/exams/stats`)
      ]);
      const examsData = await examsRes.json();
      const statsData = await statsRes.json();
      setExamList(examsData || []);
      setStats(statsData);
    } catch {
      setExamList([]);
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    if (activeTab === "exams") {
      fetchExamList();
    }
  }, [activeTab]);

  // ==============================
  // DELETE EXAM
  // ==============================
  const deleteExam = async (examCode) => {
    const confirm = window.confirm(
      "এই exam এবং সব submissions delete হয়ে যাবে। নিশ্চিত?"
    );
    if (!confirm) return;
    try {
      await fetch(`${API}/api/exams/${examCode}`, { method: "DELETE" });
      setExamList((prev) => prev.filter((e) => e.examCode !== examCode));
      fetchExamList();
    } catch {
      alert("Delete failed");
    }
  };

  // ==============================
  // FETCH QUESTIONS
  // ==============================
  useEffect(() => {
    if (!chapter) {
      setQuestions([]);
      setAllQuestions([]);
      setSelected([]);
      return;
    }

    const params = new URLSearchParams();
    params.append("subject", examData.subject);
    params.append("chapter", chapter);

    if (chapter === "Board Questions") {
      if (!boardYear || !boardName) {
        setQuestions([]);
        return;
      }
      params.append("questionType", "board");
      params.append("boardYear", boardYear);
      params.append("boardName", boardName);
    } else {
      params.append("questionType", "normal");
    }

    fetch(`${API}/api/questions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const fetched = data || [];
        setQuestions(fetched);

        if (chapter === "Board Questions") {
          setAllQuestions(fetched);
          setSelected(fetched.map((q) => q._id));
          setExamData((prev) => ({
            ...prev,
            marks: String(fetched.length)
          }));
        } else {
          setAllQuestions((prev) => {
            const merged = [...prev];
            fetched.forEach((q) => {
              const exists = merged.find((item) => item._id === q._id);
              if (!exists) merged.push(q);
            });
            return merged;
          });
        }
      })
      .catch(() => setQuestions([]));
  }, [chapter, boardYear, boardName, examData.subject]);

  // ==============================
  // HANDLE INPUT
  // ==============================
  const handleChange = (e) => {
    setExamData({ ...examData, [e.target.name]: e.target.value });
  };

  // ==============================
  // SELECT QUESTION
  // ==============================
  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((q) => q !== id));
      return;
    }
    const limit = Number(examData.marks);
    if (selected.length >= limit) {
      alert(`আপনি সর্বোচ্চ ${limit} টি প্রশ্ন সিলেক্ট করতে পারবেন`);
      return;
    }
    setSelected((prev) => [...prev, id]);
  };

  // ==============================
  // SELECT ALL / DESELECT ALL
  // ==============================
  const selectAll = () => {
    const currentIds = questions.map((q) => q._id);
    setSelected(currentIds);
    if (chapter === "Board Questions") {
      setExamData((prev) => ({ ...prev, marks: String(questions.length) }));
    }
  };

  const deselectAll = () => setSelected([]);

  // ==============================
  // CREATE EXAM
  // ==============================
  const createExam = async () => {
    if (!examData.academy) return alert("একাডেমির নাম লিখুন");
    if (!examData.title) return alert("পরীক্ষার নাম লিখুন");
    if (!chapter) return alert("অধ্যায় নির্বাচন করুন");
    if (selected.length === 0) return alert("প্রশ্ন সিলেক্ট করুন");

    try {
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
      alert("Exam Created Successfully");
    } catch {
      alert("Create Failed");
    }
  };

  // ==============================
  // COPY LINK
  // ==============================
  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/exam/${examCode}`);
    alert("Link Copied!");
  };

  // ==============================
  // PDF DOWNLOAD
  // ==============================
  const downloadPDF = async () => {
    if (selected.length > 20) {
      setPdfCompact(true);
    } else {
      setPdfCompact(false);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    const element = document.getElementById("question-paper");

    const options = {
      margin: 0,
      filename: `${examData.title || "question-paper"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    };

    await html2pdf().set(options).from(element).save();
    setPdfCompact(false);
  };

  // ==============================
  // SHARED INPUT STYLE
  // ==============================
  const inputStyle = {
    width: "100%",
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    padding: "13px 16px",
    color: "#1e293b",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    transition: "border-color 0.2s"
  };

  const selectStyle = {
    ...inputStyle,
    background: "#ffffff",
    color: "#1e293b"
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <div
      className="min-h-screen"
      style={{
        background: "#f1f5f9",
        backgroundImage: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none"
      }}
    >

      {/* ==============================
          GLOBAL ANTI-COPY STYLES
      ============================== */}
      <style>{`
        * {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }
        input, textarea, select {
          user-select: text !important;
          -webkit-user-select: text !important;
        }
        img {
          pointer-events: none !important;
          -webkit-user-drag: none !important;
        }
        @media print {
          body { display: none !important; }
        }
        input::placeholder { color: #94a3b8; }
        input:focus, select:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        }
      `}</style>

      {/* ==============================
          TOPBAR
      ============================== */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <div
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "12px",
                padding: "8px 12px",
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)"
              }}
            >
              <span className="text-white text-xl font-bold">📝</span>
            </div>

            <div>
              <h1 style={{ color: "#1e293b", fontSize: "22px", fontWeight: "800", letterSpacing: "-0.3px", margin: 0 }}>
                প্রশ্নব্যাংক
              </h1>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
                Question Bank Builder
              </p>
            </div>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("builder")}
              style={{
                background: activeTab === "builder"
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "#f8fafc",
                border: activeTab === "builder" ? "none" : "1.5px solid #e2e8f0",
                borderRadius: "12px",
                padding: "10px 20px",
                color: activeTab === "builder" ? "white" : "#64748b",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "14px",
                boxShadow: activeTab === "builder" ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                transition: "all 0.2s"
              }}
            >
              📝 Builder
            </button>

            <button
              onClick={() => setActiveTab("exams")}
              style={{
                background: activeTab === "exams"
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "#f8fafc",
                border: activeTab === "exams" ? "none" : "1.5px solid #e2e8f0",
                borderRadius: "12px",
                padding: "10px 20px",
                color: activeTab === "exams" ? "white" : "#64748b",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "14px",
                boxShadow: activeTab === "exams" ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                transition: "all 0.2s"
              }}
            >
              📋 Exam List
            </button>
          </div>

        </div>
      </div>

      {/* ==============================
          EXAM LIST TAB
      ============================== */}
      {activeTab === "exams" && (
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* STATS */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "16px",
                marginBottom: "32px"
              }}
            >
              {[
                { label: "মোট Exam", value: stats.examCount, icon: "📝", color: "#6366f1", bg: "#eef2ff" },
                { label: "মোট Submission", value: stats.submissionCount, icon: "✅", color: "#059669", bg: "#ecfdf5" },
                { label: "মোট Question", value: stats.questionCount, icon: "❓", color: "#dc2626", bg: "#fef2f2" }
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    border: "1.5px solid #e2e8f0",
                    padding: "24px",
                    textAlign: "center",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>{s.icon}</div>
                  <div style={{ color: s.color, fontSize: "32px", fontWeight: "800", marginBottom: "4px" }}>
                    {s.value}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600" }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* EXAM LIST HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px"
            }}
          >
            <h2 style={{ color: "#1e293b", fontSize: "22px", fontWeight: "800", margin: 0 }}>
              সব Exam তালিকা
            </h2>

            <button
              onClick={fetchExamList}
              style={{
                background: "#ffffff",
                border: "1.5px solid #e2e8f0",
                borderRadius: "10px",
                padding: "8px 18px",
                color: "#64748b",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* LOADING */}
          {loadingExams && (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "60px", fontSize: "18px" }}>
              Loading...
            </div>
          )}

          {/* EMPTY */}
          {!loadingExams && examList.length === 0 && (
            <div style={{ textAlign: "center", color: "#cbd5e1", padding: "80px", fontSize: "18px" }}>
              কোনো Exam পাওয়া যায়নি
            </div>
          )}

          {/* EXAM CARDS */}
          <div style={{ display: "grid", gap: "16px" }}>
            {examList.map((exam) => (
              <div
                key={exam._id}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1.5px solid #e2e8f0",
                  padding: "24px 28px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)"
                }}
              >

                {/* LEFT INFO */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: "#1e293b", fontSize: "19px", fontWeight: "700", marginBottom: "10px", margin: "0 0 10px 0" }}>
                    {exam.title}
                  </h3>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    <span style={{
                      background: "#eef2ff", border: "1px solid #c7d2fe",
                      borderRadius: "8px", padding: "4px 12px",
                      color: "#4f46e5", fontSize: "13px", fontWeight: "600"
                    }}>
                      🔑 {exam.examCode}
                    </span>

                    <span style={{
                      background: "#ecfdf5", border: "1px solid #a7f3d0",
                      borderRadius: "8px", padding: "4px 12px",
                      color: "#059669", fontSize: "13px", fontWeight: "600"
                    }}>
                      ❓ {exam.questions?.length || 0} প্রশ্ন
                    </span>

                    <span style={{
                      background: "#fef2f2", border: "1px solid #fecaca",
                      borderRadius: "8px", padding: "4px 12px",
                      color: "#dc2626", fontSize: "13px", fontWeight: "600"
                    }}>
                      ✅ {exam.submissionCount || 0} Submission
                    </span>

                    <span style={{
                      background: "#f8fafc", border: "1px solid #e2e8f0",
                      borderRadius: "8px", padding: "4px 12px",
                      color: "#64748b", fontSize: "13px"
                    }}>
                      ⏱️ {exam.duration} মিনিট
                    </span>
                  </div>
                </div>

                {/* RIGHT BUTTONS */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

                  {/* COPY LINK */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/exam/${exam.examCode}`);
                      alert("Link Copied!");
                    }}
                    style={{
                      background: "#eef2ff", border: "1px solid #c7d2fe",
                      borderRadius: "10px", padding: "10px 16px",
                      color: "#4f46e5", fontWeight: "600", cursor: "pointer", fontSize: "13px"
                    }}
                  >
                    📋 Link Copy
                  </button>

                  {/* RANKING */}
                  <a
                    href={`/ranking/${exam.examCode}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "#fef2f2", border: "1px solid #fecaca",
                      borderRadius: "10px", padding: "10px 16px",
                      color: "#dc2626", fontWeight: "600", cursor: "pointer", fontSize: "13px",
                      textDecoration: "none", display: "inline-block"
                    }}
                  >
                    🏆 Ranking
                  </a>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteExam(exam.examCode)}
                    style={{
                      background: "#fff1f2", border: "1px solid #fda4af",
                      borderRadius: "10px", padding: "10px 16px",
                      color: "#e11d48", fontWeight: "700", cursor: "pointer", fontSize: "13px"
                    }}
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ==============================
          BUILDER TAB
      ============================== */}
      {activeTab === "builder" && (
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* FORM CARD */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              border: "1.5px solid #e2e8f0",
              padding: "36px",
              marginBottom: "32px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
            }}
          >

            <div className="text-center mb-8">
              <h2 style={{ color: "#1e293b", fontSize: "26px", fontWeight: "800", marginBottom: "6px" }}>
                পরীক্ষার তথ্য পূরণ করুন
              </h2>
              <p style={{ color: "#94a3b8", margin: 0 }}>
                নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              {/* ACADEMY */}
              <div>
                <label style={{ color: "#475569", fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px", letterSpacing: "0.3px" }}>
                  🏫 একাডেমি / কলেজের নাম
                </label>
                <input
                  type="text"
                  name="academy"
                  placeholder="যেমন: Saif Academy"
                  value={examData.academy}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* EXAM TITLE */}
              <div>
                <label style={{ color: "#475569", fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px", letterSpacing: "0.3px" }}>
                  📋 পরীক্ষার নাম
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="যেমন: Model Test 2024"
                  value={examData.title}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* SUBJECT */}
              <div>
                <label style={{ color: "#475569", fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px", letterSpacing: "0.3px" }}>
                  📚 বিষয়
                </label>
                <input
                  type="text"
                  name="subject"
                  value={examData.subject}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* CHAPTER */}
              <div>
                <label style={{ color: "#475569", fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px", letterSpacing: "0.3px" }}>
                  📖 অধ্যায়
                </label>

                <select
                  value={chapter}
                  onChange={(e) => {
                    setChapter(e.target.value);
                    setSelected([]);
                    setAllQuestions([]);
                    setBoardYear("");
                    setBoardName("");
                  }}
                  style={selectStyle}
                >
                  <option value="">অধ্যায় নির্বাচন করুন</option>
                  <option value="Introduction to ICT">Chapter 1 - ICT Introduction</option>
                  <option value="Communication Systems">Chapter 2 - Communication Systems</option>
                  <option value="Numbers & Digital Devices">Chapter 3 - Number System</option>
                  <option value="Web & HTML">Chapter 4 - Web & HTML</option>
                  <option value="Programming & Language">Chapter 5 - Programming</option>
                  <option value="Board Questions">🏆 Board Questions</option>
                </select>

                {/* BOARD YEAR */}
                {chapter === "Board Questions" && (
                  <div className="mt-4">
                    <label style={{ color: "#475569", fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px", letterSpacing: "0.3px" }}>
                      📅 Board Year
                    </label>
                    <select
                      value={boardYear}
                      onChange={(e) => {
                        setBoardYear(e.target.value);
                        setSelected([]);
                        setAllQuestions([]);
                        setBoardName("");
                      }}
                      style={selectStyle}
                    >
                      <option value="">Select Year</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2019">2019</option>
                    </select>
                  </div>
                )}

                {/* BOARD NAME */}
                {chapter === "Board Questions" && boardYear && (
                  <div className="mt-4">
                    <label style={{ color: "#475569", fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px", letterSpacing: "0.3px" }}>
                      🏛️ Board Name
                    </label>
                    <select
                      value={boardName}
                      onChange={(e) => {
                        setSelected([]);
                        setAllQuestions([]);
                        setBoardName(e.target.value);
                      }}
                      style={selectStyle}
                    >
                      <option value="">Select Board</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Cumilla">Cumilla</option>
                      <option value="Jessore">Jessore</option>
                      <option value="Dinajpur">Dinajpur</option>
                      <option value="Sylhet">Sylhet</option>
                    </select>
                  </div>
                )}

              </div>

              {/* MARKS */}
              <div>
                <label style={{ color: "#475569", fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px", letterSpacing: "0.3px" }}>
                  🎯 প্রশ্ন সংখ্যা
                </label>
                <input
                  type="number"
                  name="marks"
                  value={examData.marks}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* DURATION */}
              <div>
                <label style={{ color: "#475569", fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px", letterSpacing: "0.3px" }}>
                  ⏱️ সময় (মিনিট)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={examData.duration}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

            </div>

          </div>

          {/* QUESTION HEADER */}
          {questions.length > 0 && (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                border: "1.5px solid #e2e8f0",
                padding: "22px 28px",
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
              }}
            >
              <div>
                <h2 style={{ color: "#1e293b", fontSize: "20px", fontWeight: "800", margin: "0 0 4px 0" }}>
                  প্রশ্ন সিলেক্ট করুন
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
                  মোট {questions.length}টি প্রশ্ন পাওয়া গেছে
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    borderRadius: "50px",
                    padding: "8px 20px",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "16px",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.3)"
                  }}
                >
                  ✅ {selected.length} / {examData.marks}
                </div>

                <button
                  onClick={selectAll}
                  style={{
                    background: "#eef2ff", border: "1px solid #c7d2fe",
                    borderRadius: "10px", padding: "8px 16px",
                    color: "#4f46e5", fontWeight: "600", cursor: "pointer", fontSize: "13px"
                  }}
                >
                  সব Select
                </button>

                <button
                  onClick={deselectAll}
                  style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: "10px", padding: "8px 16px",
                    color: "#dc2626", fontWeight: "600", cursor: "pointer", fontSize: "13px"
                  }}
                >
                  সব Deselect
                </button>
              </div>

            </div>
          )}

          {/* QUESTIONS UI */}
          <div className="space-y-4">
            {questions.map((q, index) => {
              const active = selected.includes(q._id);

              return (
                <div
                  key={q._id}
                  onClick={() => toggleSelect(q._id)}
                  style={{
                    background: active ? "#f0f4ff" : "#ffffff",
                    border: active
                      ? "2px solid #6366f1"
                      : "2px solid #e2e8f0",
                    borderRadius: "20px",
                    padding: "24px",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    boxShadow: active
                      ? "0 4px 20px rgba(99,102,241,0.15)"
                      : "0 1px 6px rgba(0,0,0,0.04)"
                  }}
                >
                  <div className="flex items-start gap-4">

                    {/* NUMBER BADGE */}
                    <div
                      style={{
                        minWidth: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: active
                          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                          : "#f1f5f9",
                        border: active ? "none" : "1.5px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: active ? "white" : "#64748b",
                        fontWeight: "700",
                        fontSize: "15px",
                        flexShrink: 0,
                        boxShadow: active ? "0 4px 10px rgba(99,102,241,0.3)" : "none"
                      }}
                    >
                      {active ? "✓" : index + 1}
                    </div>

                    <div style={{ flex: 1 }}>

                      {/* QUESTION */}
                      <h2
                        style={{
                          color: "#1e293b",
                          fontSize: "17px",
                          fontWeight: "700",
                          lineHeight: "1.6",
                          marginBottom: "16px"
                        }}
                      >
                        {q.question}
                      </h2>

                      {/* IMAGE */}
                      {q.image && (
                        <img
                          src={q.image}
                          alt="question"
                          style={{
                            maxWidth: "320px",
                            borderRadius: "12px",
                            border: "1.5px solid #e2e8f0",
                            marginBottom: "16px"
                          }}
                        />
                      )}

                      {/* OPTIONS */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px"
                        }}
                      >
                        {q.options?.map((opt, idx) => {
                          const labels = ["ক", "খ", "গ", "ঘ"];
                          return (
                            <div
                              key={idx}
                              style={{
                                background: active ? "#e8edff" : "#f8fafc",
                                border: "1px solid",
                                borderColor: active ? "#c7d2fe" : "#e2e8f0",
                                borderRadius: "10px",
                                padding: "10px 14px",
                                color: "#374151",
                                fontSize: "14px",
                                display: "flex",
                                gap: "8px"
                              }}
                            >
                              <span style={{ color: "#6366f1", fontWeight: "700", flexShrink: 0 }}>
                                {labels[idx]}.
                              </span>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTION BUTTONS */}
          {questions.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                marginTop: "40px",
                flexWrap: "wrap"
              }}
            >
              <button
                onClick={createExam}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  border: "none",
                  borderRadius: "16px",
                  padding: "16px 32px",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(16,185,129,0.35)"
                }}
              >
                🚀 অনলাইনে পরীক্ষা নিন
              </button>

              <button
                onClick={downloadPDF}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  border: "none",
                  borderRadius: "16px",
                  padding: "16px 32px",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.35)"
                }}
              >
                📄 PDF Download
              </button>
            </div>
          )}

          {/* STUDENT LINK */}
          {examCode && (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "24px",
                border: "1.5px solid #e2e8f0",
                padding: "36px",
                marginTop: "40px",
                textAlign: "center",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)"
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "linear-gradient(135deg, #10b981, #34d399)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "28px",
                  boxShadow: "0 6px 20px rgba(16,185,129,0.3)"
                }}
              >
                ✅
              </div>

              <h2 style={{ color: "#1e293b", fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>
                Exam তৈরি সফল হয়েছে!
              </h2>

              <p style={{ color: "#94a3b8", marginBottom: "24px", fontSize: "14px" }}>
                নিচের লিংকটি স্টুডেন্টদের দিন
              </p>

              <div
                style={{
                  background: "#f0f4ff",
                  borderRadius: "14px",
                  padding: "16px 24px",
                  color: "#4f46e5",
                  fontSize: "15px",
                  marginBottom: "24px",
                  wordBreak: "break-all",
                  border: "1.5px solid #c7d2fe",
                  fontWeight: "600"
                }}
              >
                {window.location.origin}/exam/{examCode}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                <button
                  onClick={copyLink}
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 28px",
                    color: "white",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "15px",
                    boxShadow: "0 6px 18px rgba(99,102,241,0.35)"
                  }}
                >
                  📋 Link Copy করুন
                </button>

                <a
                  href={`/ranking/${examCode}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "linear-gradient(135deg, #f43f5e, #ec4899)",
                    borderRadius: "12px",
                    padding: "12px 28px",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "15px",
                    textDecoration: "none",
                    display: "inline-block",
                    boxShadow: "0 6px 18px rgba(244,63,94,0.3)"
                  }}
                >
                  🏆 View Ranking
                </a>
              </div>

            </div>
          )}

          {/* PRINTABLE QUESTION PAPER */}
          <div
            id="question-paper"
            className="bg-white mt-10 shadow-xl mx-auto preview-paper"
          >
            <style>
              {`
                .preview-paper {
                  width: 210mm;
                  min-height: 297mm;
                  background: white;
                  padding: 14mm;
                  box-sizing: border-box;
                  overflow: hidden;
                }

                .preview-paper * {
                  box-sizing: border-box;
                  word-break: break-word;
                  overflow-wrap: break-word;
                }

                .question-block {
                  width: 100%;
                  margin-bottom: 12px;
                  page-break-inside: avoid;
                  break-inside: avoid;
                }

                .question-title {
                  font-weight: 700;
                  text-align: justify;
                }

                .option-line {
                  display: flex;
                  gap: 4px;
                  align-items: flex-start;
                }

                @media screen and (max-width: 900px) {
                  .preview-paper {
                    width: 100%;
                    padding: 14px;
                  }
                }
              `}
            </style>

            {/* HEADER */}
            <div className="text-center border-b pb-3 mb-4">
              <div className="inline-block bg-black px-5 py-1 mb-2">
                <h1 className={`text-white font-bold ${pdfCompact ? "text-base" : "text-2xl"}`}>
                  {examData.subject}
                </h1>
              </div>

              <h2 className={`font-bold ${pdfCompact ? "text-sm" : "text-xl"}`}>
                {examData.academy}
              </h2>

              <p className={`text-gray-700 mt-1 ${pdfCompact ? "text-[10px]" : "text-sm"}`}>
                {examData.title}
              </p>

              <div className={`flex justify-between mt-3 border-t pt-2 ${pdfCompact ? "text-[9px]" : "text-sm"}`}>
                <p>সময়: {examData.duration} মিনিট</p>
                <p>পূর্ণমান: {examData.marks}</p>
              </div>
            </div>

            {/* PDF QUESTIONS */}
            <div style={{ columnCount: 2, columnGap: pdfCompact ? "14px" : "28px" }}>
              {allQuestions
                .filter((q) => selected.includes(q._id))
                .map((q, i) => (
                  <div key={q._id} className="question-block">
                    <h2
                      className="question-title"
                      style={{
                        fontSize: pdfCompact ? "9px" : "12px",
                        lineHeight: pdfCompact ? "14px" : "18px",
                        marginBottom: "4px"
                      }}
                    >
                      {i + 1}. {q.question}
                    </h2>

                    {q.image && (
                      <img
                        src={q.image}
                        alt="question"
                        style={{ maxWidth: "100%", marginBottom: "4px" }}
                      />
                    )}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: pdfCompact ? "2px 8px" : "4px 14px",
                        fontSize: pdfCompact ? "8px" : "10px",
                        lineHeight: pdfCompact ? "12px" : "15px"
                      }}
                    >
                      {q.options?.map((opt, idx) => {
                        const labels = ["ক", "খ", "গ", "ঘ"];
                        return (
                          <div key={idx} className="option-line">
                            <span style={{ fontWeight: "bold" }}>{labels[idx]}.</span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Builder;