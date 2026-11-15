import { useState } from "react";
import { useParams } from "react-router-dom";
import StudentLayout, { StudentPageHeader } from "./StudentLayout";
import { api } from "../teacher/api";
import useAsync, { useLanguage } from "../lib/useAsync";
import { Card, EmptyState, ErrorState, LinkButton, Notice, Skeleton, Tabs } from "../teacher/components/ui";
import MathText from "../components/MathText";
import QuestionImage from "../components/QuestionImage";
import { resolveQuestion, TRANSLATION_UNAVAILABLE } from "../lib/questionLanguage";
import { fmtWhen } from "./examFormat";

const cx = (...c) => c.filter(Boolean).join(" ");
const LETTERS = ["ক", "খ", "গ", "ঘ"];

function statusOf(q) {
  if (!q.yourAnswer) return "skipped";
  const idx = (q.options || []).indexOf(q.correctAnswer);
  const ok = q.yourAnswer === q.correctAnswer || (idx >= 0 && (q.optionsBn?.[idx] === q.yourAnswer || q.optionsEn?.[idx] === q.yourAnswer));
  return ok ? "correct" : "wrong";
}

export default function AnswerReview() {
  const { code } = useParams();
  const lang = useLanguage();
  const [filter, setFilter] = useState("all");
  const { status, data, error, reload } = useAsync((signal) => api.myResult(code, { signal }), [code]);

  if (status === "loading") {
    return (
      <StudentLayout maxWidth="max-w-4xl">
        <Skeleton className="h-96" />
      </StudentLayout>
    );
  }
  if (status === "error") {
    return (
      <StudentLayout maxWidth="max-w-3xl">
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      </StudentLayout>
    );
  }
  if (!data.solutionsReleased) {
    return (
      <StudentLayout maxWidth="max-w-3xl">
        <Notice tone="info" title="Solutions are not published yet">
          They open {data.solutionReleaseTime ? `on ${fmtWhen(data.solutionReleaseTime)}` : "after the exam closes"}.
        </Notice>
      </StudentLayout>
    );
  }

  const items = data.review.map((q, i) => ({ ...q, n: i + 1, status: statusOf(q) }));
  const count = (s) => items.filter((q) => q.status === s).length;
  const shown = filter === "all" ? items : items.filter((q) => q.status === filter);

  return (
    <StudentLayout maxWidth="max-w-4xl">
      <StudentPageHeader eyebrow="Answer review" title={<span className="font-bengali">{data.exam.title}</span>} actions={<LinkButton to={`/exams/${code}/result`} variant="secondary" icon="chevronLeft">Result</LinkButton>} />
      <div className="mb-5">
        <Tabs
          label="Filter questions"
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: "all", label: "All", count: items.length },
            { value: "wrong", label: "Wrong", count: count("wrong") },
            { value: "skipped", label: "Skipped", count: count("skipped") },
            { value: "correct", label: "Correct", count: count("correct") },
          ]}
        />
      </div>
      {!shown.length ? (
        <Card>
          <EmptyState icon="check" title="Nothing here." />
        </Card>
      ) : (
        <div className="space-y-4">
          {shown.map((q) => {
            const v = resolveQuestion(q, lang);
            const correctIdx = (q.options || []).indexOf(q.correctAnswer);
            const yourIdx = [q.options, q.optionsBn, q.optionsEn].map((l) => (l || []).indexOf(q.yourAnswer)).find((x) => x >= 0) ?? -1;
            return (
              <Card key={q._id} className="p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-examino-muted">Q{q.n}</span>
                  <span className={cx("rounded-md px-2 py-0.5 text-xs font-semibold", q.status === "correct" ? "bg-examino-green-light text-emerald-700" : q.status === "wrong" ? "bg-examino-rose-light text-red-700" : "bg-slate-100 text-slate-600")}>
                    {q.status === "correct" ? "Correct" : q.status === "wrong" ? "Wrong" : "Not answered"}
                  </span>
                </div>
                {!v.available ? (
                  <p className="rounded-lg bg-examino-amber-soft px-3 py-2 text-sm font-semibold text-amber-900">{TRANSLATION_UNAVAILABLE[lang]}</p>
                ) : (
                  <>
                    <p className="mb-3 font-semibold leading-relaxed text-examino-text font-bengali">
                      <MathText text={v.text} />
                    </p>
                    <QuestionImage q={q} className="mb-3" />
                    <div className="grid gap-2 sm:grid-cols-2">
                      {v.options.map((o, i) => (
                        <div
                          key={i}
                          className={cx(
                            "flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm",
                            i === correctIdx ? "border-emerald-300 bg-examino-green-light" : i === yourIdx ? "border-red-300 bg-examino-rose-light" : "border-examino-border bg-white"
                          )}
                        >
                          <span className="font-bold text-examino-muted">{LETTERS[i]}</span>
                          <span className="flex-1 font-bengali">
                            <MathText text={o} />
                          </span>
                          {i === correctIdx ? <span className="text-xs font-semibold text-emerald-700">Correct</span> : i === yourIdx ? <span className="text-xs font-semibold text-red-700">Yours</span> : null}
                        </div>
                      ))}
                    </div>
                    {v.explanation ? (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 font-bengali">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-examino-muted">Explanation</p>
                        <MathText text={v.explanation} />
                      </div>
                    ) : null}
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}
