import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import MathText from "../components/MathText";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SavedQuestions() {
  const navigate = useNavigate();

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChapter, setFilterChapter] = useState("All");
  const [revealedSolutions, setRevealedSolutions] = useState({});

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/api/practice/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setBookmarks(data.bookmarks || []);
        }
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (qId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/practice/bookmarks/${qId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBookmarks((prev) => prev.filter((b) => b.question?._id !== qId));
      }
    } catch (err) {
      console.error("Remove bookmark error:", err);
    }
  };

  const toggleSolution = (id) => {
    setRevealedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Launch practice session specifically with saved questions
  const handlePracticeSaved = () => {
    if (filteredBookmarks.length === 0) return;

    const practiceQuestions = filteredBookmarks.map((b) => ({
      _id: b.question._id,
      question: b.question.question,
      options: b.question.options,
      subject: b.question.subject,
      chapter: b.question.chapter,
      topic: b.question.topic,
      difficulty: b.question.difficulty,
      image: b.question.image || "",
      correctAnswer: b.question.correctAnswer,
      explanation: b.question.explanation || "",
    }));

    const sessionPayload = {
      sessionId: `saved_drill_${Date.now()}`,
      title: `Saved Questions Drill (${practiceQuestions.length} Questions)`,
      mode: "practice",
      durationMinutes: 0,
      totalQuestions: practiceQuestions.length,
      questions: practiceQuestions,
    };

    sessionStorage.setItem("current_practice_set", JSON.stringify(sessionPayload));
    navigate("/practice/session");
  };

  // Distinct chapters in bookmarks
  const distinctChapters = Array.from(
    new Set(bookmarks.map((b) => b.question?.chapter).filter(Boolean))
  );

  const filteredBookmarks = bookmarks.filter((b) => {
    const q = b.question;
    if (!q) return false;
    const matchChapter = filterChapter === "All" || q.chapter === filterChapter;
    const matchSearch =
      !searchQuery.trim() ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchChapter && matchSearch;
  });

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
            <span className="text-xs text-[#64748B]">Saved Questions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Saved & Bookmarked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Your personal repository of challenging questions, formulas, and key concepts
          </p>
        </div>

        {filteredBookmarks.length > 0 && (
          <button
            type="button"
            onClick={handlePracticeSaved}
            className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            <span>Practice These {filteredBookmarks.length} Saved Questions</span>
          </button>
        )}
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search saved questions by concept or question text..."
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
            <option value="All">All Chapters ({bookmarks.length})</option>
            {distinctChapters.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── BOOKMARK CARDS LIST ── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#64748B]">Loading your saved questions...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-card p-12 text-center shadow-card">
          <div className="w-12 h-12 rounded-full bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">No Saved Questions Yet</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-6">
            Bookmark any question from the Question Bank or Practice Tests to save it for quick review and dedicated revision drills.
          </p>
          <Link
            to="/question-bank"
            className="px-5 py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-lg shadow hover:bg-[#1D4ED8]"
          >
            Browse Question Bank
          </Link>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-card p-8 text-center shadow-card">
          <p className="text-xs font-semibold text-[#64748B]">No saved questions match this chapter or search query.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-12">
          {filteredBookmarks.map((b, idx) => {
            const q = b.question;
            const isRevealed = Boolean(revealedSolutions[q._id]);

            return (
              <div
                key={b.bookmarkId || q._id}
                className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-card p-5 shadow-card transition-all"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F5F9]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-[#FFFBEB] text-[#D97706] rounded">
                      Saved #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded">
                      {q.subject}
                    </span>
                    {q.chapter && (
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-[#F1F5F9] text-[#475569] rounded max-w-[200px] truncate">
                        {q.chapter}
                      </span>
                    )}
                    {q.difficulty && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded">
                        {q.difficulty}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveBookmark(q._id)}
                    className="text-[#EF4444] hover:text-[#DC2626] text-xs font-semibold flex items-center gap-1"
                    title="Remove from saved bookmarks"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>

                <div className="text-sm font-bold text-[#0F172A] leading-relaxed mb-4 font-bengali">
                  <MathText text={q.question} />
                </div>

                {q.image && (
                  <div className="mb-4 max-w-sm rounded-lg overflow-hidden border border-[#E2E8F0] p-2 bg-[#F8FAFC]">
                    <img
                      src={q.image.startsWith("http") ? q.image : `${API}${q.image}`}
                      alt="Question diagram"
                      className="w-full h-auto max-h-56 object-contain"
                    />
                  </div>
                )}

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

                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSolution(q._id)}
                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    {isRevealed ? "Hide Explanation" : "View Answer & Explanation"}
                  </button>
                  {q.topic && (
                    <span className="text-[11px] text-[#94A3B8] font-medium truncate max-w-xs">
                      Topic: {q.topic}
                    </span>
                  )}
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
