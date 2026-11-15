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
  PageHeader,
  SearchInput,
  Select,
  SkeletonRows,
  Tabs,
} from "../components/ui";
import { EXAM_STATUS, examQuestionCount, examStatus, fmtDate, fmtDateTime, fmtNum } from "../utils";
import { Button, Field, Input, Modal, Toggle } from "../components/ui";
import AudiencePicker, { audienceError } from "../components/AudiencePicker";

const toLocalInput = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function EditExamDialog({ exam, onClose, onSaved }) {
  const { notify } = useToast();
  const [f, setF] = useState(null);
  const [audience, setAudience] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (exam && (!f || f.code !== exam.examCode)) {
    setF({
      code: exam.examCode,
      title: exam.title,
      duration: exam.duration,
      startTime: toLocalInput(exam.startTime),
      endTime: toLocalInput(exam.endTime),
      solutionReleaseTime: toLocalInput(exam.solutionReleaseTime),
      allowRetake: Boolean(exam.allowRetake),
      maxAttempts: exam.maxAttempts || 1,
      isPublished: exam.isPublished !== false,
    });
    const a = exam.assignment || {};
    setAudience({ mode: a.mode || "all", batchIds: (a.batchIds || []).map(String), students: (a.studentIds || []).map((id) => ({ _id: String(id), name: "Selected student" })) });
  }
  if (!exam || !f || !audience) return null;
  const save = async () => {
    const a = audienceError(audience);
    if (a) return setErr(a);
    if (f.startTime && f.endTime && new Date(f.endTime) <= new Date(f.startTime)) return setErr("End must be after start.");
    setBusy(true);
    setErr("");
    try {
      const iso = (v) => (v ? new Date(v).toISOString() : null);
      await api.updateExam(exam.examCode, {
        title: f.title,
        duration: Number(f.duration),
        startTime: iso(f.startTime),
        endTime: iso(f.endTime),
        solutionReleaseTime: iso(f.solutionReleaseTime),
        allowRetake: f.allowRetake,
        maxAttempts: Number(f.maxAttempts) || 1,
        isPublished: f.isPublished,
        assignment: { mode: audience.mode, batchIds: audience.batchIds, studentIds: audience.students.map((s) => s._id) },
      });
      notify({ title: "Exam updated", description: exam.title });
      onSaved();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Exam settings"
      description={exam.examCode + " · questions can't be changed after publishing; duplicate the exam for a new question set."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} onClick={save}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="ee-title" className="sm:col-span-2">
          <Input id="ee-title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        </Field>
        <Field label="Duration (minutes)" htmlFor="ee-dur">
          <Input id="ee-dur" type="number" min={1} max={600} value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} />
        </Field>
        <div className="self-end pb-1">
          <Toggle checked={f.isPublished} onChange={(v) => setF({ ...f, isPublished: v })} label="Published" description="Unpublished exams are hidden from students." />
        </div>
        <Field label="Opens" htmlFor="ee-start">
          <Input id="ee-start" type="datetime-local" value={f.startTime} onChange={(e) => setF({ ...f, startTime: e.target.value })} />
        </Field>
        <Field label="Closes" htmlFor="ee-end">
          <Input id="ee-end" type="datetime-local" value={f.endTime} onChange={(e) => setF({ ...f, endTime: e.target.value })} />
        </Field>
        <Field label="Solutions published" htmlFor="ee-sol">
          <Input id="ee-sol" type="datetime-local" value={f.solutionReleaseTime} onChange={(e) => setF({ ...f, solutionReleaseTime: e.target.value })} />
        </Field>
        <div className="flex items-end gap-3">
          <Toggle checked={f.allowRetake} onChange={(v) => setF({ ...f, allowRetake: v })} label="Allow retakes" />
          {f.allowRetake ? <Input aria-label="Max attempts" type="number" min={1} max={20} value={f.maxAttempts} onChange={(e) => setF({ ...f, maxAttempts: e.target.value })} className="h-9 w-20" /> : null}
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-[13px] font-medium text-examino-text">Who can take this exam</p>
          <AudiencePicker value={audience} onChange={setAudience} />
        </div>
        {err ? <p className="text-sm font-medium text-examino-rose-dark sm:col-span-2">{err}</p> : null}
      </div>
    </Modal>
  );
}

function ExamActions({ exam, onDuplicate, onDelete, onCopy, onEdit }) {
  const navigate = useNavigate();
  return (
    <Dropdown
      width="w-48"
      trigger={({ toggle, open }) => <IconButton icon="dots" label={`Actions for ${exam.title}`} aria-expanded={open} onClick={toggle} className="h-8 w-8" />}
    >
      <MenuItem icon="settings" onClick={() => onEdit(exam)}>
        Edit settings
      </MenuItem>
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
        Remove…
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
  const [editing, setEditing] = useState(null);

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
        examType: exam.examType,
        allowRetake: exam.allowRetake,
        maxAttempts: exam.maxAttempts,
        isPublished: false,
        assignment: exam.assignment?.mode
          ? { mode: exam.assignment.mode, batchIds: (exam.assignment.batchIds || []).map(String), studentIds: (exam.assignment.studentIds || []).map(String) }
          : { mode: "all" },
      });
      addExam({ ...created, submissionCount: 0 });
      notify({ title: "Exam duplicated as unpublished", description: `New code ${created.examCode}. Open Edit settings to schedule and publish it.` });
    } catch (err) {
      notify({ tone: "error", title: "Couldn't duplicate exam", description: err.message });
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteExam(toDelete.examCode);
      removeExam(toDelete.examCode);
      notify({ title: "Exam removed", description: `${toDelete.title}. Student results were kept.` });
      setToDelete(null);
    } catch (err) {
      notify({ tone: "error", title: "Couldn't remove exam", description: err.message });
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
            <EmptyState icon="info" title="No unpublished exams" description="Duplicated exams start unpublished; publish them from Edit settings." />
          ) : tab === "scheduled" || tab === "live" ? (
            <EmptyState icon="clock" title={`No ${tab} exams`} description="Set opening and closing times when you create an exam, or from Edit settings." />
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
                            <div className="flex items-center gap-1 shrink-0">
                      <ExamActions exam={e} onCopy={copyLink} onDuplicate={duplicate} onDelete={setToDelete} onEdit={setEditing} />
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
                      <ExamActions exam={e} onCopy={copyLink} onDuplicate={duplicate} onDelete={setToDelete} onEdit={setEditing} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      <EditExamDialog
        exam={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Remove this exam?"
        confirmLabel="Remove exam"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      >
        <p>
          <b className="font-semibold text-examino-text">{toDelete?.title}</b> ({toDelete?.examCode}) will be hidden from students and from this list.
        </p>
        <p className="mt-2">
          Its <b className="font-semibold text-examino-text">{fmtNum(toDelete?.submissionCount || 0)} submissions</b> stay in the database; nothing is permanently deleted.
        </p>
      </ConfirmDialog>
    </>
  );
}
