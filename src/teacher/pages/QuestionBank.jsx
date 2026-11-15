import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { QuestionPicker } from "../components/questions";
import CreateQuestion from "./CreateQuestion";
import PaperBuilder from "./PaperBuilder";
import { useTeacherData } from "../teacherData";
import { triggerHaptic } from "../../utils/haptics";
import Icon from "../components/Icon";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function QuestionBank() {
  const { userId } = useTeacherData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab: 'browse' | 'create' | 'builder'
  const currentTab = searchParams.get("tab") || "browse";
  const [selectedQuestions, setSelectedQuestions] = useState(() => new Map());
  const [editingQuestion, setEditingQuestion] = useState(null);

  const switchTab = (tabName) => {
    triggerHaptic("light");
    if (tabName !== "create") setEditingQuestion(null);
    setSearchParams({ tab: tabName });
  };

  const handleEditQuestion = (q) => {
    triggerHaptic("medium");
    setEditingQuestion(q);
    setSearchParams({ tab: "create" });
  };

  const toggleQuestion = (q) => {
    setSelectedQuestions((prev) => {
      const next = new Map(prev);
      if (next.has(q._id)) next.delete(q._id);
      else next.set(q._id, q);
      return next;
    });
  };

  const selectPage = (questions, add) => {
    setSelectedQuestions((prev) => {
      const next = new Map(prev);
      questions.forEach((q) => {
        if (add) next.set(q._id, q);
        else next.delete(q._id);
      });
      return next;
    });
  };

  const chosenList = Array.from(selectedQuestions.values());

  return (
    <div className="flex flex-col gap-5">
      {/* Workspace Header & Integrated Tabs */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-bengali">
            প্রশ্ন ব্যাংক ও প্রশ্নপত্র প্রস্তুতকরণ
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            প্রশ্ন ব্রাউজ ও ফিল্টারিং, নতুন প্রশ্ন প্রণয়ন এবং প্রিন্ট-উপযোগী প্রশ্নপত্র তৈরি—সব এক জায়গায়।
          </p>
        </div>

        {/* 3 Unified Tabs */}
        <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1 border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => switchTab("browse")}
            className={cx(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
              currentTab === "browse"
                ? "bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Icon name="database" size={16} />
            <span>প্রশ্ন ব্যাংক</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab("create")}
            className={cx(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
              currentTab === "create"
                ? "bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Icon name="plusSquare" size={16} />
            <span>নতুন প্রশ্ন তৈরি</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab("builder")}
            className={cx(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
              currentTab === "builder"
                ? "bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Icon name="file" size={16} />
            <span>প্রশ্নপত্র বিল্ডার</span>
            {chosenList.length > 0 && (
              <span className="ml-0.5 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                {chosenList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Browse Questions */}
      {currentTab === "browse" && (
        <div className="flex flex-col gap-5">
          <QuestionPicker
            selected={selectedQuestions}
            onToggle={toggleQuestion}
            onSelectPage={selectPage}
            userId={userId}
            limit={12}
            examTitle="প্রশ্ন ব্যাংক এক্সপ্লোরার"
            onSave={() => switchTab("builder")}
            onEditQuestion={handleEditQuestion}
          />

          {/* Sticky Quick-Action Bar when questions are chosen */}
          {chosenList.length > 0 && (
            <div className="sticky bottom-4 z-40 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0F172A] p-4 text-white shadow-2xl border border-slate-700 animate-slideUp">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-bold text-xs text-white">
                  ✓
                </span>
                <div>
                  <p className="font-extrabold text-sm text-white">
                    {chosenList.length} টি প্রশ্ন বাছাই করা হয়েছে
                  </p>
                  <p className="text-[11px] text-slate-400">
                    এখনই প্রশ্নপত্র তৈরি করুন অথবা অনলাইন পরীক্ষা হিসেবে প্রকাশ করুন।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedQuestions(new Map());
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  সব মুছুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    switchTab("builder");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-xs"
                >
                  <Icon name="file" size={14} />
                  <span>প্রশ্নপত্র তৈরি করুন ({chosenList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("success");
                    navigate("/teacher/exams/new", { state: { questions: chosenList } });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-xs"
                >
                  <Icon name="clipboard" size={14} />
                  <span>অনলাইন পরীক্ষা তৈরি</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Create / Edit Question */}
      {currentTab === "create" && (
        <div className="animate-fadeIn">
          <CreateQuestion
            embedded={true}
            editQuestion={editingQuestion}
            onCancelEdit={() => {
              setEditingQuestion(null);
              switchTab("browse");
            }}
            onSuccess={() => {
              setEditingQuestion(null);
              switchTab("browse");
            }}
          />
        </div>
      )}

      {/* Tab 3: Question Paper / PDF Builder */}
      {currentTab === "builder" && (
        <div className="animate-fadeIn">
          <PaperBuilder
            embedded={true}
            preloadedQuestions={chosenList}
          />
        </div>
      )}
    </div>
  );
}
