import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTeacherData } from "../teacherData";
import { AreaChart } from "../components/charts";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  LinkButton,
  Notice,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  SkeletonRows,
} from "../components/ui";
import { downloadCsv, fmtDate, fmtDateTime, fmtNum, fmtPct, fmtShortDay, timeAgo } from "../utils";

const PAGE_SIZE = 15;

function ScoreBar({ pct }) {
  if (pct === null) return <span className="text-examino-subtle">—</span>;
  const tone = pct >= 80 ? "bg-examino-green" : pct >= 33 ? "bg-examino-blue" : "bg-examino-rose";
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <span className={`block h-full ${tone}`} style={{ width: `${Math.max(2, pct)}%` }} />
      </span>
      <span className="tabular-nums">{fmtPct(pct)}</span>
    </span>
  );
}

function StudentDrawer({ student, onClose }) {
  const ordered = useMemo(() => (student ? [...student.attempts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) : []), [student]);
  if (!student) return null;
  return (
    <Drawer open onClose={onClose} title="Student details">
      <div className="flex items-center gap-3">
        <Avatar name={student.name} size={48} />
        <div>
          <p className="text-base font-semibold">{student.name}</p>
          <p className="text-sm text-examino-muted">
            Student ID <span className="font-mono">{student.roll || "—"}</span>
          </p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3">
        {[
          ["Exams", fmtNum(student.examsTaken)],
          ["Average", fmtPct(student.avgPct)],
          ["Best", fmtPct(student.bestPct)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-examino-border p-3">
            <dt className="text-xs text-examino-muted">{k}</dt>
            <dd className="text-lg font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      {ordered.length > 1 ? (
        <div className="mt-5">
          <p className="mb-1 text-sm font-semibold">Academic progress</p>
          <AreaChart
            height={180}
            maxValue={100}
            data={ordered.map((a) => ({ label: fmtShortDay(a.createdAt), value: a.pct === null ? null : Math.round(a.pct) }))}
            valueSuffix="%"
            ariaLabel={`Score percentage across ${ordered.length} attempts`}
          />
        </div>
      ) : null}
      <p className="mb-2 mt-5 text-sm font-semibold">Attempts</p>
      <ul className="divide-y divide-examino-border rounded-lg border border-examino-border">
        {[...ordered].reverse().map((a) => (
          <li key={a.id}>
            <Link to={`/teacher/results/${a.examCode}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{a.examTitle}</span>
                <span className="text-xs text-examino-muted">{fmtDateTime(a.createdAt)}</span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-semibold tabular-nums">
                  {a.score}/{a.total}
                </span>
                <span className="text-xs text-examino-muted">{fmtPct(a.pct)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-examino-muted">
        Students are identified by the name and roll they enter when submitting. Two students using the same roll and name would appear as one.
      </p>
    </Drawer>
  );
}

export default function Students() {
  const { students, exams, examsStatus, examsError, rankingsLoading, reload } = useTeacherData();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const q = params.get("q") || "";
  const exam = params.get("exam") || "";

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setPage(1);
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = students.filter((s) => (!term || s.name.toLowerCase().includes(term) || s.roll.toLowerCase().includes(term)) && (!exam || s.attempts.some((a) => a.examCode === exam)));
    const by = {
      recent: (a, b) => b.lastSeen - a.lastSeen,
      avg: (a, b) => (b.avgPct ?? -1) - (a.avgPct ?? -1),
      exams: (a, b) => b.examsTaken - a.examsTaken,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    list = [...list].sort(by[sort]);
    return list;
  }, [students, q, exam, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const loading = examsStatus === "loading" || rankingsLoading;

  const exportCsv = () => {
    downloadCsv(`examino-students-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Name", "Student ID (roll)", "Exams taken", "Average %", "Best %", "First attempt", "Last active"],
      ...filtered.map((s) => [s.name, s.roll, s.examsTaken, s.avgPct?.toFixed(1) ?? "", s.bestPct?.toFixed(1) ?? "", fmtDate(s.firstSeen), fmtDate(s.lastSeen)]),
    ]);
  };

  return (
    <>
      <PageHeader
        title="My Students"
        description="Everyone who has submitted one of your exams, with their progress."
        actions={
          <Button variant="secondary" icon="download" onClick={exportCsv} disabled={!filtered.length}>
            Export CSV
          </Button>
        }
      />
      <Notice tone="neutral" className="mb-5">
        Enrolling students and assigning them to courses needs a course/enrollment API that doesn't exist yet. This list is built from real exam submissions.
      </Notice>

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-examino-border p-4">
          <SearchInput value={q} onChange={(v) => setParam("q", v)} placeholder="Search name or student ID" className="min-w-[220px] flex-1" label="Search students" />
          <Select value={exam} onChange={(e) => setParam("exam", e.target.value)} aria-label="Filter by exam" className="w-full sm:w-56">
            <option value="">All exams</option>
            {exams.map((e) => (
              <option key={e.examCode} value={e.examCode}>
                {e.title}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort students" className="w-full sm:w-44">
            <option value="recent">Recently active</option>
            <option value="avg">Average score</option>
            <option value="exams">Exams taken</option>
            <option value="name">Name A–Z</option>
          </Select>
        </div>

        {examsStatus === "error" ? (
          <ErrorState message={examsError} onRetry={reload} />
        ) : loading ? (
          <SkeletonRows rows={6} />
        ) : !students.length ? (
          <EmptyState
            icon="users"
            title="No students yet"
            description="Students appear here after they submit one of your exams. Share an exam link to get started."
            action={<LinkButton to="/teacher/exams" size="sm">Share an exam</LinkButton>}
          />
        ) : !filtered.length ? (
          <EmptyState icon="search" title="No students match" description="Try a different name, ID or exam filter." />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-examino-border bg-slate-50/70 text-left text-xs font-semibold text-examino-muted">
                    <th className="px-5 py-2.5">Student</th>
                    <th className="px-3 py-2.5">Student ID</th>
                    <th className="px-3 py-2.5 text-right">Exams</th>
                    <th className="px-3 py-2.5">Average score</th>
                    <th className="px-3 py-2.5">Activity</th>
                    <th className="px-3 py-2.5">First attempt</th>
                    <th className="px-5 py-2.5 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.key} className="border-b border-examino-border last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-3">
                          <Avatar name={s.name} size={32} />
                          <span className="font-medium">{s.name}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-[13px] text-examino-muted">{s.roll || "—"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{s.examsTaken}</td>
                      <td className="px-3 py-3">
                        <ScoreBar pct={s.avgPct} />
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={s.active ? "green" : "neutral"}>{s.active ? "Active" : "Inactive"}</Badge>
                        <span className="ml-2 text-xs text-examino-muted">{timeAgo(s.lastSeen)}</span>
                      </td>
                      <td className="px-3 py-3 text-examino-muted">{fmtDate(s.firstSeen)}</td>
                      <td className="px-5 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(s)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-examino-border md:hidden">
              {rows.map((s) => (
                <li key={s.key}>
                  <button type="button" onClick={() => setSelected(s)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <Avatar name={s.name} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{s.name}</span>
                      <span className="text-xs text-examino-muted">
                        ID {s.roll || "—"} · {s.examsTaken} exam{s.examsTaken === 1 ? "" : "s"} · {timeAgo(s.lastSeen)}
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{fmtPct(s.avgPct)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <Pagination
              page={current}
              totalPages={totalPages}
              onChange={setPage}
              summary={`Showing ${(current - 1) * PAGE_SIZE + 1}–${Math.min(current * PAGE_SIZE, filtered.length)} of ${filtered.length} students`}
            />
          </>
        )}
      </Card>
      <StudentDrawer student={selected} onClose={() => setSelected(null)} />
    </>
  );
}
