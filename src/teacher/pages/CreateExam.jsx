import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MathText from "../../components/MathText";
import { api, studentExamLink } from "../api";
import { useTeacherData } from "../teacherData";
import { useToast } from "../toast";
import { QuestionPicker } from "../components/questions";
import Icon from "../components/Icon";
import { Button, Card, CardHeader, Field, IconButton, Input, LinkButton, PageHeader, Select, Textarea, Toggle } from "../components/ui";
import AudiencePicker, { EMPTY_AUDIENCE, audienceError, audienceSummary, useBatchesList } from "../components/AudiencePicker";

const STEPS = ["Details", "Questions", "Review & publish"];
const cx = (...c) => c.filter(Boolean).join(" ");

function Stepper({ step, onGo, canGo }) {
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="Steps">
      {STEPS.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={label}>
            <button
              type="button"
              disabled={!canGo(i)}
              onClick={() => onGo(i)}
              aria-current={current ? "step" : undefined}
              className="flex items-center gap-2.5 text-sm disabled:cursor-not-allowed"
            >
              <span
                className={cx(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  done ? "bg-examino-green-dark text-white" : current ? "bg-examino-blue text-white" : "bg-slate-200 text-examino-muted"
                )}
              >
                {done ? <Icon name="check" size={14} strokeWidth={2.5} /> : i + 1}
              </span>
              <span className={current ? "font-semibold text-examino-text" : "text-examino-muted"}>{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function CreateExam() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, addExam } = useTeacherData();
  const { notify } = useToast();
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState({ title: "", description: "", duration: 30, negative: "0.25", startTime: "", endTime: "", solutionReleaseTime: "", allowRetake: false, maxAttempts: 1 });
  const [audience, setAudience] = useState(EMPTY_AUDIENCE);
  const batches = useBatchesList();
  const [errors, setErrors] = useState({});
  const [selected, setSelected] = useState(() => new Map((location.state?.questions || []).map((q) => [q._id, q])));
  const [publishing, setPublishing] = useState(false);
  const [created, setCreated] = useState(null);

  const ordered = [...selected.values()];

  const detailErrors = () => {
    const e = {};
    if (!details.title.trim()) e.title = "Give the exam a title.";
    const d = Number(details.duration);
    if (!Number.isFinite(d) || d < 1 || d > 600) e.duration = "Duration must be between 1 and 600 minutes.";
    if (details.startTime && details.endTime && new Date(details.endTime) <= new Date(details.startTime)) e.endTime = "End must be after start.";
    const a = audienceError(audience);
    if (a) e.audience = a;
    return e;
  };
  const canGo = (i) => i <= step || (i === 1 && !Object.keys(detailErrors()).length) || (i === 2 && !Object.keys(detailErrors()).length && ordered.length > 0);

  const next = () => {
    if (step === 0) {
      const e = detailErrors();
      setErrors(e);
      if (Object.keys(e).length) return;
    }
    if (step === 1 && !ordered.length) {
      notify({ tone: "error", title: "Select at least one question" });
      return;
    }
    setStep((s) => s + 1);
  };

  const toggle = (q) =>
    setSelected((prev) => {
      const m = new Map(prev);
      if (m.has(q._id)) m.delete(q._id);
      else m.set(q._id, q);
      return m;
    });

  const move = (index, dir) => {
    const arr = [...ordered];
    const j = index + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[index], arr[j]] = [arr[j], arr[index]];
    setSelected(new Map(arr.map((q) => [q._id, q])));
  };

  const publish = async () => {
    setPublishing(true);
    try {
      const exam = await api.createExam({
        title: details.title.trim(),
        description: details.description.trim(),
        questions: ordered.map((q) => q._id),
        duration: Number(details.duration),
        negativeMarkPerWrong: Number(details.negative),
        startTime: details.startTime ? new Date(details.startTime).toISOString() : null,
        endTime: details.endTime ? new Date(details.endTime).toISOString() : null,
        solutionReleaseTime: details.solutionReleaseTime ? new Date(details.solutionReleaseTime).toISOString() : null,
        examType: details.startTime || details.endTime ? "scheduled" : "practice",
        allowRetake: details.allowRetake,
        maxAttempts: details.allowRetake ? Number(details.maxAttempts) || 1 : 1,
        assignment: { mode: audience.mode, batchIds: audience.batchIds, studentIds: audience.students.map((x) => x._id) },
        isPublished: true,
      });
      addExam({ ...exam, submissionCount: 0 });
      setCreated(exam);
      notify({ title: "Exam published", description: `Code ${exam.examCode}` });
    } catch (err) {
      notify({ tone: "error", title: "Couldn't publish the exam", description: err.message });
    } finally {
      setPublishing(false);
    }
  };

  if (created) {
    const link = studentExamLink(created.examCode);
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-examino-green-dark text-white">
          <Icon name="check" size={26} strokeWidth={2.5} />
        </span>
        <h1 className="mt-4 text-xl font-semibold">Your exam is live</h1>
        <p className="mt-1 text-sm text-examino-muted">{created.title}</p>
        <div className="mt-6 rounded-xl border border-examino-border bg-slate-50 p-4 text-left">
          <p className="text-xs font-medium text-examino-muted">Exam code</p>
          <p className="font-mono text-2xl font-semibold tracking-wider">{created.examCode}</p>
          <p className="mt-3 text-xs font-medium text-examino-muted">Student link</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1.5 text-xs ring-1 ring-examino-border">{link}</code>
            <Button
              size="sm"
              variant="secondary"
              icon="copy"
              onClick={() =>
                navigator.clipboard
                  .writeText(link)
                  .then(() => notify({ title: "Link copied" }))
                  .catch(() => notify({ tone: "error", title: "Couldn't copy the link" }))
              }
            >
              Copy
            </Button>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <LinkButton to="/teacher/exams" variant="secondary">
            All exams
          </LinkButton>
          <Button variant="secondary" icon="file" onClick={() => navigate("/teacher/paper-builder", { state: { questions: ordered, title: created.title } })}>
            Print as paper
          </Button>
          <LinkButton to={`/teacher/results/${created.examCode}`}>View results</LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <>
      <PageHeader title="Create exam" description="Set the rules, choose questions from the bank, and publish a shareable online exam." />
      <Stepper step={step} onGo={setStep} canGo={canGo} />

      {step === 0 ? (
        <Card className="max-w-3xl">
          <CardHeader title="Exam details" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Title" htmlFor="ce-title" required error={errors.title} className="sm:col-span-2">
              <Input id="ce-title" value={details.title} invalid={!!errors.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} placeholder="HSC 2027 ICT — Model Test 04" />
            </Field>
            <Field label="Description" htmlFor="ce-desc" hint="Optional · shown on the exam details page" className="sm:col-span-2">
              <Textarea id="ce-desc" rows={3} value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} placeholder="অধ্যায় ১–২ · প্রতিটি প্রশ্নের মান ১" />
            </Field>
            <Field label="Duration (minutes)" htmlFor="ce-dur" required error={errors.duration}>
              <Input id="ce-dur" type="number" min={1} max={600} value={details.duration} invalid={!!errors.duration} onChange={(e) => setDetails({ ...details, duration: e.target.value })} />
            </Field>
            <Field label="Negative marking" htmlFor="ce-neg" hint="Marks deducted for each wrong answer">
              <Select id="ce-neg" value={details.negative} onChange={(e) => setDetails({ ...details, negative: e.target.value })}>
                <option value="0">None</option>
                <option value="0.25">−0.25 per wrong answer</option>
                <option value="0.5">−0.50 per wrong answer</option>
                <option value="1">−1 per wrong answer</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 border-t border-examino-border p-5 sm:grid-cols-3">
            <Field label="Opens" htmlFor="ce-start" hint="Leave empty to open now">
              <Input id="ce-start" type="datetime-local" value={details.startTime} onChange={(e) => setDetails({ ...details, startTime: e.target.value })} />
            </Field>
            <Field label="Closes" htmlFor="ce-end" hint="Leave empty for no deadline" error={errors.endTime}>
              <Input id="ce-end" type="datetime-local" value={details.endTime} invalid={!!errors.endTime} onChange={(e) => setDetails({ ...details, endTime: e.target.value })} />
            </Field>
            <Field label="Solutions published" htmlFor="ce-sol" hint="Default: when it closes (or right after submit)">
              <Input id="ce-sol" type="datetime-local" value={details.solutionReleaseTime} onChange={(e) => setDetails({ ...details, solutionReleaseTime: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Toggle checked={details.allowRetake} onChange={(v) => setDetails({ ...details, allowRetake: v })} label="Allow retakes" description="Scheduled exams always allow one attempt." />
            </div>
            {details.allowRetake ? (
              <Field label="Max attempts" htmlFor="ce-att">
                <Input id="ce-att" type="number" min={1} max={20} value={details.maxAttempts} onChange={(e) => setDetails({ ...details, maxAttempts: e.target.value })} />
              </Field>
            ) : null}
          </div>
          <div className="border-t border-examino-border p-5">
            <p className="mb-1 text-[13px] font-medium text-examino-text">Who can take this exam</p>
            <p className="mb-3 text-xs text-examino-muted">Students outside this audience can't see or open the exam — the server checks it.</p>
            <AudiencePicker value={audience} onChange={setAudience} />
            {errors.audience ? <p className="mt-2 text-xs font-medium text-examino-rose-dark">{errors.audience}</p> : null}
          </div>
        </Card>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-6">
          <QuestionPicker
            selected={selected}
            onToggle={toggle}
            userId={userId}
            examTitle={details.title}
            onSave={next}
            onSelectPage={(qs, add) =>
              setSelected((prev) => {
                const m = new Map(prev);
                qs.forEach((q) => (add ? m.set(q._id, q) : m.delete(q._id)));
                return m;
              })
            }
          />
        </div>
      ) : null}

      {step === 2 ? (
        <Card className="max-w-3xl">
          <CardHeader title="Review" description="Check everything before publishing. Schedule and audience can be changed later from Online Exams." />
          <dl className="grid gap-px overflow-hidden bg-examino-border sm:grid-cols-2">
            {[
              ["Title", details.title],
              ["Questions", `${ordered.length} MCQ`],
              ["Total marks", ordered.length],
              ["Duration", `${details.duration} minutes`],
              ["Negative marking", Number(details.negative) ? `−${details.negative} per wrong answer` : "None"],
              ["Opens", details.startTime ? new Date(details.startTime).toLocaleString() : "Immediately"],
              ["Closes", details.endTime ? new Date(details.endTime).toLocaleString() : "No deadline"],
              ["Attempts", details.allowRetake && !(details.startTime || details.endTime) ? `Up to ${details.maxAttempts}` : "1"],
              ["Assigned to", audienceSummary(audience, batches)],
            ].map(([k, v]) => (
              <div key={k} className="bg-white px-5 py-3">
                <dt className="text-xs text-examino-muted">{k}</dt>
                <dd className="text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="p-5">
            <p className="mb-2 text-sm font-semibold">Question order</p>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
              {ordered.slice(0, 10).map((q) => (
                <li key={q._id} className="line-clamp-1">
                  <MathText text={q.question} />
                </li>
              ))}
            </ol>
            {ordered.length > 10 ? <p className="mt-2 text-xs text-examino-muted">…and {ordered.length - 10} more</p> : null}
          </div>
        </Card>
      ) : null}

      <div className="mt-6 flex max-w-3xl flex-wrap justify-between gap-3 xl:max-w-none">
        <Button variant="secondary" icon="chevronLeft" onClick={() => (step ? setStep(step - 1) : navigate("/teacher/exams"))}>
          {step ? "Back" : "Cancel"}
        </Button>
        {step < 2 ? (
          <Button iconRight="chevronRight" onClick={next}>
            {step === 0 ? "Choose questions" : `Review ${ordered.length} question${ordered.length === 1 ? "" : "s"}`}
          </Button>
        ) : (
          <Button icon="check" loading={publishing} onClick={publish}>
            Publish exam
          </Button>
        )}
      </div>
    </>
  );
}
