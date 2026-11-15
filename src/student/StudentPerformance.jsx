import { Link } from "react-router-dom";
import StudentLayout, { StudentPageHeader } from "./StudentLayout";
import { api, request } from "../teacher/api";
import useAsync from "../lib/useAsync";
import { Card, CardHeader, EmptyState, ErrorState, LinkButton, Skeleton } from "../teacher/components/ui";
import { fmtDay, pct } from "./examFormat";

// Progress built only from the student's own submitted exams and graded answers.
function Trend({ points }) {
  if (points.length < 2) return <p className="px-5 pb-5 text-sm text-examino-muted">Submit at least two exams to see your trend.</p>;
  const w = 560;
  const h = 160;
  const x = (i) => 20 + (i / (points.length - 1)) * (w - 40);
  const y = (v) => 10 + (1 - v / 100) * (h - 20);
  return (
    <div className="px-5 pb-5">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" role="img" aria-label={`Exam scores over time: ${points.map((p) => p.pct).join(", ")} percent`}>
        {[0, 50, 100].map((g) => (
          <g key={g}>
            <line x1="20" x2={w - 20} y1={y(g)} y2={y(g)} stroke="#E2E8F0" strokeDasharray={g === 50 ? "4 4" : undefined} />
            <text x="0" y={y(g) + 4} fontSize="10" fill="#94A3B8">
              {g}
            </text>
          </g>
        ))}
        <polyline points={points.map((p, i) => `${x(i)},${y(p.pct)}`).join(" ")} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.pct)} r="4" fill="#2563EB">
            <title>{`${p.title}: ${p.pct}%`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

export default function StudentPerformance() {
  const history = useAsync((signal) => api.studentHistory({ signal }), []);
  const weak = useAsync((signal) => request("/api/exams/student/weak-topics", { signal }), []);

  if (history.status === "loading") {
    return (
      <StudentLayout>
        <Skeleton className="mb-6 h-24" />
        <Skeleton className="h-64" />
      </StudentLayout>
    );
  }
  if (history.status === "error") {
    return (
      <StudentLayout>
        <Card>
          <ErrorState message={history.error} onRetry={history.reload} />
        </Card>
      </StudentLayout>
    );
  }

  const subs = (history.data || []).filter((s) => s.totalQuestions);
  const firstAttempts = subs.filter((s) => (s.attemptNumber || 1) === 1);
  const pcts = subs.map((s) => pct(s.score, s.totalQuestions));
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
  const best = pcts.length ? Math.max(...pcts) : null;
  const correct = subs.reduce((a, s) => a + (s.correctCount || 0), 0);
  const wrong = subs.reduce((a, s) => a + (s.wrongCount || 0), 0);
  const accuracy = correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : null;
  const trend = [...subs]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-12)
    .map((s) => ({ pct: pct(s.score, s.totalQuestions), title: s.examId?.title || s.examCode }));
  const weakTopics = weak.data?.weakTopics || [];

  return (
    <StudentLayout>
      <StudentPageHeader title="Progress" subtitle="Calculated from your submitted exams only." actions={<LinkButton to="/history" variant="secondary" size="sm">Exam history</LinkButton>} />

      {!subs.length ? (
        <Card>
          <EmptyState icon="chart" title="No submitted exams yet." description="Your scores, accuracy and weak topics appear after your first exam." action={<LinkButton to="/exams">See exams</LinkButton>} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ["Exams submitted", subs.length, `${firstAttempts.length} first attempts`],
              ["Average score", `${avg}%`, "Across all attempts"],
              ["Best score", `${best}%`, ""],
              ["Answer accuracy", accuracy === null ? "—" : `${accuracy}%`, `${correct} correct · ${wrong} wrong`],
            ].map(([k, v, h]) => (
              <Card key={k} className="p-4">
                <p className="text-xs font-medium text-examino-muted">{k}</p>
                <p className="mt-1 text-2xl font-bold text-examino-text">{v}</p>
                {h ? <p className="text-xs text-examino-muted">{h}</p> : null}
              </Card>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Score trend" description="Your last 12 submissions, oldest to newest." />
              <Trend points={trend} />
            </Card>
            <Card>
              <CardHeader title="Topics to revise" description="From questions you answered wrongly in exams." />
              {weak.status === "loading" ? (
                <div className="p-5">
                  <Skeleton className="h-32" />
                </div>
              ) : !weakTopics.length ? (
                <EmptyState icon="check" title="No weak topics found yet." />
              ) : (
                <ul className="space-y-4 px-5 pb-5">
                  {weakTopics.slice(0, 6).map((t) => (
                    <li key={t.topic}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-medium text-examino-text font-bengali">{t.topic}</span>
                        <span className={`font-bold ${t.accuracy < 50 ? "text-examino-rose-dark" : "text-amber-600"}`}>{t.accuracy}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${t.accuracy < 50 ? "bg-examino-rose" : "bg-examino-amber"}`} style={{ width: `${Math.max(4, t.accuracy)}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-examino-muted">
                        {t.wrongCount} wrong of {t.totalAttempted} answered
                      </p>
                    </li>
                  ))}
                  <li>
                    <LinkButton to="/practice/create" size="sm" variant="secondary" className="w-full">
                      Practise these topics
                    </LinkButton>
                  </li>
                </ul>
              )}
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader title="Recent results" />
            <ul className="divide-y divide-examino-border">
              {subs.slice(0, 10).map((s) => (
                <li key={s._id}>
                  <Link to={`/exams/${s.examCode}/result`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-examino-text font-bengali">{s.examId?.title || s.examCode}</span>
                      <span className="text-xs text-examino-muted">
                        {fmtDay(s.createdAt)} · attempt #{s.attemptNumber || 1}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-examino-text">
                      {s.score}/{s.totalQuestions} <span className="font-normal text-examino-muted">({pct(s.score, s.totalQuestions)}%)</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </StudentLayout>
  );
}
