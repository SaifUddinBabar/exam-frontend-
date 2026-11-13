import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import MathText from "../components/MathText";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PracticeSessionPage() {
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("current_practice_set") || "null");
    } catch {
      return null;
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [revealedSolutions, setRevealedSolutions] = useState({});
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Timer logic for timed test mode
  const durationMinutes = sessionData?.durationMinutes || 0;
  const isTimed = durationMinutes > 0;
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!sessionData || !sessionData.questions || sessionData.questions.length === 0) {
      return;
    }

    if (!isTimed || evaluationResult) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionData, isTimed, evaluationResult]);

  if (!sessionData || !sessionData.questions || sessionData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-2">No Active Practice Session Found</h2>
        <p className="text-xs text-[#64748B] max-w-sm mb-6">
          Your practice session may have expired or not yet been created. Configure a new practice test to begin.
        </p>
        <Link
          to="/practice/create"
          className="px-6 py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-lg shadow hover:bg-[#1D4ED8] transition-colors"
        >
          Create Practice Test
        </Link>
      </div>
    );
  }

  const questions = sessionData.questions;
  const currentQ = questions[currentIndex];
  const isPracticeMode = sessionData.mode === "practice";

  // Handle option click
  const handleSelectOption = (opt) => {
    if (evaluationResult) return; // Prevent changing after test submit
    setAnswers((prev) => ({
      ...prev,
      [currentQ._id]: opt,
    }));

    if (isPracticeMode) {
      // Automatically reveal explanation in Practice Mode
      setRevealedSolutions((prev) => ({
        ...prev,
        [currentQ._id]: true,
      }));
    }
  };

  // Toggle mark for review
  const toggleMark = (qId) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Toggle bookmark
  const toggleBookmark = async (qId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sign in to save questions to your bookmarks.");
      return;
    }
    try {
      const res = await fetch(`${API}/api/practice/bookmarks/${qId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (data.isBookmarked) next.add(qId);
          else next.delete(qId);
          return next;
        });
      }
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    }
  };

  // Submit test (for Test Mode or Finishing Practice Mode)
  const handleSubmitTest = async () => {
    if (submitting || evaluationResult) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      const res = await fetch(`${API}/api/practice/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          answers,
          timeSpentSeconds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEvaluationResult(data);
      } else {
        alert(data.message || "Failed to submit practice test");
      }
    } catch (err) {
      console.error("Submit test error:", err);
      alert("Network error while submitting practice test");
    } finally {
      setSubmitting(false);
    }
  };

  // Format timer seconds
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Render Post-Evaluation Summary View if Test Mode is submitted
  if (evaluationResult) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 text-[11px] font-bold bg-[#ECFDF5] text-[#059669] rounded-full inline-block mb-1">
                Assessment Completed
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                Practice Performance Report
              </h1>
              <p className="text-xs text-[#64748B] mt-1">{sessionData.title}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/practice/create"
                className="px-4 py-2 bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold rounded-lg hover:bg-[#F8FAFC]"
              >
                New Test
              </Link>
              <Link
                to="/practice"
                className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg shadow hover:bg-[#1D4ED8]"
              >
                Practice Hub
              </Link>
            </div>
          </div>

          {/* 4 Performance Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
              <span className="text-[11px] font-semibold text-[#64748B]">Score</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
                {evaluationResult.score} <span className="text-xs text-[#94A3B8]">/ {evaluationResult.totalQuestions}</span>
              </p>
              <span className="text-[10px] text-[#64748B] mt-1 block">Standard grading</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
              <span className="text-[11px] font-semibold text-[#64748B]">Accuracy</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#10B981] mt-1">
                {evaluationResult.accuracy}%
              </p>
              <span className="text-[10px] text-[#64748B] mt-1 block">Attempted accuracy</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
              <span className="text-[11px] font-semibold text-[#64748B]">Correct / Wrong</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
                <span className="text-[#10B981]">{evaluationResult.correctCount}</span>
                <span className="text-xs text-[#94A3B8]"> / </span>
                <span className="text-[#EF4444]">{evaluationResult.wrongCount}</span>
              </p>
              <span className="text-[10px] text-[#94A3B8] mt-1 block">
                {evaluationResult.unattemptedCount} Unattempted
              </span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
              <span className="text-[11px] font-semibold text-[#64748B]">Time Spent</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1 font-mono">
                {formatTime(evaluationResult.timeSpentSeconds)}
              </p>
              <span className="text-[10px] text-[#64748B] mt-1 block">Total duration</span>
            </div>
          </div>

          {/* Solutions & Answer Review Section */}
          <div className="space-y-4 pt-4">
            <h2 className="text-base font-bold text-[#0F172A]">Detailed Solutions & Explanations</h2>

            {evaluationResult.questions.map((q, idx) => {
              const isCorrect = q.isCorrect;
              const isUnattempted = !q.studentAnswer;

              return (
                <div
                  key={q._id}
                  className={`bg-white border rounded-card p-5 shadow-card ${
                    isCorrect
                      ? "border-[#A7F3D0]"
                      : isUnattempted
                      ? "border-[#E2E8F0]"
                      : "border-[#FCA5A5]"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-[#F1F5F9] text-[#0F172A]">
                        #{idx + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                          isCorrect
                            ? "bg-[#ECFDF5] text-[#059669]"
                            : isUnattempted
                            ? "bg-[#F1F5F9] text-[#64748B]"
                            : "bg-[#FEF2F2] text-[#DC2626]"
                        }`}
                      >
                        {isCorrect ? "Correct" : isUnattempted ? "Unattempted" : "Incorrect"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(q._id)}
                      className="text-[#F59E0B] hover:text-[#D97706] text-xs font-semibold flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      <span>Save Question</span>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = opt === q.correctAnswer;
                      const isOptionChosen = opt === q.studentAnswer;

                      let optClass = "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]";
                      if (isOptionCorrect) {
                        optClass = "bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-semibold";
                      } else if (isOptionChosen && !isOptionCorrect) {
                        optClass = "bg-[#FEF2F2] border-[#EF4444] text-[#991B1B] line-through";
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-lg border text-xs sm:text-sm font-bengali ${optClass}`}>
                          <MathText text={opt} />
                          {isOptionChosen && (
                            <span className="block text-[10px] font-sans font-bold mt-1 text-[#64748B]">
                              Your Selection
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bengali leading-relaxed text-[#475569]">
                      <span className="font-bold text-[#0F172A] block mb-1 font-sans">Explanation:</span>
                      <MathText text={q.explanation} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-6 pb-12 flex justify-center gap-4">
            <Link
              to="/practice"
              className="px-6 py-3 bg-[#2563EB] text-white font-bold text-xs rounded-xl shadow"
            >
              Return to Practice Zone
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Live Exam & Practice Runner View
  const selectedAnswer = answers[currentQ._id];
  const isAnswered = Boolean(selectedAnswer);
  const isMarked = Boolean(markedForReview[currentQ._id]);
  const isBookmarked = bookmarkedIds.has(currentQ._id);
  const showSolution = isPracticeMode && isAnswered;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* ── TOP STICKY BAR ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Title & Mode Badge */}
          <div className="flex items-center gap-3">
            <Link
              to="/practice"
              className="text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors"
              title="Exit Practice"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                    isPracticeMode ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#EFF6FF] text-[#2563EB]"
                  }`}
                >
                  {isPracticeMode ? "Practice Mode" : "Test Mode"}
                </span>
                <span className="text-xs font-bold text-[#0F172A] truncate max-w-xs sm:max-w-md">
                  {sessionData.title}
                </span>
              </div>
            </div>
          </div>

          {/* Right Timer & Finish Action */}
          <div className="flex items-center gap-4">
            {isTimed && (
              <div
                className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 ${
                  secondsRemaining < 120
                    ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626] animate-pulse"
                    : "bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]"
                }`}
              >
                <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmitTest}
              disabled={submitting}
              className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg shadow transition-colors"
            >
              {submitting ? "Grading..." : isPracticeMode ? "Finish Practice" : "Final Submit"}
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Cols: Active Question Card */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card space-y-5">
            
            {/* Question Top Info Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F172A]">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-[#94A3B8]">·</span>
                <span className="text-xs text-[#64748B] font-semibold">{currentQ.subject}</span>
                {currentQ.difficulty && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded uppercase">
                    {currentQ.difficulty}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mark for Review Toggle */}
                <button
                  type="button"
                  onClick={() => toggleMark(currentQ._id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                    isMarked
                      ? "bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]"
                      : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                  }`}
                >
                  {isMarked ? "★ Marked" : "☆ Mark for Review"}
                </button>

                {/* Bookmark Toggle */}
                <button
                  type="button"
                  onClick={() => toggleBookmark(currentQ._id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isBookmarked
                      ? "bg-[#FFFBEB] border-[#FDE68A] text-[#F59E0B]"
                      : "bg-white border-[#E2E8F0] text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                  }`}
                  title="Bookmark question"
                >
                  <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-bold text-[#0F172A] leading-relaxed font-bengali">
              <MathText text={currentQ.question} />
            </div>

            {/* Optional Image */}
            {currentQ.image && (
              <div className="max-w-md rounded-xl overflow-hidden border border-[#E2E8F0] p-2 bg-[#F8FAFC]">
                <img
                  src={currentQ.image.startsWith("http") ? currentQ.image : `${API}${currentQ.image}`}
                  alt="Question Diagram"
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            )}

            {/* 4 Interactive Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, i) => {
                const letters = ["A", "B", "C", "D"];
                const isSelected = selectedAnswer === opt;

                let cardStyle = "bg-white border-[#CBD5E1] text-[#0F172A] hover:border-[#2563EB]";
                let badgeStyle = "bg-[#F1F5F9] text-[#64748B]";

                if (isPracticeMode && isAnswered) {
                  // In Practice Mode with answer selected:
                  if (opt === currentQ.correctAnswer) {
                    cardStyle = "bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-semibold ring-1 ring-[#10B981]";
                    badgeStyle = "bg-[#10B981] text-white";
                  } else if (isSelected && opt !== currentQ.correctAnswer) {
                    cardStyle = "bg-[#FEF2F2] border-[#EF4444] text-[#991B1B] font-semibold ring-1 ring-[#EF4444]";
                    badgeStyle = "bg-[#EF4444] text-white";
                  }
                } else if (isSelected) {
                  // In Test Mode (or practice before answer):
                  cardStyle = "bg-[#EFF6FF] border-[#2563EB] text-[#1E40AF] font-semibold ring-1 ring-[#2563EB]";
                  badgeStyle = "bg-[#2563EB] text-white";
                }

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all focus:outline-none ${cardStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${badgeStyle}`}
                    >
                      {letters[i]}
                    </span>
                    <div className="font-bengali leading-relaxed">
                      <MathText text={opt} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Immediate Explanation Display in Practice Mode */}
            {showSolution && (
              <div className="mt-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#059669]">
                    {selectedAnswer === currentQ.correctAnswer ? "✓ Correct Answer!" : "✗ Incorrect"}
                  </span>
                  <span className="text-xs text-[#64748B]">·</span>
                  <span className="text-xs font-extrabold text-[#0F172A] font-bengali">
                    Correct: {currentQ.correctAnswer}
                  </span>
                </div>

                {currentQ.explanation && (
                  <div className="text-xs text-[#475569] leading-relaxed pt-2 border-t border-[#E2E8F0]/70 font-bengali">
                    <span className="font-bold text-[#0F172A] block mb-1 font-sans">Explanation:</span>
                    <MathText text={currentQ.explanation} />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Nav Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-bold rounded-lg hover:bg-[#F8FAFC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                &larr; Previous
              </button>

              <span className="text-xs text-[#94A3B8]">
                {Object.keys(answers).length} of {questions.length} Answered
              </span>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow transition-colors"
                >
                  Next &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg shadow transition-colors"
                >
                  {isPracticeMode ? "Finish Drill" : "Submit Test"}
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Right 1 Col: Question Grid Palette */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card sticky top-24 space-y-4">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider pb-2 border-b border-[#F1F5F9]">
              Question Tracker
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#2563EB]" />
                <span className="text-[#64748B]">Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#FFFBEB] border border-[#FDE68A]" />
                <span className="text-[#64748B]">Marked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#F1F5F9] border border-[#CBD5E1]" />
                <span className="text-[#64748B]">Unvisited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded ring-2 ring-[#2563EB] bg-white" />
                <span className="text-[#64748B]">Current</span>
              </div>
            </div>

            {/* Grid of Question Numbers */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const hasAnswer = Boolean(answers[q._id]);
                const marked = Boolean(markedForReview[q._id]);
                const isCurrent = idx === currentIndex;

                let pillColor = "bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B]";
                if (hasAnswer) {
                  pillColor = "bg-[#2563EB] border-[#2563EB] text-white";
                } else if (marked) {
                  pillColor = "bg-[#FFFBEB] border-[#FDE68A] text-[#D97706] font-bold";
                }

                return (
                  <button
                    key={q._id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg border text-xs font-bold flex items-center justify-center transition-all ${pillColor} ${
                      isCurrent ? "ring-2 ring-offset-1 ring-[#0F172A]" : ""
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={submitting}
                className="w-full py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg shadow transition-colors"
              >
                {isPracticeMode ? "Complete Session" : "Final Submit"}
              </button>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
}
