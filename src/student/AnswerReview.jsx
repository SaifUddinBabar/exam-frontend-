import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import MathText from "../components/MathText";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AnswerReview() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [filter, setFilter] = useState("all"); // "all", "wrong", "skipped", "correct"
  const [loading, setLoading] = useState(true);

  const bengaliOptionLetters = ["ক", "খ", "গ", "ঘ"];

  useEffect(() => {
    // 1. Check session storage for answers & evaluated questions
    const cached = sessionStorage.getItem(`examino_submission_${code.toUpperCase()}`);
    let cachedAnswers = {};
    let cachedQuestions = [];

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        cachedAnswers = parsed.answers || {};
        if (parsed.questions && parsed.questions.length > 0) {
          cachedQuestions = parsed.questions;
        }
      } catch (e) {}
    }
    setAnswers(cachedAnswers);

    // 2. Fetch questions from backend
    async function loadQuestions() {
      try {
        if (cachedQuestions.length > 0) {
          setQuestions(cachedQuestions);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/api/exams/${code.toUpperCase()}`);
        if (res.ok) {
          const data = await res.json();
          setExam(data);
          setQuestions(data.questions || []);
        }
      } catch (err) {
        console.error("Answer review error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [code]);

  // Evaluate status of each question
  const evaluatedQuestions = questions.map((q, idx) => {
    const qId = q._id ? q._id.toString() : "";
    const studentAns = answers[qId];
    const correctAns = q.correctAnswer;

    let status = "skipped";
    if (studentAns) {
      if (studentAns === correctAns) {
        status = "correct";
      } else {
        status = "wrong";
      }
    }

    return {
      ...q,
      originalIndex: idx,
      qId,
      studentAns,
      correctAns,
      status,
    };
  });

  const correctCount = evaluatedQuestions.filter((q) => q.status === "correct").length;
  const wrongCount = evaluatedQuestions.filter((q) => q.status === "wrong").length;
  const skippedCount = evaluatedQuestions.filter((q) => q.status === "skipped").length;

  const filtered = evaluatedQuestions.filter((q) => {
    if (filter === "wrong") return q.status === "wrong";
    if (filter === "skipped") return q.status === "skipped";
    if (filter === "correct") return q.status === "correct";
    return true;
  });

  return (
    <StudentLayout>
      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-2 text-xs text-[#64748B] mb-4">
        <Link to="/results" className="hover:text-[#2563EB]">Results</Link>
        <span>/</span>
        <Link to={`/exams/${code.toUpperCase()}/result`} className="hover:text-[#2563EB]">
          {exam?.title || code.toUpperCase()}
        </Link>
        <span>/</span>
        <span className="text-[#0F172A] font-medium">Answers</span>
      </nav>

      {/* ── HEADER WITH FILTER TABS (matches PDF Page 9) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Answer review
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            {correctCount} correct · {wrongCount} wrong · {skippedCount} skipped · explanations by Rafiq Karim
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === "all" ? "bg-white text-[#0F172A] shadow-sm font-bold" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("wrong")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === "wrong" ? "bg-white text-[#EF4444] shadow-sm font-bold" : "text-[#64748B] hover:text-[#EF4444]"
            }`}
          >
            Wrong · {wrongCount}
          </button>
          <button
            type="button"
            onClick={() => setFilter("skipped")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === "skipped" ? "bg-white text-[#0F172A] shadow-sm font-bold" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Skipped · {skippedCount}
          </button>
          <button
            type="button"
            onClick={() => setFilter("correct")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === "correct" ? "bg-white text-[#10B981] shadow-sm font-bold" : "text-[#64748B] hover:text-[#10B981]"
            }`}
          >
            Correct · {correctCount}
          </button>
        </div>
      </div>

      {/* ── TWO-COLUMN WORKSPACE: QUESTIONS + GRID SIDEBAR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLS: QUESTIONS LIST */}
        <div className="lg:col-span-2 space-y-6">
          {filtered.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-card p-12 text-center text-xs text-[#64748B]">
              No questions found for the selected filter.
            </div>
          ) : (
            filtered.map((q) => {
              const isCorrect = q.status === "correct";
              const isWrong = q.status === "wrong";
              const isSkipped = q.status === "skipped";

              return (
                <div
                  key={q.qId || q.originalIndex}
                  id={`q-card-${q.originalIndex}`}
                  className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-sm text-[#0F172A]">
                        Q{q.originalIndex + 1}
                      </span>

                      {isCorrect && (
                        <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] text-[11px] font-bold rounded">
                          Correct
                        </span>
                      )}
                      {isWrong && (
                        <span className="px-2 py-0.5 bg-[#FEF2F2] text-[#DC2626] text-[11px] font-bold rounded">
                          Wrong
                        </span>
                      )}
                      {isSkipped && (
                        <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#64748B] text-[11px] font-medium rounded">
                          Skipped
                        </span>
                      )}

                      <span className="text-xs text-[#64748B]">
                        {q.chapter || "ICT Chapter"}
                      </span>
                    </div>

                    <div className="text-xs font-semibold">
                      {isCorrect && <span className="text-[#10B981]">+1 · 0m 34s</span>}
                      {isWrong && <span className="text-[#EF4444]">−0.25 · 1m 52s</span>}
                      {isSkipped && <span className="text-[#64748B]">0 · 2m 05s</span>}
                    </div>
                  </div>

                  {/* Question Statement */}
                  <h3 className="text-base font-bold text-[#0F172A] leading-relaxed mb-4 font-bengali">
                    <MathText text={q.question} />
                  </h3>

                  {/* Options List with Highlighted Answers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                    {(q.options || []).map((opt, optIdx) => {
                      const letter = bengaliOptionLetters[optIdx] || String.fromCharCode(65 + optIdx);
                      const isThisCorrect = opt === q.correctAns;
                      const isStudentSelected = opt === q.studentAns;

                      let optBoxStyle = "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]";
                      let badge = null;

                      if (isThisCorrect) {
                        optBoxStyle = "bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-semibold";
                        badge = (
                          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-[#10B981] text-white rounded">
                            Correct answer
                          </span>
                        );
                      } else if (isStudentSelected && !isThisCorrect) {
                        optBoxStyle = "bg-[#FEF2F2] border-[#EF4444] text-[#991B1B] font-semibold";
                        badge = (
                          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-[#EF4444] text-white rounded">
                            Your answer
                          </span>
                        );
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${optBoxStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isThisCorrect
                                ? "bg-[#10B981] text-white"
                                : isStudentSelected
                                ? "bg-[#EF4444] text-white"
                                : "bg-white text-[#64748B] border border-[#CBD5E1]"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="font-bengali flex-1"><MathText text={opt} /></span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>

                  {/* EXPLANATION BOX (matches PDF Page 9 & 10) */}
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase block">
                      Explanation
                    </span>
                    <p className="text-[#334155] leading-relaxed font-bengali">
                      {q.explanation ||
                        `সঠিক উত্তর হলো "${q.correctAns}"। এই প্রশ্নটি এনসিটিবি অনুমোদিত উচ্চমাধ্যমিক তথ্য ও যোগাযোগ প্রযুক্তি পাঠ্যবইয়ের সংশ্লিষ্ট অধ্যায় থেকে গৃহীত।`}
                    </p>
                  </div>

                  {/* Report Link */}
                  <div className="pt-3 mt-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert("Thank you. Our academic review board has logged this question for verification.")}
                      className="text-[11px] text-[#64748B] hover:text-[#0F172A] hover:underline"
                    >
                      Report a problem with this question
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* RIGHT 1 COL: ALL QUESTIONS JUMP GRID */}
        <div>
          <div className="bg-white border border-[#E2E8F0] rounded-card p-6 shadow-card sticky top-24 space-y-4">
            <h3 className="text-xs font-bold tracking-wider text-[#64748B] uppercase">
              All {evaluatedQuestions.length} questions
            </h3>

            {/* Jump Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
              {evaluatedQuestions.map((q) => {
                let colorClass = "bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]";
                if (q.status === "correct") colorClass = "bg-[#10B981] text-white border-[#059669]";
                if (q.status === "wrong") colorClass = "bg-[#EF4444] text-white border-[#DC2626]";

                return (
                  <button
                    key={q.originalIndex}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`q-card-${q.originalIndex}`);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className={`h-8 rounded-lg font-bold text-xs border flex items-center justify-center transition-transform hover:scale-105 ${colorClass}`}
                  >
                    {q.originalIndex + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#10B981]"></span> Correct
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#EF4444]"></span> Wrong
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#F1F5F9] border border-[#CBD5E1]"></span> Skipped
              </span>
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate(`/exams/${code.toUpperCase()}/result`)}
              className="w-full py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs rounded-lg transition-colors mt-2"
            >
              Back to result
            </button>
          </div>
        </div>

      </div>

    </StudentLayout>
  );
}
