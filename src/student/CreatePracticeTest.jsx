import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CreatePracticeTest() {
  const navigate = useNavigate();

  const [metadata, setMetadata] = useState({ subjects: [] });
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Configuration State
  const [languageMode, setLanguageMode] = useState(() => {
    return localStorage.getItem("examino_language_mode") || "bangla";
  });
  const [selectedSubject, setSelectedSubject] = useState("ICT");
  const [selectedChapter, setSelectedChapter] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedCount, setSelectedCount] = useState(25);
  const [isCustomCount, setIsCustomCount] = useState(false);
  const [customCountValue, setCustomCountValue] = useState(25);
  const [selectedDifficulty, setSelectedDifficulty] = useState("mixed");
  const [selectedMode, setSelectedMode] = useState("practice"); // 'practice' or 'test'
  const [timerOption, setTimerOption] = useState("25"); // minutes, '0' for untimed
  const [isCustomTimer, setIsCustomTimer] = useState(false);
  const [customTimerValue, setCustomTimerValue] = useState(30);

  // Live count of available questions matching filters
  const [availableCount, setAvailableCount] = useState(null);
  const [countingQuestions, setCountingQuestions] = useState(false);

  // Listen for global languageModeChanged events
  useEffect(() => {
    const handleModeUpdate = (e) => {
      const newMode = e.detail?.mode || localStorage.getItem("examino_language_mode") || "bangla";
      setLanguageMode(newMode);
      setSelectedChapter("All");
      setSelectedTopic("All");
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
    window.dispatchEvent(new CustomEvent("languageModeChanged", { detail: { mode } }));
  };

  // Load filter metadata when languageMode changes
  useEffect(() => {
    async function fetchMeta() {
      setLoadingMeta(true);
      try {
        const res = await fetch(`${API}/api/practice/metadata?version=${languageMode}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } });
        if (res.ok) {
          const data = await res.json();
          setMetadata(data);
          if (data.subjects && data.subjects.length > 0) {
            setSelectedSubject(data.subjects[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to load metadata:", err);
      } finally {
        setLoadingMeta(false);
      }
    }
    fetchMeta();
  }, [languageMode]);

  const currentSubjectObj = metadata.subjects.find((s) => s.name === selectedSubject);
  const availableChapters = currentSubjectObj ? currentSubjectObj.chapters : [];
  const currentChapterObj = availableChapters.find((c) => c.name === selectedChapter);
  const availableTopics = currentChapterObj ? currentChapterObj.topics : [];

  // Reset child filters on change
  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
    setSelectedChapter("All");
    setSelectedTopic("All");
  };

  const handleChapterChange = (e) => {
    setSelectedChapter(e.target.value);
    setSelectedTopic("All");
  };

  // Determine actual question count
  const effectiveCount = isCustomCount
    ? Math.max(5, Math.min(100, parseInt(customCountValue) || 10))
    : selectedCount;

  // Determine actual timer in minutes
  const effectiveTimer = isCustomTimer
    ? Math.max(0, parseInt(customTimerValue) || 0)
    : parseInt(timerOption) || 0;

  // Query live available question count as student tweaks settings
  useEffect(() => {
    let isCancelled = false;
    async function checkCount() {
      setCountingQuestions(true);
      try {
        const params = new URLSearchParams({
          subject: selectedSubject,
          chapter: selectedChapter,
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          version: languageMode,
        });
        const res = await fetch(`${API}/api/practice/available-count?${params.toString()}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } });
        if (res.ok && !isCancelled) {
          const data = await res.json();
          setAvailableCount(data.count || 0);
        }
      } catch (err) {
        console.error("Count check failed:", err);
      } finally {
        if (!isCancelled) setCountingQuestions(false);
      }
    }
    checkCount();
    return () => {
      isCancelled = true;
    };
  }, [selectedSubject, selectedChapter, selectedTopic, selectedDifficulty, languageMode]);

  // Handle Form Submission / Generation
  const handleStartPractice = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (availableCount === 0) {
      setErrorMessage("No questions exist matching your chosen criteria. Please broaden your chapter or topic selection.");
      return;
    }

    const finalCount = Math.min(effectiveCount, availableCount || effectiveCount);

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const payload = {
        subject: selectedSubject,
        chapter: selectedChapter,
        topic: selectedTopic,
        questionCount: finalCount,
        difficulty: selectedDifficulty,
        mode: selectedMode,
        durationMinutes: effectiveTimer,
        version: languageMode,
        title: `${selectedSubject} (${languageMode === "english" ? "English" : "বাংলা"}) - ${selectedChapter === "All" ? "Full Syllabus" : selectedChapter} (${selectedMode === "practice" ? "Practice Drill" : "Timed Test"})`,
      };

      const res = await fetch(`${API}/api/practice/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to generate practice test. Please try again.");
        return;
      }

      // Store generated practice set in session storage and navigate to session runner
      sessionStorage.setItem("current_practice_set", JSON.stringify(data));
      navigate("/practice/session");
    } catch (err) {
      console.error("Generate error:", err);
      setErrorMessage("Network error while generating practice test.");
    } finally {
      setSubmitting(false);
    }
  };

  const countPills = [10, 20, 25, 30, 50];

  return (
    <StudentLayout>
      {/* ── HEADER BREADCRUMB ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link to="/practice" className="text-xs font-semibold text-[#2563EB] hover:underline">
            Practice Zone
          </Link>
          <span className="text-xs text-[#94A3B8]">/</span>
          <span className="text-xs text-[#64748B]">Create Practice Test</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Create Custom Practice Test
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Customize target chapters, count, difficulty, and timer for targeted self-learning
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs font-semibold text-[#DC2626] flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleStartPractice} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Left 2 Cols: Configuration Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Subject, Chapter & Topic Scope */}
          <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
              <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-[#0F172A]">Syllabus Scope & Chapter Selection</h3>
            </div>

            {/* Medium / Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Curriculum Medium / ভাষা মাধ্যম
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => switchLanguageMode("bangla")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    languageMode === "bangla"
                      ? "bg-[#F0FDF4] border-[#16A34A] text-[#15803D] ring-2 ring-[#16A34A]/20"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-white"
                  }`}
                >
                  <span className="text-base">🇧🇩</span>
                  <span>বাংলা মাধ্যম</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchLanguageMode("english")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    languageMode === "english"
                      ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] ring-2 ring-[#2563EB]/20"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-white"
                  }`}
                >
                  <span className="text-base">🇬🇧</span>
                  <span>English Medium</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                >
                  {metadata.subjects.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.totalQuestions} Questions)
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Chapter
                </label>
                <select
                  value={selectedChapter}
                  onChange={handleChapterChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB] truncate"
                >
                  <option value="All">All Chapters (Full Syllabus Drill)</option>
                  {availableChapters.map((ch) => (
                    <option key={ch.name} value={ch.name}>
                      {ch.name} ({ch.questionCount} Qs)
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Specific Topic <span className="text-[#94A3B8] font-normal">(Optional)</span>
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  disabled={selectedChapter === "All" || availableTopics.length === 0}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB] disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]"
                >
                  <option value="All">
                    {selectedChapter === "All"
                      ? "Select a specific chapter to enable topic drill"
                      : "All Topics in this Chapter"}
                  </option>
                  {availableTopics.map((top) => (
                    <option key={top} value={top}>
                      {top}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Question Count & Difficulty */}
          <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
              <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-[#0F172A]">Question Count & Difficulty Level</h3>
            </div>

            {/* Question Count Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-2">
                Number of Questions
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {countPills.map((count) => {
                  const active = !isCustomCount && selectedCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        setSelectedCount(count);
                        setIsCustomCount(false);
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                        active
                          ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                          : "bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {count} Qs
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCustomCount(true)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                    isCustomCount
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                      : "bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustomCount && (
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={customCountValue}
                    onChange={(e) => setCustomCountValue(e.target.value)}
                    placeholder="5 - 100"
                    className="w-32 px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="text-xs text-[#64748B]">Choose between 5 and 100 questions</span>
                </div>
              )}
            </div>

            {/* Difficulty Level */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#0F172A] mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "mixed", label: "Mixed", desc: "40% Easy, 40% Med, 20% Hard" },
                  { id: "easy", label: "Easy", desc: "Foundational concepts" },
                  { id: "medium", label: "Medium", desc: "Standard board level" },
                  { id: "hard", label: "Hard", desc: "Analytical & multi-step" },
                ].map((diff) => {
                  const active = selectedDifficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff.id)}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        active
                          ? "bg-[#EFF6FF] border-[#2563EB] text-[#1E40AF] ring-1 ring-[#2563EB]"
                          : "bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <p className="text-xs font-bold capitalize">{diff.label}</p>
                      <p className="text-[10px] text-[#64748B] mt-0.5 leading-tight">{diff.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Practice Mode & Timer */}
          <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
              <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-[#0F172A]">Practice Mode & Timer Settings</h3>
            </div>

            {/* Mode: Practice vs Test */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-2">
                Assessment Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMode("practice")}
                  className={`p-4 text-left rounded-xl border transition-all ${
                    selectedMode === "practice"
                      ? "bg-[#EFF6FF] border-[#2563EB] ring-1 ring-[#2563EB]"
                      : "bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#0F172A]">Practice Mode</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#ECFDF5] text-[#059669] rounded">
                      Immediate Feedback
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Shows correct answer and detailed explanation immediately upon selecting an option. Ideal for learning and chapter review.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode("test")}
                  className={`p-4 text-left rounded-xl border transition-all ${
                    selectedMode === "test"
                      ? "bg-[#EFF6FF] border-[#2563EB] ring-1 ring-[#2563EB]"
                      : "bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#0F172A]">Test Mode</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFFBEB] text-[#D97706] rounded">
                      Delayed Grading
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Answers are hidden until you click Final Submit. Evaluates score, marks mistakes, and computes accuracy rate like a real exam.
                  </p>
                </button>
              </div>
            </div>

            {/* Optional Timer Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#0F172A] mb-2">
                Timer Duration <span className="text-[#94A3B8] font-normal">(Optional)</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { val: "0", label: "Untimed" },
                  { val: "10", label: "10 min" },
                  { val: "15", label: "15 min" },
                  { val: "20", label: "20 min" },
                  { val: "25", label: "25 min" },
                  { val: "30", label: "30 min" },
                ].map((t) => {
                  const active = !isCustomTimer && timerOption === t.val;
                  return (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => {
                        setTimerOption(t.val);
                        setIsCustomTimer(false);
                      }}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        active
                          ? "bg-[#0F172A] text-white border-[#0F172A]"
                          : "bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCustomTimer(true)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    isCustomTimer
                      ? "bg-[#0F172A] text-white border-[#0F172A]"
                      : "bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustomTimer && (
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customTimerValue}
                    onChange={(e) => setCustomTimerValue(e.target.value)}
                    placeholder="Minutes"
                    className="w-28 px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="text-xs text-[#64748B]">Minutes for entire practice test</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Action Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card sticky top-24 space-y-6">
            <h3 className="text-sm font-bold text-[#0F172A] pb-3 border-b border-[#F1F5F9]">
              Test Configuration Summary
            </h3>

            {/* Live Database Availability Indicator */}
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Matching in Bank:</span>
                <span className="font-extrabold text-[#0F172A]">
                  {countingQuestions ? (
                    <span className="text-[#94A3B8]">Checking...</span>
                  ) : (
                    `${availableCount !== null ? availableCount : "—"} Questions`
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Selected Count:</span>
                <span className="font-extrabold text-[#2563EB]">
                  {Math.min(effectiveCount, availableCount || effectiveCount)} Qs
                </span>
              </div>

              {availableCount !== null && effectiveCount > availableCount && (
                <p className="text-[11px] font-semibold text-[#D97706] pt-1 border-t border-[#E2E8F0]">
                  ⚠️ Requested {effectiveCount} questions, but only {availableCount} are available for this specific filter. Your test will include all {availableCount} questions.
                </p>
              )}
            </div>

            {/* Config Specs */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Subject</span>
                <span className="font-bold text-[#0F172A]">{selectedSubject}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Chapter</span>
                <span className="font-bold text-[#0F172A] truncate max-w-[150px]">
                  {selectedChapter}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Difficulty</span>
                <span className="font-bold text-[#0F172A] capitalize">{selectedDifficulty}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Mode</span>
                <span className="font-bold text-[#0F172A] capitalize">{selectedMode} Mode</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Timer</span>
                <span className="font-bold text-[#0F172A]">
                  {effectiveTimer > 0 ? `${effectiveTimer} Minutes` : "Untimed"}
                </span>
              </div>
            </div>

            {/* Launch CTA Button */}
            <button
              type="submit"
              disabled={submitting || availableCount === 0}
              className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#94A3B8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Random Test...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Start Practice Session</span>
                </>
              )}
            </button>

            <Link
              to="/question-bank"
              className="block text-center text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Or browse question bank directly &rarr;
            </Link>
          </div>
        </div>
      </form>
    </StudentLayout>
  );
}
