import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const getStorageKey = (code) => `exam_progress_${code}`;

const getScoreComment = (score, name) => {
  const n = name || "বন্ধু";
  if (score >= 1 && score <= 5)  return `😔 ${n}, এবার ফলাফল একটু কম হয়েছে — কিন্তু এটাই শেষ কথা নয়! প্রতিটা ব্যর্থতা সাফল্যের প্রথম ধাপ। আবার চেষ্টা করো, তুমি অবশ্যই পারবে! 💪`;
  if (score >= 6 && score <= 10) return `🙂 ${n}, তুমি চেষ্টা করেছ — সেটাই সবচেয়ে বড় কথা! একটু বেশি সময় দিলে পরের বার তুমি অনেক এগিয়ে যাবে। হাল ছেড়ো না! 🔥`;
  if (score >= 11 && score <= 14) return `😊 বাহ ${n}! মাঝামাঝি ফলাফল এসেছে — তবে তোমার মধ্যে আরও অনেক সম্ভাবনা আছে। একটু মনোযোগ বাড়াও, সেরাটা বের হয়ে আসবেই! ⭐`;
  if (score >= 15 && score <= 18) return `🌟 চমৎকার ${n}! তুমি সত্যিই ভালো করেছ! আর মাত্র কয়েক ধাপ — শীর্ষে পৌঁছানো তোমার পক্ষেই সম্ভব। এগিয়ে যাও! 🚀`;
  if (score >= 19 && score <= 25) return `🏆 অবিশ্বাস্য ${n}! তুমি আজকে সত্যিকারের চ্যাম্পিয়ন! তোমার এই পরিশ্রম ও মেধা একদিন তোমাকে অনেক উঁচুতে নিয়ে যাবে। গর্বিত তোমাকে নিয়ে! 🎉✨`;
  return "";
};

