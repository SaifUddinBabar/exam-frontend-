import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";

const API = import.meta.env.VITE_API_URL;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #060910;
    --surface: #0d1117;
    --surface2: #161b22;
    --border: rgba(255,255,255,0.07);
    --border-active: rgba(99,179,237,0.5);
    --accent: #63b3ed;
    --accent2: #4fd1c5;
    --accent3: #f6ad55;
    --text: #e6edf3;
    --text-muted: rgba(230,237,243,0.45);
    --success: #56d364;
    --danger: #f85149;
    --gradient: linear-gradient(135deg, #1a2a4a 0%, #0d1f3c 50%, #0a1628 100%);
  }

  body {
    font-family: 'Sora', 'Noto Sans Bengali', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  .app-bg {
    min-height: 100vh;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,179,237,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 40% 30% at 85% 60%, rgba(79,209,197,0.05) 0%, transparent 50%);
    position: relative;
  }

  .app-bg::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── TOPBAR ── */
  .topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(6,9,16,0.85);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
  }

  .topbar-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 28px;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #1a3a6a, #0d2a50);
    border: 1px solid rgba(99,179,237,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 0 20px rgba(99,179,237,0.15);
  }

  .logo-text h1 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.3px;
    line-height: 1;
  }

  .logo-text p {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 2px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .tab-group {
    display: flex;
    gap: 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 4px;
  }

  .tab-btn {
    padding: 8px 18px;
    border-radius: 8px;
    border: none;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-muted);
    background: transparent;
    letter-spacing: 0.2px;
  }

  .tab-btn.active {
    background: linear-gradient(135deg, #1a3a6a, #0d2a50);
    color: var(--accent);
    border: 1px solid rgba(99,179,237,0.3);
    box-shadow: 0 0 16px rgba(99,179,237,0.15);
  }

  /* ── CONTENT ── */
  .content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 36px 28px;
    position: relative;
    z-index: 1;
  }

  /* ── STATS ROW ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: border-color 0.2s;
  }

  .stat-card:hover { border-color: rgba(99,179,237,0.2); }

  .stat-icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  .stat-card:nth-child(1) .stat-icon-box { background: rgba(99,179,237,0.1); }
  .stat-card:nth-child(2) .stat-icon-box { background: rgba(86,211,100,0.1); }
  .stat-card:nth-child(3) .stat-icon-box { background: rgba(246,173,85,0.1); }

  .stat-value {
    font-size: 30px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-card:nth-child(1) .stat-value { color: var(--accent); }
  .stat-card:nth-child(2) .stat-value { color: var(--success); }
  .stat-card:nth-child(3) .stat-value { color: var(--accent3); }

  .stat-label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 500;
    letter-spacing: 0.3px;
  }

  /* ── SECTION TITLE ── */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--text);
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .refresh-btn:hover {
    border-color: rgba(99,179,237,0.3);
    color: var(--accent);
    background: rgba(99,179,237,0.05);
  }

  /* ── EXAM CARD ── */
  .exam-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 22px 26px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 12px;
    transition: all 0.2s;
  }

  .exam-card:hover {
    border-color: rgba(99,179,237,0.2);
    background: #0f1520;
  }

  .exam-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 10px;
  }

  .badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .badge-blue { background: rgba(99,179,237,0.1); color: var(--accent); border: 1px solid rgba(99,179,237,0.2); }
  .badge-green { background: rgba(86,211,100,0.1); color: var(--success); border: 1px solid rgba(86,211,100,0.2); }
  .badge-red { background: rgba(248,81,73,0.1); color: var(--danger); border: 1px solid rgba(248,81,73,0.2); }
  .badge-gray { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--border); }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    border-radius: 8px;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    border: 1px solid transparent;
  }

  .action-btn-copy { background: rgba(99,179,237,0.08); color: var(--accent); border-color: rgba(99,179,237,0.2); }
  .action-btn-copy:hover { background: rgba(99,179,237,0.15); }

  .action-btn-rank { background: rgba(246,173,85,0.08); color: var(--accent3); border-color: rgba(246,173,85,0.2); }
  .action-btn-rank:hover { background: rgba(246,173,85,0.15); }

  .action-btn-del { background: rgba(248,81,73,0.08); color: var(--danger); border-color: rgba(248,81,73,0.2); }
  .action-btn-del:hover { background: rgba(248,81,73,0.15); }

  /* ── FORM CARD ── */
  .form-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 28px;
  }

  .form-card-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 6px;
  }

  .form-card-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 28px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .field-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 8px;
  }

  .field-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
    color: var(--text);
    font-family: 'Sora', 'Noto Sans Bengali', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .field-input:focus {
    border-color: rgba(99,179,237,0.4);
    box-shadow: 0 0 0 3px rgba(99,179,237,0.07);
  }

  .field-input::placeholder { color: rgba(255,255,255,0.2); }

  select.field-input option {
    background: #0d1117;
    color: var(--text);
  }

  /* ── QUESTION PANEL HEADER ── */
  .q-panel-header {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 18px 24px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
  }

  .q-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(99,179,237,0.1);
    border: 1px solid rgba(99,179,237,0.25);
    border-radius: 8px;
    padding: 6px 14px;
    color: var(--accent);
    font-size: 14px;
    font-weight: 700;
  }

  .select-btn {
    padding: 7px 14px;
    border-radius: 8px;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
  }

  .select-btn-all { background: rgba(99,179,237,0.08); color: var(--accent); border-color: rgba(99,179,237,0.2); }
  .select-btn-all:hover { background: rgba(99,179,237,0.15); }

  .select-btn-none { background: rgba(248,81,73,0.08); color: var(--danger); border-color: rgba(248,81,73,0.2); }
  .select-btn-none:hover { background: rgba(248,81,73,0.15); }

  /* ── QUESTION CARD ── */
  .q-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .q-card:hover {
    border-color: rgba(99,179,237,0.25);
    background: #0f1520;
  }

  .q-card.selected {
    background: rgba(99,179,237,0.06);
    border-color: rgba(99,179,237,0.45);
    box-shadow: 0 0 24px rgba(99,179,237,0.07);
  }

  .q-num {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-muted);
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .q-card.selected .q-num {
    background: linear-gradient(135deg, #1a3a6a, #0d2a50);
    border-color: rgba(99,179,237,0.4);
    color: var(--accent);
  }

  .q-text {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .option-item {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text-muted);
    display: flex;
    gap: 7px;
    align-items: flex-start;
    transition: border-color 0.2s;
  }

  .q-card.selected .option-item {
    border-color: rgba(99,179,237,0.12);
  }

  .option-label {
    color: var(--accent);
    font-weight: 700;
    flex-shrink: 0;
  }

  /* ── ACTION BUTTONS ── */
  .action-bar {
    display: flex;
    justify-content: center;
    gap: 14px;
    margin-top: 36px;
    flex-wrap: wrap;
  }

  .main-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: 12px;
    border: none;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.2px;
  }

  .main-btn-create {
    background: linear-gradient(135deg, #1a5c3a, #0d3d24);
    color: var(--success);
    border: 1px solid rgba(86,211,100,0.3);
    box-shadow: 0 0 28px rgba(86,211,100,0.12);
  }

  .main-btn-create:hover {
    box-shadow: 0 0 40px rgba(86,211,100,0.2);
    transform: translateY(-1px);
  }

  .main-btn-pdf {
    background: linear-gradient(135deg, #1a2a5c, #0d1c45);
    color: var(--accent);
    border: 1px solid rgba(99,179,237,0.3);
    box-shadow: 0 0 28px rgba(99,179,237,0.12);
  }

  .main-btn-pdf:hover {
    box-shadow: 0 0 40px rgba(99,179,237,0.2);
    transform: translateY(-1px);
  }

  /* ── SUCCESS CARD ── */
  .success-card {
    background: var(--surface);
    border: 1px solid rgba(86,211,100,0.2);
    border-radius: 20px;
    padding: 36px;
    margin-top: 32px;
    text-align: center;
  }

  .success-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: rgba(86,211,100,0.1);
    border: 1px solid rgba(86,211,100,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin: 0 auto 16px;
  }

  .success-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 6px;
  }

  .success-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 20px;
  }

  .link-box {
    background: rgba(99,179,237,0.05);
    border: 1px solid rgba(99,179,237,0.15);
    border-radius: 10px;
    padding: 14px 20px;
    color: var(--accent);
    font-size: 14px;
    margin-bottom: 20px;
    word-break: break-all;
    font-weight: 500;
  }

  .success-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .success-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 11px 22px;
    border-radius: 10px;
    border: none;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
  }

  .success-btn-copy {
    background: rgba(99,179,237,0.1);
    color: var(--accent);
    border: 1px solid rgba(99,179,237,0.25);
  }
  .success-btn-copy:hover { background: rgba(99,179,237,0.18); }

  .success-btn-rank {
    background: rgba(246,173,85,0.1);
    color: var(--accent3);
    border: 1px solid rgba(246,173,85,0.25);
  }
  .success-btn-rank:hover { background: rgba(246,173,85,0.18); }

  /* ── EMPTY / LOADING ── */
  .empty-state {
    text-align: center;
    padding: 80px 20px;
    color: var(--text-muted);
    font-size: 15px;
  }

  .loading-state {
    text-align: center;
    padding: 80px 20px;
    color: var(--text-muted);
    font-size: 15px;
  }

  /* ── DIVIDER ── */
  .divider {
    height: 1px;
    background: var(--border);
    margin: 28px 0;
  }

  /* ── IMAGE ── */
  .q-img {
    max-width: 280px;
    border-radius: 8px;
    border: 1px solid var(--border);
    margin-bottom: 10px;
  }

  /* PDF STYLES unchanged */
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
    .preview-paper { width: 100%; padding: 14px; }
    .form-grid { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: 1fr; }
    .options-grid { grid-template-columns: 1fr; }
  }
