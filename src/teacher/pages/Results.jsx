import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, studentExamLink } from "../api";
import { useTeacherData } from "../teacherData";
import { useToast } from "../toast";
import { AreaChart, BarChart } from "../components/charts";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Input,
  LinkButton,
  PageHeader,
  Pagination,
  SearchInput,
  SkeletonRows,
} from "../components/ui";
import StatCard from "../components/StatCard";
import { EXAM_STATUS, average, downloadCsv, examQuestionCount, examStatus, fmtDate, fmtDateTime, fmtNum, fmtPct, fmtShortDay, median, readPref, writePref } from "../utils";

function usePassMark() {
  const [passMark, setPassMarkState] = useState(() => readPref("passMark", 33));
  const setPassMark = (v) => {
    const n = Math.min(100, Math.max(0, Number(v) || 0));
    setPassMarkState(n);
    writePref("passMark", n);
  };
  return [passMark, setPassMark];
}

function PassMarkInput({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs text-examino-muted">
      Pass mark
      <Input type="number" min={0} max={100} value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-16 text-center" aria-label="Pass mark percentage" />%
    </label>
  );
}

function summarize(attempts, passMark) {
  const pcts = attempts.map((a) => a.pct).filter((p) => p !== null);
  return {
    count: attempts.length,
    avg: average(pcts),
    high: pcts.length ? Math.max(...pcts) : null,
    low: pcts.length ? Math.min(...pcts) : null,
    median: median(pcts),
    pass: pcts.length ? (pcts.filter((p) => p >= passMark).length / pcts.length) * 100 : null,
  };
}

function distribution(attempts) {
  const bins = Array.from({ length: 10 }, (_, i) => ({ label: `${i * 10}–${i === 9 ? 100 : i * 10 + 9}`, value: 0 }));
  attempts.forEach((a) => {
    if (a.pct === null) return;
    bins[Math.min(9, Math.floor(a.pct / 10))].value += 1;
  });
  return bins;
}

// ---------------------------------------------------------------- All exams

