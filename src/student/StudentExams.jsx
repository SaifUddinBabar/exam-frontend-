import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout, { StudentPageHeader } from "./StudentLayout";
import { api } from "../teacher/api";
import useAsync from "../lib/useAsync";
import { Badge, Card, EmptyState, ErrorState, LinkButton, SearchInput, Skeleton, Tabs } from "../teacher/components/ui";
import Icon from "../teacher/components/Icon";
import { STATUS_META, fmtWhen, relative } from "./examFormat";

const TABS = [
  { value: "open", label: "Open", statuses: ["in_progress", "active"] },
  { value: "upcoming", label: "Upcoming", statuses: ["upcoming"] },
  { value: "completed", label: "Completed", statuses: ["completed"] },
  { value: "missed", label: "Missed", statuses: ["missed", "closed"] },
];

function ExamCard({ exam }) {
  const meta = STATUS_META[exam.status] || STATUS_META.active;
  const cta =
    exam.status === "in_progress"
      ? { label: "Resume", to: `/exam/${exam.examCode}`, variant: "primary" }
      : exam.status === "active"
        ? { label: exam.myAttempts ? "Retake" : "View & start", to: `/exams/${exam.examCode}/details`, variant: "primary" }
        : exam.status === "completed"
          ? { label: "View result", to: `/exams/${exam.examCode}/result`, variant: "secondary" }
          : { label: "Details", to: `/exams/${exam.examCode}/details`, variant: "secondary" };
  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge tone={meta.tone} dot>
          {meta.label}
        </Badge>
        <span className="text-xs text-examino-muted">
          {exam.status === "upcoming" && exam.startTime ? `Opens ${relative(exam.startTime)}` : exam.status === "in_progress" && exam.deadlineAt ? `Ends ${relative(exam.deadlineAt)}` : exam.endTime && exam.status === "active" ? `Closes ${relative(exam.endTime)}` : ""}
        </span>
      </div>
      {exam.subject ? <p className="text-xs font-semibold uppercase tracking-wider text-examino-muted">{exam.subject}</p> : null}
      <h3 className="mt-0.5 line-clamp-2 text-base font-bold leading-snug text-examino-text font-bengali">{exam.title}</h3>
      {exam.description ? <p className="mt-1 line-clamp-2 text-sm text-examino-muted font-bengali">{exam.description}</p> : null}
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["Questions", exam.totalQuestions],
          ["Minutes", exam.duration],
          ["Negative", exam.negativeMarkPerWrong ? `−${exam.negativeMarkPerWrong}` : "None"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-slate-50 py-2">
            <dt className="text-[11px] text-examino-muted">{k}</dt>
            <dd className="text-sm font-semibold text-examino-text">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-examino-border pt-4">
        <span className="text-xs text-examino-muted">
          {exam.bestScore !== null && exam.bestScore !== undefined
            ? `Best: ${exam.bestScore}/${exam.totalQuestions}`
            : exam.startTime
              ? fmtWhen(exam.startTime)
              : exam.authorName
                ? `By ${exam.authorName}`
                : ""}
        </span>
        <LinkButton to={cta.to} variant={cta.variant} size="sm">
          {cta.label}
        </LinkButton>
      </div>
    </Card>
  );
}

export default function StudentExams() {
  const { status, data, error, reload } = useAsync((signal) => api.studentExams({ signal }), []);
  const [tab, setTab] = useState("open");
  const [search, setSearch] = useState("");
  const exams = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const counts = Object.fromEntries(TABS.map((t) => [t.value, exams.filter((e) => t.statuses.includes(e.status)).length]));
  const shown = exams.filter((e) => {
    const t = TABS.find((x) => x.value === tab);
    if (!t.statuses.includes(e.status)) return false;
    const q = search.trim().toLowerCase();
    return !q || `${e.title} ${e.description} ${e.examCode} ${e.subject}`.toLowerCase().includes(q);
  });

  return (
    <StudentLayout>
      <StudentPageHeader title="Exams" subtitle="Exams assigned to you, your batches, or all students." actions={<SearchInput value={search} onChange={setSearch} placeholder="Search exams" className="w-full sm:w-72" />} />
      <div className="mb-5 overflow-x-auto">
        <Tabs label="Exam status" value={tab} onChange={setTab} tabs={TABS.map((t) => ({ value: t.value, label: t.label, count: counts[t.value] || 0 }))} />
      </div>

      {status === "loading" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-60" />
          ))}
        </div>
      ) : status === "error" ? (
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      ) : !exams.length ? (
        <Card>
          <EmptyState icon="clipboard" title="No exams available yet." description="When your teacher assigns an exam to you or your batch, it will appear here." action={<LinkButton to="/batches" variant="secondary" size="sm" icon="layers">Join a batch</LinkButton>} />
        </Card>
      ) : !shown.length ? (
        <Card>
          <EmptyState icon="search" title={search ? "No exams match your search." : `No ${TABS.find((t) => t.value === tab).label.toLowerCase()} exams.`} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((e) => (
            <ExamCard key={e._id} exam={e} />
          ))}
        </div>
      )}
      <p className="mt-6 flex items-center gap-1.5 text-xs text-examino-muted">
        <Icon name="info" size={14} /> Looking for practice sets? <Link to="/practice" className="font-semibold text-examino-blue hover:underline">Open Practice</Link>
      </p>
    </StudentLayout>
  );
}
