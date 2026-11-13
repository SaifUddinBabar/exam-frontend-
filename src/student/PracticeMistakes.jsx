import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import MathText from "../components/MathText";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PracticeMistakes() {
  const navigate = useNavigate();

  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterChapter, setFilterChapter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedSolutions, setRevealedSolutions] = useState({});

  useEffect(() => {
    async function loadMistakes() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/api/practice/mistakes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setMistakes(data.questions || []);
        }
      } catch (err) {
        console.error("Failed to load mistakes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMistakes();
  }, []);

  // Distinct chapters in mistake set
  const distinctChapters = Array.from(new Set(mistakes.map((m) => m.chapter).filter(Boolean)));

  const filteredMistakes = mistakes.filter((m) => {
    const matchChapter = filterChapter === "All" || m.chapter === filterChapter;
    const matchSearch =
      !searchQuery.trim() ||
      m.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.topic && m.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchChapter && matchSearch;
  });

  const toggleSolution = (id) => {
    setRevealedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Launch practice session specifically with these mistake questions
  const handlePracticeMistakes = () => {
    if (filteredMistakes.length === 0) return;

    const practiceQuestions = filteredMistakes.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      subject: q.subject,
      chapter: q.chapter,
      topic: q.topic,
      difficulty: q.difficulty,
      image: q.image || "",
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
    }));

    const sessionPayload = {
      sessionId: `mistake_drill_${Date.now()}`,
      title: `Mistake Recovery Drill (${practiceQuestions.length} Questions)`,
      mode: "practice",
      durationMinutes: 0,
      totalQuestions: practiceQuestions.length,
      questions: practiceQuestions,
    };

    sessionStorage.setItem("current_practice_set", JSON.stringify(sessionPayload));
    navigate("/practice/session");
  };

  return (
    <StudentLayout>
      {/* ── HEADER BREADCRUMB ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/practice" className="text-xs font-semibold text-[#2563EB] hover:underline">
              Practice Zone
            </Link>
            <span className="text-xs text-[#94A3B8]">/</span>
            <span className="text-xs text-[#64748B]">Mistake Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Practice Mistakes & Weak Spots
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Review and master questions you answered incorrectly in exams and practice tests
          </p>
        </div>

        {filteredMistakes.length > 0 && (
          <button
            type="button"
            onClick={handlePracticeMistakes}
            className="px-5 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            <span>Practice These {filteredMistakes.length} Mistakes</span>
          </button>
        )}
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search mistakes by question text or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs sm:text-sm text-[#0F172A] focus:bg-white focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="All">All Chapters ({mistakes.length})</option>
            {distinctChapters.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── MISTAKES LIST ── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#EF4444] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#64748B]">Loading your mistakes record...</p>
        </div>
      ) : mistakes.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-card p-12 text-center shadow-card">
          <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">Zero Mistakes Recorded!</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-6">
            You currently have no recorded mistakes. Take practice tests or scheduled model exams, and any missed questions will appear here for targeted review.
          </p>
          <Link
            to="/practice/create"
            className="px-5 py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-lg shadow hover:bg-[#1D4ED8]"
          >
            Start Practice Test
          </Link>
        </div>
      ) : filteredMistakes.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-card p-8 text-center shadow-card">
          <p className="text-xs font-semibold text-[#64748B]">No mistakes found matching this chapter or search query.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-12">
          {filteredMistakes.map((q, idx) => {
            const isRevealed = Boolean(revealedSolutions[q._id]);

            return (
              <div
                key={q._id}
                className="bg-white border border-[#FCA5A5]/60 hover:border-[#EF4444] rounded-card p-5 shadow-card transition-all"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F5F9]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] rounded">
                      Mistake #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded">
                      {q.subject}
                    </span>
                    {q.chapter && (
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-[#F1F5F9] text-[#475569] rounded max-w-[200px] truncate">
                        {q.chapter}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSolution(q._id)}
                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    {isRevealed ? "Hide Explanation" : "View Correct Solution"}
                  </button>
                </div>

                <div className="text-sm font-bold text-[#0F172A] leading-relaxed mb-4 font-bengali">
                  <MathText text={q.question} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {q.options.map((opt, optIdx) => {
                    const letters = ["A", "B", "C", "D"];
                    const isCorrect = isRevealed && opt === q.correctAnswer;

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg border text-xs sm:text-sm font-bengali ${
                          isCorrect
                            ? "bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-semibold"
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]"
                        }`}
                      >
                        <span className="font-sans font-bold mr-2 text-[#64748B]">
                          {letters[optIdx]}.
                        </span>
                        <MathText text={opt} />
                      </div>
                    );
                  })}
                </div>

                {isRevealed && (
                  <div className="mt-3 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#059669]">Correct Answer:</span>
                      <span className="font-extrabold text-[#0F172A] font-bengali">{q.correctAnswer}</span>
                    </div>

                    {q.explanation && (
                      <div className="text-[#475569] leading-relaxed pt-2 border-t border-[#E2E8F0]/70 font-bengali">
                        <span className="font-bold text-[#0F172A] block mb-1 font-sans">Explanation:</span>
                        <MathText text={q.explanation} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}
