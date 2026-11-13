import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";

export default function StudentPerformance() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("This term (Sep–Nov)");

  const subjects = [
    { name: "ICT", score: 91, count: 4, trend: "▲ 4 pts", isUp: true },
    { name: "Physics", score: 84, count: 5, trend: "▲ 6 pts", isUp: true },
    { name: "Higher Math", score: 76, count: 3, trend: "1 missed", isUp: null },
    { name: "English", score: 74, count: 2, trend: "", isUp: null },
    { name: "Chemistry", score: 71, count: 4, trend: "▼ 3 pts", isUp: false },
    { name: "Biology", score: 69, count: 2, trend: "", isUp: null },
  ];

  const chaptersToFix = [
    { chapter: "ডেটা ট্রান্সমিশন মোড ও ব্যান্ডউইথ", subject: "ICT 1st paper", seen: 28, score: 54 },
    { chapter: "কমিউনিকেশন মিডিয়া (অপটিক্যাল ফাইবার)", subject: "ICT 1st paper", seen: 34, score: 58 },
    { chapter: "লজিক গেট ও ডিজিটাল ডিভাইস", subject: "ICT 1st paper", seen: 22, score: 62 },
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
            18 exams this term · HSC 2027 · Science
          </p>
        </div>

        {/* Period Selector */}
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

      {/* ── SUBJECT-WISE SUMMARY CARDS (matches PDF Page 11) ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#0F172A]">Subject-wise</h3>
          <span className="text-xs text-[#64748B]">Average score across all exams</span>
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
            <h3 className="text-base font-bold text-[#0F172A]">Score trend · ICT</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#2563EB] font-bold">
                <span className="w-3 h-0.5 bg-[#2563EB]"></span> You
              </span>
              <span className="flex items-center gap-1.5 text-[#94A3B8]">
                <span className="w-3 h-0.5 bg-[#CBD5E1] border-b border-dashed"></span> Batch average
              </span>
            </div>
          </div>

          {/* SVG Score Trend Graph */}
          <div className="w-full h-56 relative flex flex-col justify-between pt-4">
            <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              {/* Dotted Guide Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" />

              {/* Batch Average Curve (dashed gray) */}
              <path
                d="M 10 75 Q 120 70, 250 68 T 490 72"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Student Score Curve (bold blue) */}
              <path
                d="M 10 65 L 120 55 L 240 60 L 370 40 L 490 20"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="10" cy="65" r="4" fill="#2563EB" />
              <circle cx="120" cy="55" r="4" fill="#2563EB" />
              <circle cx="240" cy="60" r="4" fill="#2563EB" />
              <circle cx="370" cy="40" r="4" fill="#2563EB" />
              <circle cx="490" cy="20" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* X-axis date labels */}
            <div className="flex justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
              <span>12 Sep</span>
              <span>3 Oct</span>
              <span>24 Oct</span>
              <span>7 Nov</span>
              <span className="font-bold text-[#0F172A]">13 Nov · 91%</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Weakest Chapters */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] mb-4">Weakest chapters</h3>
            <div className="space-y-4">
              {chaptersToFix.map((ch, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-[#0F172A] truncate max-w-[180px]">{ch.chapter}</span>
                    <span className="font-extrabold text-[#EF4444]">{ch.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#EF4444] rounded-full" style={{ width: `${ch.score}%` }} />
                  </div>
                  <p className="text-[10px] text-[#64748B] mt-1">{ch.subject} · {ch.seen} questions seen</p>
                </div>
              ))}
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

      {/* ── CHAPTER ACCURACY HEATMAP (matches PDF Page 11) ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-base font-bold text-[#0F172A]">Chapter accuracy · ICT</h3>
          <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#2563EB]"></span> 80%+
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#93C5FD]"></span> 60–79%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#FDE68A]"></span> &lt;60%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                <th className="pb-3 text-left font-semibold">Chapter</th>
                <th className="pb-3 text-center font-semibold">WT 06</th>
                <th className="pb-3 text-center font-semibold">WT 07</th>
                <th className="pb-3 text-center font-semibold">WT 08</th>
                <th className="pb-3 text-center font-semibold">WT 09</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              <tr>
                <td className="py-2.5 font-medium text-[#0F172A]">কমিউনিকেশন সিস্টেম ও নেটওয়ার্কিং</td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#2563EB] text-white font-bold">90%</span></td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#2563EB] text-white font-bold">85%</span></td>
                <td className="py-2.5 text-center text-[#94A3B8]">—</td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#2563EB] text-white font-bold">88%</span></td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-[#0F172A]">সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস</td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#93C5FD] text-[#1E3A8A] font-bold">72%</span></td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#2563EB] text-white font-bold">80%</span></td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#93C5FD] text-[#1E3A8A] font-bold">76%</span></td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#2563EB] text-white font-bold">82%</span></td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-[#0F172A]">ওয়েব ডিজাইন পরিচিতি ও HTML</td>
                <td className="py-2.5 text-center text-[#94A3B8]">—</td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#93C5FD] text-[#1E3A8A] font-bold">64%</span></td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#93C5FD] text-[#1E3A8A] font-bold">70%</span></td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#93C5FD] text-[#1E3A8A] font-bold">68%</span></td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-[#0F172A]">প্রোগ্রামিং ভাষা (C Programming)</td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#FDE68A] text-[#92400E] font-bold">44%</span></td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#FDE68A] text-[#92400E] font-bold">50%</span></td>
                <td className="py-2.5 text-center text-[#94A3B8]">—</td>
                <td className="py-2.5 text-center"><span className="px-3 py-1 rounded bg-[#FDE68A] text-[#92400E] font-bold">49%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </StudentLayout>
  );
}
