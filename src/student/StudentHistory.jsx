import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "./StudentLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentHistory() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("All subjects");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");

  useEffect(() => {
    async function loadRealSubmissions() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/api/exams/student/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const subs = await res.json();
          if (Array.isArray(subs)) {
            const mapped = subs.map((s) => {
              const qCount = s.totalQuestions || 25;
              const pct = Math.round(((s.score || 0) / qCount) * 100);
              return {
                id: s._id,
                code: s.examCode,
                title: s.examId?.title || `ICT Model Test (${s.examCode})`,
                meta: `ICT · ${qCount} MCQ`,
                date: new Date(s.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                }),
                score: `${s.score} / ${qCount}`,
                percent: `${pct}%`,
                rank: "Recorded",
                time: "Completed",
                status: "Completed",
                action: "View",
              };
            });
            setHistoryList(mapped);
          }
        }
      } catch (e) {
        console.error("Submissions load error", e);
      } finally {
        setLoading(false);
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
            Every exam you've taken or submitted, newest first
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option>All subjects</option>
            <option>ICT</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option>All statuses</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      {/* ── HISTORY TABLE ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-card shadow-card overflow-hidden mb-6">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#64748B]">
            <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading your verified exam records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center p-6">
            <p className="text-sm font-bold text-[#0F172A]">No exam history recorded yet</p>
            <p className="text-xs text-[#64748B] mt-1">
              You haven't submitted any examinations yet. Complete a model test to track your performance history here.
            </p>
            <Link
              to="/exams"
              className="mt-4 inline-block px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Take an Available Exam
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                  <th className="py-3.5 px-6 font-semibold">Exam</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Score</th>
                  <th className="py-3.5 px-4 font-semibold text-center">%</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        to={`/exams/${item.code}/result`}
                        className="font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors block text-sm"
                      >
                        {item.title}
                      </Link>
                      <span className="text-[11px] text-[#64748B] mt-0.5 block">{item.meta}</span>
                    </td>

                    <td className="py-4 px-4 text-[#64748B] whitespace-nowrap">{item.date}</td>

                    <td className="py-4 px-4 text-center font-bold text-[#0F172A] whitespace-nowrap">
                      {item.score}
                    </td>

                    <td className="py-4 px-4 text-center font-semibold text-[#0F172A] whitespace-nowrap">
                      {item.percent}
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#059669] font-semibold text-[11px] rounded-md">
                        {item.status}
                      </span>
                    </td>

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
        )}
      </div>

    </StudentLayout>
  );
}
