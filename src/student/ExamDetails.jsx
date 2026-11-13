import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import StudentLayout from "./StudentLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ExamDetails() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchExam() {
      try {
        const res = await fetch(`${API}/api/exams/${code.toUpperCase()}`);
        if (!res.ok) {
          setError("Exam not found or has been closed.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setExam(data);
      } catch (err) {
        console.error("Exam Details Error:", err);
        setError("Failed to connect to exam server.");
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [code]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-24 text-center text-xs text-[#64748B]">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading exam syllabus and rules...
        </div>
      </StudentLayout>
    );
  }

  if (error || !exam) {
    return (
      <StudentLayout>
        <div className="max-w-lg mx-auto py-16 text-center bg-white border border-[#E2E8F0] rounded-card p-8">
          <p className="text-base font-bold text-[#DC2626]">Unable to load exam</p>
          <p className="text-xs text-[#64748B] mt-2">{error || "The requested exam does not exist."}</p>
          <Link
            to="/exams"
            className="mt-5 inline-block px-5 py-2.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg"
          >
            Back to Available Exams
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const qCount = exam.questions ? exam.questions.length : 25;
  const isScheduled = exam.examType === "scheduled";
  const passMark = Math.ceil(qCount * 0.4);

  return (
    <StudentLayout>
      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-2 text-xs text-[#64748B] mb-4">
        <Link to="/exams" className="hover:text-[#2563EB]">Exams</Link>
        <span>/</span>
        <span className="hover:text-[#2563EB]">ICT</span>
        <span>/</span>
        <span className="text-[#0F172A] font-medium">{exam.examCode}</span>
      </nav>

      {/* ── TOP BADGES & TITLE (matches PDF Page 5) ── */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {isScheduled ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ECFDF5] text-[#059669] text-xs font-bold rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Live now
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold rounded-md">
              Practice
            </span>
          )}
          <span className="px-2.5 py-1 bg-[#F1F5F9] text-[#475569] text-xs font-medium rounded-md">
            MCQ · single answer
          </span>
          <span className="px-2.5 py-1 bg-[#F1F5F9] text-[#475569] text-xs font-medium rounded-md font-bengali">
            বাংলা + English
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          {exam.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
          ICT 1st paper · set by Rafiq Karim · Nobodoy Academic Care
        </p>
      </div>

      {/* ── TWO-COLUMN MAIN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLS: SYLLABUS, MARKING, BEFORE START */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Syllabus Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
            <h3 className="text-base font-bold text-[#0F172A] mb-4">Syllabus</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                    <th className="pb-3 font-semibold">Chapter</th>
                    <th className="pb-3 font-semibold text-center">Questions</th>
                    <th className="pb-3 font-semibold text-right">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  <tr>
                    <td className="py-3 font-medium text-[#0F172A]">অধ্যায় ২ — কমিউনিকেশন সিস্টেম ও নেটওয়ার্কিং</td>
                    <td className="py-3 text-center text-[#64748B]">{qCount}</td>
                    <td className="py-3 text-right font-medium text-[#0F172A]">{qCount}</td>
                  </tr>
                  <tr className="border-t border-[#E2E8F0] font-bold text-[#0F172A]">
                    <td className="pt-3">Total</td>
                    <td className="pt-3 text-center">{qCount}</td>
                    <td className="pt-3 text-right">{qCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Marking Scheme 4-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card">
              <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Correct</span>
              <p className="text-lg font-extrabold text-[#10B981] mt-1">+1 mark</p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card">
              <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Wrong</span>
              <p className="text-lg font-extrabold text-[#EF4444] mt-1">
                −{exam.negativeMarkPerWrong || "0"} marks
              </p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card">
              <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">No answer</span>
              <p className="text-lg font-extrabold text-[#64748B] mt-1">0</p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-card p-4 shadow-card">
              <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Pass mark</span>
              <p className="text-lg font-extrabold text-[#0F172A] mt-1">{passMark} / {qCount}</p>
            </div>
          </div>

          {/* Before You Start */}
          <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
            <h3 className="text-base font-bold text-[#0F172A] mb-3">Before you start</h3>
            <ul className="space-y-2 text-xs text-[#64748B] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] font-bold">•</span>
                <span>Some questions include diagrams — they load as you reach them, about 40 KB each.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] font-bold">•</span>
                <span>Answers save on every tap. If your connection drops, keep going; they sync when you're back.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] font-bold">•</span>
                <span>Correct answers and explanations open when results publish at 9:30 PM, not before.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* RIGHT 1 COL: SIDEBAR EXAM SUMMARY & START BUTTON */}
        <div>
          <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card sticky top-24 space-y-4">
            
            {/* Countdown Badge */}
            <div className="pb-4 border-b border-[#F1F5F9]">
              <span className="text-xs text-[#64748B] block">Window closes in</span>
              <span className="text-3xl font-extrabold text-[#0F172A] font-mono tracking-wider mt-0.5 block">
                38:20
              </span>
            </div>

            {/* Exam Parameters */}
            <div className="divide-y divide-[#F1F5F9] text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Exam window</span>
                <span className="font-semibold text-[#0F172A]">Today, 8:00–9:00 PM</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Duration</span>
                <span className="font-semibold text-[#0F172A]">{exam.duration} min</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Questions</span>
                <span className="font-semibold text-[#0F172A]">{qCount} MCQ</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Total marks</span>
                <span className="font-semibold text-[#0F172A]">{qCount}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Your attempts</span>
                <span className="font-semibold text-[#0F172A]">
                  0 of {exam.maxAttempts || (isScheduled ? 1 : "unlimited")}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Result publishes</span>
                <span className="font-semibold text-[#0F172A]">Today, 9:30 PM</span>
              </div>
            </div>

            {/* Warning Alert Box */}
            <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-[11px] text-[#B45309] leading-relaxed">
              Join after 8:35 PM and you'll get less than {exam.duration} minutes — the window still ends at 9:00.
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => navigate(`/exams/${exam.examCode}/instructions`)}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-lg shadow transition-colors focus:outline-none"
            >
              Read instructions & start
            </button>

            {/* Secondary Back Button */}
            <button
              type="button"
              onClick={() => navigate("/exams")}
              className="w-full py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs rounded-lg transition-colors"
            >
              Back to exams
            </button>

          </div>
        </div>

      </div>

    </StudentLayout>
  );
}
