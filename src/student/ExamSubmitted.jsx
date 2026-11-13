import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";

export default function ExamSubmitted() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    // Read cached submission receipt
    const saved = sessionStorage.getItem(`examino_submission_${code.toUpperCase()}`);
    if (saved) {
      try {
        setReceipt(JSON.parse(saved));
      } catch (e) {}
    }
  }, [code]);

  const submissionDate = receipt?.submittedAt
    ? new Date(receipt.submittedAt).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : new Date().toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

  const receiptId = receipt?.submissionId
    ? `EXM-${receipt.submissionId.slice(-8).toUpperCase()}`
    : `EXM-MT01-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const timeSpentMin = receipt?.timeSpentSeconds
    ? `${Math.floor(receipt.timeSpentSeconds / 60)}m ${receipt.timeSpentSeconds % 60}s`
    : "22m 14s";

  const totalAnswered = receipt?.answers ? Object.keys(receipt.answers).length : 24;
  const totalQ = receipt?.totalQuestions || 25;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* Top Simple Header */}
      <header className="p-6 flex justify-center border-b border-[#E2E8F0] bg-white">
        <ExaminoLogo to="/dashboard" />
      </header>

      {/* Main Submission Card (matches PDF Page 7) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white border border-[#E2E8F0] rounded-card p-6 sm:p-10 max-w-lg w-full shadow-card text-center">
          
          {/* Big Green Checkmark Icon */}
          <div className="w-16 h-16 bg-[#10B981] text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
            <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Exam submitted
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            {receipt?.examTitle || `HSC 2027 ICT — Model Test (${code.toUpperCase()})`}
          </p>

          {/* Submission Details List */}
          <div className="my-6 p-4 sm:p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-left text-xs divide-y divide-[#F1F5F9] space-y-2.5">
            <div className="flex justify-between pt-1">
              <span className="text-[#64748B]">Submitted at</span>
              <span className="font-semibold text-[#0F172A]">{submissionDate}</span>
            </div>

            <div className="flex justify-between pt-2.5">
              <span className="text-[#64748B]">Questions answered</span>
              <span className="font-semibold text-[#0F172A]">{totalAnswered} of {totalQ}</span>
            </div>

            <div className="flex justify-between pt-2.5">
              <span className="text-[#64748B]">Time taken</span>
              <span className="font-semibold text-[#0F172A]">{timeSpentMin}</span>
            </div>

            <div className="flex justify-between pt-2.5 font-mono">
              <span className="text-[#64748B] font-sans">Receipt</span>
              <span className="font-bold text-[#2563EB]">{receiptId}</span>
            </div>
          </div>

          {/* Results Publish Alert Box */}
          <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-left flex items-start gap-3 mb-6">
            <svg className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1 text-xs">
              <p className="font-bold text-[#1E3A8A]">Results publish tonight</p>
              <p className="text-[#3B82F6] text-[11px] mt-0.5 leading-relaxed">
                Score, rank and explanations unlock together. We'll send an SMS and app notification.
              </p>
            </div>
            <span className="text-sm font-extrabold text-[#1E3A8A] font-mono tracking-wider">
              47:45
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 py-3 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs rounded-lg transition-colors"
            >
              Back to dashboard
            </button>

            <button
              type="button"
              onClick={() => navigate(`/exams/${code.toUpperCase()}/result`)}
              className="flex-1 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg shadow transition-colors"
            >
              View result now
            </button>
          </div>

          {/* Support Note */}
          <p className="text-[11px] text-[#94A3B8] mt-6 leading-relaxed">
            Something wrong with this submission? Contact your teacher with the receipt code above.
          </p>

        </div>
      </main>

    </div>
  );
}
