import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ExamInstructions() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [lang, setLang] = useState("English"); // "English" or "বাংলা"
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExam() {
      try {
        const res = await fetch(`${API}/api/exams/${code.toUpperCase()}`);
        if (res.ok) {
          const data = await res.json();
          setExam(data);
        }
      } catch (err) {
        console.error("Instructions Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [code]);

  const qCount = exam?.questions ? exam.questions.length : 25;
  const duration = exam?.duration || 25;
  const negMark = exam?.negativeMarkPerWrong || "0.25";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* ── TOP NAV BAR (matches PDF Page 6) ── */}
      <header className="w-full bg-[#101B35] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#1E2D4A]">
        <div className="flex items-center gap-4">
          <ExaminoLogo light size="sm" to="/dashboard" />
          <div className="border-l border-[#2B3E68] pl-4 hidden sm:block">
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              {exam?.title || "ICT Examination"}
            </h2>
            <p className="text-[11px] text-[#94A3B8]">
              {qCount} MCQ · {duration} minutes · window closes 9:00 PM
            </p>
          </div>
        </div>

        <Link
          to={`/exams/${code}/details`}
          className="text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
        >
          Back to details
        </Link>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLS: INSTRUCTIONS & GRID LEGEND */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white border border-[#E2E8F0] rounded-card p-6 sm:p-8 shadow-card">
              
              {/* Header with Language Switcher */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-5">
                <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                  {lang === "বাংলা" ? "পরীক্ষার নির্দেশনাবলি" : "Instructions"}
                </h1>
                
                <div className="flex bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setLang("English")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      lang === "English"
                        ? "bg-white text-[#0F172A] shadow-sm"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("বাংলা")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all font-bengali ${
                      lang === "বাংলা"
                        ? "bg-white text-[#0F172A] shadow-sm"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              {/* 7 Instructions Rules */}
              {lang === "বাংলা" ? (
                <ol className="space-y-3.5 text-xs sm:text-sm text-[#334155] leading-relaxed list-decimal list-inside font-bengali">
                  <li>এই পরীক্ষায় {qCount}টি বহুনির্বাচনী প্রশ্ন রয়েছে। প্রতিটি প্রশ্নের শুধুমাত্র একটি সঠিক উত্তর রয়েছে।</li>
                  <li>প্রতিটি সঠিক উত্তরের জন্য ১ নম্বর যোগ হবে। প্রতিটি ভুল উত্তরের জন্য {negMark} নম্বর কাটা যাবে। উত্তর না দিলে কোনো নম্বর কাটা যাবে না।</li>
                  <li>মোট সময় {duration} মিনিট। সার্ভার ঘড়ি অনুযায়ী সময় গণনা করা হয়, পৃষ্ঠা বন্ধ করলেও সময় চলতে থাকবে।</li>
                  <li>অপশনে ক্লিক করার সাথে সাথে আপনার উত্তর স্বয়ংক্রিয়ভাবে সেভ হবে। সাবমিট করার আগ পর্যন্ত যেকোনো সময় উত্তর পরিবর্তন বা বাতিল করা যাবে।</li>
                  <li>যেসব প্রশ্ন পরে আবার দেখতে চান, সেগুলোতে “Mark for review” ব্যবহার করুন। উত্তর দিয়ে রিভিউ চিহ্নিত রাখলেও তা মূল্যায়নে যুক্ত হবে।</li>
                  <li>ইন্টারনেট সংযোগ বিচ্ছিন্ন হলেও পরীক্ষা চালিয়ে যান। উত্তরগুলো ডিভাইসে সংরক্ষিত থাকবে এবং পুনরায় কানেক্ট হলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।</li>
                  <li>সময় শেষ হলে আপনার নির্বাচিত সকল উত্তর স্বয়ংক্রিয়ভাবে চূড়ান্ত সাবমিট হয়ে যাবে।</li>
                </ol>
              ) : (
                <ol className="space-y-3.5 text-xs sm:text-sm text-[#334155] leading-relaxed list-decimal list-inside">
                  <li>This exam has {qCount} multiple-choice questions. Each has exactly one correct answer.</li>
                  <li>Each correct answer earns 1 mark. Each wrong answer loses {negMark}. Unanswered questions score 0.</li>
                  <li>You have {duration} minutes. The timer runs on the server and continues even if you close the page.</li>
                  <li>Your answer saves the moment you tap it. You can change or clear it any time before submitting.</li>
                  <li>Use “Mark for review” to flag questions to revisit. Marked questions with an answer are still scored.</li>
                  <li>If your connection drops, keep answering. Answers are kept on this device and sync automatically.</li>
                  <li>When time runs out, your exam is submitted automatically with every answer you selected.</li>
                </ol>
              )}

              {/* Question Grid Colours Box */}
              <div className="mt-8 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <span className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase block mb-3">
                  Question grid colours
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#2563EB] text-white font-bold flex items-center justify-center text-xs">
                      7
                    </span>
                    <span className="font-medium text-[#0F172A]">Answered</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] font-bold flex items-center justify-center text-xs">
                      8
                    </span>
                    <span className="font-medium text-[#0F172A]">Seen, not answered</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#F59E0B] text-white font-bold flex items-center justify-center text-xs">
                      9
                    </span>
                    <span className="font-medium text-[#0F172A]">Marked for review</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] font-bold flex items-center justify-center text-xs">
                      10
                    </span>
                    <span className="font-medium text-[#0F172A]">Not visited</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT 1 COL: DEVICE CHECK CARD */}
          <div>
            <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card space-y-5 sticky top-20">
              <h3 className="text-sm font-bold text-[#0F172A]">Device check</h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#10B981] font-bold">✓</span>
                    <span className="text-[#0F172A]">Connection</span>
                  </div>
                  <span className="font-semibold text-[#10B981]">Good · 180 ms</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#10B981] font-bold">✓</span>
                    <span className="text-[#0F172A]">Clock synced with server</span>
                  </div>
                  <span className="font-semibold text-[#10B981]">±1 s</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#10B981] font-bold">✓</span>
                    <span className="text-[#0F172A]">Bangla & maths fonts</span>
                  </div>
                  <span className="font-semibold text-[#10B981]">Loaded</span>
                </div>
              </div>

              {/* Honor Code Checkbox */}
              <div className="pt-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="honor"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                  />
                  <label htmlFor="honor" className="text-xs text-[#475569] leading-relaxed cursor-pointer select-none">
                    I have read the instructions and will not use outside help during this exam.
                  </label>
                </div>
              </div>

              {/* Start Button */}
              <div>
                <button
                  type="button"
                  disabled={!agree}
                  onClick={() => navigate(`/exam/${code.toUpperCase()}`)}
                  className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-lg shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                >
                  Start exam
                </button>
                <p className="text-[11px] text-[#94A3B8] text-center mt-2">
                  Timer starts only after you confirm.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