function ExamPage() {
  const { code } = useParams();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [score, setScore] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const blockTimeoutRef = useRef(null);
  const [showToast, setShowToast] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // ==============================
  // ANTI-COPY / ANTI-SCREENSHOT
  // ==============================
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (e.ctrlKey && ["c","u","s","a","p","x"].includes(key)) { e.preventDefault(); return; }
      if (e.shiftKey && e.metaKey) { e.preventDefault(); return; }
      if (e.key === "PrintScreen" || e.key === "F12" || (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(key))) {
        e.preventDefault();
        navigator.clipboard.writeText("").catch(() => {});
        triggerBlock();
        return;
      }
    };
    const handleCopy = (e) => e.preventDefault();
    const handleCut = (e) => e.preventDefault();
    const handleDragStart = (e) => e.preventDefault();
    const handleBeforePrint = (e) => { e.preventDefault(); triggerBlock(); };
    const handleVisibilityChange = () => { if (document.hidden) triggerBlock(); };

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
        const storageKey = getStorageKey(code);
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const progress = JSON.parse(saved);
            if (progress.name) setName(progress.name);
            if (progress.roll) setRoll(progress.roll);
            if (progress.answers) setAnswers(progress.answers);
            if (progress.timeLeft !== undefined && progress.timeLeft > 0) {
              setTimeLeft(progress.timeLeft);
            } else if (data.duration) {
              setTimeLeft(data.duration * 60);
            }
          } catch {
            localStorage.removeItem(storageKey);
            if (data.duration) setTimeLeft(data.duration * 60);
          }
        } else {
          if (data.duration) setTimeLeft(data.duration * 60);
        }
      });
  }, [code]);

  // ==============================
  // SAVE PROGRESS
  // ==============================
  useEffect(() => {
    if (!exam || submitted) return;
    const storageKey = getStorageKey(code);
    localStorage.setItem(storageKey, JSON.stringify({ answers, name, roll, timeLeft }));
  }, [answers, name, roll, timeLeft, exam, submitted, code]);

  // ==============================
  // TIMER
  // ==============================
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { autoSubmit(); return; }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // ==============================
  // TOAST TRIGGER
  // ==============================
  useEffect(() => {
    if (score !== null && reviewData) {
      setTimeout(() => {
        setShowToast(true);
        setTimeout(() => setToastVisible(true), 50);
        setTimeout(() => {
          setToastVisible(false);
          setTimeout(() => setShowToast(false), 600);
        }, 6000);
      }, 500);
    }
  }, [score, reviewData]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const timerColor = timeLeft !== null && timeLeft <= 60 ? "#ff4444" : "white";

  const handleAnswer = (qid, option) => setAnswers({ ...answers, [qid]: option });
  const clearProgress = () => localStorage.removeItem(getStorageKey(code));

  const submitExam = async () => {
    if (submitted) return;
    if (!name || !roll) return alert("Name & Roll Required");
    setSubmitted(true);
    try {
      const res = await fetch(`${API}/api/exams/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examCode: code, name, roll, answers })
      });
      const data = await res.json();
      clearProgress();
      setScore(data.score);
      setReviewData(data);
    } catch {
      setSubmitted(false);
      alert("Submit Failed");
    }
  };

  const autoSubmit = () => {
    if (submitted) return;
    alert("সময় শেষ! Auto Submit হচ্ছে");
    submitExam();
  };

  const downloadResult = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("result-sheet");
    element.classList.add("pdf-mode");
    await new Promise((resolve) => setTimeout(resolve, 300));
    const options = {
      margin: [5, 5, 5, 5],
      filename: `${exam.title || "exam-result"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#f8fafc", scrollY: 0 },
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
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap');

    * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      box-sizing: border-box;
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
      background: #f8fafc !important;
      padding: 20px !important;
    }
    .pdf-mode .question {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    @keyframes timerPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.06); }
      100% { transform: scale(1); }
    }

    /* FIXED TOAST — uses translateX(-50%) for centering, translateY for slide */
    @keyframes toastIn {
      0%   { transform: translateX(-50%) translateY(100px); opacity: 0; }
      100% { transform: translateX(-50%) translateY(0);     opacity: 1; }
    }
    @keyframes toastOut {
      0%   { transform: translateX(-50%) translateY(0);     opacity: 1; }
      100% { transform: translateX(-50%) translateY(100px); opacity: 0; }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to   { opacity: 1; transform: scale(1); }
    }

    .stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.15) !important;
    }
    .option-btn {
      transition: all 0.18s ease;
    }
    .option-btn:hover {
      transform: translateX(4px);
    }
    .review-question {
      animation: fadeInUp 0.4s ease both;
    }
  `;

  // ==============================
  // BLOCKED OVERLAY (shared)
  // ==============================
  const BlockedOverlay = () => blocked ? (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.97)",
      zIndex: 99999, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", color: "white"
    }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🚫</div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10, fontFamily: "'Sora', sans-serif" }}>Screenshot Blocked</h2>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, fontFamily: "'Hind Siliguri', sans-serif" }}>এই পরীক্ষায় screenshot নেওয়া নিষিদ্ধ</p>
    </div>
  ) : null;

  // ==============================
  // RESULT PAGE
  // ==============================
  if (score !== null && reviewData) {
    const wrong = reviewData.questions.length - score;
    const percentage = Math.round((score / reviewData.questions.length) * 100);

    return (
      <div style={{
        minHeight: "100vh",
        background: "#f0f4ff",
        padding: "14px",
        fontFamily: "'Sora', 'Hind Siliguri', sans-serif"
      }}>
        <style>{globalStyles}</style>
        <BlockedOverlay />

        {/* ── TOAST (FIXED CENTERED) ── */}
        {showToast && (
          <div style={{
            position: "fixed",
            bottom: 28,
            left: "50%",               /* anchor at center */
            transform: "translateX(-50%)", /* pull back half-width */
            zIndex: 99998,
            width: "calc(100% - 32px)",  /* full width minus side padding */
            maxWidth: 540,
            animation: toastVisible
              ? "toastIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards"
              : "toastOut 0.45s ease forwards",
          }}>
            <div style={{
              background: "linear-gradient(135deg,#1e3a8a 0%,#4c1d95 100%)",
              borderRadius: 20,
              padding: "18px 22px",
              color: "white",
              fontSize: "clamp(13px,2vw,17px)",
              fontWeight: 600,
              lineHeight: 1.8,
              boxShadow: "0 24px 64px rgba(30,58,138,0.45), 0 4px 16px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.18)",
              textAlign: "center",
              backdropFilter: "blur(12px)",
              fontFamily: "'Hind Siliguri', sans-serif",
            }}>
              {getScoreComment(score, name)}
            </div>
          </div>
        )}

        <div id="result-sheet" style={{ maxWidth: 860, margin: "0 auto", width: "100%" }}>

          {/* ── HERO RESULT CARD ── */}
          <div style={{
            background: "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)",
            borderRadius: 28,
            padding: "28px 22px",
            color: "white",
            marginBottom: 28,
            boxShadow: "0 20px 60px rgba(37,99,235,0.35), 0 4px 20px rgba(0,0,0,0.15)",
            animation: "scaleIn 0.5s ease both",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
              <h1 style={{
                fontSize: "clamp(26px,5vw,48px)",
                margin: 0, fontWeight: 800, lineHeight: 1.2,
                fontFamily: "'Sora', sans-serif", letterSpacing: "-0.5px"
              }}>
                🎉 Exam Completed
              </h1>
            </div>
            <h2 style={{
              fontSize: "clamp(15px,2.5vw,22px)", marginBottom: 24, marginTop: 6,
              opacity: 0.85, fontWeight: 500, wordBreak: "break-word"
            }}>
              {exam.title}
            </h2>

            {/* STAT CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
              {[
                { label: "Score", value: `${score}/${reviewData.questions.length}`, bg: "rgba(255,255,255,0.15)", border: "rgba(255,255,255,0.25)" },
                { label: "Correct", value: `✅ ${score}`, bg: "rgba(34,197,94,0.2)", border: "rgba(34,197,94,0.4)" },
                { label: "Wrong", value: `❌ ${wrong}`, bg: "rgba(239,68,68,0.18)", border: "rgba(239,68,68,0.35)" },
                { label: "Percentage", value: `${percentage}%`, bg: "rgba(255,255,255,0.12)", border: "rgba(255,255,255,0.22)" },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{
                  background: s.bg, padding: "18px 16px", borderRadius: 18,
                  border: `1.5px solid ${s.border}`,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                }}>
                  <p style={{ opacity: 0.8, marginBottom: 8, fontSize: 13, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{s.label}</p>
                  <p style={{ fontSize: "clamp(26px,4.5vw,44px)", margin: 0, fontWeight: 800, lineHeight: 1, fontFamily: "'Sora', sans-serif" }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* SCORE COMMENT INSIDE CARD */}
            <div style={{
              background: "rgba(255,255,255,0.13)",
              borderRadius: 18, padding: "18px 20px", marginTop: 18,
              fontSize: "clamp(14px,2.2vw,19px)", fontWeight: 600,
              textAlign: "center", lineHeight: 1.9, letterSpacing: "0.2px",
              border: "1px solid rgba(255,255,255,0.22)",
              fontFamily: "'Hind Siliguri', sans-serif",
              backdropFilter: "blur(4px)",
            }}>
              {getScoreComment(score, name)}
            </div>
          </div>

          {/* ── DOWNLOAD BUTTON ── */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <button
              onClick={downloadResult}
              style={{
                padding: "15px 28px", border: "none", borderRadius: 16,
                background: "linear-gradient(135deg,#16a34a,#15803d)",
                color: "white", fontSize: 17, fontWeight: 700,
                cursor: "pointer", width: "100%", maxWidth: 340,
                boxShadow: "0 8px 24px rgba(22,163,74,0.35)",
                fontFamily: "'Sora', sans-serif", letterSpacing: "0.3px",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(22,163,74,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(22,163,74,0.35)"; }}
            >
              📄 Download Result PDF
            </button>
          </div>

          {/* ── QUESTION REVIEW ── */}
          {reviewData.questions.map((q, index) => {
            const userAns = reviewData.answers[q._id];
            const correct = q.correctAnswer;
            return (
              <div
                key={index}
                className="review-question"
                style={{
                  background: "white",
                  padding: "22px 20px",
                  borderRadius: 22,
                  marginBottom: 18,
                  /* ← Smooth multi-layer shadow on white */
                  boxShadow: "0 2px 8px rgba(37,99,235,0.06), 0 8px 28px rgba(37,99,235,0.10), 0 1px 3px rgba(0,0,0,0.05)",
                  border: "1px solid rgba(226,232,240,0.8)",
                  overflow: "hidden",
                  animationDelay: `${index * 0.04}s`,
                }}
              >
                {/* Question header stripe */}
                <div style={{
                  display: "inline-flex", alignItems: "center",
                  background: "linear-gradient(135deg,#eff6ff,#f5f3ff)",
                  borderRadius: 10, padding: "4px 12px", marginBottom: 12,
                  border: "1px solid #e0e7ff",
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#3730a3", fontFamily: "'Sora', sans-serif" }}>
                    Q{index + 1}
                  </span>
                </div>

                <h2 style={{
                  fontSize: "clamp(16px,2.6vw,24px)", marginBottom: 14,
                  color: "#0f172a", lineHeight: 1.6, wordBreak: "break-word",
                  fontFamily: "'Hind Siliguri', 'Sora', sans-serif", fontWeight: 600,
                  margin: "0 0 14px 0",
                }}>
                  {q.question}
                </h2>

                {q.image && (
                  <img src={q.image} alt="question" style={{
                    maxWidth: "300px", borderRadius: "12px",
                    border: "1px solid #e2e8f0", marginBottom: "16px", display: "block",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                  }} />
                )}

                <div style={{ display: "grid", gap: 10 }}>
                  {q.options.map((opt, i) => {
                    const isCorrect = opt === correct;
                    const isWrong = opt === userAns && opt !== correct;
                    let bg = "#f8fafc", border = "#e2e8f0", color = "#334155";
                    if (isCorrect) { bg = "#f0fdf4"; border = "#86efac"; color = "#14532d"; }
                    if (isWrong)   { bg = "#fff1f2"; border = "#fca5a5"; color = "#7f1d1d"; }
                    return (
                      <div key={i} style={{
                        padding: "13px 16px", borderRadius: 14, background: bg,
                        border: `1.5px solid ${border}`, color,
                        fontSize: "clamp(14px,2.4vw,18px)", fontWeight: 500,
                        lineHeight: 1.6, wordBreak: "break-word",
                        fontFamily: "'Hind Siliguri', sans-serif",
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                      }}>
                        <span>{opt}</span>
                        {isCorrect && <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", whiteSpace: "nowrap", background: "#dcfce7", padding: "2px 10px", borderRadius: 20 }}>✅ Correct</span>}
                        {isWrong   && <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", whiteSpace: "nowrap", background: "#fee2e2", padding: "2px 10px", borderRadius: 20 }}>❌ Your Answer</span>}
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
      <div style={{
        minHeight: "100vh", display: "flex",
        justifyContent: "center", alignItems: "center",
        fontSize: 28, fontWeight: "bold",
        background: "linear-gradient(135deg,#0f172a,#1e293b)", color: "white",
        fontFamily: "'Sora', sans-serif"
      }}>
        Loading...
      </div>
    );
  }

  // ==============================
  // EXAM PAGE
  // ==============================
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#0f172a 0%,#1e293b 100%)",
      padding: 14,
      fontFamily: "'Sora', 'Hind Siliguri', sans-serif"
    }}>
      <style>{globalStyles}</style>
      <BlockedOverlay />

      {/* STICKY TIMER */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        display: "flex", justifyContent: "center",
        padding: "10px 16px",
        background: "rgba(15,23,42,0.88)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)"
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: timeLeft !== null && timeLeft <= 60 ? "rgba(255,68,68,0.12)" : "rgba(37,99,235,0.18)",
          border: `1.5px solid ${timerColor}`,
          borderRadius: 50, padding: "8px 26px",
          animation: timeLeft !== null && timeLeft <= 60 ? "timerPulse 1s infinite" : "none"
        }}>
          <span style={{ fontSize: 18 }}>⏰</span>
          <span style={{
            fontSize: "clamp(16px,3vw,22px)", fontWeight: 800, color: timerColor,
            letterSpacing: "2.5px", fontFamily: "monospace"
          }}>
            {timeLeft !== null ? formatTime() : "--:--"}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "auto", paddingTop: 66 }}>

        {/* EXAM TITLE */}
        <div style={{
          background: "linear-gradient(135deg,#2563eb,#7c3aed)",
          borderRadius: 24, padding: "22px 20px", color: "white", marginBottom: 22,
          boxShadow: "0 12px 40px rgba(37,99,235,0.3)",
        }}>
          <h1 style={{
            fontSize: "clamp(22px,4.5vw,46px)", margin: 0, lineHeight: 1.25,
            fontWeight: 800, letterSpacing: "-0.3px"
          }}>
            📝 {exam.title}
          </h1>
        </div>

        {/* USER INFO */}
        <div style={{
          background: "white", borderRadius: 20, padding: "18px 16px", marginBottom: 22,
          boxShadow: "0 2px 8px rgba(37,99,235,0.06), 0 8px 28px rgba(37,99,235,0.10)",
          border: "1px solid rgba(226,232,240,0.8)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            {[
              { placeholder: "Your Name", value: name, onChange: (e) => setName(e.target.value) },
              { placeholder: "Your Roll", value: roll, onChange: (e) => setRoll(e.target.value) },
            ].map((inp, i) => (
              <input
                key={i}
                type="text"
                placeholder={inp.placeholder}
                value={inp.value}
                onChange={inp.onChange}
                style={{
                  padding: "14px 16px", borderRadius: 14,
                  border: "1.5px solid #e2e8f0", fontSize: 15,
                  width: "100%", outline: "none",
                  fontFamily: "'Hind Siliguri', 'Sora', sans-serif",
                  color: "#0f172a", background: "#f8fafc",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#2563eb"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            ))}
          </div>
        </div>

        {/* QUESTIONS */}
        {exam.questions.map((q, index) => (
          <div key={q._id} style={{
            background: "white", borderRadius: 22, padding: "20px 18px", marginBottom: 18,
            boxShadow: "0 2px 8px rgba(37,99,235,0.06), 0 8px 28px rgba(37,99,235,0.10)",
            border: "1px solid rgba(226,232,240,0.8)",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: "linear-gradient(135deg,#eff6ff,#f5f3ff)",
              borderRadius: 10, padding: "3px 12px", marginBottom: 10,
              border: "1px solid #e0e7ff",
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#3730a3", fontFamily: "'Sora', sans-serif" }}>
                Q{index + 1}
              </span>
            </div>

            <h2 style={{
              fontSize: "clamp(17px,2.8vw,26px)", marginBottom: 16, margin: "0 0 16px 0",
              color: "#0f172a", lineHeight: 1.6, fontWeight: 600,
              fontFamily: "'Hind Siliguri', 'Sora', sans-serif",
            }}>
              {q.question}
            </h2>

            {q.image && (
              <img src={q.image} alt="question" style={{
                maxWidth: "300px", borderRadius: "12px",
                border: "1px solid #e2e8f0", marginBottom: "14px", display: "block",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
              }} />
            )}

            <div style={{ display: "grid", gap: 12 }}>
              {q.options.map((opt, i) => {
                const selected = answers[q._id] === opt;
                return (
                  <button
                    key={i}
                    className="option-btn"
                    onClick={() => handleAnswer(q._id, opt)}
                    style={{
                      padding: "14px 18px", borderRadius: 14, textAlign: "left",
                      border: selected ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                      background: selected
                        ? "linear-gradient(135deg,#eff6ff,#f5f3ff)"
                        : "#f8fafc",
                      cursor: "pointer",
                      fontSize: "clamp(14px,2.5vw,19px)", fontWeight: selected ? 600 : 500,
                      lineHeight: 1.6, width: "100%", wordBreak: "break-word",
                      color: selected ? "#1e40af" : "#334155",
                      boxShadow: selected ? "0 4px 14px rgba(37,99,235,0.15)" : "none",
                      fontFamily: "'Hind Siliguri', 'Sora', sans-serif",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* SUBMIT */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 30, marginBottom: 40 }}>
          <button
            onClick={submitExam}
            disabled={submitted}
            style={{
              padding: "17px 28px", border: "none", borderRadius: 18,
              background: submitted
                ? "#94a3b8"
                : "linear-gradient(135deg,#22c55e,#16a34a)",
              color: "white", fontSize: 19, fontWeight: 700,
              cursor: submitted ? "not-allowed" : "pointer",
              width: "100%", maxWidth: 350,
              boxShadow: submitted ? "none" : "0 8px 28px rgba(34,197,94,0.35)",
              fontFamily: "'Sora', sans-serif", letterSpacing: "0.3px",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={e => { if (!submitted) e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {submitted ? "⏳ Submitting..." : "🚀 Submit Exam"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ExamPage;