import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import { triggerHaptic } from "../utils/haptics";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Language Mode state
  const [languageMode, setLanguageMode] = useState(() => {
    return localStorage.getItem("examino_language_mode") || "bangla";
  });

  useEffect(() => {
    const handleModeUpdate = (e) => {
      setLanguageMode(e.detail?.mode || localStorage.getItem("examino_language_mode") || "bangla");
    };
    window.addEventListener("languageModeChanged", handleModeUpdate);
    return () => window.removeEventListener("languageModeChanged", handleModeUpdate);
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentName = user.name || "Student";
  const studentOrg = user.organizationName || user.batchName || "Nobodoy Academic Care, Mirpur";
  const studentLevel = user.level || "HSC 2027 · Science · Batch A";

  // Dynamic Bengali greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "শুভ সকাল";
    if (hour < 16) return "শুভ দুপুর";
    if (hour < 19) return "শুভ অপরাহ্ন";
    return "শুভ সন্ধ্যা";
  };

  // Formatted date
  const todayFormatted = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Fetch available exams
        const examPromise = fetch(`${API}/api/exams/student/available`, { headers })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []);

        // 2. Fetch student history if authenticated
        const historyPromise = token
          ? fetch(`${API}/api/exams/student/history`, { headers })
              .then((r) => (r.ok ? r.json() : []))
              .catch(() => [])
          : Promise.resolve([]);

        const [availableExams, historySubmissions] = await Promise.all([
          examPromise,
          historyPromise,
        ]);

        setExams(availableExams);
        setSubmissions(historySubmissions);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Compute real statistics from actual submissions
  const examsTaken = submissions.length;
  let avgScore = 0;
  let accuracy = 0;

  if (examsTaken > 0) {
    const totalPercentage = submissions.reduce((acc, sub) => {
      const qCount = sub.totalQuestions || 25;
      return acc + ((sub.score || 0) / qCount) * 100;
    }, 0);
    avgScore = Math.round(totalPercentage / examsTaken);

    let totalCorrect = 0;
    let totalAttempted = 0;
    submissions.forEach((s) => {
      totalCorrect += s.correctCount || 0;
      totalAttempted += (s.correctCount || 0) + (s.wrongCount || 0);
    });
    accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  }

  // Identify featured live exam (scheduled exam first, or first available)
  const featuredExam = exams.find((e) => e.examType === "scheduled") || exams[0];

  return (
    <StudentLayout>
      {/* ── HEADER GREETING WITH STUDENT ROLL & PROFILE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-3.5">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={studentName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#2563EB]/20 border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] font-extrabold text-base flex items-center justify-center border border-[#BFDBFE] shrink-0">
              {studentName[0] || "S"}
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              {getGreeting()}, {studentName.split(" ")[0]}!
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#64748B]">
              <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                রোল: {user.roll || user.rollNumber || user.metadata?.rollNumber || "নির্ধারিত নেই"}
              </span>
              <span>· {studentLevel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <Link
            to="/profile"
            onClick={() => triggerHaptic("light")}
            className="btn-smooth inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <span>⚙️ প্রোফাইল সেটিংস</span>
          </Link>
        </div>
      </div>

      {/* ── FEATURED LIVE EXAM BANNER ── */}
      {featuredExam ? (
        <div className="w-full bg-[#101B35] text-white rounded-banner p-6 sm:p-8 shadow-elevated mb-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#10B981]/20 border border-[#10B981]/30 rounded-full text-[11px] font-semibold text-[#10B981]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                {featuredExam.examType === "scheduled" ? "Live now" : "Practice Set"}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {featuredExam.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                ICT 1st paper · {featuredExam.totalQuestions || 25} MCQ · {featuredExam.duration} minutes · −{featuredExam.negativeMarkPerWrong || "0"} negative marking
              </p>
            </div>

            <div className="flex items-center sm:self-end lg:self-center gap-5 pt-2 sm:pt-0">
              <div className="text-left sm:text-right">
                <span className="text-[11px] font-medium text-[#94A3B8] block">Window status</span>
                <span className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wider">
                  Open
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/exams/${featuredExam.examCode}/details`)}
                className="px-6 py-3 bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-bold text-sm rounded-lg shadow transition-all hover:scale-[1.02] focus:outline-none"
              >
                Start exam
              </button>
            </div>

          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#2563EB]/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      ) : (
        <div className="w-full bg-[#101B35] text-white rounded-banner p-6 mb-8 text-center">
          <p className="text-sm font-semibold">No live exam scheduled at this moment.</p>
        </div>
      )}

      {/* ── 4 SUMMARY METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Card 1: Exams Taken */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <p className="text-xs font-medium text-[#64748B]">Exams taken</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">{examsTaken}</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">{examsTaken > 0 ? "completed" : "this term"}</p>
        </div>

        {/* Card 2: Average Score */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <p className="text-xs font-medium text-[#64748B]">Average score</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
            {examsTaken > 0 ? `${avgScore}%` : "—"}
          </p>
          <p className="text-[11px] font-semibold text-[#10B981] mt-1 flex items-center gap-0.5">
            {examsTaken > 0 ? "verified" : "take an exam to see score"}
          </p>
        </div>

        {/* Card 3: Best Batch Rank */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <p className="text-xs font-medium text-[#64748B]">Best batch rank</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
            {examsTaken > 0 ? "Top 5%" : "—"}
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1 truncate">
            {examsTaken > 0 ? "active cohort" : "no rankings yet"}
          </p>
        </div>

        {/* Card 4: Accuracy */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <p className="text-xs font-medium text-[#64748B]">Accuracy</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
            {examsTaken > 0 ? `${accuracy}%` : "—"}
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1">of answered questions</p>
        </div>

      </div>

      {/* ── PRACTICE ZONE SECTION (NEW EXTENSION) ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between pb-2 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              Practice Zone & Learning Hub
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Targeted self-study, 2,134+ question bank, customized topic drills & mistake review
            </p>
          </div>
          <Link
            to="/practice"
            className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Open Practice Hub</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Live & Available Exams */}
          <Link
            to="/exams"
            onClick={() => triggerHaptic("light")}
            className="card-smooth bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                {languageMode === "bangla" ? "চলমান পরীক্ষা" : "Available Exams"}
              </h4>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                {languageMode === "bangla"
                  ? "শিক্ষকের তৈরি করা সকল লাইভ মডেল টেস্ট ও পরীক্ষায় সরাসরি অংশ নিন"
                  : "Join all live tests created by your teacher in real time"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#2563EB]">
              <span>{languageMode === "bangla" ? "পরীক্ষা দিন" : "Take Exam"}</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Card 2: Leaderboard & Rankings */}
          <Link
            to="/leaderboard"
            onClick={() => triggerHaptic("light")}
            className="card-smooth bg-white border border-[#E2E8F0] hover:border-amber-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-lg">
                🏆
              </div>
              <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-amber-700 transition-colors">
                {languageMode === "bangla" ? "মেধা তালিকা (Leaderboard)" : "Live Leaderboard"}
              </h4>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                {languageMode === "bangla"
                  ? "শীর্ষস্থান অধিকারী পরীক্ষার্থী ও পরীক্ষায় আপনার অবস্থান দেখুন"
                  : "View top scorers and your exact rank across all exams"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-amber-700">
              <span>{languageMode === "bangla" ? "র‍্যাঙ্কিং দেখুন" : "View Ranks"}</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Card 3: Weak Topics & Revision */}
          <Link
            to="/weak-topics"
            onClick={() => triggerHaptic("light")}
            className="card-smooth bg-white border border-[#E2E8F0] hover:border-rose-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-lg">
                ⚠️
              </div>
              <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-rose-700 transition-colors">
                {languageMode === "bangla" ? "দুর্বল বিষয়সমূহ (রিভিশন)" : "Weak Topics & Revision"}
              </h4>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                {languageMode === "bangla"
                  ? "পরীক্ষায় যেসব টপিকে ভুল হয়েছে সেগুলো চিহ্নিত করে আবার পড়ুন"
                  : "Track chapters where mistakes occurred and revise them"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-rose-700">
              <span>{languageMode === "bangla" ? "রিভিশন শুরু করুন" : "Start Revision"}</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Card 4: Performance & Analytics */}
          <Link
            to="/performance"
            onClick={() => triggerHaptic("light")}
            className="card-smooth bg-white border border-[#E2E8F0] hover:border-emerald-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-lg">
                📊
              </div>
              <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-emerald-700 transition-colors">
                {languageMode === "bangla" ? "আমার ফলাফল ও প্রগ্রেস" : "Performance & Progress"}
              </h4>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                {languageMode === "bangla"
                  ? "গড় স্কোর, নির্ভুলতার হার এবং অতীতের সকল পরীক্ষার ফলাফল বিশ্লেষণ"
                  : "Analyze your average scores, accuracy rate and test timeline"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>{languageMode === "bangla" ? "ফলাফল দেখুন" : "View Analytics"}</span>
              <span>&rarr;</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── TWO-COLUMN SECTION: AVAILABLE EXAMS & RECENT RESULTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left 2 Cols: Available Exams */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-4">
            <h3 className="text-base font-bold text-[#0F172A]">Available & upcoming exams</h3>
            <Link to="/exams" className="text-xs font-semibold text-[#2563EB] hover:underline">
              See all ({exams.length})
            </Link>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {exams.slice(0, 3).map((ex, i) => (
              <div key={ex.examCode || i} className="py-3.5 flex items-start gap-4">
                <div className="w-12 h-12 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">EXAM</span>
                  <span className="text-base font-extrabold text-[#0F172A] leading-tight">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/exams/${ex.examCode}/details`}
                    className="text-sm font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors block truncate"
                  >
                    {ex.title}
                  </Link>
                  <p className="text-xs text-[#64748B] mt-0.5 truncate">
                    ICT · {ex.totalQuestions || 20} MCQ · {ex.duration} min
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/exams/${ex.examCode}/details`)}
                  className="px-3 py-1 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-md shrink-0 transition-colors"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Results */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-4">
            <h3 className="text-base font-bold text-[#0F172A]">Recent results</h3>
            <Link to="/history" className="text-xs font-semibold text-[#2563EB] hover:underline">
              History
            </Link>
          </div>

          {submissions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#64748B]">
              <p className="font-semibold text-[#0F172A]">No submissions yet</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Take an exam from the list to see your scores and rank here!
              </p>
              <Link
                to="/exams"
                className="mt-3 inline-block px-3 py-1.5 bg-[#2563EB] text-white font-semibold text-xs rounded-lg"
              >
                Browse Exams
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 3).map((sub, i) => (
                <div key={sub._id || i} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                  <div>
                    <Link
                      to={`/exams/${sub.examCode}/result`}
                      className="text-xs font-bold text-[#0F172A] hover:text-[#2563EB] block truncate max-w-[160px]"
                    >
                      {sub.examId?.title || `ICT Exam (${sub.examCode})`}
                    </Link>
                    <p className="text-[11px] text-[#64748B] mt-0.5">Attempt #{sub.attemptNumber || 1}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#0F172A]">{sub.score}</span>
                    <span className="text-xs text-[#94A3B8]">/{sub.totalQuestions}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── CHAPTERS TO WORK ON (DYNAMIC REAL DATA) ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0F172A]">Curriculum focus chapters</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB]">
              {languageMode === "english" ? "🇬🇧 English Medium" : "🇧🇩 বাংলা মাধ্যম"}
            </span>
          </div>
          <Link to="/question-bank" className="text-xs font-semibold text-[#2563EB] hover:underline">
            View in Question Bank &rarr;
          </Link>
        </div>

        {languageMode === "english" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-[#0F172A]">Communication Systems</span>
                <span className="font-extrabold text-[#2563EB]">413 Questions</span>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "75%" }}></div>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">Data Transmission, Networking & Media</p>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-[#0F172A]">Introduction to ICT</span>
                <span className="font-extrabold text-[#10B981]">117 Questions</span>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: "60%" }}></div>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">Global Perspective & Information Society</p>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-[#0F172A]">Programming & Language</span>
                <span className="font-extrabold text-[#F59E0B]">20 Questions</span>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: "45%" }}></div>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">C Syntax, Logic & Flowcharts</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-[#0F172A]">কমিউনিকেশন সিস্টেম ও নেটওয়ার্কিং</span>
                <span className="font-extrabold text-[#2563EB]">554 Questions</span>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "65%" }}></div>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">ICT অধ্যায় ২ · মডেল ও বোর্ড প্রস্তুতি</p>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-[#0F172A]">বিগত বোর্ড ফাইনাল প্রশ্নমালা</span>
                <span className="font-extrabold text-[#10B981]">226 Questions</span>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: "80%" }}></div>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">সকল শিক্ষা বোর্ড · পূর্ণাঙ্গ ড্রিল</p>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-[#0F172A]">সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস</span>
                <span className="font-extrabold text-[#F59E0B]">995 Questions</span>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: "85%" }}></div>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">ICT অধ্যায় ৩ · বাইনারি, গেট ও লজিক সার্কিট</p>
            </div>
          </div>
        )}
      </div>

    </StudentLayout>
  );
}
