import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, studentExamLink } from "../api";
import { useTeacherData } from "../teacherData";
import { useToast } from "../toast";
import {
  Badge,
  Card,
  ConfirmDialog,
  Dropdown,
  EmptyState,
  ErrorState,
  IconButton,
  LinkButton,
  MenuItem,
  Notice,
  PageHeader,
  SearchInput,
  Select,
  SkeletonRows,
  Tabs,
} from "../components/ui";
import { EXAM_STATUS, examQuestionCount, examStatus, fmtDate, fmtDateTime, fmtNum } from "../utils";

function ExamActions({ exam, onDuplicate, onDelete, onCopy }) {
  const navigate = useNavigate();
  return (
    <Dropdown
      width="w-48"
      trigger={({ toggle, open }) => <IconButton icon="dots" label={`Actions for ${exam.title}`} aria-expanded={open} onClick={toggle} className="h-8 w-8" />}
    >
      <MenuItem icon="chart" onClick={() => navigate(`/teacher/results/${exam.examCode}`)}>
        View results
      </MenuItem>
      <MenuItem icon="link" onClick={() => onCopy(exam)}>
        Copy student link
      </MenuItem>
      <MenuItem icon="duplicate" onClick={() => onDuplicate(exam)}>
        Duplicate
      </MenuItem>
      <div className="my-1 h-px bg-examino-border" />
      <MenuItem icon="trash" tone="danger" onClick={() => onDelete(exam)}>
        Delete…
      </MenuItem>
    </Dropdown>
  );
}