function ResultsOverview() {
  const { exams, attempts, examsStatus, examsError, rankingsLoading, reload } = useTeacherData();
  const [passMark, setPassMark] = usePassMark();
  const subjectTargets = useMemo(() => exams.filter((e) => (e.submissionCount || 0) > 0).slice(0, 20), [exams]);
  const subjectKey = subjectTargets.map((e) => e.examCode).join(",");
  const [subjectResult, setSubjectResult] = useState({ key: null, byExam: {} });
  const subjects = useMemo(
    () => (subjectResult.key === subjectKey ? { status: "ready", byExam: subjectResult.byExam } : { status: subjectKey ? "loading" : "ready", byExam: {} }),
    [subjectResult, subjectKey]
  );

  const perExam = useMemo(
    () =>
      exams
        .map((e) => ({ exam: e, ...summarize(attempts.filter((a) => a.examCode === e.examCode), passMark) }))
        .sort((a, b) => new Date(b.exam.createdAt) - new Date(a.exam.createdAt)),
    [exams, attempts, passMark]
  );
  const overall = useMemo(() => summarize(attempts, passMark), [attempts, passMark]);

  // Subject of each exam = most common subject among its questions (GET /api/exams/:code/admin).
  useEffect(() => {
    if (examsStatus !== "ready" || !subjectTargets.length) return undefined;
    let cancelled = false;
    const targets = subjectTargets;
    Promise.allSettled(targets.map((e) => api.examAdmin(e.examCode))).then((results) => {
      if (cancelled) return;
      const byExam = {};
      results.forEach((r, i) => {
        if (r.status !== "fulfilled") return;
        const tally = {};
        (r.value.questions || []).forEach((q) => {
          tally[q.subject] = (tally[q.subject] || 0) + 1;
        });
        const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
        if (top) byExam[targets[i].examCode] = top[0];
      });
      setSubjectResult({ key: subjectKey, byExam });
    });
    return () => {
      cancelled = true;
    };
  }, [subjectTargets, subjectKey, examsStatus]);

  const bySubject = useMemo(() => {
    const groups = {};
    attempts.forEach((a) => {
      const s = subjects.byExam[a.examCode];
      if (!s) return;
      (groups[s] = groups[s] || []).push(a);
    });
    return Object.entries(groups)
      .map(([subject, list]) => ({ subject, ...summarize(list, passMark), exams: new Set(list.map((a) => a.examCode)).size }))
      .sort((a, b) => b.count - a.count);
  }, [attempts, subjects, passMark]);

  const trend = useMemo(
    () =>
      [...perExam]
        .filter((r) => r.avg !== null)
        .reverse()
        .slice(-12)
        .map((r) => ({ label: r.exam.examCode, value: Math.round(r.avg) })),
    [perExam]
  );

  const loading = examsStatus === "loading" || rankingsLoading;

  if (examsStatus === "error") {
    return (
      <Card>
        <ErrorState message={examsError} onRetry={reload} />
      </Card>
    );
  }

  return (
    <>
      <PageHeader title="Results & Analytics" description="How your students perform across exams and subjects." actions={<PassMarkInput value={passMark} onChange={setPassMark} />} />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Submissions" icon="check" state={loading ? "loading" : "ready"} value={fmtNum(overall.count)} note={`across ${fmtNum(exams.length)} exams`} />
        <StatCard label="Average score" icon="target" state={loading ? "loading" : "ready"} value={fmtPct(overall.avg)} note="mean of all attempts" />
        <StatCard label="Highest score" icon="trophy" state={loading ? "loading" : "ready"} value={fmtPct(overall.high)} note="best single attempt" />
        <StatCard label="Pass rate" icon="chart" state={loading ? "loading" : "ready"} value={fmtPct(overall.pass)} note={`at a ${passMark}% pass mark`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Historical trend" description="Average score of your last 12 exams with results, oldest to newest" />
          <div className="px-3 pb-4 pt-3">
            {loading ? (
              <SkeletonRows rows={3} />
            ) : trend.length < 2 ? (
              <EmptyState icon="chart" title="Not enough results yet" description="The trend appears once two or more exams have submissions." />
            ) : (
              <AreaChart data={trend} maxValue={100} valueSuffix="%" formatValue={(v) => Math.round(v)} ariaLabel="Average score per exam" />
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="Subject-wise" description="Subject inferred from each exam's questions" />
          {loading || subjects.status === "loading" ? (
            <SkeletonRows rows={3} />
          ) : bySubject.length ? (
            <ul className="divide-y divide-examino-border px-5 py-2">
              {bySubject.map((s) => (
                <li key={s.subject} className="py-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{s.subject}</span>
                    <span className="tabular-nums font-semibold">{fmtPct(s.avg)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-examino-blue" style={{ width: `${Math.max(2, s.avg || 0)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-examino-muted">
                    {s.count} attempts · {s.exams} exam{s.exams === 1 ? "" : "s"} · pass {fmtPct(s.pass)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="book" title="No subject data yet" description="Appears once your exams have submissions." />
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Exam-wise performance" description="Click an exam for its rank list and score distribution" />
        {loading ? (
          <SkeletonRows rows={5} />
        ) : !perExam.length ? (
          <EmptyState icon="clipboard" title="No exams yet" action={<LinkButton to="/teacher/exams/new" size="sm" icon="plus">Create exam</LinkButton>} />
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-y border-examino-border bg-slate-50/70 text-left text-xs font-semibold text-examino-muted">
                  <th className="px-5 py-2.5">Exam</th>
                  <th className="px-3 py-2.5">Subject</th>
                  <th className="px-3 py-2.5 text-right">Participants</th>
                  <th className="px-3 py-2.5 text-right">Average</th>
                  <th className="px-3 py-2.5 text-right">Highest</th>
                  <th className="px-3 py-2.5 text-right">Lowest</th>
                  <th className="px-5 py-2.5 text-right">Pass rate</th>
                </tr>
              </thead>
              <tbody>
                {perExam.map((r) => (
                  <tr key={r.exam.examCode} className="border-b border-examino-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <Link to={`/teacher/results/${r.exam.examCode}`} className="font-medium hover:text-examino-blue">
                        {r.exam.title}
                      </Link>
                      <p className="text-xs text-examino-muted">
                        <span className="font-mono">{r.exam.examCode}</span> · {fmtDate(r.exam.createdAt)}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-examino-muted">{subjects.byExam[r.exam.examCode] || "—"}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{fmtNum(r.count)}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">{fmtPct(r.avg)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{fmtPct(r.high)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{fmtPct(r.low)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{fmtPct(r.pass)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

// ---------------------------------------------------------------- One exam

const PAGE = 20;

function ExamResults({ code }) {
  const { exams, attempts, examsStatus, rankingsLoading, reload } = useTeacherData();
  const { notify } = useToast();
  const [passMark, setPassMark] = usePassMark();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const exam = exams.find((e) => e.examCode === code);
  const rows = useMemo(() => attempts.filter((a) => a.examCode === code).sort((a, b) => b.score - a.score || new Date(a.createdAt) - new Date(b.createdAt)), [attempts, code]);
  const ranked = useMemo(() => rows.map((r, i) => ({ ...r, rank: i + 1 })), [rows]);
  const s = useMemo(() => summarize(rows, passMark), [rows, passMark]);
  const filtered = ranked.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.roll.toLowerCase().includes(q.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, totalPages);

  const overTime = useMemo(() => {
    const byDay = {};
    rows.forEach((r) => {
      const d = new Date(r.createdAt);
      d.setHours(0, 0, 0, 0);
      byDay[d.getTime()] = (byDay[d.getTime()] || 0) + 1;
    });
    return Object.keys(byDay)
      .map(Number)
      .sort((a, b) => a - b)
      .slice(-30)
      .map((t) => ({ label: fmtShortDay(t), value: byDay[t] }));
  }, [rows]);

  if (examsStatus === "loading") return <Card><SkeletonRows rows={6} /></Card>;
  if (!exam) {
    return (
      <Card>
        <EmptyState
          icon="search"
          title="Exam not found"
          description={`There's no exam with code ${code} among your exams.`}
          action={<LinkButton to="/teacher/results" size="sm">All results</LinkButton>}
        />
      </Card>
    );
  }

  const st = EXAM_STATUS[examStatus(exam)];
  const total = examQuestionCount(exam);

  const exportCsv = () =>
    downloadCsv(`${exam.examCode}-results.csv`, [
      ["Rank", "Name", "Roll", "Score", "Out of", "Percent", "Submitted"],
      ...ranked.map((r) => [r.rank, r.name, r.roll, r.score, r.total, r.pct?.toFixed(1) ?? "", fmtDateTime(r.createdAt)]),
    ]);

  return (
    <>
      <PageHeader
        eyebrow={
          <Link to="/teacher/results" className="hover:text-examino-text">
            ← All results
          </Link>
        }
        title={exam.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={st.tone}>{st.label}</Badge>
            <span className="font-mono">{exam.examCode}</span>· {total} questions · {exam.duration} min
            {exam.negativeMarkPerWrong ? ` · −${exam.negativeMarkPerWrong} per wrong` : ""}
          </span>
        }
        actions={
          <>
            <PassMarkInput value={passMark} onChange={setPassMark} />
            <Button
              variant="secondary"
              icon="link"
              onClick={() =>
                navigator.clipboard
                  .writeText(studentExamLink(exam.examCode))
                  .then(() => notify({ title: "Student link copied" }))
                  .catch(() => notify({ tone: "error", title: "Couldn't copy the link" }))
              }
            >
              Copy link
            </Button>
            <Button variant="secondary" icon="refresh" onClick={reload}>
              Refresh
            </Button>
            <Button icon="download" onClick={exportCsv} disabled={!rows.length}>
              Export CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Participants" icon="users" state={rankingsLoading ? "loading" : "ready"} value={fmtNum(s.count)} />
        <StatCard label="Average" icon="target" state={rankingsLoading ? "loading" : "ready"} value={fmtPct(s.avg)} note={s.avg !== null ? `${((s.avg / 100) * total).toFixed(1)} / ${total}` : null} />
        <StatCard label="Highest" icon="trophy" state={rankingsLoading ? "loading" : "ready"} value={fmtPct(s.high)} note={ranked[0] ? ranked[0].name : null} />
        <StatCard label="Median" icon="chart" state={rankingsLoading ? "loading" : "ready"} value={fmtPct(s.median)} note={`lowest ${fmtPct(s.low)}`} />
        <StatCard label="Pass rate" icon="check" state={rankingsLoading ? "loading" : "ready"} value={fmtPct(s.pass)} note={`≥ ${passMark}%`} />
      </div>

      {!rankingsLoading && !rows.length ? (
        <Card className="mt-6">
          <EmptyState
            icon="clock"
            title="No submissions yet"
            description="Share the student link — results appear here as soon as students submit."
            action={
              <Button size="sm" icon="link" onClick={() => navigator.clipboard.writeText(studentExamLink(exam.examCode)).then(() => notify({ title: "Student link copied" }))}>
                Copy student link
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Score distribution" description="Number of students per 10% band" />
              <div className="px-3 pb-4 pt-3">
                {rankingsLoading ? <SkeletonRows rows={3} /> : <BarChart data={distribution(rows)} highlightFrom={Math.floor(passMark / 10)} valueSuffix=" students" ariaLabel="Score distribution" />}
              </div>
              <p className="px-5 pb-4 text-xs text-examino-muted">Grey bars are below the {passMark}% pass mark.</p>
            </Card>
            <Card>
              <CardHeader title="Submissions over time" description="Per day, last 30 active days" />
              <div className="px-3 pb-4 pt-3">
                {rankingsLoading ? <SkeletonRows rows={3} /> : <BarChart data={overTime} valueSuffix=" submissions" ariaLabel="Submissions per day" />}
              </div>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader title="Rank list" description="Ties are ordered by who submitted first" actions={<SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Name or roll" className="w-56" label="Search rank list" />} />
            {rankingsLoading ? (
              <SkeletonRows rows={6} />
            ) : (
              <>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-y border-examino-border bg-slate-50/70 text-left text-xs font-semibold text-examino-muted">
                        <th className="w-16 px-5 py-2.5">Rank</th>
                        <th className="px-3 py-2.5">Student</th>
                        <th className="px-3 py-2.5">Roll</th>
                        <th className="px-3 py-2.5 text-right">Score</th>
                        <th className="px-3 py-2.5 text-right">%</th>
                        <th className="px-3 py-2.5">Result</th>
                        <th className="px-5 py-2.5">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice((current - 1) * PAGE, current * PAGE).map((r) => (
                        <tr key={r.id} className="border-b border-examino-border last:border-0">
                          <td className="px-5 py-2.5 font-mono tabular-nums">{r.rank}</td>
                          <td className="px-3 py-2.5 font-medium">
                            <Link to={`/teacher/students?q=${encodeURIComponent(r.roll)}`} className="hover:text-examino-blue">
                              {r.name}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[13px] text-examino-muted">{r.roll}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                            {r.score}/{r.total}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{fmtPct(r.pct)}</td>
                          <td className="px-3 py-2.5">{r.pct !== null && r.pct >= passMark ? <Badge tone="green">Pass</Badge> : <Badge tone="red">Below pass</Badge>}</td>
                          <td className="px-5 py-2.5 text-examino-muted">{fmtDateTime(r.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={current} totalPages={totalPages} onChange={setPage} summary={`${filtered.length} of ${ranked.length} students`} />
              </>
            )}
          </Card>
        </>
      )}
    </>
  );
}

export default function Results() {
  const { code } = useParams();
  return code ? <ExamResults code={code.toUpperCase()} /> : <ResultsOverview />;
}

