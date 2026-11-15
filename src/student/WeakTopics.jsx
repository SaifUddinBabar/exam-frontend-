import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import { triggerHaptic } from "../utils/haptics";
import Icon from "../teacher/components/Icon";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Curated high-yield study notes for common HSC ICT topics
const REVISION_GUIDES = {
  "সংখ্যা পদ্ধতি": "বাইনারি, অকটাল, ডেসিমাল ও হেক্সাডেসিমাল রূপান্তর সূত্রাবলী রিভিশন করুন। ২-এর পরিপূরক (2's Complement) যোগ-বিয়োগের নিয়মটি বিশেষভাবে চর্চা করুন।",
  "ডিজিটাল ডিভাইস": "মৌলিক গেইট (AND, OR, NOT) এবং সার্বজনীন গেইট (NAND, NOR) দিয়ে অন্যান্য গেইট বাস্তবায়ন ও সত্যক সারণি (Truth Table) ভালোভাবে দেখুন।",
  "কমিউনিকেশন সিস্টেম": "ব্যান্ডউইথ, অপটিক্যাল ফাইবার, মাইক্রোওয়েভ, ব্লুটুথ ও ওয়াইফাই/ওয়াইম্যাক্স এর স্পেসিফিকেশন ও ব্যবহারের পার্থক্য মনে রাখুন।",
  "নেটওয়ার্কিং": "টপোলজি (স্টার, বাস, রিং, মেশ) এর সুবিধা-অসুবিধা এবং ক্লাউড কম্পিউটিং এর সার্ভিস মডেল (SaaS, PaaS, IaaS) পড়ুন।",
  "HTML": "টেবিল ট্যাগ (table, tr, td, th), হাইপারলিংক (a href) এবং ইমেজ (img src) ট্যাগ ও অ্যাট্রিবিউটসমূহ মুখস্থ রাখুন।",
  "সি প্রোগ্রামিং": "লুপ (for, while, do-while), কন্ডিশনাল স্টেটমেন্ট (if-else) এবং ডাটা টাইপ স্পেসিফায়ার (%d, %f, %c) গুরুত্ব সহকারে দেখুন।",
  "ডাটাবেজ": "প্রাইমারি কি (Primary Key), ফরেন কি (Foreign Key) এবং SQL কুয়েরি (SELECT, INSERT, UPDATE, DELETE) রিভিশন করুন।",
};

export default function WeakTopics() {
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revisedMap, setRevisedMap] = useState({});

  useEffect(() => {
    async function loadWeakTopics() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API}/api/exams/student/weak-topics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.weakTopics)) {
            setWeakTopics(data.weakTopics);
          }
        }
      } catch (err) {
        console.error("Error loading weak topics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWeakTopics();
  }, []);

  const handleToggleRevised = (topicKey) => {
    triggerHaptic("success");
    setRevisedMap((prev) => ({
      ...prev,
      [topicKey]: !prev[topicKey],
    }));
  };

  const getGuide = (topic, chapter) => {
    const combined = `${topic} ${chapter}`;
    for (const [key, text] of Object.entries(REVISION_GUIDES)) {
      if (combined.includes(key)) return text;
    }
    return "উক্ত অধ্যায়ের বোর্ড বইয়ের মূল ধারণা এবং বিগত বছরের বহুনির্বাচনী প্রশ্নগুলো পুনরায় ভালো করে পড়ুন।";
  };

  const totalMistakes = weakTopics.reduce((acc, curr) => acc + curr.wrongCount, 0);

  return (
    <StudentLayout>
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold mb-2 border border-rose-200">
            
            <span>দুর্বল বিষয়সমূহ ও রিভিশন প্ল্যান</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            যেসব টপিকে বেশি ভুল হয়েছে (Weak Topics)
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            আপনার অতীতের পরীক্ষার ভুলের ভিত্তিতে স্বয়ংক্রিয়ভাবে চিহ্নিত টপিকসমূহ। এগুলো রিভিশন করে প্রস্তুতি আরও মজবুত করুন।
          </p>
        </div>

        <Link
          to="/exams"
          className="btn-smooth px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1D4ED8] flex items-center gap-2 self-start sm:self-auto"
        >
          <span>পরীক্ষায় অংশ নিন</span>
          <Icon name="arrowRight" size={16} />
        </Link>
      </div>

      {/* ── STATS SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            শনাক্তকৃত দুর্বল টপিক
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 block">
            {weakTopics.length} টি
          </span>
          <p className="text-[11px] text-[#64748B] mt-1">যেগুলোতে সঠিকতার হার কম</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            মোট ভুল হওয়া প্রশ্ন
          </span>
          <span className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block">
            {totalMistakes} টি
          </span>
          <p className="text-[11px] text-[#64748B] mt-1">যা পরীক্ষায় মিস হয়েছিল</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            রিভিশন সম্পন্ন
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
            {Object.values(revisedMap).filter(Boolean).length} টি
          </span>
          <p className="text-[11px] text-[#64748B] mt-1">আপনার পড়া শেষ হয়েছে</p>
        </div>
      </div>

      {/* ── WEAK TOPICS LIST ── */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold">ভুল বিষয়গুলো বিশ্লেষণ করা হচ্ছে...</p>
        </div>
      ) : weakTopics.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          
          <h3 className="text-base font-extrabold text-[#0F172A]">অসাধারণ! আপনার কোনো দুর্বল টপিক নেই।</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
            আপনি পরীক্ষায় চমৎকার ফলাফল করেছেন অথবা এখনো কোনো পরীক্ষায় ভুল করেননি। নতুন কোনো পরীক্ষায় অংশ নিয়ে নিজেকে যাচাই করুন!
          </p>
          <Link
            to="/exams"
            className="btn-smooth inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            <span>উপলব্ধ পরীক্ষাগুলো দেখুন</span>
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {weakTopics.map((item, idx) => {
            const isRevised = !!revisedMap[item.topic];
            return (
              <div
                key={idx}
                className={`card-smooth p-5 rounded-2xl border transition-all ${
                  isRevised
                    ? "bg-emerald-50/40 border-emerald-200 opacity-90"
                    : "bg-white border-[#E2E8F0] shadow-xs"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Topic Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
                        {item.subject}
                      </span>
                      {item.chapter && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                          {item.chapter}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold">
                        {item.wrongCount}টি ভুল
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#0F172A]">
                      {item.topic}
                    </h3>

                    {/* Revision Study Note */}
                    <p className="text-xs text-[#475569] mt-2 leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-slate-100">
                      <b>রিভিশন টিপস:</b> {getGuide(item.topic, item.chapter)}
                    </p>
                  </div>

                  {/* Right Accuracy & Action */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-[#64748B] font-bold block">সঠিকতার হার</span>
                      <span className={`text-lg font-black font-mono ${item.accuracy < 50 ? "text-rose-600" : "text-amber-600"}`}>
                        {item.accuracy}%
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleRevised(item.topic)}
                      className={`btn-smooth px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                        isRevised
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{isRevised ? "✓ রিভিশন শেষ হয়েছে" : "রিভিশন সম্পন্ন করুন"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}
