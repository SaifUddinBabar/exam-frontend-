import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [selectedSubject, setSelectedSubject] = useState("All");

  const subjects = ["All", "ICT", "Physics", "Chemistry", "Higher Math", "Biology", "English"];

  useEffect(() => {
    async function loadExams() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/api/exams/student/available`, { headers });
        if (res.ok) {
          const data = await res.json();
          setExams(data);
        }
      } catch (err) {
        console.error("Failed to load exams:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  // Filter exams by tab, search, and subject
  const filteredExams = exams.filter((exam) => {
    // Subject filter
    if (selectedSubject !== "All") {
      const matchSubject = (exam.title + " " + exam.description).toLowerCase().includes(selectedSubject.toLowerCase());
      if (!matchSubject) return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchQuery =
        exam.title.toLowerCase().includes(q) ||
        (exam.description && exam.description.toLowerCase().includes(q)) ||
        exam.examCode.toLowerCase().includes(q);
      if (!matchQuery) return false;
    }

    return true;
  });

  return (
    <StudentLayout>
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Exams
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Assigned by Nobodoy Academic Care to HSC 2027 · Science · Batch A
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or chapter"
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
          <svg
            className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* ── STATUS TABS (matches PDF Page 4) ── */}
      <div className="flex items-center gap-6 border-b border-[#E2E8F0] pb-3 mb-5 overflow-x-auto text-xs sm:text-sm font-semibold text-[#64748B]">
        <button
          type="button"
          onClick={() => setActiveTab("available")}
          className={`pb-3 -mb-3 transition-colors ${
            activeTab === "available"
              ? "text-[#2563EB] border-b-2 border-[#2563EB]"
              : "hover:text-[#0F172A]"
          }`}
        >
          Available now <span className="text-[#2563EB] font-bold">({exams.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={`pb-3 -mb-3 transition-colors ${
            activeTab === "upcoming"
              ? "text-[#2563EB] border-b-2 border-[#2563EB]"
              : "hover:text-[#0F172A]"
          }`}
        >
          Upcoming <span className="text-[#64748B] font-normal">(4)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`pb-3 -mb-3 transition-colors ${
            activeTab === "completed"
              ? "text-[#2563EB] border-b-2 border-[#2563EB]"
              : "hover:text-[#0F172A]"
          }`}
        >
          Completed <span className="text-[#64748B] font-normal">(3)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("missed")}
          className={`pb-3 -mb-3 transition-colors ${
            activeTab === "missed"
              ? "text-[#2563EB] border-b-2 border-[#2563EB]"
              : "hover:text-[#0F172A]"
          }`}
        >
          Missed <span className="text-[#64748B] font-normal">(1)</span>
        </button>
      </div>

      {/* ── SUBJECT FILTER PILLS ── */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {subjects.map((sub) => {
          const isSelected = selectedSubject === sub;
          return (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                isSelected
                  ? "bg-[#0F172A] text-white shadow-sm"
                  : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
              }`}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* ── EXAMS GRID ── */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#64748B]">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading real exams from question bank...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="py-16 text-center bg-white border border-[#E2E8F0] rounded-card p-8">
          <p className="text-sm font-semibold text-[#0F172A]">No exams found matching your filter.</p>
          <p className="text-xs text-[#64748B] mt-1">Try resetting the subject filter or search terms.</p>
          <button
            type="button"
            onClick={() => { setSelectedSubject("All"); setSearch(""); }}
            className="mt-4 px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const isScheduled = exam.examType === "scheduled";
            const isPractice = exam.examType === "practice";

            return (
              <div
                key={exam._id || exam.examCode}
                className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card hover:shadow-elevated transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    {isScheduled ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#ECFDF5] text-[#059669] text-[11px] font-bold rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                        Live
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-semibold rounded-md">
                        Practice
                      </span>
                    )}

                    <span className="text-[11px] font-medium text-[#64748B]">
                      {isScheduled ? "Closes in 38:20" : "Open till 30 Nov"}
                    </span>
                  </div>

                  {/* Subject Tag */}
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    ICT
                  </p>

                  {/* Title */}
                  <h3 className="text-base font-bold text-[#0F172A] tracking-tight leading-snug line-clamp-2">
                    {exam.title}
                  </h3>

                  {/* Metadata */}
                  <p className="text-xs text-[#64748B] mt-2 line-clamp-2">
                    {exam.description || `ICT 1st paper · ${exam.totalQuestions || 25} MCQ · ${exam.duration} min · −${exam.negativeMarkPerWrong || "0"}`}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-[#F1F5F9] mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#64748B]">
                    {isScheduled
                      ? "1 attempt · 126 enrolled"
                      : exam.allowRetake
                      ? "Unlimited attempts"
                      : "1 of 1 attempts"}
                  </span>

                  <button
                    type="button"
                    onClick={() => navigate(`/exams/${exam.examCode}/details`)}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    {isScheduled ? "Start exam" : "Start practice"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </StudentLayout>
  );
}
