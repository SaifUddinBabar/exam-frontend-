import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PracticeZone() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPracticeData() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [histRes, anaRes, mistRes, saveRes] = await Promise.all([
          token ? fetch(`${API}/api/practice/history`, { headers }).then((r) => r.json()).catch(() => ({})) : Promise.resolve({}),
          token ? fetch(`${API}/api/practice/analytics`, { headers }).then((r) => r.json()).catch(() => ({})) : Promise.resolve({}),
          token ? fetch(`${API}/api/practice/mistakes`, { headers }).then((r) => r.json()).catch(() => ({})) : Promise.resolve({}),
          token ? fetch(`${API}/api/practice/bookmarks`, { headers }).then((r) => r.json()).catch(() => ({})) : Promise.resolve({}),
        ]);

        if (histRes.sessions) setHistory(histRes.sessions);
        if (anaRes.success) setAnalytics(anaRes);
        if (mistRes.totalMistakes !== undefined) setMistakesCount(mistRes.totalMistakes);
        if (saveRes.total !== undefined) setSavedCount(saveRes.total);
      } catch (err) {
        console.error("Practice Zone load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPracticeData();
  }, []);

  return (
    <StudentLayout>
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Practice Zone & Self-Study
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Master concepts at your own pace with interactive drills, mistake review, and full question bank access
          </p>
        </div>

        <Link
          to="/practice/create"
          className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Practice Test</span>
        </Link>
      </div>

      {/* ── 4 PRIMARY STUDY HUBS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Question Bank */}
        <Link
          to="/question-bank"
          className="bg-white border border-[#E2E8F0] hover:border-[#2563EB]/40 rounded-card p-6 shadow-card hover:shadow-elevated transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
              Browse Question Bank
            </h2>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              Explore 2,134+ questions with subject, chapter, board & topic filters
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
            <span>Explore Questions</span>
            <span>&rarr;</span>
          </div>
        </Link>

        {/* Card 2: Create Practice Test */}
        <Link
          to="/practice/create"
          className="bg-white border border-[#E2E8F0] hover:border-[#10B981]/40 rounded-card p-6 shadow-card hover:shadow-elevated transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-[#0F172A] group-hover:text-[#10B981] transition-colors">
              Create Practice Test
            </h2>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              Generate custom self-tests by target chapters, count (5–100) & optional timer
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#10B981]">
            <span>Configure Test</span>
            <span>&rarr;</span>
          </div>
        </Link>

        {/* Card 3: Practice Mistakes */}
        <Link
          to="/practice/mistakes"
          className="bg-white border border-[#E2E8F0] hover:border-[#EF4444]/40 rounded-card p-6 shadow-card hover:shadow-elevated transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0F172A] group-hover:text-[#EF4444] transition-colors">
                Practice Mistakes
              </h2>
              {mistakesCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] rounded-full">
                  {mistakesCount}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              Target and retry all questions you answered incorrectly in past assessments
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#EF4444]">
            <span>Fix Mistakes</span>
            <span>&rarr;</span>
          </div>
        </Link>

        {/* Card 4: Saved Questions */}
        <Link
          to="/saved-questions"
          className="bg-white border border-[#E2E8F0] hover:border-[#F59E0B]/40 rounded-card p-6 shadow-card hover:shadow-elevated transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0F172A] group-hover:text-[#F59E0B] transition-colors">
                Saved Questions
              </h2>
              {savedCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFFBEB] text-[#D97706] rounded-full">
                  {savedCount}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              Review, bookmark, and drill difficult questions saved from exams
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#F59E0B]">
            <span>View Saved</span>
            <span>&rarr;</span>
          </div>
        </Link>
      </div>

      {/* ── 3 PRACTICE SUMMARY STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <span className="text-[11px] font-semibold text-[#64748B]">Total Drills Completed</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
            {analytics?.totalSessions || 0}
          </p>
          <span className="text-[10px] text-[#94A3B8] mt-1 block">Self-practice tests</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <span className="text-[11px] font-semibold text-[#64748B]">Questions Practiced</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#2563EB] mt-1">
            {analytics?.totalPracticeQuestions || 0}
          </p>
          <span className="text-[10px] text-[#94A3B8] mt-1 block">Across all topics</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <span className="text-[11px] font-semibold text-[#64748B]">Overall Practice Accuracy</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#10B981] mt-1">
            {analytics?.overallAccuracy || 0}%
          </p>
          <span className="text-[10px] text-[#94A3B8] mt-1 block">Correct vs wrong ratio</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 shadow-card">
          <span className="text-[11px] font-semibold text-[#64748B]">Practice Time</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
            {analytics?.totalTimeSpentMinutes || 0} <span className="text-xs text-[#94A3B8]">Mins</span>
          </p>
          <span className="text-[10px] text-[#94A3B8] mt-1 block">Active study duration</span>
        </div>
      </div>

      {/* ── TWO-COLUMN: RECENT PRACTICE HISTORY & CHAPTER PERFORMANCE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {/* Left Col: Recent Practice Sessions */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Recent Practice Sessions</h3>
            <span className="text-[11px] text-[#64748B]">{history.length} completed</span>
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#64748B]">
              <p className="font-semibold text-[#0F172A]">No practice tests taken yet</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Generate your first custom test to track session history and accuracy!
              </p>
              <Link
                to="/practice/create"
                className="mt-3 inline-block px-4 py-2 bg-[#2563EB] text-white font-semibold text-xs rounded-lg"
              >
                Create First Test
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((sess) => {
                const dateStr = new Date(sess.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                });

                return (
                  <div
                    key={sess._id}
                    className="p-3.5 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] truncate max-w-xs">{sess.title}</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {dateStr} · {sess.totalQuestions} Qs · {sess.mode === "practice" ? "Practice Mode" : "Test Mode"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-[#0F172A]">
                        {sess.score} / {sess.totalQuestions}
                      </span>
                      <span className="text-[10px] block font-semibold text-[#10B981]">
                        {sess.totalQuestions > 0 ? Math.round((sess.score / sess.totalQuestions) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Chapter Performance Mastery */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Chapter Mastery Breakdown</h3>
            <Link to="/results" className="text-xs font-semibold text-[#2563EB] hover:underline">
              Full Analytics
            </Link>
          </div>

          {analytics?.chapterPerformance && analytics.chapterPerformance.length > 0 ? (
            <div className="space-y-4">
              {analytics.chapterPerformance.slice(0, 5).map((cp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-[#0F172A] truncate max-w-[240px]">{cp.chapter}</span>
                    <span className="font-bold text-[#2563EB]">{cp.accuracy}% ({cp.correct}/{cp.total})</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cp.accuracy >= 75
                          ? "bg-[#10B981]"
                          : cp.accuracy >= 50
                          ? "bg-[#2563EB]"
                          : "bg-[#F59E0B]"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, cp.accuracy))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#64748B]">
              <p className="font-semibold text-[#0F172A]">Mastery data updating</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Complete practice tests across different chapters to see your mastery metrics here.
              </p>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
