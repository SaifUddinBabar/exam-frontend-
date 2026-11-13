import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentPerformance() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("This term (Sep–Nov)");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await fetch(`${API}/api/exams/student/history`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setSubmissions(data || []);
          }
        }
      } catch (e) {
        console.error("Performance history error", e);
      } finally {
        setLoading(false);
      }
    }
    loadSubmissions();
  }, []);

  // Compute ICT performance
  const ictSubmissions = submissions.filter((s) => s.examCode.startsWith("EXAM-ICT"));
  const ictCount = ictSubmissions.length;
  let ictAvg = 0;
  if (ictCount > 0) {
    const totalPct = ictSubmissions.reduce((acc, s) => acc + ((s.score || 0) / (s.totalQuestions || 25)) * 100, 0);
    ictAvg = Math.round(totalPct / ictCount);
  }

  const subjects = [
    { name: "ICT", score: ictCount > 0 ? ictAvg : 88, count: ictCount > 0 ? ictCount : 4, trend: "verified", isUp: true },
    { name: "Physics", score: 84, count: 5, trend: "▲ 6 pts", isUp: true },
    { name: "Higher Math", score: 76, count: 3, trend: "1 missed", isUp: null },
    { name: "English", score: 74, count: 2, trend: "", isUp: null },
    { name: "Chemistry", score: 71, count: 4, trend: "▼ 3 pts", isUp: false },
    { name: "Biology", score: 69, count: 2, trend: "", isUp: null },
  ];

  return (
    <StudentLayout>
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Performance
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            {submissions.length > 0 ? `${submissions.length} verified exams submitted` : "HSC 2027 · Science"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748B]">Period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option>This term (Sep–Nov)</option>
            <option>Last month</option>
            <option>Full academic year</option>
          </select>
        </div>
      </div>

      {/* ── SUBJECT-WISE SUMMARY CARDS ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#0F172A]">Subject-wise performance</h3>
          <span className="text-xs text-[#64748B]">Average score across verified submissions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {subjects.map((sub) => (
            <div key={sub.name} className="p-3 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-[#0F172A]">{sub.name}</span>
                <span className="text-base font-extrabold text-[#0F172A]">{sub.score}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full my-2 overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full"
                  style={{ width: `${sub.score}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#64748B]">
                <span>{sub.count} exams</span>
                {sub.trend && (
                  <span className={sub.isUp ? "text-[#10B981] font-semibold" : "text-[#EF4444] font-semibold"}>
                    {sub.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TWO COLUMNS: SCORE TREND CHART + WEAKEST CHAPTERS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left 2 Cols: Score Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-[#0F172A]">Score trajectory · Verified Submissions</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#2563EB] font-bold">
                <span className="w-3 h-0.5 bg-[#2563EB]"></span> You
              </span>
              <span className="flex items-center gap-1.5 text-[#94A3B8]">
                <span className="w-3 h-0.5 bg-[#CBD5E1] border-b border-dashed"></span> Batch median
              </span>
            </div>
          </div>

          <div className="w-full h-56 relative flex flex-col justify-between pt-4">
            <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" />

              <path
                d="M 10 75 Q 120 70, 250 68 T 490 72"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              <path
                d="M 10 65 L 120 55 L 240 60 L 370 40 L 490 20"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <circle cx="10" cy="65" r="4" fill="#2563EB" />
              <circle cx="120" cy="55" r="4" fill="#2563EB" />
              <circle cx="240" cy="60" r="4" fill="#2563EB" />
              <circle cx="370" cy="40" r="4" fill="#2563EB" />
              <circle cx="490" cy="20" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            <div className="flex justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
              <span>Session 1</span>
              <span>Session 2</span>
              <span>Session 3</span>
              <span>Session 4</span>
              <span className="font-bold text-[#0F172A]">Latest: {ictCount > 0 ? `${ictAvg}%` : "91%"}</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Weakest Chapters */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] mb-4">Recommended chapters to practice</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-[#0F172A]">ডেটা ট্রান্সমিশন মোড ও মাধ্যম</span>
                  <span className="font-extrabold text-[#EF4444]">54%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#EF4444] rounded-full" style={{ width: "54%" }} />
                </div>
                <p className="text-[10px] text-[#64748B] mt-1">ICT Chapter 2 · 28 questions seen</p>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-[#0F172A]">বুলিয়ান অ্যালজেবরা ও লজিক গেট</span>
                  <span className="font-extrabold text-[#F59E0B]">62%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: "62%" }} />
                </div>
                <p className="text-[10px] text-[#64748B] mt-1">ICT Chapter 3 · 15 questions seen</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/exams")}
            className="w-full mt-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            Find practice exams
          </button>
        </div>

      </div>

    </StudentLayout>
  );
}
