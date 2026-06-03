import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

const API = import.meta.env.VITE_API_URL;

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400;1,9..144,600&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');

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

    :root {
      --bg:        #fafaf8;
      --bg-2:      #f4f3ef;
      --bg-3:      #eceae3;
      --ink:       #1a1916;
      --ink-2:     #3d3b35;
      --ink-3:     #6b6860;
      --ink-4:     #9e9b94;
      --line:      rgba(26,25,22,0.08);
      --line-2:    rgba(26,25,22,0.14);
      --accent:    #2563eb;
      --accent-2:  #1d4ed8;
      --accent-bg: #eff6ff;
      --accent-line: rgba(37,99,235,0.2);
      --green:     #059669;
      --green-bg:  #ecfdf5;
      --red:       #dc2626;
      --red-bg:    #fef2f2;
      --amber:     #d97706;
      --amber-bg:  #fffbeb;
      --r-sm:      6px;
      --r-md:      12px;
      --r-lg:      18px;
      --r-xl:      24px;
      --sh-xs:     0 1px 3px rgba(0,0,0,0.06);
      --sh-sm:     0 2px 8px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04);
      --sh-md:     0 4px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
      --sh-lg:     0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05);
      --sh-xl:     0 24px 64px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06);
    }

    html { scroll-behavior: smooth; }
    body { font-family: 'Geist', sans-serif; background: var(--bg); color: var(--ink); margin: 0; }

    /* ── Animations ── */
    @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes scaleIn  { from { opacity:0; transform:scale(0.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
    @keyframes slideIn  { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
    @keyframes pop      { 0%{transform:scale(0.8);} 60%{transform:scale(1.1);} 100%{transform:scale(1);} }
    @keyframes shimmer  { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
    @keyframes spin     { to { transform: rotate(360deg); } }

    .au  { animation: fadeUp   0.5s cubic-bezier(.22,1,.36,1) both; }
    .asi { animation: scaleIn  0.45s cubic-bezier(.22,1,.36,1) both; }
    .afi { animation: fadeIn   0.4s ease both; }
    .asl { animation: slideIn  0.4s cubic-bezier(.22,1,.36,1) both; }
    .d1  { animation-delay: 0.05s; } .d2 { animation-delay: 0.10s; }
    .d3  { animation-delay: 0.15s; } .d4 { animation-delay: 0.20s; }
    .d5  { animation-delay: 0.25s; } .d6 { animation-delay: 0.30s; }

    /* ── Topbar ── */
    .topbar {
      position: sticky; top: 0; z-index: 300;
      background: rgba(250,250,248,0.92);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border-bottom: 1px solid var(--line);
    }

    /* ── Input ── */
    .p-input {
      width: 100%;
      background: #fff;
      border: 1.5px solid var(--line-2);
      border-radius: var(--r-md);
      padding: 11px 14px;
      color: var(--ink);
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 400;
      outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
      box-shadow: var(--sh-xs);
    }
    .p-input::placeholder { color: var(--ink-4); }
    .p-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(37,99,235,0.10), var(--sh-xs);
    }
    .p-input:hover:not(:focus) { border-color: rgba(26,25,22,0.22); }
    select.p-input {
      cursor: pointer; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239e9b94' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 36px;
    }

    /* ── Buttons ── */
    .btn {
      display: inline-flex; align-items: center; gap: 7px;
      border: none; border-radius: var(--r-md);
      padding: 10px 20px;
      font-family: 'Geist', sans-serif;
      font-weight: 600; font-size: 13.5px;
      cursor: pointer; letter-spacing: -0.01em;
      transition: all 0.18s; white-space: nowrap;
    }
    .btn:active { transform: scale(0.98); }

    .btn-primary {
      background: var(--ink); color: #fff;
      box-shadow: 0 2px 8px rgba(26,25,22,0.20), inset 0 1px 0 rgba(255,255,255,0.08);
    }
    .btn-primary:hover { background: #2a2825; box-shadow: 0 4px 16px rgba(26,25,22,0.28); transform: translateY(-1px); }

    .btn-accent {
      background: var(--accent); color: #fff;
      box-shadow: 0 2px 10px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.12);
    }
    .btn-accent:hover { background: var(--accent-2); box-shadow: 0 4px 18px rgba(37,99,235,0.36); transform: translateY(-1px); }

    .btn-green {
      background: var(--green); color: #fff;
      box-shadow: 0 2px 10px rgba(5,150,105,0.28), inset 0 1px 0 rgba(255,255,255,0.12);
    }
    .btn-green:hover { background: #047857; box-shadow: 0 4px 18px rgba(5,150,105,0.36); transform: translateY(-1px); }

    .btn-ghost {
      background: #fff; color: var(--ink-2);
      border: 1.5px solid var(--line-2);
      box-shadow: var(--sh-xs);
    }
    .btn-ghost:hover { background: var(--bg-2); border-color: var(--ink-4); transform: translateY(-1px); }

    .btn-danger {
      background: var(--red-bg); color: var(--red);
      border: 1.5px solid rgba(220,38,38,0.2);
    }
    .btn-danger:hover { background: #fee2e2; border-color: rgba(220,38,38,0.35); transform: translateY(-1px); }

    .btn-sm { padding: 7px 14px; font-size: 12.5px; border-radius: 9px; }
    .btn-lg { padding: 13px 28px; font-size: 15px; border-radius: 14px; }

    /* ── Card ── */
    .card {
      background: #fff;
      border: 1.5px solid var(--line);
      border-radius: var(--r-xl);
      box-shadow: var(--sh-sm);
    }

    /* ── Divider ── */
    .divider { height: 1px; background: var(--line); margin: 0; }

    /* ── Badge ── */
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 20px;
      font-size: 11.5px; font-weight: 600;
      font-family: 'Geist', sans-serif; letter-spacing: -0.01em;
    }
    .badge-blue   { background: var(--accent-bg); color: var(--accent); border: 1px solid var(--accent-line); }
    .badge-green  { background: var(--green-bg); color: var(--green); border: 1px solid rgba(5,150,105,0.2); }
    .badge-red    { background: var(--red-bg); color: var(--red); border: 1px solid rgba(220,38,38,0.15); }
    .badge-amber  { background: var(--amber-bg); color: var(--amber); border: 1px solid rgba(217,119,6,0.2); }
    .badge-slate  { background: var(--bg-2); color: var(--ink-3); border: 1px solid var(--line-2); }

    /* ── Tab ── */
    .tab-btn {
      padding: 7px 18px; border-radius: 30px;
      font-family: 'Geist', sans-serif;
      font-weight: 600; font-size: 13px; letter-spacing: -0.01em;
      cursor: pointer; transition: all 0.2s; border: none;
    }
    .tab-btn.inactive { background: transparent; color: var(--ink-3); }
    .tab-btn.inactive:hover { color: var(--ink); background: var(--bg-3); }
    .tab-btn.active { background: var(--ink); color: #fff; box-shadow: var(--sh-sm); }

    /* ── Stat card ── */
    .stat-card {
      background: #fff; border: 1.5px solid var(--line);
      border-radius: var(--r-lg); padding: 28px 24px;
      text-align: center; box-shadow: var(--sh-sm);
      transition: transform 0.22s, box-shadow 0.22s;
    }
    .stat-card:hover { transform: translateY(-4px); box-shadow: var(--sh-lg); }

    /* ── Q card ── */
    .q-card {
      background: #fff; border: 1.5px solid var(--line);
      border-radius: var(--r-lg); padding: 20px 22px;
      cursor: pointer;
      transition: border-color 0.18s, background 0.18s, transform 0.2s, box-shadow 0.2s;
      box-shadow: var(--sh-xs);
      position: relative;
    }
    .q-card::before {
      content: ''; position: absolute; left: 0; top: 16px; bottom: 16px;
      width: 3px; border-radius: 0 3px 3px 0;
      background: var(--accent);
      transform: scaleY(0); transform-origin: center;
      transition: transform 0.22s cubic-bezier(.22,1,.36,1);
    }
    .q-card:hover { border-color: var(--line-2); transform: translateY(-2px); box-shadow: var(--sh-md); }
    .q-card.active {
      background: var(--accent-bg); border-color: rgba(37,99,235,0.3);
      box-shadow: 0 4px 20px rgba(37,99,235,0.08), var(--sh-xs);
    }
    .q-card.active::before { transform: scaleY(1); }

    /* ── Num badge ── */
    .num-badge {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 13px; flex-shrink: 0;
      transition: all 0.25s cubic-bezier(.22,1,.36,1);
    }
    .num-badge.inactive { background: var(--bg-2); border: 1.5px solid var(--line-2); color: var(--ink-3); }
    .num-badge.active {
      background: var(--accent); color: #fff;
      animation: pop 0.3s cubic-bezier(.22,1,.36,1);
      box-shadow: 0 3px 10px rgba(37,99,235,0.3);
    }

    /* ── Opt pill ── */
    .opt-pill {
      display: flex; gap: 7px; align-items: flex-start;
      background: var(--bg-2); border: 1px solid var(--line);
      border-radius: 9px; padding: 8px 11px;
      font-size: 13.5px; color: var(--ink-2);
      transition: background 0.18s, border-color 0.18s;
    }
    .q-card.active .opt-pill { background: #dbeafe; border-color: rgba(37,99,235,0.15); }

    /* ── Progress ── */
    .progress-track { background: var(--bg-3); border-radius: 99px; height: 5px; overflow: hidden; }
    .progress-fill {
      height: 100%; border-radius: 99px;
      background: var(--accent);
      transition: width 0.4s cubic-bezier(.22,1,.36,1);
    }

    /* ── Success box ── */
    .success-box {
      background: #fff; border: 1.5px solid var(--line);
      border-radius: var(--r-xl); padding: 44px 40px;
      text-align: center; box-shadow: var(--sh-md);
    }

    /* ── Exam row ── */
    .exam-row {
      background: #fff; border: 1.5px solid var(--line);
      border-radius: var(--r-lg); padding: 20px 26px;
      display: flex; justify-content: space-between;
      align-items: center; flex-wrap: wrap; gap: 16px;
      box-shadow: var(--sh-xs);
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.18s;
    }
    .exam-row:hover { transform: translateY(-2px); box-shadow: var(--sh-md); border-color: var(--line-2); }

    /* ── Field label ── */
    .field-label {
      display: block; margin-bottom: 7px;
      color: var(--ink-2); font-size: 12.5px; font-weight: 600;
      letter-spacing: 0.01em; font-family: 'Geist', sans-serif;
    }

    /* ── Section title ── */
    .sec-title {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 30px; font-weight: 600; color: var(--ink);
      letter-spacing: -0.5px; line-height: 1.15;
    }
    .sec-sub {
      font-size: 14px; color: var(--ink-4); margin-top: 4px; font-weight: 400;
    }

    /* ── Link box ── */
    .link-box {
      background: var(--bg-2); border: 1.5px solid var(--line-2);
      border-radius: var(--r-md); padding: 13px 18px;
      color: var(--accent); font-family: 'Geist Mono', monospace;
      font-size: 13px; word-break: break-all; margin-bottom: 20px;
    }

    /* ── Counter ── */
    .counter {
      background: var(--ink); color: #fff;
      border-radius: var(--r-sm);
      padding: 6px 16px;
      font-family: 'Geist Mono', monospace;
      font-size: 15px; font-weight: 500; letter-spacing: 0.02em;
    }

    /* ── Separator ── */
    .sep {
      display: flex; align-items: center; gap: 12px;
      font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
      text-transform: uppercase; color: var(--ink-4);
    }
    .sep::before, .sep::after {
      content: ''; flex: 1; height: 1px; background: var(--line);
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--line-2); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--ink-4); }

    /* ── PDF ── */
    .preview-paper {
      width: 210mm; min-height: 297mm;
      background: white; padding: 14mm;
      box-sizing: border-box; overflow: hidden;
      position: fixed; left: -9999px; top: -9999px;
      z-index: -1; visibility: hidden;
    }
    .preview-paper * { box-sizing: border-box; word-break: break-word; overflow-wrap: break-word; }
    .question-block { width: 100%; margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; }
    .question-title { font-weight: 700; text-align: justify; }
    .option-line { display: flex; gap: 4px; align-items: flex-start; }
  `}</style>
);

function Builder() {

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

  const [questions,    setQuestions]    = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selected,     setSelected]     = useState([]);
  const [chapter,      setChapter]      = useState("");
  const [examCode,     setExamCode]     = useState("");
  const [boardYear,    setBoardYear]    = useState("");
  const [boardName,    setBoardName]    = useState("");
  const [pdfCompact,   setPdfCompact]   = useState(false);
  const [examData,     setExamData]     = useState({ academy:"", title:"", duration:"60", subject:"ICT", marks:"25" });
  const [examList,     setExamList]     = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loadingExams, setLoadingExams] = useState(false);
  const [activeTab,    setActiveTab]    = useState("builder");
  const [creating,     setCreating]     = useState(false);

  const progress = Math.min(100, (selected.length / Math.max(1, Number(examData.marks))) * 100);

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

  const handleChange  = (e) => setExamData({ ...examData, [e.target.name]: e.target.value });
  const toggleSelect  = (id) => {
    if (selected.includes(id)) { setSelected(p => p.filter(x => x !== id)); return; }
    if (selected.length >= Number(examData.marks)) { alert(`সর্বোচ্চ ${examData.marks}টি প্রশ্ন বেছে নিন`); return; }
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
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ title:examData.title, duration:examData.duration, questions:selected })
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
    const el = document.getElementById("question-paper");
    el.style.visibility = "visible";
    await html2pdf().set({
      margin: 0, filename: `${examData.title || "question-paper"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all","css","legacy"] }
    }).from(el).save();
    el.style.visibility = "hidden";
    setPdfCompact(false);
  };

  const labels = ["ক","খ","গ","ঘ"];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", fontFamily:"'Geist', sans-serif" }}>
      <GlobalStyles />

      {/* ── Topbar ── */}
      <header className="topbar">
        <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 28px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          <div className="asl" style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:38, height:38, borderRadius:10,
              background:"var(--ink)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:17, flexShrink:0,
              boxShadow:"0 2px 8px rgba(26,25,22,0.25)"
            }}>📝</div>
            <div>
              <div style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:18, fontWeight:600, color:"var(--ink)", letterSpacing:"-0.3px", lineHeight:1 }}>প্রশ্নব্যাংক</div>
              <div style={{ fontSize:10, color:"var(--ink-4)", fontWeight:500, letterSpacing:"0.07em", textTransform:"uppercase", marginTop:2 }}>Question Bank Builder</div>
            </div>
          </div>

          <div style={{ display:"flex", gap:3, background:"var(--bg-2)", padding:"4px 5px", borderRadius:40, border:"1px solid var(--line)" }}>
            {[["builder","Builder"],["exams","Exam List"]].map(([id, label]) => (
              <button key={id} className={`tab-btn ${activeTab===id?"active":"inactive"}`} onClick={() => setActiveTab(id)}>
                {label}
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* ══ EXAM LIST TAB ══ */}
      {activeTab === "exams" && (
        <div className="au" style={{ maxWidth:1080, margin:"0 auto", padding:"44px 28px" }}>

          <div style={{ marginBottom:40 }}>
            <div className="sec-title">Exam তালিকা</div>
            <div className="sec-sub">তৈরি করা সব পরীক্ষার সংক্ষিপ্ত বিবরণ</div>
          </div>

          {stats && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:14, marginBottom:44 }}>
              {[
                { label:"মোট Exam",       value:stats.examCount,       icon:"📝", color:"var(--accent)"  },
                { label:"মোট Submission", value:stats.submissionCount, icon:"✅", color:"var(--green)"   },
                { label:"মোট Question",   value:stats.questionCount,   icon:"❓", color:"var(--amber)"   }
              ].map((s,i) => (
                <div key={i} className={`stat-card au d${i+1}`}>
                  <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
                  <div style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:42, fontWeight:600, color:s.color, lineHeight:1, letterSpacing:"-1px" }}>{s.value}</div>
                  <div style={{ fontSize:12, color:"var(--ink-3)", fontWeight:600, marginTop:6, letterSpacing:"0.02em" }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
            <div style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:18, fontWeight:500, color:"var(--ink)" }}>
              {examList.length}টি পরীক্ষা
            </div>
            <button className="btn btn-ghost btn-sm" onClick={fetchExamList}>↺ &nbsp;Refresh</button>
          </div>

          {loadingExams && (
            <div style={{ textAlign:"center", padding:80, color:"var(--ink-4)" }}>
              <div style={{ fontSize:26, marginBottom:10 }}>⏳</div>
              <div style={{ fontSize:14 }}>লোড হচ্ছে…</div>
            </div>
          )}
          {!loadingExams && examList.length === 0 && (
            <div style={{ textAlign:"center", padding:80 }}>
              <div style={{ fontSize:36, marginBottom:12, opacity:0.25 }}>📋</div>
              <div style={{ color:"var(--ink-4)", fontSize:15 }}>কোনো Exam পাওয়া যায়নি</div>
            </div>
          )}

          <div style={{ display:"grid", gap:12 }}>
            {examList.map((exam, idx) => (
              <div key={exam._id} className={`exam-row au d${Math.min(idx+1,5)}`}>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:19, fontWeight:500, color:"var(--ink)", margin:"0 0 10px" }}>
                    {exam.title}
                  </h3>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    <span className="badge badge-blue">🔑 {exam.examCode}</span>
                    <span className="badge badge-green">❓ {exam.questions?.length||0} প্রশ্ন</span>
                    <span className="badge badge-red">✓ {exam.submissionCount||0} Submission</span>
                    <span className="badge badge-slate">⏱ {exam.duration} মিনিট</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <button className="btn btn-ghost btn-sm"
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/exam/${exam.examCode}`); alert("Copied!"); }}>
                    ⎘ &nbsp;Link
                  </button>
                  <a href={`/ranking/${exam.examCode}`} target="_blank" rel="noreferrer"
                    style={{ display:"inline-flex", alignItems:"center", gap:5, background:"var(--accent-bg)", border:"1.5px solid var(--accent-line)", borderRadius:9, padding:"7px 14px", color:"var(--accent)", fontWeight:600, fontSize:12.5, textDecoration:"none", transition:"all 0.18s" }}>
                    ◈ &nbsp;Ranking
                  </a>
                  <button onClick={() => deleteExam(exam.examCode)} className="btn btn-danger btn-sm">
                    ✕ &nbsp;Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ BUILDER TAB ══ */}
      {activeTab === "builder" && (
        <div style={{ maxWidth:1080, margin:"0 auto", padding:"44px 28px" }}>

          <div className="au" style={{ marginBottom:32 }}>
            <div className="sec-title">নতুন পরীক্ষা তৈরি করুন</div>
            <div className="sec-sub">তথ্য পূরণ করে প্রশ্ন বেছে নিন, তারপর প্রকাশ করুন</div>
          </div>

          {/* ── Form Card ── */}
          <div className="card au d1" style={{ padding:"36px 40px", marginBottom:28 }}>

            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28, paddingBottom:20, borderBottom:"1px solid var(--line)" }}>
              <div style={{ width:36, height:36, borderRadius:9, background:"var(--bg-2)", border:"1.5px solid var(--line-2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📋</div>
              <div>
                <div style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:18, fontWeight:500, color:"var(--ink)" }}>পরীক্ষার তথ্য</div>
                <div style={{ fontSize:12.5, color:"var(--ink-4)", marginTop:1 }}>সঠিক তথ্য দিয়ে পূরণ করুন</div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

              <div className="au d1">
                <label className="field-label">একাডেমি / কলেজ</label>
                <input className="p-input" type="text" name="academy" placeholder="যেমন: Saif Academy"
                  value={examData.academy} onChange={handleChange} />
              </div>

              <div className="au d2">
                <label className="field-label">পরীক্ষার নাম</label>
                <input className="p-input" type="text" name="title" placeholder="যেমন: Model Test 2024"
                  value={examData.title} onChange={handleChange} />
              </div>

              <div className="au d3">
                <label className="field-label">বিষয়</label>
                <input className="p-input" type="text" name="subject" value={examData.subject} onChange={handleChange} />
              </div>

              <div className="au d4">
                <label className="field-label">অধ্যায় নির্বাচন</label>
                <select className="p-input" value={chapter}
                  onChange={e => { setChapter(e.target.value); setSelected([]); setAllQuestions([]); setBoardYear(""); setBoardName(""); }}>
                  <option value="">— অধ্যায় বেছে নিন —</option>
                  <option value="Introduction to ICT">Chapter 1 — ICT Introduction</option>
                  <option value="Communication Systems">Chapter 2 — Communication Systems</option>
                  <option value="Numbers & Digital Devices">Chapter 3 — Number System</option>
                  <option value="Web & HTML">Chapter 4 — Web & HTML</option>
                  <option value="Programming & Language">Chapter 5 — Programming</option>
                  <option value="Board Questions">Board Questions</option>
                </select>

                {chapter === "Board Questions" && (
                  <div style={{ marginTop:14 }} className="au">
                    <label className="field-label">Board Year</label>
                    <select className="p-input" value={boardYear}
                      onChange={e => { setBoardYear(e.target.value); setSelected([]); setAllQuestions([]); setBoardName(""); }}>
                      <option value="">— বছর বেছে নিন —</option>
                      {["2025","2024","2023","2022","2019"].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}
                {chapter === "Board Questions" && boardYear && (
                  <div style={{ marginTop:14 }} className="au">
                    <label className="field-label">Board Name</label>
                    <select className="p-input" value={boardName}
                      onChange={e => { setSelected([]); setAllQuestions([]); setBoardName(e.target.value); }}>
                      <option value="">— বোর্ড বেছে নিন —</option>
                      {["Dhaka","Chittagong","Rajshahi","Cumilla","Jessore","Dinajpur","Sylhet"].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="au d5">
                <label className="field-label">প্রশ্ন সংখ্যা</label>
                <input className="p-input" type="number" name="marks" value={examData.marks} onChange={handleChange} />
              </div>

              <div className="au d6">
                <label className="field-label">সময় (মিনিট)</label>
                <input className="p-input" type="number" name="duration" value={examData.duration} onChange={handleChange} />
              </div>

            </div>
          </div>

          {/* ── Question header ── */}
          {questions.length > 0 && (
            <div className="card asi" style={{ padding:"18px 24px", marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14, marginBottom:14 }}>
                <div>
                  <div style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:17, fontWeight:500, color:"var(--ink)" }}>প্রশ্ন নির্বাচন করুন</div>
                  <div style={{ fontSize:12.5, color:"var(--ink-4)", marginTop:2 }}>মোট {questions.length}টি প্রশ্ন পাওয়া গেছে</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div className="counter">{selected.length}&thinsp;/&thinsp;{examData.marks}</div>
                  <button className="btn btn-ghost btn-sm" onClick={selectAll}>সব Select</button>
                  <button className="btn btn-sm" style={{ background:"var(--red-bg)", color:"var(--red)", border:"1.5px solid rgba(220,38,38,0.18)" }} onClick={deselectAll}>Deselect</button>
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width:`${progress}%` }} />
              </div>
              <div style={{ fontSize:11, color:"var(--ink-4)", marginTop:5, textAlign:"right", fontFamily:"'Geist Mono', monospace" }}>
                {Math.round(progress)}%
              </div>
            </div>
          )}

          {/* ── Question list ── */}
          <div style={{ display:"grid", gap:10 }}>
            {questions.map((q, index) => {
              const active = selected.includes(q._id);
              return (
                <div key={q._id} className={`q-card${active?" active":""} au`}
                  style={{ animationDelay:`${Math.min(index*0.03,0.4)}s` }}
                  onClick={() => toggleSelect(q._id)}>
                  <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>

                    <div className={`num-badge ${active?"active":"inactive"}`}>
                      {active ? "✓" : index + 1}
                    </div>

                    <div style={{ flex:1 }}>
                      <p style={{ color:"var(--ink)", fontSize:15, fontWeight:500, lineHeight:1.65, marginBottom:13, margin:"0 0 13px" }}>
                        {q.question}
                      </p>

                      {q.image && (
                        <img src={q.image} alt="q" style={{ maxWidth:260, borderRadius:10, border:"1.5px solid var(--line-2)", marginBottom:13, display:"block" }} />
                      )}

                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px 10px" }}>
                        {q.options?.map((opt, idx) => (
                          <div key={idx} className="opt-pill">
                            <span style={{ color:"var(--accent)", fontWeight:700, fontFamily:"'Geist', sans-serif", fontSize:12, flexShrink:0, marginTop:1 }}>{labels[idx]}.</span>
                            <span style={{ fontSize:13.5 }}>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Action buttons ── */}
          {questions.length > 0 && (
            <div className="au" style={{ display:"flex", justifyContent:"center", gap:12, marginTop:40, flexWrap:"wrap" }}>
              <button className="btn btn-green btn-lg" onClick={createExam} disabled={creating}>
                {creating ? "⏳ তৈরি হচ্ছে…" : "🚀 অনলাইনে পরীক্ষা নিন"}
              </button>
              <button className="btn btn-primary btn-lg" onClick={downloadPDF}>
                ↓ &nbsp;PDF Download
              </button>
            </div>
          )}

          {/* ── Success box ── */}
          {examCode && (
            <div className="success-box asi" style={{ marginTop:40 }}>
              <div style={{ fontSize:40, marginBottom:14 }}>🎉</div>
              <div style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:24, fontWeight:600, color:"var(--ink)", marginBottom:6 }}>
                Exam সফলভাবে তৈরি!
              </div>
              <p style={{ color:"var(--ink-3)", marginBottom:22, fontSize:14 }}>নিচের লিংকটি স্টুডেন্টদের পাঠান</p>
              <div className="link-box">{window.location.origin}/exam/{examCode}</div>
              <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
                <button className="btn btn-accent btn-lg" onClick={copyLink}>⎘ &nbsp;Link Copy</button>
                <a href={`/ranking/${examCode}`} target="_blank" rel="noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--ink)", color:"#fff", borderRadius:14, padding:"13px 28px", fontWeight:600, fontSize:15, textDecoration:"none", boxShadow:"0 2px 10px rgba(26,25,22,0.2)", transition:"all 0.18s" }}>
                  ◈ &nbsp;View Ranking
                </a>
              </div>
            </div>
          )}

          {/* ── Hidden PDF ── */}
          <div id="question-paper" className="preview-paper">
            <style>{`
              .preview-paper { width:210mm; min-height:297mm; background:white; padding:14mm; box-sizing:border-box; overflow:hidden; }
              .preview-paper * { box-sizing:border-box; word-break:break-word; overflow-wrap:break-word; }
              .question-block { width:100%; margin-bottom:12px; page-break-inside:avoid; break-inside:avoid; }
              .question-title { font-weight:700; text-align:justify; }
              .option-line { display:flex; gap:4px; align-items:flex-start; }
            `}</style>

            <div style={{ textAlign:"center", borderBottom:"1px solid #ccc", paddingBottom:12, marginBottom:16 }}>
              <div style={{ display:"inline-block", background:"black", padding:"4px 20px", marginBottom:8 }}>
                <h1 style={{ color:"white", fontWeight:"bold", fontSize: pdfCompact?"14px":"22px", margin:0 }}>{examData.subject}</h1>
              </div>
              <h2 style={{ fontWeight:"bold", fontSize: pdfCompact?"13px":"19px", margin:"0 0 4px" }}>{examData.academy}</h2>
              <p style={{ color:"#374151", margin:"0 0 10px", fontSize: pdfCompact?"10px":"13px" }}>{examData.title}</p>
              <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #ccc", paddingTop:8, fontSize: pdfCompact?"9px":"12px" }}>
                <span>সময়: {examData.duration} মিনিট</span>
                <span>পূর্ণমান: {examData.marks}</span>
              </div>
            </div>

            <div style={{ columnCount:2, columnGap: pdfCompact?"14px":"28px" }}>
              {allQuestions.filter(q => selected.includes(q._id)).map((q, i) => (
                <div key={q._id} className="question-block">
                  <h2 className="question-title" style={{ fontSize: pdfCompact?"9px":"12px", lineHeight: pdfCompact?"14px":"18px", marginBottom:4 }}>
                    {i+1}. {q.question}
                  </h2>
                  {q.image && <img src={q.image} alt="q" style={{ maxWidth:"100%", marginBottom:4 }} />}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: pdfCompact?"2px 8px":"4px 14px", fontSize: pdfCompact?"8px":"10px", lineHeight: pdfCompact?"12px":"15px" }}>
                    {q.options?.map((opt, idx) => (
                      <div key={idx} className="option-line">
                        <span style={{ fontWeight:"bold" }}>{labels[idx]}.</span>
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