export default function Exams() {
  const { exams, examsStatus, examsError, reload, addExam, removeExam } = useTeacherData();
  const { notify } = useToast();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const counts = useMemo(() => {
    const c = { all: exams.length, live: 0, scheduled: 0, open: 0, completed: 0, draft: 0 };
    exams.forEach((e) => {
      c[examStatus(e)] += 1;
    });
    return c;
  }, [exams]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const rows = exams.filter((e) => (tab === "all" || examStatus(e) === tab) && (!term || e.title.toLowerCase().includes(term) || e.examCode.toLowerCase().includes(term)));
    const by = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      participants: (a, b) => (b.submissionCount || 0) - (a.submissionCount || 0),
      title: (a, b) => a.title.localeCompare(b.title),
    };
    return [...rows].sort(by[sort]);
  }, [exams, tab, q, sort]);

  const copyLink = async (exam) => {
    try {
      await navigator.clipboard.writeText(studentExamLink(exam.examCode));
      notify({ title: "Student link copied", description: studentExamLink(exam.examCode) });
    } catch {
      notify({ tone: "error", title: "Couldn't copy", description: `Share this code instead: ${exam.examCode}` });
    }
  };

  const duplicate = async (exam) => {
    try {
      const created = await api.createExam({
        title: `${exam.title} (copy)`,
        description: exam.description || "",
        questions: exam.questions,
        duration: exam.duration,
        negativeMarkPerWrong: exam.negativeMarkPerWrong || 0,
      });
      addExam({ ...created, submissionCount: 0 });
      notify({ title: "Exam duplicated", description: `New code ${created.examCode}` });
    } catch (err) {
      notify({ tone: "error", title: "Couldn't duplicate exam", description: err.message });
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteExam(toDelete.examCode);
      removeExam(toDelete.examCode);
      notify({ title: "Exam deleted", description: toDelete.title });
      setToDelete(null);
    } catch (err) {
      notify({ tone: "error", title: "Couldn't delete exam", description: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { value: "all", label: "All", count: counts.all },
    { value: "live", label: "Live", count: counts.live },
    { value: "scheduled", label: "Scheduled", count: counts.scheduled },
    { value: "open", label: "Published", count: counts.open },
    { value: "completed", label: "Completed", count: counts.completed },
    { value: "draft", label: "Drafts", count: counts.draft },
  ];

  return (
    <>
      <PageHeader
        title="Online Exams"
        description="Create, share and track your online exams."
        actions={
          <LinkButton to="/teacher/exams/new" icon="plus">
            Create exam
          </LinkButton>
        }
      />

      <Card>
        <div className="px-5 pt-1">
          <Tabs tabs={tabs} value={tab} onChange={setTab} label="Exam status" />
        </div>
        <div className="flex flex-wrap gap-3 border-b border-examino-border p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search by title or code" className="min-w-[220px] flex-1" label="Search exams" />
          <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort exams" className="w-full sm:w-48">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="participants">Most participants</option>
            <option value="title">Title A–Z</option>
          </Select>
        </div>

        {examsStatus === "error" ? (
          <ErrorState message={examsError} onRetry={reload} />
        ) : examsStatus === "loading" ? (
          <SkeletonRows rows={6} />
        ) : !exams.length ? (
          <EmptyState
            icon="clipboard"
            title="No exams yet"
            description="Choose questions from the bank, set the duration and negative marking, then share the link with students."
            action={<LinkButton to="/teacher/exams/new" icon="plus">Create your first exam</LinkButton>}
          />
        ) : !list.length ? (
          tab === "draft" ? (
            <EmptyState icon="info" title="No drafts" description="Exams created through the current API are published immediately, so there are no drafts to show." />
          ) : tab === "scheduled" || tab === "live" ? (
            <EmptyState icon="clock" title={`No ${tab} exams`} description="The create-exam API doesn't accept start and end times yet, so new exams stay open until you delete them." />
          ) : (
            <EmptyState icon="search" title="No exams match" description="Try another search or tab." />
          )
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-examino-border bg-slate-50/70 text-left text-xs font-semibold text-examino-muted">
                    <th className="px-5 py-2.5">Exam</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5 text-right">Questions</th>
                    <th className="px-3 py-2.5 text-right">Duration</th>
                    <th className="px-3 py-2.5 text-right">Participants</th>
                    <th className="px-3 py-2.5">Window</th>
                    <th className="px-3 py-2.5">Created</th>
                    <th className="px-5 py-2.5">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((e) => {
                    const status = examStatus(e);
                    return (
                      <tr key={e.examCode} className="border-b border-examino-border last:border-0 hover:bg-slate-50/60">
                        <td className="max-w-[320px] px-5 py-3">
                          <Link to={`/teacher/results/${e.examCode}`} className="font-medium text-examino-text hover:text-examino-blue">
                            {e.title}
                          </Link>
                          <p className="text-xs text-examino-muted">
                            <span className="font-mono">{e.examCode}</span>
                            {e.negativeMarkPerWrong ? ` · −${e.negativeMarkPerWrong} per wrong` : " · no negative marking"}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <Badge tone={EXAM_STATUS[status].tone} dot={status === "live"}>
                            {EXAM_STATUS[status].label}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">{examQuestionCount(e)}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{e.duration} min</td>
                        <td className="px-3 py-3 text-right tabular-nums">{fmtNum(e.submissionCount || 0)}</td>
                        <td className="px-3 py-3 text-xs text-examino-muted">
                          {e.startTime || e.endTime ? (
                            <>
                              {fmtDateTime(e.startTime)} – {fmtDateTime(e.endTime)}
                            </>
                          ) : (
                            "Always open"
                          )}
                        </td>
                        <td className="px-3 py-3 text-examino-muted">{fmtDate(e.createdAt)}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              title="Delete Exam"
                              onClick={() => setToDelete(e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Icon name="trash" size={16} />
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Delete Exam"
                        onClick={() => setToDelete(e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Icon name="trash" size={17} />
                      </button>
                      <ExamActions exam={e} onCopy={copyLink} onDuplicate={duplicate} onDelete={setToDelete} />
                    </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-examino-border md:hidden">
              {list.map((e) => {
                const status = examStatus(e);
                return (
                  <li key={e.examCode} className="flex items-start gap-3 px-4 py-3">
                    <Link to={`/teacher/results/${e.examCode}`} className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{e.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-examino-muted">
                        <Badge tone={EXAM_STATUS[status].tone}>{EXAM_STATUS[status].label}</Badge>
                        <span className="font-mono">{e.examCode}</span>
                        <span>
                          {examQuestionCount(e)} Q · {e.duration} min · {fmtNum(e.submissionCount || 0)} took it
                        </span>
                      </span>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Delete Exam"
                        onClick={() => setToDelete(e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Icon name="trash" size={17} />
                      </button>
                      <ExamActions exam={e} onCopy={copyLink} onDuplicate={duplicate} onDelete={setToDelete} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      <Notice tone="neutral" className="mt-5">
        Editing an exam, saving drafts, scheduling and attempt limits need backend support that isn't available yet. To change an exam today, duplicate it with new questions and delete the old one.
      </Notice>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this exam?"
        confirmLabel="Delete exam"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      >
        <p>
          <b className="font-semibold text-examino-text">{toDelete?.title}</b> ({toDelete?.examCode}) will be removed for everyone.
        </p>
        <p className="mt-2">
          The server also permanently deletes its <b className="font-semibold text-examino-text">{fmtNum(toDelete?.submissionCount || 0)} submissions</b>. Download results first if you need them. This can't be undone.
        </p>
      </ConfirmDialog>
    </>
  );
}
