import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentName = user.name || "Nusrat Jahan";

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
    async function fetchAvailableExams() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/api/exams/student/available`, { headers });
        if (res.ok) {
          const data = await res.json();
          setExams(data);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailableExams();
  }, []);

  // Identify primary featured live exam (or first scheduled/practice exam)
  const featuredExam = exams.find((e) => e.examType === "scheduled") || exams[0] || {
    title: "HSC 2027 ICT — Model Test 01 (Communication Systems)",
    examCode: "EXAM-ICT-01",
    duration: 25,
    totalQuestions: 25,
    negativeMarkPerWrong: 0.25,
  };

  return (
    <StudentLayout>
      {/* ── HEADER GREETING (matches PDF Page 3) ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {getGreeting()}, {studentName.split(" ")[0]}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            HSC 2027 · Science · Batch A — Nobodoy Academic Care, Mirpur
          </p>
        </div>
        <div className="text-xs font-medium text-[#64748B] sm:text-right">
          {todayFormatted}
        </div>
      </div>

      {/* ── FEATURED LIVE EXAM BANNER (NAVY #101B35) ── */}
      <div className="w-full bg-[#101B35] text-white rounded-banner p-6 sm:p-8 shadow-elevated mb-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left Info */}
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#10B981]/20 border border-[#10B981]/30 rounded-full text-[11px] font-semibold text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              Live now
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {featuredExam.title}
            </h2>

            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              ICT 1st paper · অধ্যায় ২ · {featuredExam.totalQuestions || 25} MCQ · {featuredExam.duration} minutes · −{featuredExam.negativeMarkPerWrong || "0.25"} negative marking
            </p>
          </div>

          {/* Right Action & Timer */}
          <div className="flex items-center sm:self-end lg:self-center gap-5 pt-2 sm:pt-0">
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-medium text-[#94A3B8] block">Window closes in</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-wider">
                38:20
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

        {/* Decorative subtle background circle */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#2563EB]/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* ── 4 SUMMARY METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Card 1: Exams Taken */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <p className="text-xs font-medium text-[#64748B]">Exams taken</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">18</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">this term</p>
        </div>

        {/* Card 2: Average Score */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <p className="text-xs font-medium text-[#64748B]">Average score</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">78.6%</p>
          <p className="text-[11px] font-semibold text-[#10B981] mt-1 flex items-center gap-0.5">
            <span>▲ 4.2 pts</span>
            <span className="text-[#94A3B8] font-normal">vs October</span>
          </p>
        </div>

        {/* Card 3: Best Batch Rank */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <p className="text-xs font-medium text-[#64748B]">Best batch rank</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
            2 <span className="text-base font-normal text-[#64748B]">/ 126</span>
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1 truncate">ICT Model Test 01</p>
        </div>

        {/* Card 4: Accuracy */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <p className="text-xs font-medium text-[#64748B]">Accuracy</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">84%</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">of answered questions</p>
        </div>

      </div>

      {/* ── TWO-COLUMN SECTION: UPCOMING EXAMS & RECENT RESULTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left 2 Cols: Upcoming Exams */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-4">
            <h3 className="text-base font-bold text-[#0F172A]">Upcoming exams</h3>
            <Link to="/exams" className="text-xs font-semibold text-[#2563EB] hover:underline">
              See all
            </Link>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            
            {/* Exam Row 1 */}
            <div className="py-3.5 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">SAT</span>
                <span className="text-base font-extrabold text-[#0F172A] leading-tight">14</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/exams/${featuredExam.examCode}/details`}
                  className="text-sm font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors block truncate"
                >
                  ICT 1st paper — Weekly Test 10
                </Link>
                <p className="text-xs text-[#64748B] mt-0.5 truncate">
                  অধ্যায় ২ — কমিউনিকেশন সিস্টেম ও নেটওয়ার্কিং · 25 MCQ · 25 min
                </p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] rounded-md shrink-0">
                Upcoming · 8:00 PM
              </span>
            </div>

            {/* Exam Row 2 */}
            <div className="py-3.5 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">MON</span>
                <span className="text-base font-extrabold text-[#0F172A] leading-tight">16</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0F172A] truncate">
                  Higher Mathematics — Model Test 03
                </p>
                <p className="text-xs text-[#64748B] mt-0.5 truncate">
                  উচ্চতর গণিত · ম্যাট্রিক্স ও নির্ণায়ক · 30 MCQ · 35 min
                </p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium text-[#64748B] bg-[#F1F5F9] rounded-md shrink-0">
                Scheduled
              </span>
            </div>

            {/* Exam Row 3 */}
            <div className="py-3.5 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">WED</span>
                <span className="text-base font-extrabold text-[#0F172A] leading-tight">18</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0F172A] truncate">
                  English 1st paper — Seen Comprehension
                </p>
                <p className="text-xs text-[#64748B] mt-0.5 truncate">
                  English · Unit 4 · 20 MCQ · 20 min
                </p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium text-[#64748B] bg-[#F1F5F9] rounded-md shrink-0">
                Scheduled
              </span>
            </div>

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

          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Physics — Model Test 03</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">Rank 6 of 124</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#0F172A]">35.5</span>
                <span className="text-xs text-[#94A3B8]">/40</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Chemistry — Weekly Test 09</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">Rank 11 of 118</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#0F172A]">18.75</span>
                <span className="text-xs text-[#94A3B8]">/25</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
              <div>
                <p className="text-xs font-bold text-[#0F172A]">ICT — Chapter Test 02</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">Rank 3 of 121</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#0F172A]">19</span>
                <span className="text-xs text-[#94A3B8]">/20</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── CHAPTERS TO WORK ON (PROGRESS METRICS) ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#0F172A]">Chapters to work on</h3>
          <Link to="/results" className="text-xs font-semibold text-[#2563EB] hover:underline">
            Full analysis
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Chapter 1 */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-[#0F172A]">কমিউনিকেশন সিস্টেম</span>
              <span className="font-extrabold text-[#EF4444]">48%</span>
            </div>
            <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div className="h-full bg-[#EF4444] rounded-full" style={{ width: "48%" }}></div>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1.5">ICT · 3 exams</p>
          </div>

          {/* Chapter 2 */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-[#0F172A]">সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস</span>
              <span className="font-extrabold text-[#F59E0B]">61%</span>
            </div>
            <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: "61%" }}></div>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1.5">ICT · 2 exams</p>
          </div>

          {/* Chapter 3 */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-[#0F172A]">ওয়েব ডিজাইন ও এইচটিএমএল</span>
              <span className="font-extrabold text-[#F59E0B]">64%</span>
            </div>
            <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: "64%" }}></div>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1.5">ICT · 2 exams</p>
          </div>

        </div>
      </div>

    </StudentLayout>
  );
}
