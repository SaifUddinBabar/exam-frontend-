import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import MathText from "../components/MathText";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentQuestionBank() {
  const [metadata, setMetadata] = useState({ subjects: [], boards: [], boardYears: [], classes: [] });
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedChapter, setSelectedChapter] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedBoard, setSelectedBoard] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedClass, setSelectedClass] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [bookmarkingId, setBookmarkingId] = useState(null);

  // Language / Medium Mode State ("bangla" | "english")
  const [languageMode, setLanguageMode] = useState(() => {
    return localStorage.getItem("examino_language_mode") || "bangla";
  });

  // Listen for global languageModeChanged events
  useEffect(() => {
    const handleModeUpdate = (e) => {
      const newMode = e.detail?.mode || localStorage.getItem("examino_language_mode") || "bangla";
      setLanguageMode(newMode);
      setSelectedChapter("All");
      setSelectedTopic("All");
      setCurrentPage(1);
    };
    window.addEventListener("languageModeChanged", handleModeUpdate);
    return () => window.removeEventListener("languageModeChanged", handleModeUpdate);
  }, []);

  const switchLanguageMode = (mode) => {
    if (mode === languageMode) return;
    setLanguageMode(mode);
    localStorage.setItem("examino_language_mode", mode);
    setSelectedChapter("All");
    setSelectedTopic("All");
    setCurrentPage(1);
    window.dispatchEvent(new CustomEvent("languageModeChanged", { detail: { mode } }));
  };

  // Load filter metadata when languageMode changes
  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await fetch(`${API}/api/practice/metadata?version=${languageMode}`);
        if (res.ok) {
          const data = await res.json();
          setMetadata(data);
        }
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    }
    loadMeta();
  }, [languageMode]);

  // Compute available chapters based on selected subject
  const currentSubjectObj = metadata.subjects.find((s) => s.name === selectedSubject) || metadata.subjects[0];
  const availableChapters = currentSubjectObj ? currentSubjectObj.chapters : [];

  // Compute available topics based on selected chapter
  const currentChapterObj = availableChapters.find((c) => c.name === selectedChapter);
  const availableTopics = currentChapterObj ? currentChapterObj.topics : [];

  // Reset dependent filters when parent filter changes
  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
    setSelectedChapter("All");
    setSelectedTopic("All");
    setCurrentPage(1);
  };

  const handleChapterChange = (e) => {
    setSelectedChapter(e.target.value);
    setSelectedTopic("All");
    setCurrentPage(1);
  };

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setCurrentPage(1);
  };

  // Fetch paginated questions from backend API
  useEffect(() => {
    let isCancelled = false;
    async function fetchQuestions() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const params = new URLSearchParams({
          page: currentPage,
          limit: 15,
          version: languageMode,
        });

        if (selectedSubject !== "All") params.append("subject", selectedSubject);
        if (selectedChapter !== "All") params.append("chapter", selectedChapter);
        if (selectedTopic !== "All") params.append("topic", selectedTopic);
        if (selectedDifficulty !== "All") params.append("difficulty", selectedDifficulty);
        if (selectedBoard !== "All") params.append("boardName", selectedBoard);
        if (selectedYear !== "All") params.append("boardYear", selectedYear);
        if (selectedClass !== "All") params.append("className", selectedClass);
        if (searchQuery.trim()) params.append("search", searchQuery.trim());

        const res = await fetch(`${API}/api/practice/question-bank?${params.toString()}`, { headers });
        if (res.ok && !isCancelled) {
          const data = await res.json();
          setQuestions(data.questions || []);
          setTotalQuestions(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    const timer = setTimeout(fetchQuestions, 250); // debounce search
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    currentPage,
    selectedSubject,
    selectedChapter,
    selectedTopic,
    selectedDifficulty,
    selectedBoard,
    selectedYear,
    selectedClass,
    searchQuery,
    languageMode,
  ]);

  // Toggle answer revelation per question card
  const toggleAnswer = (id) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle bookmark
  const handleToggleBookmark = async (qId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to save questions to your bookmarks.");
      return;
    }

    setBookmarkingId(qId);
    try {
      const res = await fetch(`${API}/api/practice/bookmarks/${qId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions((prev) =>
          prev.map((q) => (q._id === qId ? { ...q, isBookmarked: data.isBookmarked } : q))
        );
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    } finally {
      setBookmarkingId(null);
    }
  };

  const resetAllFilters = () => {
    setSelectedSubject("All");
    setSelectedChapter("All");
    setSelectedTopic("All");
    setSelectedDifficulty("All");
    setSelectedBoard("All");
    setSelectedYear("All");
    setSelectedClass("All");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <StudentLayout>
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/practice" className="text-xs font-semibold text-[#2563EB] hover:underline">
              Practice Zone
            </Link>
            <span className="text-xs text-[#94A3B8]">/</span>
            <span className="text-xs text-[#64748B]">Question Bank</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Examino Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Browse, filter, and study over {totalQuestions.toLocaleString()} authentic curriculum questions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/saved-questions"
            className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            Saved Questions
          </Link>

          <Link
            to="/practice/create"
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Practice Test
          </Link>
        </div>
      </div>

      {/* ── MEDIUM / LANGUAGE MODE NOTICE & QUICK SELECTOR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 mb-5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs font-semibold text-[#0F172A]">
            Current Curriculum:{" "}
            <span className="font-bold text-[#2563EB]">
              {languageMode === "english" ? "🇬🇧 English Medium (Chorcha & Model Practice)" : "🇧🇩 বাংলা মাধ্যম (NCTB ও বোর্ড প্রশ্নসমূহ)"}
            </span>
          </span>
          <span className="text-xs font-medium text-[#64748B]">
            ({totalQuestions.toLocaleString()} questions)
          </span>
        </div>

        {/* Quick Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs text-[#64748B] font-medium mr-1">Switch:</span>
          <button
            type="button"
            onClick={() => switchLanguageMode("bangla")}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
              languageMode === "bangla"
                ? "bg-[#15803D] text-white border-[#15803D] shadow-xs"
                : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-white"
            }`}
          >
            🇧🇩 বাংলা
          </button>
          <button
            type="button"
            onClick={() => switchLanguageMode("english")}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
              languageMode === "english"
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-white"
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS CARD ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <svg
            className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search questions by keyword, topic, or concept in Bengali or English..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>

        {/* Dependent Filter Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Subject */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={handleSubjectChange}
              className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="All">All Subjects</option>
              {metadata.subjects.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.totalQuestions})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Chapter (Dependent on Subject) */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              Chapter
            </label>
            <select
              value={selectedChapter}
              onChange={handleChapterChange}
              className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB] truncate"
            >
              <option value="All">All Chapters</option>
              {availableChapters.map((ch) => (
                <option key={ch.name} value={ch.name}>
                  {ch.name} ({ch.questionCount})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Topic (Dependent on Chapter) */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-3">
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              Topic
            </label>
            <select
              value={selectedTopic}
              onChange={handleTopicChange}
              disabled={selectedChapter === "All" || availableTopics.length === 0}
              className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB] truncate disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]"
            >
              <option value="All">
                {selectedChapter === "All" ? "Select a chapter first" : "All Topics in Chapter"}
              </option>
              {availableTopics.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Board Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              Board
            </label>
            <select
              value={selectedBoard}
              onChange={(e) => {
                setSelectedBoard(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="All">All Boards</option>
              {metadata.boards.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Board Year */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              Board Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="All">All Years</option>
              {metadata.boardYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Difficulty */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="All">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* 7. Class */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              Class / Level
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="All">All Classes</option>
              {metadata.classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters CTA */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 flex items-end">
            <button
              type="button"
              onClick={resetAllFilters}
              className="w-full py-1.5 px-3 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] text-xs font-semibold rounded-lg transition-colors text-center"
            >
              Clear all filters
            </button>
          </div>
        </div>
      </div>

      {/* ── QUESTION RESULTS HEADER ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs sm:text-sm font-semibold text-[#64748B]">
          Showing {questions.length > 0 ? (currentPage - 1) * 15 + 1 : 0}–
          {Math.min(currentPage * 15, totalQuestions)} of {totalQuestions} questions
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8]">Page {currentPage} of {totalPages}</span>
        </div>
      </div>

      {/* ── QUESTION CARDS LIST ── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#64748B]">Loading questions from Examino Question Bank...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-card p-12 text-center shadow-card">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">No questions match your current filters</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-4">
            Try loosening the chapter, topic, or board filters to view more questions from the bank.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg shadow"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {questions.map((q, idx) => {
            const questionNumber = (currentPage - 1) * 15 + idx + 1;
            const isRevealed = Boolean(revealedAnswers[q._id]);
            const isBookmarked = Boolean(q.isBookmarked);

            return (
              <div
                key={q._id}
                className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card hover:border-[#CBD5E1] transition-all"
              >
                {/* Card Meta Badges & Bookmark */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#F1F5F9]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] rounded">
                      #{questionNumber}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded">
                      {q.subject}
                    </span>
                    {q.chapter && (
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-[#F1F5F9] text-[#475569] rounded max-w-[200px] truncate">
                        {q.chapter}
                      </span>
                    )}
                    {q.boardName && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] rounded">
                        {q.boardName} {q.boardYear}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        q.difficulty === "easy"
                          ? "bg-[#ECFDF5] text-[#059669]"
                          : q.difficulty === "hard"
                          ? "bg-[#FEF2F2] text-[#DC2626]"
                          : "bg-[#FFFBEB] text-[#D97706]"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(q._id)}
                    disabled={bookmarkingId === q._id}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isBookmarked
                        ? "bg-[#FFFBEB] border-[#FDE68A] text-[#F59E0B]"
                        : "bg-white border-[#E2E8F0] text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                    }`}
                    title={isBookmarked ? "Saved in bookmarks" : "Save question"}
                  >
                    <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>

                {/* Question Text */}
                <div className="text-sm sm:text-base font-bold text-[#0F172A] leading-relaxed mb-4 font-bengali">
                  <MathText text={q.question} />
                </div>

                {/* Optional Image */}
                {q.image && (
                  <div className="mb-4 max-w-sm rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] p-2">
                    <img
                      src={q.image.startsWith("http") ? q.image : `${API}${q.image}`}
                      alt="Question Diagram"
                      className="w-full h-auto object-contain max-h-56"
                    />
                  </div>
                )}

                {/* MCQ 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {q.options.map((opt, optIdx) => {
                    const letters = ["A", "B", "C", "D"];
                    const isCorrect = opt === q.correctAnswer;
                    const showColor = isRevealed && isCorrect;

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs sm:text-sm transition-all ${
                          showColor
                            ? "bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-semibold"
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            showColor
                              ? "bg-[#10B981] text-white"
                              : "bg-[#E2E8F0] text-[#64748B]"
                          }`}
                        >
                          {letters[optIdx]}
                        </span>
                        <div className="font-bengali leading-snug">
                          <MathText text={opt} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Solution Reveal Accordion Toggle */}
                <div className="pt-2 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleAnswer(q._id)}
                    className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1.5 focus:outline-none"
                  >
                    <span>{isRevealed ? "Hide Answer & Solution" : "View Answer & Explanation"}</span>
                    <svg
                      className={`w-3.5 h-3.5 transform transition-transform ${isRevealed ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {q.topic && (
                    <span className="text-[11px] text-[#94A3B8] font-medium truncate max-w-xs">
                      Topic: {q.topic}
                    </span>
                  )}
                </div>

                {/* Revealed Answer Box */}
                {isRevealed && (
                  <div className="mt-3 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#059669]">Correct Answer:</span>
                      <span className="font-extrabold text-[#0F172A] font-bengali">{q.correctAnswer}</span>
                    </div>

                    {q.explanation ? (
                      <div className="text-[#475569] leading-relaxed pt-2 border-t border-[#E2E8F0]/60 font-bengali">
                        <span className="font-semibold text-[#0F172A] block mb-1">Explanation:</span>
                        <MathText text={q.explanation} />
                      </div>
                    ) : (
                      <div className="text-[#94A3B8] italic pt-1">
                        No additional explanation provided for this question.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── PAGINATION CONTROLS ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-12">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            &larr; Previous
          </button>

          <span className="px-4 py-2 text-xs font-bold text-[#0F172A]">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </StudentLayout>
  );
}
