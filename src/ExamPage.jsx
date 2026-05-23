import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

// ==============================
// LOCALSTORAGE KEY HELPER
// ==============================
const getStorageKey = (code) => `exam_progress_${code}`;

function ExamPage() {

  const { code } = useParams();

  // ==============================
  // STATES
  // ==============================
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [score, setScore] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // TIMER
  const [timeLeft, setTimeLeft] = useState(null);

  // ANTI-SCREENSHOT OVERLAY
  const [blocked, setBlocked] = useState(false);
  const blockTimeoutRef = useRef(null);

  // ==============================
  // ANTI-COPY / ANTI-SCREENSHOT PROTECTION
  // ==============================
  useEffect(() => {

    const handleContextMenu = (e) => e.preventDefault();

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (e.ctrlKey && ["c","u","s","a","p","x"].includes(key)) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey && e.metaKey) {
        e.preventDefault();
        return;
      }
      if (
        e.key === "PrintScreen" ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(key))
      ) {
        e.preventDefault();
        navigator.clipboard.writeText("").catch(() => {});
        triggerBlock();
        return;
      }
    };

    const handleCopy = (e) => e.preventDefault();
    const handleCut = (e) => e.preventDefault();
    const handleDragStart = (e) => e.preventDefault();

    const handleBeforePrint = (e) => {
      e.preventDefault();
      triggerBlock();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerBlock();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("dragstart", handleDragStart);
    window.addEventListener("beforeprint", handleBeforePrint);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("beforeprint", handleBeforePrint);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const triggerBlock = () => {
    setBlocked(true);
    if (blockTimeoutRef.current) clearTimeout(blockTimeoutRef.current);
    blockTimeoutRef.current = setTimeout(() => setBlocked(false), 2000);
  };

  // ==============================
  // FETCH EXAM + RESTORE PROGRESS
  // ==============================
  useEffect(() => {

    fetch(`${API}/api/exams/${code}`)
      .then((res) => res.json())
      .then((data) => {
        setExam(data);

        // Try restoring saved progress from localStorage
        const storageKey = getStorageKey(code);
        const saved = localStorage.getItem(storageKey);

        if (saved) {
          try {
            const progress = JSON.parse(saved);

            // Restore name & roll
            if (progress.name) setName(progress.name);
            if (progress.roll) setRoll(progress.roll);

            // Restore answers
            if (progress.answers) setAnswers(progress.answers);

            // Restore remaining time (if saved, use it; otherwise use exam duration)
            if (progress.timeLeft !== undefined && progress.timeLeft > 0) {
              setTimeLeft(progress.timeLeft);
            } else if (data.duration) {
              setTimeLeft(data.duration * 60);
            }

          } catch {
            // Corrupted data — start fresh
            localStorage.removeItem(storageKey);
            if (data.duration) setTimeLeft(data.duration * 60);
          }
        } else {
          // No saved progress — start fresh
          if (data.duration) setTimeLeft(data.duration * 60);
        }
      });

  }, [code]);

  // ==============================
  // SAVE PROGRESS TO LOCALSTORAGE
  // whenever answers / name / roll / timeLeft changes
  // ==============================
  useEffect(() => {

    // Don't save if exam not loaded yet, or already submitted
    if (!exam || submitted) return;

    const storageKey = getStorageKey(code);

    const progress = {
      answers,
      name,
      roll,
      timeLeft,
    };

    localStorage.setItem(storageKey, JSON.stringify(progress));

  }, [answers, name, roll, timeLeft, exam, submitted, code]);

  // ==============================
  // TIMER
  // ==============================
  useEffect(() => {

    if (timeLeft === null) return;
    if (submitted) return;

    if (timeLeft <= 0) {
      autoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);

  }, [timeLeft, submitted]);

  // ==============================
  // FORMAT TIME
  // ==============================
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // ==============================
  // ANSWER
  // ==============================
  const handleAnswer = (qid, option) => {
    setAnswers({ ...answers, [qid]: option });
  };

  // ==============================
  // CLEAR SAVED PROGRESS
  // ==============================
  const clearProgress = () => {
    localStorage.removeItem(getStorageKey(code));
  };

  // ==============================
  // SUBMIT
  // ==============================
  const submitExam = async () => {

    if (submitted) return;

    if (!name || !roll) {
      return alert("Name & Roll Required");
    }

    setSubmitted(true);

    try {

      const res = await fetch(
        `${API}/api/exams/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examCode: code, name, roll, answers })
        }
      );

      const data = await res.json();

      // Clear saved progress after successful submit
      clearProgress();

      setScore(data.score);
      setReviewData(data);

    } catch {
      setSubmitted(false);
      alert("Submit Failed");
    }
  };

  // ==============================
  // AUTO SUBMIT
  // ==============================
  const autoSubmit = () => {
    if (submitted) return;
    alert("সময় শেষ! Auto Submit হচ্ছে");
    submitExam();
  };

  // ==============================
  // DOWNLOAD RESULT PDF
  // ==============================
  const downloadResult = async () => {

    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("result-sheet");

    element.classList.add("pdf-mode");
    await new Promise((resolve) => setTimeout(resolve, 300));

    const options = {
      margin: [5, 5, 5, 5],
      filename: `${exam.title || "exam-result"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#071028",
        scrollY: 0
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    };

    await html2pdf().set(options).from(element).save();
    element.classList.remove("pdf-mode");
  };

  // ==============================
  // GLOBAL STYLES
  // ==============================
  const globalStyles = `
    * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }
    input, textarea {
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
    .pdf-mode {
      background: #071028 !important;
      padding: 20px !important;
    }
    .pdf-mode * {
      box-sizing: border-box;
    }
    .pdf-mode .question {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  `;

  // ==============================
  // RESULT PAGE
  // ==============================
  if (score !== null && reviewData) {

    const wrong = reviewData.questions.length - score;
    const percentage = Math.round((score / reviewData.questions.length) * 100);

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#071028",
          padding: "14px"
        }}
      >
        <style>{globalStyles}</style>

        {blocked && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.97)",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🚫</div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "10px" }}>
              Screenshot Blocked
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px" }}>
              এই পরীক্ষায় screenshot নেওয়া নিষিদ্ধ
            </p>
          </div>
        )}

        <div id="result-sheet" style={{ maxWidth: 1200, margin: "auto", width: "100%" }}>

          <div
            style={{
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              borderRadius: 28,
              padding: "25px 18px",
              color: "white",
              marginBottom: 30
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 15 }}>
              <h1 style={{ fontSize: "clamp(28px,5vw,55px)", margin: 0, fontWeight: "700", lineHeight: 1.2 }}>
                🎉 Exam Completed
              </h1>
            </div>

            <h2 style={{ fontSize: "clamp(16px,3vw,28px)", marginBottom: 25, wordBreak: "break-word" }}>
              {exam.title}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>

              <div style={{ background: "rgba(255,255,255,0.12)", padding: 20, borderRadius: 20 }}>
                <p style={{ opacity: 0.9, marginBottom: 10, fontSize: 16 }}>Score</p>
                <h1 style={{ fontSize: "clamp(30px,5vw,50px)", margin: 0 }}>
                  {score}/{reviewData.questions.length}
                </h1>
              </div>

              <div style={{ background: "rgba(34,197,94,0.18)", padding: 20, borderRadius: 20 }}>
                <p style={{ marginBottom: 10, fontSize: 16 }}>Correct</p>
                <h1 style={{ fontSize: "clamp(30px,5vw,50px)", margin: 0 }}>✅ {score}</h1>
              </div>

              <div style={{ background: "rgba(239,68,68,0.18)", padding: 20, borderRadius: 20 }}>
                <p style={{ marginBottom: 10, fontSize: 16 }}>Wrong</p>
                <h1 style={{ fontSize: "clamp(30px,5vw,50px)", margin: 0 }}>❌ {wrong}</h1>
              </div>

              <div style={{ background: "rgba(255,255,255,0.12)", padding: 20, borderRadius: 20 }}>
                <p style={{ marginBottom: 10, fontSize: 16 }}>Percentage</p>
                <h1 style={{ fontSize: "clamp(30px,5vw,50px)", margin: 0 }}>{percentage}%</h1>
              </div>

            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
            <button
              onClick={downloadResult}
              style={{
                padding: "16px 28px",
                border: "none",
                borderRadius: 18,
                background: "#22c55e",
                color: "white",
                fontSize: 18,
                fontWeight: "700",
                cursor: "pointer",
                width: "100%",
                maxWidth: 350
              }}
            >
              📄 Download Result PDF
            </button>
          </div>

          {reviewData.questions.map((q, index) => {

            const userAns = reviewData.answers[q._id];
            const correct = q.correctAnswer;

            return (
              <div
                key={index}
                className="question"
                style={{
                  background: "white",
                  padding: "18px",
                  borderRadius: 24,
                  marginBottom: 22,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  overflow: "hidden"
                }}
              >
                <h2
                  style={{
                    fontSize: "clamp(18px,3vw,28px)",
                    marginBottom: 12,
                    color: "#0f172a",
                    lineHeight: 1.5,
                    wordBreak: "break-word"
                  }}
                >
                  Q{index + 1}. {q.question}
                </h2>

                {q.image && (
                  <img
                    src={q.image}
                    alt="question"
                    style={{
                      maxWidth: "320px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      marginBottom: "16px",
                      display: "block"
                    }}
                  />
                )}

                <div style={{ display: "grid", gap: 12 }}>
                  {q.options.map((opt, i) => {

                    let bg = "#f1f5f9";
                    let border = "#cbd5e1";

                    if (opt === correct) { bg = "#dcfce7"; border = "#16a34a"; }
                    if (opt === userAns && opt !== correct) { bg = "#fee2e2"; border = "#dc2626"; }

                    return (
                      <div
                        key={i}
                        style={{
                          padding: "15px 14px",
                          borderRadius: 14,
                          background: bg,
                          border: `2px solid ${border}`,
                          fontSize: "clamp(15px,2.7vw,20px)",
                          fontWeight: 500,
                          lineHeight: 1.6,
                          wordBreak: "break-word"
                        }}
                      >
                        {opt}
                        {opt === correct && <span> ✅ Correct</span>}
                        {opt === userAns && opt !== correct && <span> ❌ Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}

        </div>
      </div>
    );
  }

  // ==============================
  // LOADING
  // ==============================
  if (!exam) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 30,
          fontWeight: "bold"
        }}
      >
        Loading...
      </div>
    );
  }

  // ==============================
  // EXAM PAGE
  // ==============================
  return (

    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        padding: 14
      }}
    >
      <style>{globalStyles}</style>

      {blocked && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.97)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🚫</div>
          <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "10px" }}>
            Screenshot Blocked
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px" }}>
            এই পরীক্ষায় screenshot নেওয়া নিষিদ্ধ
          </p>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "auto" }}>

        {/* TOP */}
        <div
          style={{
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            borderRadius: 28,
            padding: "25px 18px",
            color: "white",
            marginBottom: 25
          }}
        >
          <h1 style={{ fontSize: "clamp(28px,5vw,55px)", marginBottom: 14, lineHeight: 1.2 }}>
            📝 {exam.title}
          </h1>
          <p style={{ fontSize: "clamp(18px,3vw,24px)" }}>
            ⏰ Time Left: {formatTime()}
          </p>
        </div>

        {/* USER INFO */}
        <div style={{ background: "white", borderRadius: 22, padding: 20, marginBottom: 25 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 16
            }}
          >
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: 16,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                width: "100%",
                boxSizing: "border-box"
              }}
            />
            <input
              type="text"
              placeholder="Your Roll"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              style={{
                padding: 16,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                width: "100%",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {/* QUESTIONS */}
        {exam.questions.map((q, index) => (

          <div
            key={q._id}
            style={{ background: "white", borderRadius: 24, padding: 20, marginBottom: 22 }}
          >

            <h2
              style={{
                fontSize: "clamp(20px,3vw,30px)",
                marginBottom: 16,
                color: "#0f172a",
                lineHeight: 1.5
              }}
            >
              {index + 1}. {q.question}
            </h2>

            {q.image && (
              <img
                src={q.image}
                alt="question"
                style={{
                  maxWidth: "320px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "16px",
                  display: "block"
                }}
              />
            )}

            <div style={{ display: "grid", gap: 14 }}>
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(q._id, opt)}
                  style={{
                    padding: "16px 18px",
                    borderRadius: 16,
                    border: answers[q._id] === opt ? "2px solid #2563eb" : "2px solid #e2e8f0",
                    background: answers[q._id] === opt ? "#dbeafe" : "#f8fafc",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "clamp(15px,2.7vw,20px)",
                    fontWeight: 500,
                    lineHeight: 1.6,
                    width: "100%",
                    wordBreak: "break-word"
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

          </div>
        ))}

        {/* SUBMIT */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 35 }}>
          <button
            onClick={submitExam}
            disabled={submitted}
            style={{
              padding: "18px 28px",
              border: "none",
              borderRadius: 18,
              background: submitted ? "#94a3b8" : "#22c55e",
              color: "white",
              fontSize: 20,
              fontWeight: "700",
              cursor: submitted ? "not-allowed" : "pointer",
              width: "100%",
              maxWidth: 350
            }}
          >
            {submitted ? "⏳ Submitting..." : "🚀 Submit Exam"}
          </button>
        </div>

      </div>

    </div>
  );
}

export default ExamPage;