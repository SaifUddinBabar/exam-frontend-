import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

const API = import.meta.env.VITE_API_URL;

function Builder() {

  // ==============================
  // STATES
  // ==============================
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [chapter, setChapter] = useState("");
  const [examCode, setExamCode] = useState("");

  const [boardYear, setBoardYear] =
    useState("");

  const [boardName, setBoardName] =
    useState("");

  const [pdfCompact, setPdfCompact] = useState(false);

  const [examData, setExamData] = useState({
    academy: "",
    title: "",
    duration: "60",
    subject: "ICT",
    marks: "25"
  });

  // ==============================
  // FETCH QUESTIONS
  // ==============================
  useEffect(() => {

    if (!chapter) {
      setQuestions([]);
      return;
    }

    const params = new URLSearchParams();

    params.append("subject", examData.subject);
    params.append("chapter", chapter);

    // BOARD QUESTION
    if (chapter === "Board Questions") {

      // BUG FIX: boardName select না করলে questions আসবে না
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

        // AUTO SELECT — board questions হলে সব auto select
        if (chapter === "Board Questions") {

          setSelected(
            fetched.map((q) => q._id)
          );

          setExamData((prev) => ({
            ...prev,
            marks: String(fetched.length)
          }));
        }

        setAllQuestions((prev) => {

          const merged = [...prev];

          fetched.forEach((q) => {

            const exists = merged.find(
              (item) => item._id === q._id
            );

            if (!exists) {
              merged.push(q);
            }
          });

          return merged;
        });

      })
      .catch(() => setQuestions([]));

  }, [
    chapter,
    boardYear,
    boardName,
    examData.subject
  ]);

  // ==============================
  // HANDLE INPUT
  // ==============================
  const handleChange = (e) => {
    setExamData({
      ...examData,
      [e.target.name]: e.target.value
    });
  };

  // ==============================
  // SELECT QUESTION
  // ==============================
  const toggleSelect = (id) => {

    if (selected.includes(id)) {
      setSelected((prev) =>
        prev.filter((q) => q !== id)
      );
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
    setSelected(questions.map((q) => q._id));
    setExamData((prev) => ({
      ...prev,
      marks: String(questions.length)
    }));
  };

  const deselectAll = () => {
    setSelected([]);
  };

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
    navigator.clipboard.writeText(
      `${window.location.origin}/exam/${examCode}`
    );
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

    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    const element =
      document.getElementById("question-paper");

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
  // RENDER
  // ==============================
  return (

    <div className="min-h-screen" style={{ background: "#0f0c29", backgroundImage: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>

      {/* ==============================
          TOPBAR
      ============================== */}
      <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>

        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "12px", padding: "8px 12px" }}>
              <span className="text-white text-xl font-bold">📝</span>
            </div>

            <div>
              <h1 className="text-white text-2xl font-bold tracking-wide">
                প্রশ্নব্যাংক
              </h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                Question Bank Builder
              </p>
            </div>

          </div>

          <button
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              border: "none",
              borderRadius: "12px",
              padding: "10px 20px",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            ← মূল তালিকা
          </button>

        </div>

      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ==============================
            FORM CARD
        ============================== */}
        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "36px",
            marginBottom: "32px"
          }}
        >

          <div className="text-center mb-8">

            <h2 className="text-white text-3xl font-bold mb-2">
              পরীক্ষার তথ্য পূরণ করুন
            </h2>

            <p style={{ color: "rgba(255,255,255,0.5)" }}>
              নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            {/* ACADEMY */}
            <div>

              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                🏫 একাডেমি / কলেজের নাম
              </label>

              <input
                type="text"
                name="academy"
                placeholder="যেমন: Saif Academy"
                value={examData.academy}
                onChange={handleChange}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  color: "white",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />

            </div>

            {/* EXAM TITLE */}
            <div>

              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                📋 পরীক্ষার নাম
              </label>

              <input
                type="text"
                name="title"
                placeholder="যেমন: Model Test 2024"
                value={examData.title}
                onChange={handleChange}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  color: "white",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />

            </div>

            {/* SUBJECT */}
            <div>

              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                📚 বিষয়
              </label>

              <input
                type="text"
                name="subject"
                value={examData.subject}
                onChange={handleChange}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  color: "white",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />

            </div>

            {/* CHAPTER */}
            <div>

              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                📖 অধ্যায়
              </label>

              <select
                value={chapter}
                onChange={(e) => {
                  setChapter(e.target.value);
                  setSelected([]);
                  setBoardYear("");
                  setBoardName("");
                }}
                style={{
                  width: "100%",
                  background: "rgba(30,25,60,0.95)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  color: "white",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
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

                  <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                    📅 Board Year
                  </label>

                  <select
                    value={boardYear}
                    onChange={(e) => {
                      setBoardYear(e.target.value);
                      setSelected([]);
                      setBoardName("");
                    }}
                    style={{
                      width: "100%",
                      background: "rgba(30,25,60,0.95)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      color: "white",
                      fontSize: "15px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="">Select Year</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>

                </div>
              )}

              {/* BOARD NAME */}
              {chapter === "Board Questions" && boardYear && (

                <div className="mt-4">

                  <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                    🏛️ Board Name
                  </label>

                  <select
                    value={boardName}
                    onChange={(e) =>
                      setBoardName(e.target.value)
                    }
                    style={{
                      width: "100%",
                      background: "rgba(30,25,60,0.95)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      color: "white",
                      fontSize: "15px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="">Select Board</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Cumilla">Cumilla</option>
                    <option value="Jessore">Jessore</option>
                  </select>

                </div>
              )}

            </div>

            {/* MARKS */}
            <div>

              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                🎯 প্রশ্ন সংখ্যা
              </label>

              <input
                type="number"
                name="marks"
                value={examData.marks}
                onChange={handleChange}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  color: "white",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />

            </div>

            {/* DURATION */}
            <div>

              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                ⏱️ সময় (মিনিট)
              </label>

              <input
                type="number"
                name="duration"
                value={examData.duration}
                onChange={handleChange}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  color: "white",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />

            </div>

          </div>

        </div>

        {/* ==============================
            QUESTION HEADER
        ============================== */}
        {questions.length > 0 && (

          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "24px 32px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}
          >

            <div>

              <h2 className="text-white text-2xl font-bold mb-1">
                প্রশ্ন সিলেক্ট করুন
              </h2>

              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                মোট {questions.length}টি প্রশ্ন পাওয়া গেছে
              </p>

            </div>

            <div className="flex items-center gap-4">

              {/* COUNTER BADGE */}
              <div
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  borderRadius: "50px",
                  padding: "8px 20px",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "16px"
                }}
              >
                ✅ {selected.length} / {examData.marks}
              </div>

              {/* SELECT ALL */}
              <button
                onClick={selectAll}
                style={{
                  background: "rgba(102,126,234,0.2)",
                  border: "1px solid rgba(102,126,234,0.5)",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  color: "#a78bfa",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                সব Select
              </button>

              {/* DESELECT ALL */}
              <button
                onClick={deselectAll}
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  color: "#f87171",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                সব Deselect
              </button>

            </div>

          </div>
        )}

        {/* ==============================
            QUESTIONS UI
        ============================== */}
        <div className="space-y-4">

          {questions.map((q, index) => {

            const active = selected.includes(q._id);

            return (

              <div
                key={q._id}
                onClick={() => toggleSelect(q._id)}
                style={{
                  background: active
                    ? "rgba(102,126,234,0.15)"
                    : "rgba(255,255,255,0.05)",
                  border: active
                    ? "2px solid rgba(102,126,234,0.7)"
                    : "2px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  padding: "24px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  backdropFilter: "blur(10px)",
                  boxShadow: active
                    ? "0 0 30px rgba(102,126,234,0.2)"
                    : "none"
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
                        ? "linear-gradient(135deg, #667eea, #764ba2)"
                        : "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "15px",
                      flexShrink: 0
                    }}
                  >
                    {active ? "✓" : index + 1}
                  </div>

                  <div style={{ flex: 1 }}>

                    {/* QUESTION */}
                    <h2
                      style={{
                        color: "white",
                        fontSize: "18px",
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
                          border: "1px solid rgba(255,255,255,0.15)",
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
                              background: "rgba(255,255,255,0.06)",
                              borderRadius: "10px",
                              padding: "10px 14px",
                              color: "rgba(255,255,255,0.8)",
                              fontSize: "15px",
                              display: "flex",
                              gap: "8px"
                            }}
                          >

                            <span
                              style={{
                                color: "#a78bfa",
                                fontWeight: "700",
                                flexShrink: 0
                              }}
                            >
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

        {/* ==============================
            ACTION BUTTONS
        ============================== */}
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

            {/* CREATE EXAM */}
            <button
              onClick={createExam}
              style={{
                background: "linear-gradient(135deg, #11998e, #38ef7d)",
                border: "none",
                borderRadius: "16px",
                padding: "16px 32px",
                color: "white",
                fontWeight: "700",
                fontSize: "16px",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(56,239,125,0.3)"
              }}
            >
              🚀 অনলাইনে পরীক্ষা নিন
            </button>

            {/* PDF */}
            <button
              onClick={downloadPDF}
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "none",
                borderRadius: "16px",
                padding: "16px 32px",
                color: "white",
                fontWeight: "700",
                fontSize: "16px",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(102,126,234,0.3)"
              }}
            >
              📄 PDF Download
            </button>

          </div>
        )}

        {/* ==============================
            STUDENT LINK
        ============================== */}
        {examCode && (

          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "36px",
              marginTop: "40px",
              textAlign: "center"
            }}
          >

            <div
              style={{
                width: "64px",
                height: "64px",
                background: "linear-gradient(135deg, #11998e, #38ef7d)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "28px"
              }}
            >
              ✅
            </div>

            <h2
              style={{
                color: "white",
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "8px"
              }}
            >
              Exam তৈরি সফল হয়েছে!
            </h2>

            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                marginBottom: "24px",
                fontSize: "14px"
              }}
            >
              নিচের লিংকটি স্টুডেন্টদের দিন
            </p>

            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "14px",
                padding: "16px 24px",
                color: "#a78bfa",
                fontSize: "15px",
                marginBottom: "24px",
                wordBreak: "break-all",
                border: "1px solid rgba(102,126,234,0.3)"
              }}
            >
              {window.location.origin}/exam/{examCode}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap"
              }}
            >

              <button
                onClick={copyLink}
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 28px",
                  color: "white",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "15px"
                }}
              >
                📋 Link Copy করুন
              </button>

              <a
                href={`/ranking/${examCode}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "linear-gradient(135deg, #f093fb, #f5576c)",
                  borderRadius: "12px",
                  padding: "12px 28px",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "15px",
                  textDecoration: "none",
                  display: "inline-block"
                }}
              >
                🏆 View Ranking
              </a>

            </div>

          </div>
        )}

        {/* ==============================
            PRINTABLE QUESTION PAPER
        ============================== */}
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

          {/* QUESTIONS */}
          <div
            style={{
              columnCount: 2,
              columnGap: pdfCompact ? "14px" : "28px"
            }}
          >

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
                      style={{
                        maxWidth: "100%",
                        marginBottom: "4px"
                      }}
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
                          <span style={{ fontWeight: "bold" }}>
                            {labels[idx]}.
                          </span>
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

    </div>
  );
}

export default Builder;