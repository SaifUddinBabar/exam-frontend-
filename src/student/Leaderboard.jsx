import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import { triggerHaptic } from "../utils/haptics";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Leaderboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [exams, setExams] = useState([]);
  const [selectedExamCode, setSelectedExamCode] = useState(initialCode);
  const [rankings, setRankings] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // 1. Fetch all available published exams
  useEffect(() => {
    async function fetchExams() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/api/exams/student/available`, { headers });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setExams(list);
          if (list.length > 0 && !selectedExamCode) {
            setSelectedExamCode(list[0].examCode);
          }
        }
      } catch (err) {
        console.error("Error loading exams for leaderboard:", err);
      } finally {
        setLoadingExams(false);
      }
    }
    fetchExams();
  }, []);

  // 2. Fetch ranking for selected exam
  useEffect(() => {
    if (!selectedExamCode) return;
    setLoadingRankings(true);
    triggerHaptic("light");

    fetch(`${API}/api/exams/ranking/${selectedExamCode}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setRankings(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error loading ranking:", err);
        setRankings([]);
      })
      .finally(() => {
        setLoadingRankings(false);
      });
  }, [selectedExamCode]);

  const activeExam = useMemo(() => {
    return exams.find((e) => e.examCode === selectedExamCode) || null;
  }, [exams, selectedExamCode]);

  // Filter rankings by search query
  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return rankings;
    const q = searchQuery.toLowerCase().trim();
    return rankings.filter(
      (r) =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.roll && r.roll.toLowerCase().includes(q))
    );
  }, [rankings, searchQuery]);

  // Current student rank in this exam
  const myRank = useMemo(() => {
    if (!currentUser.name) return null;
    const myName = currentUser.name.trim().toLowerCase();
    const myPhone = currentUser.phone ? currentUser.phone.trim() : "";
    const idx = rankings.findIndex(
      (r) =>
        (r.name && r.name.trim().toLowerCase() === myName) ||
        (myPhone && r.roll && r.roll.includes(myPhone))
    );
    return idx !== -1 ? idx + 1 : null;
  }, [rankings, currentUser]);

  // Download PDF Report
  const handleDownloadPdf = async () => {
    triggerHaptic("medium");
    setDownloadingPdf(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("leaderboard-table-container");
      if (!element) return;

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `Examino-Leaderboard-${selectedExamCode}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
    } catch (e) {
      console.error("PDF export error:", e);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const top3 = rankings.slice(0, 3);

  return (
    <StudentLayout>
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2 border border-amber-200">
            <span className="text-sm">🏆</span>
            <span>মেধা তালিকা ও লাইভ র‍্যাঙ্কিং</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            পরীক্ষার মেধা তালিকা (Leaderboard)
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            প্রতিটি পরীক্ষার সর্বোচ্চ স্কোরার ও আপনার সার্বিক অবস্থান এক নজরে দেখুন।
          </p>
        </div>

        {/* Action button: Download PDF */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || rankings.length === 0}
            className="btn-smooth px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A] shadow-xs hover:bg-[#F8FAFC] flex items-center gap-2 disabled:opacity-50"
          >
            <span>📥</span>
            <span>{downloadingPdf ? "পিডিএফ তৈরি হচ্ছে..." : "পিডিএফ ডাউনলোড"}</span>
          </button>
        </div>
      </div>

      {/* ── EXAM SELECTOR DROPDOWN & SEARCH BAR ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Exam Select */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-[#64748B] mb-1.5 uppercase tracking-wider">
            পরীক্ষা নির্বাচন করুন:
          </label>
          {loadingExams ? (
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <select
              value={selectedExamCode}
              onChange={(e) => {
                setSelectedExamCode(e.target.value);
                setSearchParams({ code: e.target.value });
              }}
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm font-bold text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
            >
              {exams.map((ex) => (
                <option key={ex.examCode} value={ex.examCode}>
                  {ex.title} ({ex.examCode}) — {ex.totalQuestions} প্রশ্ন
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Live Search */}
        <div className="w-full md:w-72">
          <label className="block text-xs font-bold text-[#64748B] mb-1.5 uppercase tracking-wider">
            শিক্ষার্থী খুঁজুন:
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম বা রোল দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* ── MY POSITION HIGHLIGHT BANNER ── */}
      {myRank && activeExam && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl backdrop-blur-xs">
              #{myRank}
            </div>
            <div>
              <p className="text-xs font-medium text-blue-100">আপনার বর্তমান মেধা স্থান</p>
              <h3 className="text-lg font-extrabold">{currentUser.name}</h3>
            </div>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs">
              মোট পরীক্ষার্থী: {rankings.length} জন
            </span>
          </div>
        </div>
      )}

      {/* ── TOP 3 PODIUM (🥇 🥈 🥉) ── */}
      {!loadingRankings && top3.length > 0 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="card-smooth order-2 md:order-1 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs text-center flex flex-col items-center relative overflow-hidden">
              <span className="text-3xl mb-1">🥈</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
                ২য় স্থান (2nd)
              </span>
              <h4 className="text-base font-extrabold text-[#0F172A]">{top3[1].name}</h4>
              <p className="text-xs text-[#64748B] font-mono mt-0.5">রোল: {top3[1].roll}</p>
              <div className="mt-4 w-full py-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xl font-black text-[#0F172A]">{top3[1].score}</span>
                <span className="text-xs text-[#64748B] ml-1">নম্বর</span>
              </div>
            </div>
          )}

          {/* 1st Place (Champion) */}
          {top3[0] && (
            <div className="card-smooth order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-2xl p-6 shadow-md text-center flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-wider">
                CHAMPION
              </div>
              <span className="text-4xl mb-1 animate-bounce">🥇</span>
              <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-2">
                ১ম স্থান (1st)
              </span>
              <h4 className="text-lg font-black text-[#0F172A]">{top3[0].name}</h4>
              <p className="text-xs text-[#64748B] font-mono mt-0.5">রোল: {top3[0].roll}</p>
              <div className="mt-4 w-full py-2.5 bg-amber-100/60 rounded-xl border border-amber-200">
                <span className="text-2xl font-black text-amber-950">{top3[0].score}</span>
                <span className="text-xs font-bold text-amber-800 ml-1">নম্বর</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="card-smooth order-3 md:order-3 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs text-center flex flex-col items-center relative overflow-hidden">
              <span className="text-3xl mb-1">🥉</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2">
                ৩য় স্থান (3rd)
              </span>
              <h4 className="text-base font-extrabold text-[#0F172A]">{top3[2].name}</h4>
              <p className="text-xs text-[#64748B] font-mono mt-0.5">রোল: {top3[2].roll}</p>
              <div className="mt-4 w-full py-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xl font-black text-[#0F172A]">{top3[2].score}</span>
                <span className="text-xs text-[#64748B] ml-1">নম্বর</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FULL RANKED TABLE ── */}
      <div id="leaderboard-table-container" className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0F172A]">
            সম্পূর্ণ মেধা তালিকা ({filteredRankings.length} জন শিক্ষার্থী)
          </h3>
          {activeExam && (
            <span className="text-xs text-[#64748B]">
              মোট প্রশ্ন: {activeExam.totalQuestions || "—"} টি
            </span>
          )}
        </div>

        {loadingRankings ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold">মেধা তালিকা লোড হচ্ছে...</p>
          </div>
        ) : filteredRankings.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl block mb-2">📋</span>
            <h4 className="text-sm font-bold text-[#0F172A]">এখনো কোনো শিক্ষার্থী এই পরীক্ষাটি জমা দেয়নি।</h4>
            <p className="text-xs text-[#64748B] mt-1">প্রথম শিক্ষার্থী হিসেবে পরীক্ষায় অংশ নিন এবং চ্যাম্পিয়ন হোন!</p>
            {activeExam && (
              <Link
                to={`/exam/${activeExam.examCode}`}
                className="btn-smooth inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <span>পরীক্ষা শুরু করুন ➔</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#64748B] border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4 text-center w-16">মেধা স্থান</th>
                  <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                  <th className="py-3 px-4">রোল / মোবাইল</th>
                  <th className="py-3 px-4 text-right">প্রাপ্ত নম্বর</th>
                  <th className="py-3 px-4 text-right">জমা দেওয়ার সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredRankings.map((sub, idx) => {
                  const rank = idx + 1;
                  const isMe =
                    currentUser.name &&
                    sub.name &&
                    sub.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase();

                  return (
                    <tr
                      key={sub._id || idx}
                      className={`transition-colors ${
                        isMe
                          ? "bg-blue-50/70 font-semibold text-blue-950"
                          : rank <= 3
                          ? "bg-amber-50/30 hover:bg-amber-50/60"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-black text-xs shadow-2xs">
                            🥇 1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black text-xs shadow-2xs">
                            🥈 2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-800 font-black text-xs border border-amber-200 shadow-2xs">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-slate-500 font-bold">
                            #{rank}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0F172A]">{sub.name}</span>
                          {isMe && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold tracking-wide">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[#64748B]">
                        {sub.roll || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-black text-sm border border-emerald-200 font-mono">
                          {sub.score}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-[#64748B] whitespace-nowrap">
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