`;

function Builder() {
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [chapter, setChapter] = useState("");
  const [examCode, setExamCode] = useState("");
  const [boardYear, setBoardYear] = useState("");
  const [boardName, setBoardName] = useState("");
  const [pdfCompact, setPdfCompact] = useState(false);
  const [examData, setExamData] = useState({
    academy: "", title: "", duration: "60", subject: "ICT", marks: "25"
  });
  const [examList, setExamList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingExams, setLoadingExams] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");

  const fetchExamList = async () => {
    setLoadingExams(true);
    try {
      const [examsRes, statsRes] = await Promise.all([
        fetch(`${API}/api/exams/list`),
        fetch(`${API}/api/exams/stats`)
      ]);
      setExamList(await examsRes.json() || []);
      setStats(await statsRes.json());
    } catch {
      setExamList([]);
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    if (activeTab === "exams") fetchExamList();
  }, [activeTab]);

  const deleteExam = async (code) => {
    if (!window.confirm("এই exam এবং সব submissions delete হয়ে যাবে। নিশ্চিত?")) return;
    try {
      await fetch(`${API}/api/exams/${code}`, { method: "DELETE" });
      setExamList(prev => prev.filter(e => e.examCode !== code));
      fetchExamList();
    } catch { alert("Delete failed"); }
  };

  useEffect(() => {
    if (!chapter) { setQuestions([]); setAllQuestions([]); setSelected([]); return; }
    const params = new URLSearchParams();
    params.append("subject", examData.subject);
    params.append("chapter", chapter);
    if (chapter === "Board Questions") {
      if (!boardYear || !boardName) { setQuestions([]); return; }
      params.append("questionType", "board");
      params.append("boardYear", boardYear);
      params.append("boardName", boardName);
    } else {
      params.append("questionType", "normal");
    }
    fetch(`${API}/api/questions?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const fetched = data || [];
        setQuestions(fetched);
        if (chapter === "Board Questions") {
          setAllQuestions(fetched);
          setSelected(fetched.map(q => q._id));
          setExamData(prev => ({ ...prev, marks: String(fetched.length) }));
        } else {
          setAllQuestions(prev => {
            const merged = [...prev];
            fetched.forEach(q => { if (!merged.find(i => i._id === q._id)) merged.push(q); });
            return merged;
          });
        }
      })
      .catch(() => setQuestions([]));
  }, [chapter, boardYear, boardName, examData.subject]);

  const handleChange = e => setExamData({ ...examData, [e.target.name]: e.target.value });

  const toggleSelect = id => {
    if (selected.includes(id)) { setSelected(prev => prev.filter(q => q !== id)); return; }
    const limit = Number(examData.marks);
    if (selected.length >= limit) { alert(`আপনি সর্বোচ্চ ${limit} টি প্রশ্ন সিলেক্ট করতে পারবেন`); return; }
    setSelected(prev => [...prev, id]);
  };

  const selectAll = () => {
    setSelected(questions.map(q => q._id));
    if (chapter === "Board Questions") setExamData(prev => ({ ...prev, marks: String(questions.length) }));
  };

  const deselectAll = () => setSelected([]);

  const createExam = async () => {
    if (!examData.academy) return alert("একাডেমির নাম লিখুন");
    if (!examData.title) return alert("পরীক্ষার নাম লিখুন");
    if (!chapter) return alert("অধ্যায় নির্বাচন করুন");
    if (selected.length === 0) return alert("প্রশ্ন সিলেক্ট করুন");
    try {
      const res = await fetch(`${API}/api/exams/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: examData.title, duration: examData.duration, questions: selected })
      });
      const data = await res.json();
      setExamCode(data.examCode);
      alert("Exam Created Successfully");
    } catch { alert("Create Failed"); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/exam/${examCode}`);
    alert("Link Copied!");
  };

  const downloadPDF = async () => {
    setPdfCompact(selected.length > 20);
    await new Promise(r => setTimeout(r, 300));
    const element = document.getElementById("question-paper");
    await html2pdf().set({
      margin: 0,
      filename: `${examData.title || "question-paper"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    }).from(element).save();
    setPdfCompact(false);
  };

  const labels = ["ক", "খ", "গ", "ঘ"];

  return (
    <>
      <style>{styles}</style>
      <div className="app-bg">

        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-inner">
            <div className="logo-wrap">
              <div className="logo-icon">📝</div>
              <div className="logo-text">
                <h1>প্রশ্নব্যাংক</h1>
                <p>Question Bank Builder</p>
              </div>
            </div>
            <div className="tab-group">
              <button className={`tab-btn${activeTab === "builder" ? " active" : ""}`} onClick={() => setActiveTab("builder")}>
                📝 Builder
              </button>
              <button className={`tab-btn${activeTab === "exams" ? " active" : ""}`} onClick={() => setActiveTab("exams")}>
                📋 Exam List
              </button>
            </div>
          </div>
        </div>

        {/* ── EXAM LIST TAB ── */}
        {activeTab === "exams" && (
          <div className="content">

            {stats && (
              <div className="stats-grid">
                {[
                  { label: "মোট Exam", value: stats.examCount, icon: "📝" },
                  { label: "মোট Submission", value: stats.submissionCount, icon: "✅" },
                  { label: "মোট Question", value: stats.questionCount, icon: "❓" }
                ].map((s, i) => (
                  <div className="stat-card" key={i}>
                    <div className="stat-icon-box">{s.icon}</div>
                    <div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="section-header">
              <div className="section-title">সব Exam তালিকা</div>
              <button className="refresh-btn" onClick={fetchExamList}>🔄 Refresh</button>
            </div>

            {loadingExams && <div className="loading-state">Loading...</div>}
            {!loadingExams && examList.length === 0 && <div className="empty-state">কোনো Exam পাওয়া যায়নি</div>}

            {examList.map(exam => (
              <div className="exam-card" key={exam._id}>
                <div style={{ flex: 1 }}>
                  <div className="exam-title">{exam.title}</div>
                  <div className="badge-row">
                    <span className="badge badge-blue">🔑 {exam.examCode}</span>
                    <span className="badge badge-green">❓ {exam.questions?.length || 0} প্রশ্ন</span>
                    <span className="badge badge-red">✅ {exam.submissionCount || 0} Submission</span>
                    <span className="badge badge-gray">⏱️ {exam.duration} মিনিট</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button className="action-btn action-btn-copy" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/exam/${exam.examCode}`); alert("Link Copied!"); }}>
                    📋 Copy Link
                  </button>
                  <a className="action-btn action-btn-rank" href={`/ranking/${exam.examCode}`} target="_blank" rel="noreferrer">
                    🏆 Ranking
                  </a>
                  <button className="action-btn action-btn-del" onClick={() => deleteExam(exam.examCode)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}

          </div>
        )}

        {/* ── BUILDER TAB ── */}
        {activeTab === "builder" && (
          <div className="content">

            {/* FORM CARD */}
            <div className="form-card">
              <div className="form-card-title">পরীক্ষার তথ্য পূরণ করুন</div>
              <div className="form-card-sub">নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন</div>

              <div className="form-grid">

                <div>
                  <label className="field-label">🏫 একাডেমি / কলেজের নাম</label>
                  <input className="field-input" type="text" name="academy" placeholder="যেমন: Saif Academy" value={examData.academy} onChange={handleChange} />
                </div>

                <div>
                  <label className="field-label">📋 পরীক্ষার নাম</label>
                  <input className="field-input" type="text" name="title" placeholder="যেমন: Model Test 2024" value={examData.title} onChange={handleChange} />
                </div>

                <div>
                  <label className="field-label">📚 বিষয়</label>
                  <input className="field-input" type="text" name="subject" value={examData.subject} onChange={handleChange} />
                </div>

                <div>
                  <label className="field-label">📖 অধ্যায়</label>
                  <select className="field-input" value={chapter} onChange={e => { setChapter(e.target.value); setSelected([]); setAllQuestions([]); setBoardYear(""); setBoardName(""); }}>
                    <option value="">অধ্যায় নির্বাচন করুন</option>
                    <option value="Introduction to ICT">Chapter 1 - ICT Introduction</option>
                    <option value="Communication Systems">Chapter 2 - Communication Systems</option>
                    <option value="Numbers & Digital Devices">Chapter 3 - Number System</option>
                    <option value="Web & HTML">Chapter 4 - Web & HTML</option>
                    <option value="Programming & Language">Chapter 5 - Programming</option>
                    <option value="Board Questions">🏆 Board Questions</option>
                  </select>

                  {chapter === "Board Questions" && (
                    <div style={{ marginTop: "14px" }}>
                      <label className="field-label">📅 Board Year</label>
                      <select className="field-input" value={boardYear} onChange={e => { setBoardYear(e.target.value); setSelected([]); setAllQuestions([]); setBoardName(""); }}>
                        <option value="">Select Year</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                      </select>
                    </div>
                  )}

                  {chapter === "Board Questions" && boardYear && (
                    <div style={{ marginTop: "14px" }}>
                      <label className="field-label">🏛️ Board Name</label>
                      <select className="field-input" value={boardName} onChange={e => { setSelected([]); setAllQuestions([]); setBoardName(e.target.value); }}>
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

                <div>
                  <label className="field-label">🎯 প্রশ্ন সংখ্যা</label>
                  <input className="field-input" type="number" name="marks" value={examData.marks} onChange={handleChange} />
                </div>

                <div>
                  <label className="field-label">⏱️ সময় (মিনিট)</label>
                  <input className="field-input" type="number" name="duration" value={examData.duration} onChange={handleChange} />
                </div>

              </div>
            </div>

            {/* QUESTION PANEL */}
            {questions.length > 0 && (
              <>
                <div className="q-panel-header">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>প্রশ্ন সিলেক্ট করুন</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>মোট {questions.length}টি প্রশ্ন পাওয়া গেছে</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="q-count-badge">✅ {selected.length} / {examData.marks}</div>
                    <button className="select-btn select-btn-all" onClick={selectAll}>সব Select</button>
                    <button className="select-btn select-btn-none" onClick={deselectAll}>সব Deselect</button>
                  </div>
                </div>

                {questions.map((q, index) => {
                  const active = selected.includes(q._id);
                  return (
                    <div key={q._id} className={`q-card${active ? " selected" : ""}`} onClick={() => toggleSelect(q._id)}>
                      <div className="q-num">{active ? "✓" : index + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div className="q-text">{q.question}</div>
                        {q.image && <img src={q.image} alt="question" className="q-img" />}
                        <div className="options-grid">
                          {q.options?.map((opt, idx) => (
                            <div key={idx} className="option-item">
                              <span className="option-label">{labels[idx]}.</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* ACTION BUTTONS */}
            {questions.length > 0 && (
              <div className="action-bar">
                <button className="main-btn main-btn-create" onClick={createExam}>🚀 অনলাইনে পরীক্ষা নিন</button>
                <button className="main-btn main-btn-pdf" onClick={downloadPDF}>📄 PDF Download</button>
              </div>
            )}

            {/* SUCCESS CARD */}
            {examCode && (
              <div className="success-card">
                <div className="success-icon">✅</div>
                <div className="success-title">Exam তৈরি সফল হয়েছে!</div>
                <div className="success-sub">নিচের লিংকটি স্টুডেন্টদের দিন</div>
                <div className="link-box">{window.location.origin}/exam/{examCode}</div>
                <div className="success-actions">
                  <button className="success-btn success-btn-copy" onClick={copyLink}>📋 Link Copy করুন</button>
                  <a className="success-btn success-btn-rank" href={`/ranking/${examCode}`} target="_blank" rel="noreferrer">🏆 View Ranking</a>
                </div>
              </div>
            )}

            {/* PRINTABLE PAPER */}
            <div id="question-paper" className="bg-white mt-10 shadow-xl mx-auto preview-paper">
              <style>{`
                @media screen and (max-width: 900px) { .preview-paper { width: 100%; padding: 14px; } }
                .question-block { width: 100%; margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; }
                .question-title { font-weight: 700; text-align: justify; }
                .option-line { display: flex; gap: 4px; align-items: flex-start; }
              `}</style>
              <div className="text-center border-b pb-3 mb-4">
                <div className="inline-block bg-black px-5 py-1 mb-2">
                  <h1 className={`text-white font-bold ${pdfCompact ? "text-base" : "text-2xl"}`}>{examData.subject}</h1>
                </div>
                <h2 className={`font-bold ${pdfCompact ? "text-sm" : "text-xl"}`}>{examData.academy}</h2>
                <p className={`text-gray-700 mt-1 ${pdfCompact ? "text-[10px]" : "text-sm"}`}>{examData.title}</p>
                <div className={`flex justify-between mt-3 border-t pt-2 ${pdfCompact ? "text-[9px]" : "text-sm"}`}>
                  <p>সময়: {examData.duration} মিনিট</p>
                  <p>পূর্ণমান: {examData.marks}</p>
                </div>
              </div>
              <div style={{ columnCount: 2, columnGap: pdfCompact ? "14px" : "28px" }}>
                {allQuestions.filter(q => selected.includes(q._id)).map((q, i) => (
                  <div key={q._id} className="question-block">
                    <h2 className="question-title" style={{ fontSize: pdfCompact ? "9px" : "12px", lineHeight: pdfCompact ? "14px" : "18px", marginBottom: "4px" }}>
                      {i + 1}. {q.question}
                    </h2>
                    {q.image && <img src={q.image} alt="question" style={{ maxWidth: "100%", marginBottom: "4px" }} />}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: pdfCompact ? "2px 8px" : "4px 14px", fontSize: pdfCompact ? "8px" : "10px", lineHeight: pdfCompact ? "12px" : "15px" }}>
                      {q.options?.map((opt, idx) => (
                        <div key={idx} className="option-line">
                          <span style={{ fontWeight: "bold" }}>{labels[idx]}.</span>
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
    </>
  );
}

export default Builder;