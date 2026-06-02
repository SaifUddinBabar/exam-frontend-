import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

const API = import.meta.env.VITE_API_URL;

// ─── Premium Animation Keyframes & Global Styles ───────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

    *, *::before, *::after {
      box-sizing: border-box;
      user-select: none !important;
      -webkit-user-select: none !important;
    }
    input, textarea, select {
      user-select: text !important;
      -webkit-user-select: text !important;
    }
    img { pointer-events: none !important; -webkit-user-drag: none !important; }
    @media print { body { display: none !important; } }

    body { font-family: 'DM Sans', sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.96); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(79,70,229,0.25); }
      70%  { box-shadow: 0 0 0 10px rgba(79,70,229,0); }
      100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); }
    }
    @keyframes checkPop {
      0%   { transform: scale(0.7); }
      60%  { transform: scale(1.15); }
      100% { transform: scale(1); }
    }

    .anim-fadeUp   { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
    .anim-scaleIn  { animation: scaleIn 0.45s cubic-bezier(.22,1,.36,1) both; }
    .anim-fadeIn   { animation: fadeIn 0.4s ease both; }
    .anim-slide    { animation: slideRight 0.4s cubic-bezier(.22,1,.36,1) both; }

    .delay-1 { animation-delay: 0.05s; }
    .delay-2 { animation-delay: 0.10s; }
    .delay-3 { animation-delay: 0.15s; }
    .delay-4 { animation-delay: 0.20s; }
    .delay-5 { animation-delay: 0.25s; }

    /* ── Topbar ── */
    .topbar {
      position: sticky; top: 0; z-index: 200;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(226,232,240,0.8);
      box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.03);
    }

    /* ── Premium Input ── */
    .p-input {
      width: 100%; background: #fff;
      border: 1.5px solid #e8edf5;
      border-radius: 14px;
      padding: 13px 18px;
      color: #0f172a;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .p-input::placeholder { color: #b0bac9; }
    .p-input:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 4px rgba(79,70,229,0.08), 0 1px 4px rgba(0,0,0,0.04);
      transform: translateY(-1px);
    }
    .p-input:hover:not(:focus) { border-color: #c7d2fe; }

    /* ── Premium Button ── */
    .btn-primary {
      position: relative; overflow: hidden;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border: none; border-radius: 14px;
      padding: 14px 32px;
      color: white; font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 15px;
      cursor: pointer; letter-spacing: 0.01em;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 20px rgba(79,70,229,0.30), inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .btn-primary::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
      opacity: 0; transition: opacity 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,0.38); }
    .btn-primary:hover::before { opacity: 1; }
    .btn-primary:active { transform: translateY(0); }

    .btn-success {
      position: relative; overflow: hidden;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      border: none; border-radius: 14px;
      padding: 14px 32px;
      color: white; font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 15px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 20px rgba(5,150,105,0.28), inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .btn-success:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(5,150,105,0.36); }
    .btn-success:active { transform: translateY(0); }

    .btn-ghost {
      background: #f8fafc; border: 1.5px solid #e8edf5;
      border-radius: 12px; padding: 9px 18px;
      color: #475569; font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 13px; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-ghost:hover { background: #f1f5f9; border-color: #c7d2fe; color: #4f46e5; transform: translateY(-1px); }

    /* ── Card ── */
    .card {
      background: #ffffff;
      border: 1.5px solid #eef2f8;
      border-radius: 24px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.02);
      transition: box-shadow 0.25s;
    }
    .card:hover { box-shadow: 0 6px 28px rgba(0,0,0,0.08); }

    /* ── Question card ── */
    .q-card {
      background: #ffffff;
      border: 2px solid #eef2f8;
      border-radius: 20px;
      padding: 22px 24px;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 1px 6px rgba(0,0,0,0.04);
    }
    .q-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); border-color: #c7d2fe; }
    .q-card.active {
      background: #fafbff;
      border-color: #4f46e5;
      box-shadow: 0 4px 24px rgba(79,70,229,0.14);
      transform: translateY(-1px);
    }

    /* ── Badge ── */
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 12px; border-radius: 50px;
      font-size: 12px; font-weight: 600; letter-spacing: 0.02em;
    }
    .badge-indigo { background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; }
    .badge-green  { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
    .badge-red    { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .badge-slate  { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }

    /* ── Tab ── */
    .tab-btn {
      padding: 9px 22px; border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 14px;
      cursor: pointer; transition: all 0.25s;
      border: 1.5px solid transparent;
    }
    .tab-btn.inactive {
      background: transparent; color: #64748b;
      border-color: #e2e8f0;
    }
    .tab-btn.inactive:hover { background: #f8fafc; color: #4f46e5; border-color: #c7d2fe; }
    .tab-btn.active {
      background: #0f172a; color: #ffffff;
      box-shadow: 0 4px 14px rgba(15,23,42,0.25);
    }

    /* ── Stat card ── */
    .stat-card {
      background: #fff; border: 1.5px solid #eef2f8;
      border-radius: 22px; padding: 28px 24px;
      text-align: center;
      transition: transform 0.25s, box-shadow 0.25s;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    }
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.10); }

    /* ── Label ── */
    .field-label {
      display: block; margin-bottom: 8px;
      color: #374151; font-size: 13px; font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* ── Option pill ── */
    .opt-pill {
      display: flex; gap: 8px; align-items: flex-start;
      background: #f8fafc; border: 1px solid #eef2f8;
      border-radius: 10px; padding: 9px 12px;
      font-size: 14px; color: #374151;
      transition: background 0.2s, border-color 0.2s;
    }
    .q-card.active .opt-pill { background: #f0f0ff; border-color: #ddd6fe; }

    /* ── Number badge ── */
    .num-badge {
      min-width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; flex-shrink: 0;
      transition: all 0.3s cubic-bezier(.22,1,.36,1);
    }
    .num-badge.inactive { background: #f1f5f9; border: 1.5px solid #e2e8f0; color: #64748b; }
    .num-badge.active {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white;
      animation: checkPop 0.35s cubic-bezier(.22,1,.36,1);
      box-shadow: 0 4px 12px rgba(79,70,229,0.35);
    }

    /* ── Progress bar ── */
    .progress-track {
      background: #f1f5f9; border-radius: 50px;
      height: 6px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 50px;
      background: linear-gradient(90deg, #4f46e5, #7c3aed);
      transition: width 0.4s cubic-bezier(.22,1,.36,1);
      box-shadow: 0 0 8px rgba(79,70,229,0.4);
    }

    /* ── Divider ── */
    .divider { height: 1px; background: #f1f5f9; margin: 20px 0; }

    /* ── Section title ── */
    .section-title {
      font-family: 'Instrument Serif', Georgia, serif;
      font-size: 28px; color: #0f172a;
      letter-spacing: -0.3px; line-height: 1.2;
    }

    /* ── Success box ── */
    .success-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border: 1.5px solid #a7f3d0;
      border-radius: 20px; padding: 32px;
      text-align: center;
    }
    .link-box {
      background: #f8fafc; border: 1.5px dashed #c7d2fe;
      border-radius: 12px; padding: 14px 20px;
      color: #4f46e5; font-size: 14px; font-weight: 600;
      word-break: break-all; margin-bottom: 20px;
      cursor: default;
    }

    /* ── PDF Paper ── */
    .preview-paper {
      width: 210mm; min-height: 297mm;
      background: white; padding: 14mm;
      box-sizing: border-box; overflow: hidden;
    }
    .preview-paper * { box-sizing: border-box; word-break: break-word; overflow-wrap: break-word; }
    .question-block { width: 100%; margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; }
    .question-title { font-weight: 700; text-align: justify; }
    .option-line { display: flex; gap: 4px; align-items: flex-start; }
    @media screen and (max-width: 900px) {
      .preview-paper { width: 100%; padding: 14px; }
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #c7d2fe; }

    /* ── Exam row ── */
    .exam-row {
      background: #fff; border: 1.5px solid #eef2f8;
      border-radius: 20px; padding: 22px 28px;
      display: flex; justify-content: space-between;
      align-items: center; flex-wrap: wrap; gap: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .exam-row:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.08); border-color: #c7d2fe; }

    /* Noise texture overlay */
    .noise-bg::after {
      content: '';
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E");
    }
  `}</style>
);

function Builder() {

  // ─── Anti-copy ───────────────────────────────────────────────────────────
  useEffect(() => {
    const noCtx  = (e) => e.preventDefault();
    const noKey  = (e) => {
      if (e.ctrlKey && ["c","u","s","a","p"].includes(e.key.toLowerCase())) e.preventDefault();
      if (e.key === "PrintScreen") { e.preventDefault(); navigator.clipboard.writeText(""); }
    };
    const noDrag = (e) => e.preventDefault();
    const noPrint= (e) => e.preventDefault();
    document.addEventListener("contextmenu", noCtx);
    document.addEventListener("keydown", noKey);
    document.addEventListener("dragstart", noDrag);
    window.addEventListener("beforeprint", noPrint);
    return () => {
      document.removeEventListener("contextmenu", noCtx);
      document.removeEventListener("keydown", noKey);
      document.removeEventListener("dragstart", noDrag);
      window.removeEventListener("beforeprint", noPrint);
    };
  }, []);

  // ─── States ──────────────────────────────────────────────────────────────
  const [questions,    setQuestions]    = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selected,     setSelected]     = useState([]);
  const [chapter,      setChapter]      = useState("");
  const [examCode,     setExamCode]     = useState("");
  const [boardYear,    setBoardYear]    = useState("");
  const [boardName,    setBoardName]    = useState("");
  const [pdfCompact,   setPdfCompact]   = useState(false);
  const [examData,     setExamData]     = useState({
    academy: "", title: "", duration: "60", subject: "ICT", marks: "25"
  });
  const [examList,    setExamList]    = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loadingExams,setLoadingExams]= useState(false);
  const [activeTab,   setActiveTab]   = useState("builder");
  const [creating,    setCreating]    = useState(false);

  const progress = Math.min(100, (selected.length / Math.max(1, Number(examData.marks))) * 100);

  // ─── Fetch Exams ─────────────────────────────────────────────────────────
  const fetchExamList = async () => {
    setLoadingExams(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API}/api/exams/list`),
        fetch(`${API}/api/exams/stats`)
      ]);
      setExamList((await r1.json()) || []);
      setStats(await r2.json());
    } catch { setExamList([]); }
    finally { setLoadingExams(false); }
  };

  useEffect(() => { if (activeTab === "exams") fetchExamList(); }, [activeTab]);

  const deleteExam = async (code) => {
    if (!window.confirm("এই exam এবং সব submissions delete হয়ে যাবে। নিশ্চিত?")) return;
    try {
      await fetch(`${API}/api/exams/${code}`, { method: "DELETE" });
      setExamList(p => p.filter(e => e.examCode !== code));
      fetchExamList();
    } catch { alert("Delete failed"); }
  };

  // ─── Fetch Questions ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!chapter) { setQuestions([]); setAllQuestions([]); setSelected([]); return; }
    const p = new URLSearchParams();
    p.append("subject", examData.subject);
    p.append("chapter", chapter);
    if (chapter === "Board Questions") {
      if (!boardYear || !boardName) { setQuestions([]); return; }
      p.append("questionType","board"); p.append("boardYear", boardYear); p.append("boardName", boardName);
    } else { p.append("questionType","normal"); }

    fetch(`${API}/api/questions?${p}`)
      .then(r => r.json())
      .then(data => {
        const q = data || [];
        setQuestions(q);
        if (chapter === "Board Questions") {
          setAllQuestions(q); setSelected(q.map(x => x._id));
          setExamData(prev => ({ ...prev, marks: String(q.length) }));
        } else {
          setAllQuestions(prev => {
            const merged = [...prev];
            q.forEach(x => { if (!merged.find(m => m._id === x._id)) merged.push(x); });
            return merged;
          });
        }
      }).catch(() => setQuestions([]));
  }, [chapter, boardYear, boardName, examData.subject]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => setExamData({ ...examData, [e.target.name]: e.target.value });

  const toggleSelect = (id) => {
    if (selected.includes(id)) { setSelected(p => p.filter(x => x !== id)); return; }
    if (selected.length >= Number(examData.marks)) {
      alert(`সর্বোচ্চ ${examData.marks} টি প্রশ্ন সিলেক্ট করা যাবে`); return;
    }
    setSelected(p => [...p, id]);
  };
  const selectAll   = () => { setSelected(questions.map(q => q._id)); if (chapter==="Board Questions") setExamData(p=>({...p,marks:String(questions.length)})); };
  const deselectAll = () => setSelected([]);

  const createExam = async () => {
    if (!examData.academy) return alert("একাডেমির নাম লিখুন");
    if (!examData.title)   return alert("পরীক্ষার নাম লিখুন");
    if (!chapter)          return alert("অধ্যায় নির্বাচন করুন");
    if (selected.length===0) return alert("প্রশ্ন সিলেক্ট করুন");
    setCreating(true);
    try {
      const res  = await fetch(`${API}/api/exams/create`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: examData.title, duration: examData.duration, questions: selected })
      });
      const data = await res.json();
      setExamCode(data.examCode);
    } catch { alert("Create Failed"); }
    finally { setCreating(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/exam/${examCode}`);
    alert("Link Copied!");
  };

  const downloadPDF = async () => {
    setPdfCompact(selected.length > 20);
    await new Promise(r => setTimeout(r, 300));
    await html2pdf().set({
      margin: 0,
      filename: `${examData.title || "question-paper"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all","css","legacy"] }
    }).from(document.getElementById("question-paper")).save();
    setPdfCompact(false);
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="noise-bg" style={{ minHeight: "100vh", background: "#f7f8fc", fontFamily: "'DM Sans', sans-serif" }}>
      <GlobalStyles />

      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header className="topbar">
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <div className="anim-slide" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(79,70,229,0.30), inset 0 1px 0 rgba(255,255,255,0.2)",
              fontSize: 20
            }}>📝</div>
            <div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1 }}>প্রশ্নব্যাংক</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 2 }}>Question Bank Builder</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, background: "#f1f5f9", padding: "5px 6px", borderRadius: 50 }}>
            {[["builder","📝  Builder"],["exams","📋  Exam List"]].map(([id, label]) => (
              <button key={id} className={`tab-btn ${activeTab===id?"active":"inactive"}`} onClick={() => setActiveTab(id)}>
                {label}
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          EXAM LIST TAB
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "exams" && (
        <div className="anim-fadeUp" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 28px" }}>

          {/* Stats row */}
          {stats && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 40 }}>
              {[
                { label: "মোট Exam",       value: stats.examCount,       icon: "📝", accent: "#4f46e5" },
                { label: "মোট Submission", value: stats.submissionCount, icon: "✅", accent: "#059669" },
                { label: "মোট Question",   value: stats.questionCount,   icon: "❓", accent: "#dc2626" }
              ].map((s, i) => (
                <div key={i} className={`stat-card anim-scaleIn delay-${i+1}`}>
                  <div style={{ fontSize: 34, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 38, fontWeight: 800, color: s.accent, fontFamily: "'Instrument Serif', Georgia, serif", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ color: "#64748b", fontSize: 13, fontWeight: 600, marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h2 className="section-title">সব Exam তালিকা</h2>
            <button className="btn-ghost" onClick={fetchExamList}>🔄 &nbsp;Refresh</button>
          </div>

          {loadingExams && (
            <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
              <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse-ring 1.5s infinite" }}>⏳</div>
              <div style={{ fontSize: 15 }}>Loading exams…</div>
            </div>
          )}
          {!loadingExams && examList.length === 0 && (
            <div style={{ textAlign: "center", padding: 80, color: "#cbd5e1", fontSize: 16 }}>কোনো Exam পাওয়া যায়নি</div>
          )}

          <div style={{ display: "grid", gap: 14 }}>
            {examList.map((exam, idx) => (
              <div key={exam._id} className={`exam-row anim-fadeUp delay-${Math.min(idx+1,5)}`}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: "#0f172a", margin: "0 0 10px" }}>{exam.title}</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <span className="badge badge-indigo">🔑 {exam.examCode}</span>
                    <span className="badge badge-green">❓ {exam.questions?.length||0} প্রশ্ন</span>
                    <span className="badge badge-red">✅ {exam.submissionCount||0} Submission</span>
                    <span className="badge badge-slate">⏱️ {exam.duration} মিনিট</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="btn-ghost badge-indigo"
                    style={{ background:"#eef2ff", borderColor:"#c7d2fe", color:"#4f46e5" }}
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/exam/${exam.examCode}`); alert("Link Copied!"); }}>
                    📋 Link
                  </button>
                  <a href={`/ranking/${exam.examCode}`} target="_blank" rel="noreferrer"
                    style={{ background:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:12, padding:"9px 16px", color:"#dc2626", fontWeight:600, fontSize:13, textDecoration:"none", transition:"all 0.2s" }}>
                    🏆 Ranking
                  </a>
                  <button onClick={() => deleteExam(exam.examCode)}
                    style={{ background:"#fff1f2", border:"1.5px solid #fda4af", borderRadius:12, padding:"9px 16px", color:"#e11d48", fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.2s" }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          BUILDER TAB
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "builder" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 28px" }}>

          {/* ── Form Card ─────────────────────────────────────────────── */}
          <div className="card anim-fadeUp" style={{ padding: "40px 44px", marginBottom: 32 }}>

            {/* Card header */}
            <div style={{ marginBottom: 36 }}>
              <div className="section-title" style={{ marginBottom: 6 }}>পরীক্ষার তথ্য পূরণ করুন</div>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>সঠিক তথ্য দিয়ে আপনার পরীক্ষা তৈরি করুন</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>

              <div className="anim-fadeUp delay-1">
                <label className="field-label">🏫 একাডেমি / কলেজের নাম</label>
                <input className="p-input" type="text" name="academy" placeholder="যেমন: Saif Academy"
                  value={examData.academy} onChange={handleChange} />
              </div>

              <div className="anim-fadeUp delay-2">
                <label className="field-label">📋 পরীক্ষার নাম</label>
                <input className="p-input" type="text" name="title" placeholder="যেমন: Model Test 2024"
                  value={examData.title} onChange={handleChange} />
              </div>

              <div className="anim-fadeUp delay-3">
                <label className="field-label">📚 বিষয়</label>
                <input className="p-input" type="text" name="subject"
                  value={examData.subject} onChange={handleChange} />
              </div>

              <div className="anim-fadeUp delay-4">
                <label className="field-label">📖 অধ্যায়</label>
                <select className="p-input" value={chapter}
                  onChange={(e) => { setChapter(e.target.value); setSelected([]); setAllQuestions([]); setBoardYear(""); setBoardName(""); }}>
                  <option value="">অধ্যায় নির্বাচন করুন</option>
                  <option value="Introduction to ICT">Chapter 1 — ICT Introduction</option>
                  <option value="Communication Systems">Chapter 2 — Communication Systems</option>
                  <option value="Numbers & Digital Devices">Chapter 3 — Number System</option>
                  <option value="Web & HTML">Chapter 4 — Web & HTML</option>
                  <option value="Programming & Language">Chapter 5 — Programming</option>
                  <option value="Board Questions">🏆 Board Questions</option>
                </select>

                {chapter === "Board Questions" && (
                  <div style={{ marginTop: 16 }} className="anim-fadeUp">
                    <label className="field-label">📅 Board Year</label>
                    <select className="p-input" value={boardYear}
                      onChange={(e) => { setBoardYear(e.target.value); setSelected([]); setAllQuestions([]); setBoardName(""); }}>
                      <option value="">Select Year</option>
                      {["2025","2024","2023","2022","2019"].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}

                {chapter === "Board Questions" && boardYear && (
                  <div style={{ marginTop: 16 }} className="anim-fadeUp">
                    <label className="field-label">🏛️ Board Name</label>
                    <select className="p-input" value={boardName}
                      onChange={(e) => { setSelected([]); setAllQuestions([]); setBoardName(e.target.value); }}>
                      <option value="">Select Board</option>
                      {["Dhaka","Chittagong","Rajshahi","Cumilla","Jessore","Dinajpur","Sylhet"].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="anim-fadeUp delay-5">
                <label className="field-label">🎯 প্রশ্ন সংখ্যা</label>
                <input className="p-input" type="number" name="marks" value={examData.marks} onChange={handleChange} />
              </div>

              <div className="anim-fadeUp delay-5">
                <label className="field-label">⏱️ সময় (মিনিট)</label>
                <input className="p-input" type="number" name="duration" value={examData.duration} onChange={handleChange} />
              </div>

            </div>
          </div>

          {/* ── Question header ────────────────────────────────────────── */}
          {questions.length > 0 && (
            <div className="card anim-scaleIn" style={{ padding: "20px 28px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>

                <div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: "#0f172a" }}>প্রশ্ন সিলেক্ট করুন</div>
                  <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>মোট {questions.length}টি প্রশ্ন পাওয়া গেছে</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 50,
                    padding: "8px 22px", color: "white", fontWeight: 700, fontSize: 16,
                    boxShadow: "0 4px 14px rgba(79,70,229,0.3)"
                  }}>
                    {selected.length} / {examData.marks}
                  </div>
                  <button className="btn-ghost" onClick={selectAll}>সব Select</button>
                  <button className="btn-ghost" style={{ color: "#dc2626", borderColor: "#fecaca" }} onClick={deselectAll}>Deselect</button>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, textAlign: "right" }}>{Math.round(progress)}% সম্পন্ন</div>
              </div>
            </div>
          )}

          {/* ── Question list ─────────────────────────────────────────── */}
          <div style={{ display: "grid", gap: 14 }}>
            {questions.map((q, index) => {
              const active = selected.includes(q._id);
              const labels = ["ক","খ","গ","ঘ"];
              return (
                <div key={q._id} className={`q-card${active?" active":""} anim-fadeUp`}
                  style={{ animationDelay: `${Math.min(index*0.04,0.4)}s` }}
                  onClick={() => toggleSelect(q._id)}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

                    <div className={`num-badge ${active?"active":"inactive"}`}>
                      {active ? "✓" : index + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h2 style={{ color: "#0f172a", fontSize: 16, fontWeight: 700, lineHeight: 1.6, marginBottom: 14 }}>
                        {q.question}
                      </h2>

                      {q.image && (
                        <img src={q.image} alt="q" style={{ maxWidth: 280, borderRadius: 12, border: "1.5px solid #e2e8f0", marginBottom: 14 }} />
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
                        {q.options?.map((opt, idx) => (
                          <div key={idx} className="opt-pill">
                            <span style={{ color: "#4f46e5", fontWeight: 700, flexShrink: 0 }}>{labels[idx]}.</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Action buttons ────────────────────────────────────────── */}
          {questions.length > 0 && (
            <div className="anim-fadeUp" style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 44, flexWrap: "wrap" }}>
              <button className="btn-success" onClick={createExam} disabled={creating}>
                {creating ? "⏳ তৈরি হচ্ছে…" : "🚀 অনলাইনে পরীক্ষা নিন"}
              </button>
              <button className="btn-primary" onClick={downloadPDF}>
                📄 PDF Download
              </button>
            </div>
          )}

          {/* ── Success box ───────────────────────────────────────────── */}
          {examCode && (
            <div className="success-box anim-scaleIn" style={{ marginTop: 44 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: "#0f172a", marginBottom: 6 }}>
                Exam সফলভাবে তৈরি হয়েছে!
              </div>
              <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>নিচের লিংকটি স্টুডেন্টদের দিন</p>

              <div className="link-box">{window.location.origin}/exam/{examCode}</div>

              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={copyLink}>📋 Link Copy</button>
                <a href={`/ranking/${examCode}`} target="_blank" rel="noreferrer"
                  style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899)", border:"none", borderRadius:14, padding:"14px 32px", color:"white", fontWeight:700, fontSize:15, textDecoration:"none", boxShadow:"0 4px 20px rgba(244,63,94,0.28)", transition:"all 0.2s", display:"inline-block" }}>
                  🏆 View Ranking
                </a>
              </div>
            </div>
          )}

          {/* ── Printable Paper ───────────────────────────────────────── */}
          <div id="question-paper" className="bg-white mt-10 shadow-xl mx-auto preview-paper ">
            <style>{`
              .preview-paper { width: 210mm; min-height: 297mm; background: white; padding: 14mm; box-sizing: border-box; overflow: hidden; }
              .preview-paper * { box-sizing: border-box; word-break: break-word; overflow-wrap: break-word; }
              .question-block { width: 100%; margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; }
              .question-title { font-weight: 700; text-align: justify; }
              .option-line { display: flex; gap: 4px; align-items: flex-start; }
              @media screen and (max-width: 900px) { .preview-paper { width: 100%; padding: 14px; } }
            `}</style>

            <div className="text-center border-b pb-3 mb-4">
              <div className="inline-block bg-black px-5 py-1 mb-2">
                <h1 className={`text-white font-bold ${pdfCompact?"text-base":"text-2xl"}`}>{examData.subject}</h1>
              </div>
              <h2 className={`font-bold ${pdfCompact?"text-sm":"text-xl"}`}>{examData.academy}</h2>
              <p className={`text-gray-700 mt-1 ${pdfCompact?"text-[10px]":"text-sm"}`}>{examData.title}</p>
              <div className={`flex justify-between mt-3 border-t pt-2 ${pdfCompact?"text-[9px]":"text-sm"}`}>
                <p>সময়: {examData.duration} মিনিট</p>
                <p>পূর্ণমান: {examData.marks}</p>
              </div>
            </div>

            <div style={{ columnCount: 2, columnGap: pdfCompact ? "14px" : "28px" }}>
              {allQuestions.filter(q => selected.includes(q._id)).map((q, i) => (
                <div key={q._id} className="question-block">
                  <h2 className="question-title" style={{ fontSize: pdfCompact?"9px":"12px", lineHeight: pdfCompact?"14px":"18px", marginBottom: 4 }}>
                    {i+1}. {q.question}
                  </h2>
                  {q.image && <img src={q.image} alt="q" style={{ maxWidth:"100%", marginBottom: 4 }} />}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: pdfCompact?"2px 8px":"4px 14px", fontSize: pdfCompact?"8px":"10px", lineHeight: pdfCompact?"12px":"15px" }}>
                    {q.options?.map((opt, idx) => (
                      <div key={idx} className="option-line">
                        <span style={{ fontWeight:"bold" }}>{"ককখগঘ".split("")[idx+1]}.</span>
                        <span>{opt}</span>
                      </div>
                    ))}
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