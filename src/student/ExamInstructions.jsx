import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";
import { api } from "../teacher/api";
import useAsync from "../lib/useAsync";
import { Button, Card, ErrorState, Segmented, Skeleton } from "../teacher/components/ui";

const TEXT = {
  english: {
    title: "Instructions",
    rules: (e) => [
      `This exam has ${e.totalQuestions} multiple-choice questions. Each has exactly one correct answer.`,
      `Each correct answer earns 1 mark.${e.negativeMarkPerWrong ? ` Each wrong answer loses ${e.negativeMarkPerWrong}.` : " There is no negative marking."} Unanswered questions score 0.`,
      `You have ${e.duration} minutes. The clock starts when you press Start and is kept by the server — closing or refreshing the page does not stop it.`,
      "Your answers are saved to the server automatically as you go. If your connection drops, keep answering; they are saved again when you are back online.",
      "Use “Mark for review” to flag questions to revisit. Marked questions with an answer are still scored.",
      "When time runs out, your exam is submitted automatically with your saved answers.",
      "You can submit only once per attempt.",
    ],
    agree: "I have read the instructions and will not use outside help during this exam.",
    start: "Start exam",
  },
  bangla: {
    title: "পরীক্ষার নির্দেশনা",
    rules: (e) => [
      `এই পরীক্ষায় ${e.totalQuestions}টি বহুনির্বাচনী প্রশ্ন আছে। প্রতিটির একটি মাত্র সঠিক উত্তর।`,
      `প্রতিটি সঠিক উত্তরে ১ নম্বর।${e.negativeMarkPerWrong ? ` প্রতিটি ভুল উত্তরে ${e.negativeMarkPerWrong} নম্বর কাটা যাবে।` : " কোনো নেগেটিভ মার্কিং নেই।"} উত্তর না দিলে ০।`,
      `সময় ${e.duration} মিনিট। 'শুরু করুন' চাপলেই সার্ভারে সময় গণনা শুরু হবে — পেজ বন্ধ বা রিফ্রেশ করলেও সময় থামবে না।`,
      "আপনার উত্তর স্বয়ংক্রিয়ভাবে সার্ভারে সংরক্ষিত হয়। সংযোগ বিচ্ছিন্ন হলে উত্তর দিতে থাকুন; সংযোগ ফিরলে আবার সংরক্ষিত হবে।",
      "পরে দেখার জন্য প্রশ্ন 'রিভিউ' চিহ্নিত করতে পারবেন। চিহ্নিত প্রশ্নের উত্তরও গণনা করা হবে।",
      "সময় শেষ হলে সংরক্ষিত উত্তরসহ পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হবে।",
      "প্রতিটি প্রচেষ্টায় একবারই জমা দেওয়া যাবে।",
    ],
    agree: "আমি নির্দেশনা পড়েছি এবং পরীক্ষায় বাইরের কোনো সাহায্য নেব না।",
    start: "পরীক্ষা শুরু করুন",
  },
};

export default function ExamInstructions() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState(() => (localStorage.getItem("examino_language_mode") === "english" ? "english" : "bangla"));
  const [agree, setAgree] = useState(false);
  const { status, data: exam, error, reload } = useAsync((signal) => api.examDetails(code, { signal }), [code]);
  const t = TEXT[lang];

  return (
    <div className="flex min-h-screen flex-col bg-examino-bg">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-examino-navy px-4 py-3 text-white sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <ExaminoLogo light size="sm" to="/dashboard" />
          {exam ? (
            <div className="hidden min-w-0 border-l border-white/15 pl-4 sm:block">
              <p className="truncate text-sm font-semibold font-bengali">{exam.title}</p>
              <p className="text-xs text-slate-400">
                {exam.totalQuestions} MCQ · {exam.duration} minutes
              </p>
            </div>
          ) : null}
        </div>
        <Link to={`/exams/${code}/details`} className="text-xs font-semibold text-slate-300 hover:text-white">
          Back to details
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        {status === "loading" ? (
          <Skeleton className="h-96" />
        ) : status === "error" ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : (
          <Card className="p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-examino-border pb-4">
              <h1 className="text-xl font-bold text-examino-text">{t.title}</h1>
              <Segmented label="Instruction language" size="sm" value={lang} onChange={setLang} options={[{ value: "bangla", label: "বাংলা" }, { value: "english", label: "English" }]} />
            </div>
            <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-700 font-bengali">
              {t.rules(exam).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-examino-border bg-slate-50 p-4 text-sm text-examino-text font-bengali">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-examino-blue" />
              {t.agree}
            </label>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => navigate(`/exams/${code}/details`)}>
                Cancel
              </Button>
              <Button size="lg" disabled={!agree || (exam.window !== "active" && !exam.inProgress)} onClick={() => navigate(`/exam/${exam.examCode}`)}>
                {exam.inProgress ? "Resume exam" : t.start}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
