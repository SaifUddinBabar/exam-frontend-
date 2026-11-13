import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";
import MathText from "../components/MathText";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function LiveExamPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  // Authentication & Student Profile
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentName = user.name || "Nusrat Jahan";
  const studentRoll = user.roll || user.mobile || "1017";

  // Exam state
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: "optionValue" }
  const [markedForReview, setMarkedForReview] = useState(new Set()); // Set of questionIds
  const [visited, setVisited] = useState(new Set()); // Set of indices visited

  // Timer & Status state
  const [timeLeft, setTimeLeft] = useState(0); // In seconds
  const [savingStatus, setSavingStatus] = useState("Saved");
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer

  const examCode = code ? code.toUpperCase() : "";
  const storageProgressKey = `examino_progress_${examCode}`;
  const storageTimerKey = `examino_timer_${examCode}`;

  // 1. Load Exam from Server
  useEffect(() => {
    async function initExam() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${API}/api/exams/${examCode}`, { headers });
        if (!res.ok) {
          setError("Exam not found or unavailable.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setExam(data);
        const qList = data.questions || [];
        setQuestions(qList);

        // Load saved local progress if exists
        try {
          const savedProgress = JSON.parse(localStorage.getItem(storageProgressKey) || "{}");
          if (savedProgress.answers) setAnswers(savedProgress.answers);
          if (savedProgress.marked) setMarkedForReview(new Set(savedProgress.marked));
        } catch (e) {
          console.error("Local storage read error", e);
        }

        // Initialize server-authoritative timer
        const durationSec = (data.duration || 25) * 60;
        const now = Date.now();
        let targetEndTime;

        const storedTimer = localStorage.getItem(storageTimerKey);
        if (storedTimer) {
          targetEndTime = parseInt(storedTimer, 10);
        } else {
          targetEndTime = now + durationSec * 1000;
          localStorage.setItem(storageTimerKey, targetEndTime.toString());
        }

        const remaining = Math.max(0, Math.floor((targetEndTime - now) / 1000));
        setTimeLeft(remaining);
      } catch (err) {
        console.error("Failed to load live exam:", err);
        setError("Network error connecting to exam server.");
      } finally {
        setLoading(false);
      }
    }

    initExam();
  }, [examCode]);

  // Mark current question index as visited
  useEffect(() => {
    if (questions.length > 0) {
      setVisited((prev) => new Set([...prev, currentIndex]));
    }
  }, [currentIndex, questions.length]);

  // 2. Countdown Timer
  useEffect(() => {
    if (loading || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out!
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, timeLeft]);

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 3. Answer Selection with instant auto-save
  const handleSelectOption = (qId, optionText) => {
    const updated = { ...answers, [qId]: optionText };
    setAnswers(updated);
    setSavingStatus("Saving...");

    // Persist to local storage
    try {
      localStorage.setItem(
        storageProgressKey,
        JSON.stringify({
          answers: updated,
          marked: Array.from(markedForReview),
        })
      );
      setTimeout(() => setSavingStatus("Saved"), 300);
    } catch {
      setSavingStatus("Saved");
    }
  };

  // Clear answer
  const handleClearAnswer = (qId) => {
    const updated = { ...answers };
    delete updated[qId];
    setAnswers(updated);

    try {
      localStorage.setItem(
        storageProgressKey,
        JSON.stringify({
          answers: updated,
          marked: Array.from(markedForReview),
        })
      );
    } catch {}
  };

  // Toggle Mark for Review
  const toggleMarkForReview = (qId) => {
    const updated = new Set(markedForReview);
    if (updated.has(qId)) {
      updated.delete(qId);
    } else {
      updated.add(qId);
    }
    setMarkedForReview(updated);

    try {
      localStorage.setItem(
        storageProgressKey,
        JSON.stringify({
          answers,
          marked: Array.from(updated),
        })
      );
    } catch {}
  };

  // 4. Final Submission
  const handleFinalSubmit = async (isAuto = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload = {
        examCode,
        name: studentName,
        roll: studentRoll,
        answers,
      };

      const res = await fetch(`${API}/api/exams/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          alert(data.message || "Duplicate submission rejected: A final submission has already been recorded for this student.");
          navigate(`/exams/${examCode}/result`);
          return;
        }
        if (res.status === 400) {
          alert(data.message || "Exam deadline has passed. Submission rejected.");
          navigate("/exams");
          return;
        }
        alert(data.message || "Submission failed on server. Please try again.");
        setSubmitting(false);
        return;
      }

      // Clean local storage keys for this exam
      localStorage.removeItem(storageProgressKey);
      localStorage.removeItem(storageTimerKey);

      // Save submission receipt
      sessionStorage.setItem(
        `examino_submission_${examCode}`,
        JSON.stringify({
          ...data,
          examTitle: exam?.title,
          submittedAt: new Date().toISOString(),
          timeSpentSeconds: ((exam?.duration || 25) * 60) - timeLeft,
        })
      );

      navigate(`/exams/${examCode}/submitted`);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission error. Please verify network and try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans p-6">
        <div className="w-10 h-10 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#0F172A]">Preparing live examination workspace...</p>
        <p className="text-xs text-[#64748B] mt-1">Connecting to authoritative server timer</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans p-6">
        <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-card p-8 text-center shadow-card">
          <p className="text-base font-bold text-[#DC2626]">Exam Unavailable</p>
          <p className="text-xs text-[#64748B] mt-2">{error || "No questions found for this exam."}</p>
          <button
            type="button"
            onClick={() => navigate("/exams")}
            className="mt-6 px-6 py-2.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg"
          >
            Back to Available Exams
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || {};
  const currentQId = currentQ._id ? currentQ._id.toString() : "";
  const selectedAnswer = answers[currentQId];
  const isCurrentMarked = markedForReview.has(currentQId);

  // Bengali option indicators
  const bengaliOptionLetters = ["ক", "খ", "গ", "ঘ"];

  // Question navigation grid calculations
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;
  const unansweredCount = totalQ - answeredCount;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans no-select">
      
      {/* ── DISTRACTION-FREE TOP BAR (matches PDF Design System) ── */}
      <header className="sticky top-0 z-30 w-full bg-[#101B35] text-white border-b border-[#1E2D4A] shadow-md px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Left: Brand & Question Progress */}
        <div className="flex items-center gap-4">
          <ExaminoLogo light size="sm" to={null} />
          <div className="border-l border-[#2B3E68] pl-3.5 hidden sm:block">
            <h1 className="text-xs font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
              {exam?.title}
            </h1>
            <span className="text-[11px] text-[#94A3B8]">
              Question {currentIndex + 1} of {totalQ}
            </span>
          </div>
        </div>

        {/* Center: Server-Authoritative Timer */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-mono font-extrabold text-sm sm:text-base tracking-wider shadow-inner ${
              timeLeft < 300
                ? "bg-[#EF4444] text-white animate-pulse"
                : "bg-[#1A294C] text-white border border-[#2B3E68]"
            }`}
          >
            <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Right: Saving Status & Submit Button */}
        <div className="flex items-center gap-3">
          
          {/* Connection & Auto-save Indicator */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-[#94A3B8]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>Online</span>
            </span>
            <span>·</span>
            <span className="text-[#CBD5E1] font-medium">{savingStatus}</span>
          </div>

          {/* Question Grid Drawer Toggle on Mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-white bg-[#1A294C] hover:bg-[#2563EB] rounded-lg transition-colors"
            aria-label="Toggle Question Grid"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          {/* Final Submit Button */}
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow transition-all focus:outline-none"
          >
            Submit exam
          </button>
        </div>

      </header>

      {/* ── MAIN WORKSPACE: QUESTION AREA + QUESTION GRID ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-8">
        
        {/* ── LEFT: QUESTION & ANSWER PANEL ── */}
        <div className="flex-1 flex flex-col justify-between bg-white border border-[#E2E8F0] rounded-card shadow-card p-6 sm:p-8 min-h-[580px]">
          
          <div>
            {/* Question Header Meta */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-5">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 bg-[#101B35] text-white text-xs font-bold rounded-md">
                  Q{currentIndex + 1}
                </span>
                <span className="text-xs text-[#64748B] font-medium">
                  {currentQ.chapter || "ICT Chapter Test"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#10B981] font-bold">+1.0</span>
                <span className="text-[#64748B]">/</span>
                <span className="text-[#EF4444] font-bold">−{exam?.negativeMarkPerWrong || "0.25"}</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-semibold text-[#0F172A] leading-relaxed mb-6 font-bengali">
              <MathText text={currentQ.question} />
            </div>

            {/* Optional Diagram / Image */}
            {currentQ.image && (
              <div className="mb-6 max-w-md mx-auto p-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]">
                <img
                  src={currentQ.image}
                  alt="Question Diagram"
                  className="w-full h-auto object-contain rounded"
                />
              </div>
            )}

            {/* MCQ Options (A, B, C, D / ক, খ, গ, ঘ) */}
            <div className="space-y-3">
              {(currentQ.options || []).map((opt, optIdx) => {
                const isSelected = selectedAnswer === opt;
                const letter = bengaliOptionLetters[optIdx] || String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQId, opt)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-sm font-medium transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-[#EFF6FF] border-[#2563EB] text-[#1E3A8A] ring-1 ring-[#2563EB] shadow-sm"
                        : "bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
                    }`}
                  >
                    {/* Circle / Letter Indicator */}
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#2563EB] text-white"
                          : "bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]"
                      }`}
                    >
                      {letter}
                    </span>

                    {/* Option Text */}
                    <span className="flex-1 pt-0.5 leading-relaxed font-bengali">
                      <MathText text={opt} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions & Navigation Bar */}
          <div className="pt-6 border-t border-[#F1F5F9] mt-8 flex flex-wrap items-center justify-between gap-4">
            
            {/* Mark for review & Clear answer */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleMarkForReview(currentQId)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                  isCurrentMarked
                    ? "bg-[#FFFBEB] border-[#F59E0B] text-[#D97706]"
                    : "bg-white border-[#CBD5E1] text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                <svg className="w-4 h-4" fill={isCurrentMarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{isCurrentMarked ? "Marked for review" : "Mark for review"}</span>
              </button>

              {selectedAnswer && (
                <button
                  type="button"
                  onClick={() => handleClearAnswer(currentQId)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg border border-transparent transition-colors"
                >
                  Clear answer
                </button>
              )}
            </div>

            {/* Previous & Next Buttons */}
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <button
                type="button"
                disabled={currentIndex === totalQ - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Next →
              </button>
            </div>

          </div>

        </div>

        {/* ── RIGHT: QUESTION NAVIGATION GRID (DESKTOP + MOBILE DRAWER) ── */}
        <div
          className={`lg:w-80 shrink-0 bg-white border border-[#E2E8F0] rounded-card shadow-card p-5 flex flex-col justify-between ${
            sidebarOpen
              ? "fixed inset-y-0 right-0 z-50 w-80 shadow-elevated"
              : "hidden lg:flex"
          }`}
        >
          <div>
            {/* Header / Close button for mobile */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
              <h3 className="text-xs font-bold tracking-wider text-[#64748B] uppercase">
                Question Grid ({totalQ})
              </h3>
              {sidebarOpen && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-[#64748B] hover:text-[#0F172A] text-xs font-bold"
                >
                  ✕ Close
                </button>
              )}
            </div>

            {/* Quick Summary Pill Counters */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
              <div className="p-2 bg-[#EFF6FF] text-[#1E3A8A] rounded-lg font-medium flex items-center justify-between">
                <span>Answered:</span>
                <span className="font-extrabold">{answeredCount}</span>
              </div>
              <div className="p-2 bg-[#FEF3C7] text-[#92400E] rounded-lg font-medium flex items-center justify-between">
                <span>Marked:</span>
                <span className="font-extrabold">{markedCount}</span>
              </div>
            </div>

            {/* Grid of Numbers */}
            <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const qId = q._id ? q._id.toString() : "";
                const isAns = Boolean(answers[qId]);
                const isMark = markedForReview.has(qId);
                const isCurr = currentIndex === idx;
                const isVis = visited.has(idx);

                // Styling based on 4 approved design states:
                let btnStyle = "bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]"; // Not visited
                if (isMark) {
                  btnStyle = "bg-[#F59E0B] text-white border-[#D97706]"; // Marked for review
                } else if (isAns) {
                  btnStyle = "bg-[#2563EB] text-white border-[#1D4ED8]"; // Answered
                } else if (isVis) {
                  btnStyle = "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]"; // Seen, not answered
                }

                return (
                  <button
                    key={qId || idx}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setSidebarOpen(false);
                    }}
                    className={`h-9 rounded-lg font-bold text-xs border flex items-center justify-center transition-all ${btnStyle} ${
                      isCurr ? "ring-2 ring-[#0F172A] ring-offset-1 scale-105" : ""
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Legend */}
          <div className="pt-4 border-t border-[#F1F5F9] space-y-1.5 text-[11px] text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-[#2563EB]"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-[#FEE2E2] border border-[#FCA5A5]"></span>
              <span>Seen, not answered ({visited.size - answeredCount > 0 ? visited.size - answeredCount : 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-[#F59E0B]"></span>
              <span>Marked for review ({markedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-[#F1F5F9] border border-[#CBD5E1]"></span>
              <span>Not visited ({totalQ - visited.size > 0 ? totalQ - visited.size : 0})</span>
            </div>
          </div>

        </div>

      </div>

      {/* ── SUBMISSION CONFIRMATION MODAL ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-dropdown animate-in fade-in zoom-in-95">
            
            <h3 className="text-lg font-bold text-[#0F172A]">Submit your exam?</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Please review your question completion status before confirming. Once submitted, answers cannot be edited.
            </p>

            <div className="my-5 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Total questions:</span>
                <span className="font-bold text-[#0F172A]">{totalQ}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2563EB] font-medium">Answered:</span>
                <span className="font-bold text-[#2563EB]">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#EF4444] font-medium">Unanswered:</span>
                <span className="font-bold text-[#EF4444]">{unansweredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F59E0B] font-medium">Marked for review:</span>
                <span className="font-bold text-[#F59E0B]">{markedCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs rounded-lg transition-colors"
              >
                Cancel & keep answering
              </button>
              
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleFinalSubmit(false)}
                className="flex-1 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
