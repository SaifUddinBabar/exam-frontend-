import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentHistory() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState("All subjects");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");

  // Sample history data combined with actual submissions
  const [historyList, setHistoryList] = useState([
    {
      code: "EXAM-ICT-01",
      title: "HSC 2027 ICT — Model Test 01 (Communication Systems)",
      meta: "ICT 1st paper · 25 MCQ",
      date: "13 Nov",
      score: "22.5 / 25",
      percent: "90.0%",
      rank: "4 / 126",
      time: "21:30",
      status: "Completed",
      action: "View",
    },
    {
      code: "EXAM-ICT-02",
      title: "ICT — Number Systems & Digital Device Drill",
      meta: "ICT · 15 MCQ",
      date: "12 Nov",
      score: "14.0 / 15",
      percent: "93.3%",
      rank: "2 / 104",
      time: "12:15",
      status: "Completed",
      action: "View",
    },
    {
      code: "EXAM-ICT-04",
      title: "ICT — Introduction to ICT Weekly Test",
      meta: "ICT · 20 MCQ",
      date: "11 Nov",
      score: "—",
      percent: "—",
      rank: "—",
      time: "—",
      status: "Missed",
      action: "Solutions",
    },
    {
      code: "EXAM-ICT-03",
      title: "HSC ICT — বিগত বোর্ড প্রশ্নমালা সমন্বিত টেস্ট",
      meta: "ICT · 30 MCQ",
      date: "9 Nov",
      score: "27.5 / 30",
      percent: "91.6%",
      rank: "5 / 138",
      time: "24:40",
      status: "Completed",
      action: "View",
    },
    {
      code: "EXAM-PHY-03",
      title: "HSC 2027 Physics — Model Test 03",
      meta: "Physics 1st paper · 40 MCQ",
      date: "7 Nov",
      score: "35.5 / 40",
      percent: "88.8%",
      rank: "6 / 124",
      time: "37:10",
      status: "Completed",
      action: "View",
    },
    {
      code: "EXAM-ENG-05",
      title: "English 1st paper — Grammar Set 05",
      meta: "English · 30 MCQ",
      date: "5 Nov",
      score: "22 / 30",
      percent: "73.3%",
      rank: "19 / 120",
      time: "24:40",
      status: "Completed",
      action: "View",
    },
  ]);

  useEffect(() => {
    async function loadRealSubmissions() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API}/api/exams/student/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const subs = await res.json();
          if (subs && subs.length > 0) {
            const mapped = subs.map((s) => ({
              code: s.examCode,
              title: s.examId?.title || `ICT Model Test (${s.examCode})`,
              meta: `ICT · ${s.totalQuestions} MCQ`,
              date: new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
              score: `${s.score} / ${s.totalQuestions}`,
              percent: `${Math.round((s.score / s.totalQuestions) * 100)}%`,
              rank: "4 / 126",
              time: "21:30",
              status: "Completed",
              action: "View",
            }));

            // Merge with existing
            setHistoryList((prev) => [...mapped, ...prev.slice(mapped.length)]);
          }
        }
      } catch (e) {
        console.error("Submissions load error", e);
      }
    }
    loadRealSubmissions();
  }, []);

  const filtered = historyList.filter((item) => {
    if (selectedSubject !== "All subjects") {
      if (!item.title.toLowerCase().includes(selectedSubject.toLowerCase())) return false;
    }
    if (selectedStatus !== "All statuses") {
      if (item.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    }
    return true;
  });

  return (
    <StudentLayout>
      {/* ── HEADER & FILTERS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Exam history
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Every exam you've taken or missed, newest first
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subject Dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option>All subjects</option>
            <option>ICT</option>
            <option>Physics</option>
            <option>English</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option>All statuses</option>
            <option>Completed</option>
            <option>Missed</option>
          </select>
        </div>
      </div>

      {/* ── HISTORY TABLE (matches PDF Page 12) ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-card shadow-card overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                <th className="py-3.5 px-6 font-semibold">Exam</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold text-center">Score</th>
                <th className="py-3.5 px-4 font-semibold text-center">%</th>
                <th className="py-3.5 px-4 font-semibold text-center">Rank</th>
                <th className="py-3.5 px-4 font-semibold text-center">Time</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                  
                  {/* Exam Details */}
                  <td className="py-4 px-6">
                    <Link
                      to={`/exams/${item.code}/result`}
                      className="font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors block text-sm"
                    >
                      {item.title}
                    </Link>
                    <span className="text-[11px] text-[#64748B] mt-0.5 block">{item.meta}</span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-[#64748B] whitespace-nowrap">{item.date}</td>

                  {/* Score */}
                  <td className="py-4 px-4 text-center font-bold text-[#0F172A] whitespace-nowrap">
                    {item.score}
                  </td>

                  {/* % */}
                  <td className="py-4 px-4 text-center font-semibold text-[#0F172A] whitespace-nowrap">
                    {item.percent}
                  </td>

                  {/* Rank */}
                  <td className="py-4 px-4 text-center text-[#64748B] whitespace-nowrap">
                    {item.rank}
                  </td>

                  {/* Time */}
                  <td className="py-4 px-4 text-center text-[#64748B] whitespace-nowrap">
                    {item.time}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    {item.status === "Completed" && (
                      <span className="px-2.5 py-1 bg-[#F1F5F9] text-[#0F172A] font-semibold text-[11px] rounded-md border border-[#E2E8F0]">
                        Completed
                      </span>
                    )}
                    {item.status === "Missed" && (
                      <span className="px-2.5 py-1 bg-[#FEF2F2] text-[#DC2626] font-semibold text-[11px] rounded-md">
                        Missed
                      </span>
                    )}
                    {item.status.includes("Result") && (
                      <span className="px-2.5 py-1 bg-[#FFFBEB] text-[#D97706] font-semibold text-[11px] rounded-md">
                        {item.status}
                      </span>
                    )}
                  </td>

                  {/* Action Link */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <Link
                      to={`/exams/${item.code}/result`}
                      className="text-[#2563EB] font-bold text-xs hover:underline"
                    >
                      {item.action}
                    </Link>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
          <span>Showing 1–{filtered.length} of {filtered.length} exams</span>
          <div className="flex items-center gap-1">
            <button type="button" className="w-7 h-7 rounded bg-[#101B35] text-white font-bold flex items-center justify-center">1</button>
            <button type="button" className="w-7 h-7 rounded hover:bg-[#F1F5F9] flex items-center justify-center">2</button>
            <button type="button" className="w-7 h-7 rounded hover:bg-[#F1F5F9] flex items-center justify-center">3</button>
          </div>
        </div>
      </div>

    </StudentLayout>
  );
}
