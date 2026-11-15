import { Link, useNavigate, useParams } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import { api } from "../teacher/api";
import useAsync from "../lib/useAsync";
import { Badge, Button, Card, CardHeader, ErrorState, LinkButton, Notice, Skeleton } from "../teacher/components/ui";
import Icon from "../teacher/components/Icon";
import { STATUS_META, fmtWhen, relative } from "./examFormat";

export default function ExamDetails() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { status, data: exam, error, reload } = useAsync((signal) => api.examDetails(code, { signal }), [code]);

  if (status === "loading") {
    return (
      <StudentLayout maxWidth="max-w-5xl">
        <Skeleton className="mb-4 h-8 w-2/3" />
        <Skeleton className="h-72" />
      </StudentLayout>
    );
  }
  if (status === "error" || !exam) {
    return (
      <StudentLayout maxWidth="max-w-3xl">
        <Card>
          <ErrorState title="Unable to open this exam" message={error} onRetry={reload} />
          <div className="pb-8 text-center">
            <LinkButton to="/exams" variant="secondary" size="sm" icon="chevronLeft">
              Back to exams
            </LinkButton>
          </div>
        </Card>
      </StudentLayout>
    );
  }

  const windowState = exam.inProgress ? "in_progress" : exam.window;
  const meta = STATUS_META[windowState] || STATUS_META.active;
  const outOfAttempts = exam.attemptsLeft === 0;
  const canStart = (exam.window === "active" && !outOfAttempts) || exam.inProgress;

  return (
    <StudentLayout maxWidth="max-w-5xl">
      <nav className="mb-4 flex items-center gap-2 text-xs text-examino-muted" aria-label="Breadcrumb">
        <Link to="/exams" className="hover:text-examino-blue">
          Exams
        </Link>
        <Icon name="chevronRight" size={12} />
        <span className="font-medium text-examino-text">{exam.examCode}</span>
      </nav>

      <div className="mb-6">
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge tone={meta.tone} dot>
            {meta.label}
          </Badge>
          <Badge tone="neutral">MCQ · single answer</Badge>
          {exam.subject ? <Badge tone="neutral">{exam.subject}</Badge> : null}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-examino-text sm:text-3xl font-bengali">{exam.title}</h1>
        <p className="mt-1 text-sm text-examino-muted">{exam.authorName ? `Set by ${exam.authorName}` : "Examino exam"}</p>
        {exam.description ? <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 font-bengali">{exam.description}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Syllabus" description="Chapters covered by this exam." />
            <ul className="divide-y divide-examino-border">
              {exam.syllabus.map((s) => (
                <li key={s.chapter} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <span className="font-medium text-examino-text font-bengali">{s.chapter}</span>
                  <span className="shrink-0 text-examino-muted">{s.count} questions</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Correct", "+1", "text-emerald-600"],
              ["Wrong", exam.negativeMarkPerWrong ? `−${exam.negativeMarkPerWrong}` : "0", "text-examino-rose-dark"],
              ["No answer", "0", "text-examino-muted"],
              ["Total marks", exam.totalQuestions, "text-examino-text"],
            ].map(([k, v, c]) => (
              <Card key={k} className="p-4">
                <p className="text-xs font-medium text-examino-muted">{k}</p>
                <p className={`mt-1 text-xl font-bold ${c}`}>{v}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="h-fit p-5 lg:sticky lg:top-24">
          <dl className="divide-y divide-examino-border text-sm">
            {[
              ["Duration", `${exam.duration} minutes`],
              ["Questions", exam.totalQuestions],
              ["Opens", exam.startTime ? fmtWhen(exam.startTime) : "Any time"],
              ["Closes", exam.endTime ? fmtWhen(exam.endTime) : "No deadline"],
              ["Your attempts", exam.maxAttempts ? `${exam.myAttempts} of ${exam.maxAttempts}` : `${exam.myAttempts} (unlimited)`],
              ["Solutions", exam.solutionReleaseTime ? fmtWhen(exam.solutionReleaseTime) : exam.endTime ? "After the exam closes" : "Right after you submit"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-examino-muted">{k}</dt>
                <dd className="text-right font-semibold text-examino-text">{v}</dd>
              </div>
            ))}
          </dl>

          {exam.window === "upcoming" ? (
            <Notice tone="info" className="mt-4">
              This exam opens {relative(exam.startTime)}.
            </Notice>
          ) : exam.window === "closed" && !exam.inProgress ? (
            <Notice tone="neutral" className="mt-4">
              This exam is closed.
            </Notice>
          ) : outOfAttempts && !exam.inProgress ? (
            <Notice tone="neutral" className="mt-4">
              You have used all your attempts.
            </Notice>
          ) : exam.endTime && !exam.inProgress ? (
            <Notice tone="warning" className="mt-4">
              The exam closes {relative(exam.endTime)}. If you start late you get less than the full {exam.duration} minutes.
            </Notice>
          ) : null}

          <div className="mt-5 flex flex-col gap-2">
            {canStart ? (
              <Button size="lg" onClick={() => navigate(exam.inProgress ? `/exam/${exam.examCode}` : `/exams/${exam.examCode}/instructions`)}>
                {exam.inProgress ? "Resume exam" : "Read instructions & start"}
              </Button>
            ) : null}
            {exam.myAttempts ? (
              <LinkButton to={`/exams/${exam.examCode}/result`} variant="secondary">
                View my result
              </LinkButton>
            ) : null}
            <LinkButton to="/exams" variant="ghost">
              Back to exams
            </LinkButton>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
