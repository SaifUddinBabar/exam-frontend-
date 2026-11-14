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

function StudentDrawer({ student, onClose, onRemove }) {
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Fetch detailed student analytics and weak topics from API
  useEffect(() => {
    if (!student) {
      setDetails(null);
      return;
    }
    const sId = student.id || student._id;
    if (!sId) {
      setDetails(student);
      return;
    }
    setLoadingDetails(true);
    const token = localStorage.getItem("token");
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

    fetch(`${API}/api/auth/teacher/students/${sId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.student) {
          setDetails(data.student);
        } else {
          setDetails(student);
        }
      })
      .catch(() => setDetails(student))
      .finally(() => setLoadingDetails(false));
  }, [student]);

  const activeStudent = details || student;
  const ordered = useMemo(() => {
    const list = activeStudent?.attempts || [];
    return [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [activeStudent]);

  const handleRemove = async () => {
    if (!activeStudent) return;
    setRemoving(true);
    try {
      const sId = activeStudent.id || activeStudent._id;
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const res = await fetch(`${API}/api/auth/teacher/students/${sId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        if (onRemove) onRemove(activeStudent);
        onClose();
      } else {
        alert(data.message || "Failed to remove student");
      }
    } catch (err) {
      alert("Error removing student.");
    } finally {
      setRemoving(false);
      setConfirmRemove(false);
    }
  };

  if (!student) return null;

  return (
    <Drawer open onClose={onClose} title="শিক্ষার্থীর বিস্তারিত তথ্য (Student Details)">
      {/* Student Profile Header */}
      <div className="flex items-start gap-4 pb-4 border-b border-examino-border">
        {activeStudent.avatar ? (
          <img
            src={activeStudent.avatar}
            alt={activeStudent.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-examino-border shrink-0"
          />
        ) : (
          <Avatar name={activeStudent.name} size={56} />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-examino-text truncate">{activeStudent.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-examino-muted">
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
              রোল / ID: {activeStudent.roll || "—"}
            </span>
            <span>📱 {activeStudent.phone || "ফোন নেই"}</span>
          </div>
          <p className="text-xs text-examino-muted mt-1 truncate">
            ✉️ {activeStudent.email}
          </p>
        </div>
      </div>

      {loadingDetails ? (
        <div className="py-8 text-center text-xs text-examino-muted">
          <div className="w-5 h-5 border-2 border-examino-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          শিক্ষার্থীর অ্যানালিটিক্স লোড হচ্ছে...
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <dl className="mt-4 grid grid-cols-3 gap-2.5">
            {[
              ["অংশগ্রহণ", fmtNum(activeStudent.examsTaken || 0)],
              ["গড় স্কোর", fmtPct(activeStudent.avgPct || 0)],
              ["সর্বোচ্চ স্কোর", fmtPct(activeStudent.bestPct || 0)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-examino-border bg-slate-50/60 p-3 text-center">
                <dt className="text-[11px] font-medium text-examino-muted">{k}</dt>
                <dd className="text-base font-bold tabular-nums text-examino-text mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Weak Topics Analysis (যেসব টপিকে ভুল করেছে) */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚠️</span>
                <span>দুর্বল বিষয়সমূহ (Weak Topics & Mistakes)</span>
              </p>
              <span className="text-[11px] text-examino-muted">
                {activeStudent.weakTopics?.length || 0}টি টপিক
              </span>
            </div>

            {activeStudent.weakTopics && activeStudent.weakTopics.length > 0 ? (
              <div className="space-y-2">
                {activeStudent.weakTopics.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{t.topic}</p>
                      {t.chapter && (
                        <p className="text-[10px] text-slate-500 truncate">{t.chapter}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                        {t.wrongCount}টি ভুল
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          t.accuracy < 50
                            ? "bg-rose-200 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {t.accuracy}% সঠিক
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-center text-xs font-semibold text-emerald-800">
                🎉 এই শিক্ষার্থীর কোনো উল্লেখযোগ্য দুর্বল টপিক নেই বা যথেষ্ট পরীক্ষা সম্পন্ন হয়নি!
              </div>
            )}
          </div>

          {/* Academic Progress Chart */}
          {ordered.length > 1 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold text-examino-text">স্কোর অগ্রগতি (Progress Chart)</p>
              <AreaChart
                height={160}
                maxValue={100}
                data={ordered.map((a) => ({
                  label: fmtShortDay(a.createdAt),
                  value: a.pct === null ? null : Math.round(a.pct),
                }))}
                valueSuffix="%"
                ariaLabel={`Score percentage across ${ordered.length} attempts`}
              />
            </div>
          )}

          {/* Exam Attempts List */}
          <div className="mt-6">
            <p className="mb-2 text-xs font-bold text-examino-text">পরীক্ষার ইতিহাস (Attempts)</p>
            {ordered.length > 0 ? (
              <ul className="divide-y divide-examino-border rounded-xl border border-examino-border overflow-hidden">
                {[...ordered].reverse().map((a, i) => (
                  <li key={a.id || i}>
                    <Link
                      to={`/teacher/results/${a.examCode}`}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-slate-900">
                          {a.examTitle || a.examCode}
                        </span>
                        <span className="text-[11px] text-examino-muted">{fmtDateTime(a.createdAt)}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-xs font-bold tabular-nums text-slate-900">
                          {a.score} / {a.totalQuestions || a.total || 25}
                        </span>
                        <span className="text-[11px] font-semibold text-examino-blue">{fmtPct(a.pct)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-examino-muted py-2">এখনো কোনো পরীক্ষা সম্পন্ন করেনি।</p>
            )}
          </div>

          {/* Remove / Delete Student Action (Admin Control) */}
          <div className="mt-8 pt-4 border-t border-examino-border">
            {!confirmRemove ? (
              <Button
                variant="secondary"
                tone="danger"
                className="w-full text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-300"
                onClick={() => setConfirmRemove(true)}
              >
                🗑️ শিক্ষার্থীকে রিমুভ করুন (Remove Student)
              </Button>
            ) : (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                <p className="text-xs font-bold text-rose-800">
                  আপনি কি নিশ্চিত যে {activeStudent.name}-কে রিমুভ করতে চান? এর ফলে তার পরীক্ষার রেকর্ডও মুছে যাবে।
                </p>
                <div className="flex gap-2">
                  <Button
                    tone="danger"
                    size="sm"
                    busy={removing}
                    className="flex-1 bg-rose-600 text-white font-bold text-xs"
                    onClick={handleRemove}
                  >
                    হ্যাঁ, রিমুভ করুন
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setConfirmRemove(false)}
                  >
                    বাতিল
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
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
      <StudentDrawer
        student={selected}
        onClose={() => setSelected(null)}
        onRemove={(removed) => {
          if (reload) reload();
          setSelected(null);
        }}
      />
    </>
  );
}
