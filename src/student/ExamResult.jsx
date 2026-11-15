import { Link, useParams } from "react-router-dom";
import StudentLayout, { StudentPageHeader } from "./StudentLayout";
import { api } from "../teacher/api";
import useAsync from "../lib/useAsync";
import { Badge, Card, CardHeader, EmptyState, ErrorState, LinkButton, Notice, Skeleton } from "../teacher/components/ui";
import { fmtWhen, pct } from "./examFormat";

export default function ExamResult() {
  const { code } = useParams();
  const result = useAsync((signal) => api.myResult(code, { signal }), [code]);
  const ranking = useAsync((signal) => api.studentRanking(code, { signal }).catch(() => []), [code]);

  if (result.status === "loading") {
    return (
      <StudentLayout maxWidth="max-w-5xl">
        <Skeleton className="mb-4 h-10 w-1/2" />
        <Skeleton className="h-64" />
      </StudentLayout>
    );
  }
  if (result.status === "error") {
    return (
      <StudentLayout maxWidth="max-w-3xl">
        <Card>
          {/no submission/i.test(result.error || "") ? (
            <EmptyState icon="clipboard" title="You haven't submitted this exam." description="Your result appears here after you submit." action={<LinkButton to={`/exams/${code}/details`}>Go to exam</LinkButton>} />
          ) : (
            <ErrorState message={result.error} onRetry={result.reload} />
          )}
        </Card>
      </StudentLayout>
    );
  }

  const r = result.data;
  const first = r.attempts[r.attempts.length - 1];
  const latest = r.attempts[0];
  const p = pct(latest.score, latest.totalQuestions);
  const unanswered = latest.totalQuestions - latest.correctCount - latest.wrongCount;
  const board = Array.isArray(ranking.data) ? ranking.data : [];

  return (
    <StudentLayout maxWidth="max-w-5xl">
      <StudentPageHeader
        eyebrow="Result"
        title={<span className="font-bengali">{r.exam.title}</span>}
        subtitle={`Submitted ${fmtWhen(latest.submittedAt)} · attempt #${latest.attemptNumber}`}
        actions={
          r.solutionsReleased ? (
            <LinkButton to={`/exams/${code}/review`} icon="eye">
              Review answers
            </LinkButton>
          ) : null
        }
      />

      {!r.solutionsReleased ? (
        <Notice tone="info" className="mb-6">
          Correct answers and explanations open {r.solutionReleaseTime ? `on ${fmtWhen(r.solutionReleaseTime)}` : "after the exam closes"}.
        </Notice>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="col-span-2 p-5 lg:col-span-1">
          <p className="text-xs font-medium text-examino-muted">Score</p>
          <p className="mt-1 text-3xl font-bold text-examino-text">
            {latest.score}
            <span className="text-lg text-examino-muted">/{latest.totalQuestions}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${p >= 80 ? "bg-examino-green" : p >= 40 ? "bg-examino-blue" : "bg-examino-rose"}`} style={{ width: `${Math.min(100, p)}%` }} />
          </div>
          <p className="mt-1 text-xs text-examino-muted">{p}%</p>
        </Card>
        {[
          ["Correct", latest.correctCount, "text-emerald-600"],
          ["Wrong", latest.wrongCount, "text-examino-rose-dark"],
          ["Unanswered", unanswered, "text-examino-muted"],
        ].map(([k, v, c]) => (
          <Card key={k} className="p-5">
            <p className="text-xs font-medium text-examino-muted">{k}</p>
            <p className={`mt-1 text-3xl font-bold ${c}`}>{v}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Ranking" description="First attempts only." />
          {r.rank ? (
            <p className="px-5 pb-2 text-sm text-examino-text">
              You placed <span className="font-bold">#{r.rank.position}</span> of {r.rank.of} on your first attempt ({first.score}/{first.totalQuestions}).
            </p>
          ) : null}
          {board.length ? (
            <ol className="divide-y divide-examino-border">
              {board.slice(0, 10).map((row, i) => (
                <li key={i} className={`flex items-center justify-between px-5 py-2.5 text-sm ${row.isMe ? "bg-examino-blue-light/50" : ""}`}>
                  <span className="flex items-center gap-3">
                    <span className="w-6 text-right font-semibold text-examino-muted">{i + 1}</span>
                    <span className="font-medium text-examino-text">{row.name}</span>
                    {row.isMe ? <Badge tone="blue">You</Badge> : null}
                  </span>
                  <span className="font-semibold text-examino-text">
                    {row.score}/{row.totalQuestions}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-5 pb-5 text-sm text-examino-muted">No ranking yet.</p>
          )}
        </Card>
        <Card>
          <CardHeader title="Your attempts" />
          <ul className="divide-y divide-examino-border">
            {r.attempts.map((a) => (
              <li key={a.attemptNumber} className="flex justify-between px-5 py-2.5 text-sm">
                <span className="text-examino-muted">
                  #{a.attemptNumber} · {fmtWhen(a.submittedAt)}
                </span>
                <span className="font-semibold">
                  {a.score}/{a.totalQuestions}
                </span>
              </li>
            ))}
          </ul>
          <div className="p-5 pt-3">
            <Link to="/exams" className="text-sm font-semibold text-examino-blue hover:underline">
              Back to exams
            </Link>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
