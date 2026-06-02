import { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";

const API = import.meta.env.VITE_API_URL;

// ─── Global Styles ───────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Syne:wght@400;500;600;700;800&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; user-select: none !important; -webkit-user-select: none !important; }
    input, textarea, select { user-select: text !important; -webkit-user-select: text !important; }
    img { pointer-events: none !important; -webkit-user-drag: none !important; }
    @media print { body { display: none !important; } }

    :root {
      --ink: #0a0a0f;
      --ink-2: #1a1a2e;
      --ink-3: #2d2d44;
      --muted: #6b7280;
      --muted-2: #9ca3af;
      --surface: #ffffff;
      --surface-2: #f8f7f4;
      --surface-3: #f0ede8;
      --border: rgba(0,0,0,0.08);
      --border-2: rgba(0,0,0,0.12);
      --gold: #c9a84c;
      --gold-2: #e8c97a;
      --gold-light: #fdf6e3;
      --crimson: #8b1a1a;
      --emerald: #0d4a2f;
      --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
      --shadow-md: 0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
      --shadow-lg: 0 24px 64px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.08);
      --shadow-xl: 0 40px 80px rgba(0,0,0,0.18), 0 12px 32px rgba(0,0,0,0.10);
      --shadow-gold: 0 8px 32px rgba(201,168,76,0.25), 0 2px 8px rgba(201,168,76,0.12);
      --radius: 4px;
      --radius-md: 8px;
      --radius-lg: 16px;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Syne', sans-serif;
      background: var(--surface-2);
      color: var(--ink);
      margin: 0;
    }

    /* ── Keyframes ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.94) translateY(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes goldPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.3); }
      50%       { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
    }
    @keyframes lineExpand {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
    @keyframes floatUp {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-6px); }
    }
    @keyframes checkBounce {
      0%   { transform: scale(0) rotate(-10deg); }
      60%  { transform: scale(1.2) rotate(4deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    @keyframes progressFill {
      from { width: 0; }
    }
    @keyframes borderTrace {
      from { clip-path: inset(0 100% 0 0); }
      to   { clip-path: inset(0 0% 0 0); }
    }
    @keyframes rowSlide {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .anim-fadeUp   { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
    .anim-scaleIn  { animation: scaleIn 0.6s cubic-bezier(.16,1,.3,1) both; }
    .anim-fadeIn   { animation: fadeIn 0.5s ease both; }
    .anim-slide    { animation: slideRight 0.6s cubic-bezier(.16,1,.3,1) both; }
    .anim-rowSlide { animation: rowSlide 0.5s cubic-bezier(.16,1,.3,1) both; }

    .d1 { animation-delay: 0.06s; }
    .d2 { animation-delay: 0.12s; }
    .d3 { animation-delay: 0.18s; }
    .d4 { animation-delay: 0.24s; }
    .d5 { animation-delay: 0.30s; }
    .d6 { animation-delay: 0.36s; }

    /* ── Topbar ── */
    .topbar {
      position: sticky; top: 0; z-index: 500;
      background: rgba(10,10,15,0.97);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border-bottom: 1px solid rgba(201,168,76,0.18);
      box-shadow: 0 1px 0 rgba(201,168,76,0.08), 0 8px 32px rgba(0,0,0,0.30);
    }

    /* ── Field label ── */
    .field-label {
      display: block; margin-bottom: 9px;
      font-family: 'Syne', sans-serif;
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--muted);
    }

    /* ── Premium Input ── */
    .p-input {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border-2);
      border-radius: var(--radius-md);
      padding: 13px 16px;
      color: var(--ink);
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 16px; font-weight: 400;
      outline: none;
      transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.03), var(--shadow-sm);
    }
    .p-input::placeholder { color: var(--muted-2); font-style: italic; }
    .p-input:focus {
      border-color: var(--gold);
      box-shadow: 0 0 0 3px rgba(201,168,76,0.12), inset 0 2px 4px rgba(0,0,0,0.02), var(--shadow-sm);
      background: #fffef9;
    }
    .p-input:hover:not(:focus) { border-color: rgba(0,0,0,0.2); }
    select.p-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; padding-right: 40px; }

    /* ── Buttons ── */
    .btn-gold {
      position: relative; overflow: hidden;
      background: linear-gradient(135deg, #c9a84c 0%, #e8c97a 50%, #c9a84c 100%);
      background-size: 200% 100%;
      border: none; border-radius: var(--radius-md);
      padding: 15px 36px;
      color: #1a1400; font-family: 'Syne', sans-serif;
      font-weight: 700; font-size: 13px; letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background-position 0.4s, transform 0.2s, box-shadow 0.3s;
      box-shadow: var(--shadow-gold), inset 0 1px 0 rgba(255,255,255,0.3);
    }
    .btn-gold:hover {
      background-position: -100% 0;
      transform: translateY(-3px);
      box-shadow: 0 16px 48px rgba(201,168,76,0.35), 0 4px 12px rgba(201,168,76,0.2);
    }
    .btn-gold:active { transform: translateY(0); }

    .btn-dark {
      position: relative; overflow: hidden;
      background: var(--ink);
      border: 1px solid rgba(201,168,76,0.25);
      border-radius: var(--radius-md);
      padding: 15px 36px;
      color: #e8c97a; font-family: 'Syne', sans-serif;
      font-weight: 700; font-size: 13px; letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    }
    .btn-dark::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(201,168,76,0.08) 0%, transparent 60%);
      opacity: 0; transition: opacity 0.3s;
    }
    .btn-dark:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.35); border-color: rgba(201,168,76,0.5); }
    .btn-dark:hover::after { opacity: 1; }

    .btn-ghost {
      background: transparent;
      border: 1px solid var(--border-2);
      border-radius: var(--radius-md);
      padding: 9px 20px;
      color: var(--muted);
      font-family: 'Syne', sans-serif;
      font-weight: 600; font-size: 12px; letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-ghost:hover { background: var(--surface-3); border-color: var(--gold); color: var(--ink); }

    .btn-danger {
      background: transparent;
      border: 1px solid rgba(139,26,26,0.2);
      border-radius: var(--radius-md);
      padding: 9px 16px;
      color: var(--crimson);
      font-family: 'Syne', sans-serif;
      font-weight: 600; font-size: 12px; letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-danger:hover { background: #fef2f2; border-color: rgba(139,26,26,0.4); transform: translateY(-1px); }

    /* ── Card ── */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      transition: box-shadow 0.3s, transform 0.3s;
    }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border-2), transparent);
      margin: 28px 0;
    }
    .divider-gold {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
      margin: 28px 0;
      opacity: 0.4;
    }

    /* ── Badge ── */
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 12px; border-radius: 2px;
      font-family: 'Syne', sans-serif;
      font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .badge-gold   { background: var(--gold-light); color: #7a5c1a; border: 1px solid rgba(201,168,76,0.3); }
    .badge-green  { background: #f0fdf4; color: var(--emerald); border: 1px solid rgba(13,74,47,0.2); }
    .badge-red    { background: #fef2f2; color: var(--crimson); border: 1px solid rgba(139,26,26,0.2); }
    .badge-slate  { background: var(--surface-2); color: var(--muted); border: 1px solid var(--border); }

    /* ── Tab ── */
    .tab-btn {
      padding: 10px 24px;
      font-family: 'Syne', sans-serif;
      font-weight: 700; font-size: 12px;
      letter-spacing: 0.1em; text-transform: uppercase;
      cursor: pointer;
      transition: all 0.25s;
      border: none;
      position: relative;
    }
    .tab-btn::after {
      content: '';
      position: absolute; bottom: 0; left: 50%; right: 50%;
      height: 2px; background: var(--gold);
      transition: left 0.3s, right 0.3s;
    }
    .tab-btn.inactive { background: transparent; color: rgba(255,255,255,0.35); }
    .tab-btn.inactive:hover { color: rgba(255,255,255,0.7); }
    .tab-btn.active { background: transparent; color: var(--gold); }
    .tab-btn.active::after { left: 16px; right: 16px; }

    /* ── Stat card ── */
    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 36px 28px;
      text-align: center;
      position: relative; overflow: hidden;
      transition: transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s;
      box-shadow: var(--shadow-md);
    }
    .stat-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--gold), var(--gold-2));
    }
    .stat-card::after {
      content: '';
      position: absolute; bottom: -40px; right: -40px;
      width: 120px; height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    .stat-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl);
    }

    /* ── Q Card ── */
    .q-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px 32px;
      cursor: pointer;
      transition: border-color 0.25s, background 0.25s, transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s;
      box-shadow: var(--shadow-sm);
      position: relative; overflow: hidden;
    }
    .q-card::before {
      content: '';
      position: absolute; left: 0; top: 0; bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, var(--gold), var(--gold-2));
      transform: scaleY(0); transform-origin: bottom;
      transition: transform 0.35s cubic-bezier(.16,1,.3,1);
    }
    .q-card:hover { transform: translateY(-3px) translateX(3px); box-shadow: var(--shadow-md); border-color: rgba(0,0,0,0.15); }
    .q-card:hover::before { transform: scaleY(0.5); }
    .q-card.active {
      background: #fffef9;
      border-color: rgba(201,168,76,0.4);
      box-shadow: 0 8px 32px rgba(201,168,76,0.12), var(--shadow-sm);
      transform: translateY(-2px) translateX(3px);
    }
    .q-card.active::before { transform: scaleY(1); }

    /* ── Num badge ── */
    .num-badge {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif;
      font-weight: 800; font-size: 13px; flex-shrink: 0;
      transition: all 0.4s cubic-bezier(.16,1,.3,1);
      letter-spacing: 0;
    }
    .num-badge.inactive {
      background: var(--surface-2);
      border: 1px solid var(--border-2);
      color: var(--muted);
    }
    .num-badge.active {
      background: var(--ink);
      border: 1px solid var(--gold);
      color: var(--gold);
      animation: checkBounce 0.4s cubic-bezier(.16,1,.3,1);
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    }

    /* ── Opt pill ── */
    .opt-pill {
      display: flex; gap: 8px; align-items: flex-start;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 8px 12px;
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 15px; color: var(--ink-3);
      transition: all 0.2s;
    }
    .q-card.active .opt-pill { background: var(--gold-light); border-color: rgba(201,168,76,0.25); }

    /* ── Progress ── */
    .progress-track {
      background: var(--surface-3);
      border-radius: 2px; height: 4px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 2px;
      background: linear-gradient(90deg, var(--gold), var(--gold-2));
      transition: width 0.5s cubic-bezier(.16,1,.3,1);
      box-shadow: 0 0 12px rgba(201,168,76,0.5);
    }

    /* ── Success box ── */
    .success-box {
      background: linear-gradient(135deg, #0a1a0f 0%, #0d2a18 100%);
      border: 1px solid rgba(201,168,76,0.25);
      border-radius: var(--radius-lg);
      padding: 48px 40px;
      text-align: center;
      box-shadow: 0 32px 80px rgba(0,0,0,0.25);
      position: relative; overflow: hidden;
    }
    .success-box::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 70%);
    }

    .link-box {
      background: rgba(255,255,255,0.05);
      border: 1px dashed rgba(201,168,76,0.4);
      border-radius: var(--radius-md);
      padding: 16px 24px;
      color: var(--gold-2);
      font-family: 'Syne', sans-serif;
      font-size: 13px;
      word-break: break-all;
      margin-bottom: 24px;
      letter-spacing: 0.02em;
    }

    /* ── Exam row ── */
    .exam-row {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px 32px;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 16px;
      box-shadow: var(--shadow-sm);
      transition: transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s, border-color 0.25s;
      position: relative; overflow: hidden;
    }
    .exam-row::after {
      content: '';
      position: absolute; bottom: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
      opacity: 0; transition: opacity 0.3s;
    }
    .exam-row:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: rgba(201,168,76,0.2); }
    .exam-row:hover::after { opacity: 1; }

    /* ── Section heading ── */
    .section-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 36px; font-weight: 900; font-style: italic;
      color: var(--ink); letter-spacing: -0.5px; line-height: 1.1;
    }
    .section-sub {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 16px; color: var(--muted); font-weight: 300; font-style: italic;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--gold); }

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
    @media screen and (max-width: 900px) { .preview-paper { width: 100%; padding: 14px; } }

    /* ── Counter pill ── */
    .counter-pill {
      background: var(--ink);
      color: var(--gold);
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: 4px;
      padding: 8px 20px;
      font-family: 'Syne', sans-serif;
      font-weight: 800; font-size: 18px;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex; align-items: center; gap: 8px;
    }

    /* ── Ornament ── */
    .ornament {
      display: flex; align-items: center; gap: 12px; margin: 0 0 8px;
    }
    .ornament::before, .ornament::after {
      content: ''; flex: 1; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4));
    }
    .ornament::after { transform: scaleX(-1); }

    /* ── Hover link ── */
    a.hover-link {
      display: inline-flex; align-items: center;
      background: transparent; border: 1px solid var(--border-2);
      border-radius: var(--radius-md); padding: 9px 16px;
      color: var(--muted); font-family: 'Syne', sans-serif;
      font-weight: 600; font-size: 11px; letter-spacing: 0.07em;
      text-transform: uppercase; text-decoration: none;
      transition: all 0.25s;
    }
    a.hover-link:hover { background: var(--ink); color: var(--gold); border-color: var(--gold); }

    /* Noise */
    .noise::before {
      content: '';
      position: fixed; inset: 0; z-index: 999; pointer-events: none;
      opacity: 0.018;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
  `}</style>
);

// ─── Decorative ornament line ────────────────────────────────────────────────
const OrnamentLine = ({ label }) => (
  <div className="ornament" style={{ color: "rgba(201,168,76,0.6)", fontSize: 10, fontFamily: "'Syne', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>
    {label}
  </div>
);

function Builder() {
  // ─── Anti-copy
  useEffect(() => {
    const noCtx  = e => e.preventDefault();
    const noKey  = e => {
      if (e.ctrlKey && ["c","u","s","a","p"].includes(e.key.toLowerCase())) e.preventDefault();
      if (e.key === "PrintScreen") { e.preventDefault(); navigator.clipboard.writeText(""); }
    };
    document.addEventListener("contextmenu", noCtx);
    document.addEventListener("keydown", noKey);
    window.addEventListener("beforeprint", e => e.preventDefault());
    return () => {
      document.removeEventListener("contextmenu", noCtx);
      document.removeEventListener("keydown", noKey);
    };
  }, []);

  // ─── State
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

  // ─── Fetch exams
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
      fetchExamList();
    } catch { alert("Delete failed"); }
  };

  // ─── Fetch questions
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

  // ─── Handlers
  const handleChange = e => setExamData({ ...examData, [e.target.name]: e.target.value });
  const toggleSelect = id => {
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
    if (selected.length === 0) return alert("প্রশ্ন সিলেক্ট করুন");
    setCreating(true);
    try {
      const res  = await fetch(`${API}/api/exams/create`, {
        method:"POST", headers:{"Content-Type":"application/json"},
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
      margin: 0, filename: `${examData.title || "question-paper"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all","css","legacy"] }
    }).from(document.getElementById("question-paper")).save();
    setPdfCompact(false);
  };

  const labels = ["ক","খ","গ","ঘ"];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="noise" style={{ minHeight:"100vh", background:"var(--surface-2)", fontFamily:"'Syne', sans-serif" }}>
      <GlobalStyles />

      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div style={{ maxWidth:1120, margin:"0 auto", padding:"0 32px", height:72, display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          {/* Logo */}
          <div className="anim-slide" style={{ display:"flex", alignItems:"center", gap:18 }}>
            <div style={{
              width:44, height:44,
              background:"linear-gradient(135deg,#c9a84c,#e8c97a)",
              
              borderRadius:"6px",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, flexShrink:0,
              boxShadow:"0 4px 20px rgba(201,168,76,0.4), inset 0 1px 0 rgba(255,255,255,0.3)"
            }}>📝</div>
            <div>
              <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:20, fontWeight:700, color:"#fff", letterSpacing:"-0.3px", lineHeight:1.1 }}>
                প্রশ্নব্যাংক
              </div>
              <div style={{ fontFamily:"'Syne', sans-serif", fontSize:9, color:"rgba(201,168,76,0.7)", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", marginTop:3 }}>
                Question Bank Builder
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:0, borderBottom:"1px solid rgba(201,168,76,0.15)" }}>
            {[["builder","✦  Builder"],["exams","⊞  Exam List"]].map(([id, label]) => (
              <button key={id} className={`tab-btn ${activeTab===id?"active":"inactive"}`} onClick={() => setActiveTab(id)}>
                {label}
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* ══════════════════════ EXAM LIST TAB ══════════════════════ */}
      {activeTab === "exams" && (
        <div className="anim-fadeUp" style={{ maxWidth:1120, margin:"0 auto", padding:"52px 32px" }}>

          {/* Page header */}
          <div style={{ marginBottom:48 }}>
            <OrnamentLine label="সকল পরীক্ষা" />
            <h1 className="section-heading" style={{ margin:"12px 0 6px" }}>Exam তালিকা</h1>
            <p className="section-sub">তৈরি করা সব পরীক্ষার সংক্ষিপ্ত বিবরণ</p>
          </div>

          {/* Stats */}
          {stats && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:20, marginBottom:52 }}>
              {[
                { label:"মোট Exam",       value:stats.examCount,       icon:"📝", note:"Created" },
                { label:"মোট Submission", value:stats.submissionCount, icon:"✅", note:"Submitted" },
                { label:"মোট Question",   value:stats.questionCount,   icon:"❓", note:"In Bank" }
              ].map((s,i) => (
                <div key={i} className={`stat-card anim-scaleIn d${i+1}`}>
                  <div style={{ fontSize:32, marginBottom:16 }}>{s.icon}</div>
                  <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:48, fontWeight:900, color:"var(--ink)", lineHeight:1, letterSpacing:"-2px" }}>
                    {s.value}
                  </div>
                  <div style={{ marginTop:8 }}>
                    <div style={{ fontFamily:"'Syne', sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)" }}>{s.label}</div>
                    <div style={{ fontFamily:"'Crimson Pro', Georgia, serif", fontSize:13, color:"var(--gold)", fontStyle:"italic", marginTop:2 }}>{s.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
            <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:20, fontWeight:700, color:"var(--ink)" }}>
              {examList.length} টি পরীক্ষা
            </div>
            <button className="btn-ghost" onClick={fetchExamList}>↺ &nbsp;Refresh</button>
          </div>

          {loadingExams && (
            <div style={{ textAlign:"center", padding:100, color:"var(--muted)" }}>
              <div style={{ fontSize:28, marginBottom:14, animation:"floatUp 2s ease-in-out infinite" }}>⏳</div>
              <div style={{ fontFamily:"'Crimson Pro', Georgia, serif", fontSize:17, fontStyle:"italic" }}>Loading…</div>
            </div>
          )}
          {!loadingExams && examList.length === 0 && (
            <div style={{ textAlign:"center", padding:100 }}>
              <div style={{ fontSize:40, marginBottom:16, opacity:0.3 }}>📋</div>
              <div style={{ fontFamily:"'Crimson Pro', Georgia, serif", fontSize:18, color:"var(--muted-2)", fontStyle:"italic" }}>কোনো Exam পাওয়া যায়নি</div>
            </div>
          )}

          <div style={{ display:"grid", gap:16 }}>
            {examList.map((exam, idx) => (
              <div key={exam._id} className={`exam-row anim-rowSlide d${Math.min(idx+1,5)}`}>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:22, fontWeight:700, color:"var(--ink)", margin:"0 0 12px" }}>
                    {exam.title}
                  </h3>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    <span className="badge badge-gold">🔑 {exam.examCode}</span>
                    <span className="badge badge-green">❓ {exam.questions?.length||0} প্রশ্ন</span>
                    <span className="badge badge-red">✓ {exam.submissionCount||0} Submission</span>
                    <span className="badge badge-slate">⏱ {exam.duration} মিনিট</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <button className="btn-ghost"
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/exam/${exam.examCode}`); alert("Copied!"); }}>
                    ⎘ Link
                  </button>
                  <a href={`/ranking/${exam.examCode}`} target="_blank" rel="noreferrer" className="hover-link">
                    ◈ Ranking
                  </a>
                  <button onClick={() => deleteExam(exam.examCode)} className="btn-danger">
                    ✕ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════ BUILDER TAB ══════════════════════ */}
      {activeTab === "builder" && (
        <div style={{ maxWidth:1120, margin:"0 auto", padding:"52px 32px" }}>

          {/* Page header */}
          <div className="anim-fadeUp" style={{ marginBottom:44 }}>
            <OrnamentLine label="পরীক্ষা তৈরি করুন" />
            <h1 className="section-heading" style={{ margin:"12px 0 6px" }}>নতুন পরীক্ষা</h1>
            <p className="section-sub">তথ্য পূরণ করে প্রশ্ন বেছে নিন, তারপর প্রকাশ করুন</p>
          </div>

          {/* ── Form Card ── */}
          <div className="card anim-fadeUp d1" style={{ padding:"44px 48px", marginBottom:36 }}>

            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:36 }}>
              <div style={{ width:3, height:36, background:"linear-gradient(180deg,var(--gold),var(--gold-2))", borderRadius:2 }} />
              <div>
                <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:22, fontWeight:700, color:"var(--ink)", fontStyle:"italic" }}>পরীক্ষার তথ্য</div>
                <div style={{ fontFamily:"'Crimson Pro', Georgia, serif", fontSize:14, color:"var(--muted)", marginTop:2 }}>সঠিক তথ্য দিয়ে পূরণ করুন</div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>

              <div className="anim-fadeUp d1">
                <label className="field-label">🏫 একাডেমি / কলেজ</label>
                <input className="p-input" type="text" name="academy" placeholder="যেমন: Saif Academy"
                  value={examData.academy} onChange={handleChange} />
              </div>

              <div className="anim-fadeUp d2">
                <label className="field-label">📋 পরীক্ষার নাম</label>
                <input className="p-input" type="text" name="title" placeholder="যেমন: Model Test 2024"
                  value={examData.title} onChange={handleChange} />
              </div>

              <div className="anim-fadeUp d3">
                <label className="field-label">📚 বিষয়</label>
                <input className="p-input" type="text" name="subject" value={examData.subject} onChange={handleChange} />
              </div>

              <div className="anim-fadeUp d4">
                <label className="field-label">📖 অধ্যায় নির্বাচন</label>
                <select className="p-input" value={chapter}
                  onChange={e => { setChapter(e.target.value); setSelected([]); setAllQuestions([]); setBoardYear(""); setBoardName(""); }}>
                  <option value="">— অধ্যায় বেছে নিন —</option>
                  <option value="Introduction to ICT">Chapter 1 — ICT Introduction</option>
                  <option value="Communication Systems">Chapter 2 — Communication Systems</option>
                  <option value="Numbers & Digital Devices">Chapter 3 — Number System</option>
                  <option value="Web & HTML">Chapter 4 — Web & HTML</option>
                  <option value="Programming & Language">Chapter 5 — Programming</option>
                  <option value="Board Questions">✦ Board Questions</option>
                </select>

                {chapter === "Board Questions" && (
                  <div style={{ marginTop:18 }} className="anim-fadeUp">
                    <label className="field-label">📅 Board Year</label>
                    <select className="p-input" value={boardYear}
                      onChange={e => { setBoardYear(e.target.value); setSelected([]); setAllQuestions([]); setBoardName(""); }}>
                      <option value="">— বছর বেছে নিন —</option>
                      {["2025","2024","2023","2022","2019"].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}

                {chapter === "Board Questions" && boardYear && (
                  <div style={{ marginTop:18 }} className="anim-fadeUp">
                    <label className="field-label">🏛️ Board Name</label>
                    <select className="p-input" value={boardName}
                      onChange={e => { setSelected([]); setAllQuestions([]); setBoardName(e.target.value); }}>
                      <option value="">— বোর্ড বেছে নিন —</option>
                      {["Dhaka","Chittagong","Rajshahi","Cumilla","Jessore","Dinajpur","Sylhet"].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="anim-fadeUp d5">
                <label className="field-label">🎯 প্রশ্ন সংখ্যা</label>
                <input className="p-input" type="number" name="marks" value={examData.marks} onChange={handleChange} />
              </div>

              <div className="anim-fadeUp d6">
                <label className="field-label">⏱️ সময় (মিনিট)</label>
                <input className="p-input" type="number" name="duration" value={examData.duration} onChange={handleChange} />
              </div>

            </div>
          </div>

          {/* ── Question header ── */}
          {questions.length > 0 && (
            <div className="card anim-scaleIn" style={{ padding:"24px 32px", marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16, marginBottom:20 }}>
                <div>
                  <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:20, fontWeight:700, fontStyle:"italic", color:"var(--ink)" }}>
                    প্রশ্ন নির্বাচন করুন
                  </div>
                  <div style={{ fontFamily:"'Crimson Pro', Georgia, serif", fontSize:14, color:"var(--muted)", fontStyle:"italic", marginTop:4 }}>
                    মোট {questions.length}টি প্রশ্ন পাওয়া গেছে
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div className="counter-pill">
                    <span>{selected.length}</span>
                    <span style={{ opacity:0.4, fontWeight:400 }}>/</span>
                    <span>{examData.marks}</span>
                  </div>
                  <button className="btn-ghost" onClick={selectAll}>সব Select</button>
                  <button className="btn-ghost" style={{ color:"var(--crimson)", borderColor:"rgba(139,26,26,0.2)" }} onClick={deselectAll}>Deselect</button>
                </div>
              </div>
              <div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width:`${progress}%` }} />
                </div>
                <div style={{ fontSize:11, color:"var(--muted-2)", marginTop:7, textAlign:"right", fontFamily:"'Syne', sans-serif", letterSpacing:"0.05em" }}>
                  {Math.round(progress)}% সম্পন্ন
                </div>
              </div>
            </div>
          )}

          {/* ── Question list ── */}
          <div style={{ display:"grid", gap:14 }}>
            {questions.map((q, index) => {
              const active = selected.includes(q._id);
              return (
                <div key={q._id} className={`q-card${active?" active":""} anim-fadeUp`}
                  style={{ animationDelay:`${Math.min(index*0.035,0.5)}s` }}
                  onClick={() => toggleSelect(q._id)}>
                  <div style={{ display:"flex", gap:18, alignItems:"flex-start" }}>

                    <div className={`num-badge ${active?"active":"inactive"}`}>
                      {active ? "✓" : index + 1}
                    </div>

                    <div style={{ flex:1 }}>
                      <h2 style={{
                        fontFamily:"'Crimson Pro', Georgia, serif",
                        color:"var(--ink)", fontSize:18, fontWeight:600,
                        lineHeight:1.65, marginBottom:16, fontStyle: active?"normal":"normal"
                      }}>
                        {q.question}
                      </h2>

                      {q.image && (
                        <img src={q.image} alt="q" style={{ maxWidth:260, borderRadius:8, border:"1px solid var(--border-2)", marginBottom:16 }} />
                      )}

                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 14px" }}>
                        {q.options?.map((opt, idx) => (
                          <div key={idx} className="opt-pill">
                            <span style={{ color:"var(--gold)", fontWeight:700, fontFamily:"'Syne',sans-serif", fontSize:12, flexShrink:0, marginTop:2 }}>{labels[idx]}</span>
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

          {/* ── Action buttons ── */}
          {questions.length > 0 && (
            <div className="anim-fadeUp" style={{ display:"flex", justifyContent:"center", gap:16, marginTop:52, flexWrap:"wrap" }}>
              <button className="btn-gold" onClick={createExam} disabled={creating}>
                {creating ? "⏳  তৈরি হচ্ছে…" : "✦  অনলাইনে পরীক্ষা নিন"}
              </button>
              <button className="btn-dark" onClick={downloadPDF}>
                ⬇  PDF Download
              </button>
            </div>
          )}

          {/* ── Success box ── */}
          {examCode && (
            <div className="success-box anim-scaleIn" style={{ marginTop:52 }}>
              <div style={{ position:"relative", zIndex:1 }}>
                <div style={{ fontSize:44, marginBottom:16, animation:"floatUp 3s ease-in-out infinite" }}>🎉</div>
                <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:28, fontWeight:900, color:"#fff", marginBottom:8, letterSpacing:"-0.5px" }}>
                  Exam সফলভাবে তৈরি!
                </div>
                <div style={{ fontFamily:"'Crimson Pro', Georgia, serif", fontSize:16, color:"rgba(232,201,122,0.7)", fontStyle:"italic", marginBottom:28 }}>
                  নিচের লিংকটি স্টুডেন্টদের পাঠান
                </div>

                <div className="link-box">{window.location.origin}/exam/{examCode}</div>

                <div style={{ display:"flex", justifyContent:"center", gap:14, flexWrap:"wrap" }}>
                  <button className="btn-gold" onClick={copyLink}>⎘  Link Copy</button>
                  <a href={`/ranking/${examCode}`} target="_blank" rel="noreferrer"
                    style={{
                      background:"transparent", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"8px",
                      padding:"15px 36px", color:"#fff", fontFamily:"'Syne', sans-serif",
                      fontWeight:700, fontSize:13, letterSpacing:"0.08em", textTransform:"uppercase",
                      textDecoration:"none", transition:"all 0.25s", display:"inline-block"
                    }}
                    onMouseOver={e => { e.target.style.borderColor="rgba(201,168,76,0.5)"; e.target.style.color="var(--gold)"; }}
                    onMouseOut={e =>  { e.target.style.borderColor="rgba(255,255,255,0.2)"; e.target.style.color="#fff"; }}>
                    ◈  View Ranking
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── Printable PDF paper (hidden) ── */}
          <div id="question-paper" className="preview-paper" style={{ position:"absolute", left:"-9999px", top:0 }}>
            <style>{`
              .preview-paper { width:210mm; min-height:297mm; background:white; padding:14mm; box-sizing:border-box; overflow:hidden; }
              .preview-paper * { box-sizing:border-box; word-break:break-word; overflow-wrap:break-word; }
              .question-block { width:100%; margin-bottom:12px; page-break-inside:avoid; break-inside:avoid; }
              .question-title { font-weight:700; text-align:justify; }
              .option-line { display:flex; gap:4px; align-items:flex-start; }
              @media screen and (max-width:900px) { .preview-paper { width:100%; padding:14px; } }
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