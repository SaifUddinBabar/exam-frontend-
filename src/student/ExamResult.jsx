import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import StudentLayout from "./StudentLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ExamResult() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try reading cached submission result from session storage
    const cached = sessionStorage.getItem(`examino_submission_${code.toUpperCase()}`);
    if (cached) {
      try {
        setResult(JSON.parse(cached));
      } catch (e) {}
    }

    // Also fetch leaderboard ranking to get student's real rank in cohort
    async function fetchRank() {
      try {
        const res = await fetch(`${API}/api/exams/ranking/${code.toUpperCase()}`);
        if (res.ok) {
          const rankData = await res.json();
          // Find student rank
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const idx = rankData.findIndex((r) => r.name === user.name || r.roll === user.roll);
          if (idx !== -1) {
            setResult((prev) => ({
              ...prev,
              cohortRank: idx + 1,
              cohortTotal: rankData.length,
            }));
          }
        }
      } catch (err) {
        console.error("Rank fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRank();
  }, [code]);

  const score = result?.score !== undefined ? result.score : 22.5;
  const totalQ = result?.totalQuestions || 25;
  const correct = result?.correctCount !== undefined ? result.correctCount : 23;
  const wrong = result?.wrongCount !== undefined ? result.wrongCount : 2;
  const unattempted = result?.unattemptedCount !== undefined ? result.unattemptedCount : (totalQ - correct - wrong);
  const percentage = Math.round((score / totalQ) * 100) || 90;
  const rank = result?.cohortRank || 4;
  const totalStudents = result?.cohortTotal || 126;

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <StudentLayout>
      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-2 text-xs text-[#64748B] mb-4">
        <Link to="/results" className="hover:text-[#2563EB]">Results</Link>
        <span>/</span>
        <span className="text-[#0F172A] font-medium">{result?.examTitle || `ICT — Model Test (${code.toUpperCase()})`}</span>
      </nav>

      {/* ── HEADER WITH ACTIONS (matches PDF Page 8) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {result?.examTitle || `HSC 2027 ICT — Model Test (${code.toUpperCase()})`}
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Published Today · ICT 1st paper · {totalQ} MCQ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download report (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/exams/${code.toUpperCase()}/review`)}
            className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-2"
          >
            <span>Review answers</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* ── TOP SCORE & POSITION HERO (matches PDF Page 8) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Left: Circular Score Badge Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-6 sm:p-8 shadow-card flex items-center gap-6 sm:gap-8">
          
          {/* Circular Badge */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-8 border-[#2563EB] flex flex-col items-center justify-center shrink-0 shadow-inner">
            <span className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
              {percentage}%
            </span>
            <span className="text-[10px] font-bold text-[#64748B] uppercase">score</span>
          </div>

          {/* Score Details */}
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-[#ECFDF5] text-[#059669] text-xs font-bold rounded-md mb-2">
              Passed · pass mark {Math.ceil(totalQ * 0.4)}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                {score}
              </span>
              <span className="text-base text-[#64748B] font-medium">/ {totalQ}</span>
            </div>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              Obtained marks after −{(wrong * 0.25).toFixed(2)} negative marking
            </p>
          </div>

        </div>

        {/* Right: Position Card (Navy #101B35) */}
        <div className="bg-[#101B35] text-white rounded-card p-6 sm:p-8 shadow-elevated flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold tracking-wider text-[#94A3B8] uppercase">
              Position
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {rank}
              </span>
              <span className="text-sm font-medium text-[#94A3B8]">of {totalStudents}</span>
            </div>
          </div>

          <p className="text-xs text-[#CBD5E1] mt-4 leading-relaxed">
            Top 3% of HSC 2027 · Science · Batch A. Highest score {totalQ - 0.75}, batch average {(totalQ * 0.65).toFixed(1)}.
          </p>
        </div>

      </div>

      {/* ── 6 METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        
        <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card">
          <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Correct</span>
          <p className="text-xl font-extrabold text-[#10B981] mt-1">{correct}</p>
          <span className="text-[11px] text-[#64748B]">+{correct}.00 marks</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card">
          <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Incorrect</span>
          <p className="text-xl font-extrabold text-[#EF4444] mt-1">{wrong}</p>
          <span className="text-[11px] text-[#EF4444]">−{(wrong * 0.25).toFixed(2)} marks</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card">
          <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Unanswered</span>
          <p className="text-xl font-extrabold text-[#64748B] mt-1">{unattempted}</p>
          <span className="text-[11px] text-[#64748B]">0 marks</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card">
          <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Negative</span>
          <p className="text-xl font-extrabold text-[#EF4444] mt-1">−{(wrong * 0.25).toFixed(2)}</p>
          <span className="text-[11px] text-[#64748B]">0.25 × {wrong} wrong</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card">
          <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Time taken</span>
          <p className="text-xl font-extrabold text-[#0F172A] mt-1">21:30</p>
          <span className="text-[11px] text-[#64748B]">51s per question</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card">
          <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Accuracy</span>
          <p className="text-xl font-extrabold text-[#0F172A] mt-1">92.0%</p>
          <span className="text-[11px] text-[#64748B]">{correct} of {correct + wrong}</span>
        </div>

      </div>

      {/* ── CHAPTER-WISE BREAKDOWN TABLE (matches PDF Page 8) ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card mb-8">
        <h3 className="text-base font-bold text-[#0F172A] mb-4">Chapter-wise breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                <th className="pb-3 font-semibold">Chapter</th>
                <th className="pb-3 font-semibold text-center">Qs</th>
                <th className="pb-3 font-semibold text-center">Correct</th>
                <th className="pb-3 font-semibold text-center">Wrong</th>
                <th className="pb-3 font-semibold text-center">Skipped</th>
                <th className="pb-3 font-semibold text-center">Marks</th>
                <th className="pb-3 font-semibold text-right w-44">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              <tr>
                <td className="py-3.5 font-bold text-[#0F172A]">অধ্যায় ২ — কমিউনিকেশন সিস্টেম ও নেটওয়ার্কিং</td>
                <td className="py-3.5 text-center text-[#64748B]">25</td>
                <td className="py-3.5 text-center font-bold text-[#10B981]">{correct}</td>
                <td className="py-3.5 text-center font-bold text-[#EF4444]">{wrong}</td>
                <td className="py-3.5 text-center text-[#64748B]">{unattempted}</td>
                <td className="py-3.5 text-center font-extrabold text-[#0F172A]">{score}</td>
                <td className="py-3.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <div className="w-24 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="font-extrabold text-[#0F172A] w-8">{percentage}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TWO-COLUMN REVISIT & COMPARISON ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Questions to Revisit */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
          <h3 className="text-base font-bold text-[#0F172A] mb-3">Questions to revisit</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
              <span className="text-xs font-semibold text-[#0F172A]">Q7 · অপটিক্যাল ফাইবারের প্রতিসরণাঙ্ক</span>
              <span className="px-2 py-0.5 bg-[#EF4444] text-white text-[10px] font-bold rounded">Wrong</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
              <span className="text-xs font-semibold text-[#0F172A]">Q18 · হাফ ডুপ্লেক্স ডেটা ট্রান্সমিশন মোড</span>
              <span className="px-2 py-0.5 bg-[#EF4444] text-white text-[10px] font-bold rounded">Wrong</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/exams/${code.toUpperCase()}/review`)}
            className="w-full mt-4 py-2 bg-[#F8FAFC] border border-[#CBD5E1] hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] rounded-lg transition-colors"
          >
            Review all answers and solutions
          </button>
        </div>

        {/* Comparison with Previous Exam */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
          <h3 className="text-base font-bold text-[#0F172A] mb-3">Compared with Previous Test</h3>
          <div className="divide-y divide-[#F1F5F9] text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Score</span>
              <span className="font-bold text-[#0F172A]">20.0 → 22.5 (▲ +2.5)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Rank</span>
              <span className="font-bold text-[#10B981]">6 → 4 ▲</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Time taken</span>
              <span className="font-bold text-[#10B981]">24:10 → 21:30 ▲</span>
            </div>
          </div>
          <Link
            to="/results"
            className="block text-center mt-4 text-xs font-semibold text-[#2563EB] hover:underline"
          >
            See full performance analysis →
          </Link>
        </div>

      </div>

    </StudentLayout>
  );
}
