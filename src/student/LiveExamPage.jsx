import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExaminoLogo from "../components/ExaminoLogo";
import MathText from "../components/MathText";
import QuestionImage from "../components/QuestionImage";
import { api } from "../teacher/api";
import { Button, Card, ErrorState, Modal, Segmented, Spinner } from "../teacher/components/ui";
import Icon from "../teacher/components/Icon";
import { resolveQuestion, TRANSLATION_UNAVAILABLE } from "../lib/questionLanguage";
import { triggerHaptic } from "../utils/haptics";
import { fmtDuration } from "./examFormat";

const cx = (...c) => c.filter(Boolean).join(" ");
const BN_LETTERS = ["ক", "খ", "গ", "ঘ"];
const EN_LETTERS = ["A", "B", "C", "D"];

export default function LiveExamPage() {
  const { code } = useParams();
  const examCode = String(code || "").toUpperCase();
  const navigate = useNavigate();
  const localKey = `examino_attempt_${examCode}`;

  const [phase, setPhase] = useState("loading"); // loading | ready | error | submitting
  const [error, setError] = useState("");
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [offset, setOffset] = useState(0); // serverNow - clientNow
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState(() => new Set());
  const [visited, setVisited] = useState(() => new Set([0]));
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [save, setSave] = useState({ state: "saved", at: null }); // saved | pending | saving | offline | error
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lang, setLang] = useState(() => (localStorage.getItem("examino_language_mode") === "english" ? "english" : "bangla"));

  const dirty = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submittedRef = useRef(false);
  const idemKey = useRef(`${examCode}-${Math.random().toString(36).slice(2)}-${Date.now()}`);

  // ---------------------------------------------------------------- start / resume
  useEffect(() => {
    let cancelled = false;
    api
      .startExam(examCode)
      .then((res) => {
        if (cancelled) return;
        const serverAnswers = res.attempt?.answers || {};
        // Merge any answers saved locally while offline (only for this attempt).
        let local = {};
        try {
          const saved = JSON.parse(localStorage.getItem(localKey) || "null");
          if (saved && saved.startedAt === res.attempt.startedAt) {
            local = saved.answers || {};
            if (saved.marked) setMarked(new Set(saved.marked));
          }
        } catch {
          /* ignore */
        }
        const merged = { ...serverAnswers, ...local };
        dirty.current = Object.keys(local).some((k) => local[k] !== serverAnswers[k]);
        setOffset(new Date(res.serverNow).getTime() - Date.now());
        setExam({ ...res.exam, startedAt: res.attempt.startedAt });
        setQuestions(res.questions || []);
        setDeadline(new Date(res.attempt.deadlineAt).getTime());
        setAnswers(merged);
        setPhase("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 409) {
          navigate(`/exams/${examCode}/result`, { replace: true });
          return;
        }
        setError(err.message);
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [examCode, localKey, navigate]);

  // ---------------------------------------------------------------- clock
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  const remaining = deadline ? Math.max(0, Math.floor((deadline - (now + offset)) / 1000)) : 0;

  // ---------------------------------------------------------------- persistence
  const persistLocal = useCallback(
    (a, m) => {
      try {
        localStorage.setItem(localKey, JSON.stringify({ startedAt: exam?.startedAt, answers: a, marked: [...m] }));
      } catch {
        /* storage full or blocked */
      }
    },
    [localKey, exam]
  );

  const flush = useCallback(async () => {
    if (!dirty.current || submittedRef.current) return;
    dirty.current = false;
    setSave({ state: "saving", at: null });
    try {
      const r = await api.saveAnswers(examCode, answersRef.current);
      setSave({ state: "saved", at: r.savedAt });
    } catch (err) {
      if (err.status === 410) {
        setSave({ state: "error", at: null });
        return;
      }
      dirty.current = true;
      setSave({ state: err.status === 0 ? "offline" : "error", at: null });
    }
  }, [examCode]);

  useEffect(() => {
    if (phase !== "ready") return undefined;
    const t = setInterval(flush, 10_000); // retry / periodic save
    return () => clearInterval(t);
  }, [phase, flush]);

  useEffect(() => {
    const on = () => {
      setOnline(true);
      flush();
    };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [flush]);

  const debounce = useRef(null);
  const changeAnswers = (next) => {
    setAnswers(next);
    persistLocal(next, marked);
    dirty.current = true;
    setSave({ state: "pending", at: null });
    clearTimeout(debounce.current);
    debounce.current = setTimeout(flush, 800);
  };

  // ---------------------------------------------------------------- submit
  const submit = useCallback(
    async (auto = false) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setPhase("submitting");
      setSubmitError("");
      try {
        const res = await api.submitExam(examCode, answersRef.current, idemKey.current);
        localStorage.removeItem(localKey);
        sessionStorage.setItem(`examino_submission_${examCode}`, JSON.stringify({ ...res, auto }));
        navigate(`/exams/${examCode}/submitted`, { replace: true });
      } catch (err) {
        if (err.status === 409) {
          localStorage.removeItem(localKey);
          navigate(`/exams/${examCode}/result`, { replace: true });
          return;
        }
        submittedRef.current = false;
        setPhase("ready");
        setSubmitError(err.status === 0 ? "You appear to be offline. Your answers are saved on this device — reconnect and press Submit again." : err.message);
      }
    },
    [examCode, localKey, navigate]
  );

  useEffect(() => {
    // Auto-submit once at the deadline; if that fails the student retries from the banner.
    if (phase === "ready" && deadline && remaining === 0 && !submitError) submit(true);
  }, [phase, deadline, remaining, submit, submitError]);

  // Warn before closing the tab mid-exam.
  useEffect(() => {
    if (phase !== "ready") return undefined;
    const h = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [phase]);

  const q = questions[index];
  const view = useMemo(() => resolveQuestion(q, lang), [q, lang]);
  const answeredCount = questions.filter((x) => answers[x._id]).length;
  const letters = lang === "english" ? EN_LETTERS : BN_LETTERS;

  const go = (i) => {
    const n = Math.max(0, Math.min(questions.length - 1, i));
    setIndex(n);
    setVisited((v) => new Set(v).add(n));
    setGridOpen(false);
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-examino-bg text-sm text-examino-muted">
        <Spinner size={28} className="text-examino-blue" />
        Preparing your exam…
      </div>
    );
  }
  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-examino-bg p-4">
        <Card className="w-full max-w-md">
          <ErrorState title="This exam can't be opened" message={error} />
          <div className="flex justify-center gap-2 pb-8">
            <Button variant="secondary" onClick={() => navigate(`/exams/${examCode}/details`)}>
              Exam details
            </Button>
            <Button onClick={() => window.location.reload()}>Try again</Button>
          </div>
        </Card>
      </div>
    );
  }

  const saveLabel = !online
    ? "Offline — answers kept on this device"
    : { saved: "All answers saved", pending: "Unsaved changes", saving: "Saving…", offline: "Offline — will retry", error: "Save failed — retrying" }[save.state];
  const lowTime = remaining <= 300;

  const Grid = (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-examino-blue-light px-3 py-2 font-semibold text-examino-blue-hover">Answered {answeredCount}</div>
        <div className="rounded-lg bg-examino-amber-soft px-3 py-2 font-semibold text-amber-800">Marked {marked.size}</div>
      </div>
      <div className="grid max-h-[50vh] grid-cols-5 gap-2 overflow-y-auto pr-1">
        {questions.map((x, i) => {
          const isAns = Boolean(answers[x._id]);
          const isMark = marked.has(x._id);
          return (
            <button
              key={x._id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Question ${i + 1}${isAns ? ", answered" : ""}${isMark ? ", marked" : ""}`}
              aria-current={i === index ? "true" : undefined}
              className={cx(
                "h-10 rounded-lg border text-xs font-bold transition-colors",
                isMark ? "border-amber-500 bg-examino-amber text-white" : isAns ? "border-examino-blue-hover bg-examino-blue text-white" : visited.has(i) ? "border-red-200 bg-examino-rose-light text-examino-rose-dark" : "border-slate-200 bg-slate-50 text-examino-muted",
                i === index && "ring-2 ring-examino-navy ring-offset-1"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <ul className="mt-4 space-y-1.5 border-t border-examino-border pt-3 text-xs text-examino-muted">
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-examino-blue" />Answered</li>
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded border border-red-200 bg-examino-rose-light" />Seen, not answered</li>
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-examino-amber" />Marked for review</li>
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded border border-slate-200 bg-slate-50" />Not visited</li>
      </ul>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-examino-bg no-select">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-examino-navy text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <ExaminoLogo light size="sm" to={null} />
            <div className="hidden min-w-0 border-l border-white/15 pl-3 sm:block">
              <p className="truncate text-xs font-semibold font-bengali">{exam.title}</p>
              <p className="text-[11px] text-slate-400">
                Question {index + 1} of {questions.length}
              </p>
            </div>
          </div>
          <div
            className={cx("flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-base font-bold tabular-nums", lowTime ? "bg-examino-rose text-white" : "bg-white/10")}
            role="timer"
            aria-label={`Time remaining ${fmtDuration(remaining)}`}
          >
            <Icon name="clock" size={16} />
            {fmtDuration(remaining)}
          </div>
          <div className="flex items-center gap-2">
            <span className={cx("hidden items-center gap-1.5 text-[11px] md:flex", !online || save.state === "offline" || save.state === "error" ? "text-amber-300" : "text-slate-300")}>
              <Icon name={online ? "check" : "wifiOff"} size={13} />
              {saveLabel}
            </span>
            <button type="button" onClick={() => setGridOpen(true)} className="rounded-lg bg-white/10 p-2 lg:hidden" aria-label="Open question list">
              <Icon name="menu" size={18} />
            </button>
            <Button size="sm" onClick={() => setConfirmOpen(true)} loading={phase === "submitting"}>
              Submit
            </Button>
          </div>
        </div>
        {!online ? <div className="bg-amber-500 px-4 py-1 text-center text-xs font-semibold text-amber-950">You are offline. Keep answering — your answers are kept on this device and sent when you reconnect.</div> : null}
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 p-3 sm:p-6">
        <Card className="flex min-h-[60vh] flex-1 flex-col p-5 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-examino-border pb-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="rounded-md bg-examino-navy px-2 py-1 text-xs font-bold text-white">Q{index + 1}</span>
              <span className="truncate text-xs text-examino-muted font-bengali">{q?.chapter}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs">
                <span className="font-bold text-emerald-600">+1</span>
                {exam.negativeMarkPerWrong ? <span className="ml-1.5 font-bold text-examino-rose-dark">−{exam.negativeMarkPerWrong}</span> : null}
              </span>
              <Segmented size="sm" label="Question language" value={lang} onChange={setLang} options={[{ value: "bangla", label: "বাংলা" }, { value: "english", label: "EN" }]} />
            </div>
          </div>

          {view.available ? (
            <>
              <div className="mb-5 text-base font-semibold leading-relaxed text-examino-text sm:text-lg font-bengali">
                <MathText text={view.text} />
              </div>
              <QuestionImage q={q} className="mb-5" />
              <div className="space-y-3" role="radiogroup" aria-label={`Options for question ${index + 1}`}>
                {view.options.map((opt, i) => {
                  const value = q.options[i];
                  const selected = answers[q._id] === value;
                  return (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        triggerHaptic("light");
                        changeAnswers({ ...answers, [q._id]: value });
                      }}
                      className={cx(
                        "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors sm:p-4",
                        selected ? "border-examino-blue bg-examino-blue-light ring-2 ring-examino-blue/30" : "border-examino-border bg-white hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", selected ? "bg-examino-blue text-white" : "bg-slate-100 text-examino-muted")}>{letters[i]}</span>
                      <span className="flex-1 pt-0.5 font-medium text-examino-text font-bengali">
                        <MathText text={opt} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-amber-300 bg-examino-amber-soft p-8 text-center">
              <p className="text-sm font-semibold text-amber-900">{TRANSLATION_UNAVAILABLE[lang]}</p>
              <p className="mt-1 text-xs text-amber-800">This question is only available in {lang === "english" ? "Bengali" : "English"}.</p>
              <Button size="sm" variant="secondary" className="mt-4" onClick={() => setLang(lang === "english" ? "bangla" : "english")}>
                Show in {lang === "english" ? "বাংলা" : "English"}
              </Button>
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-examino-border pt-5">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={marked.has(q?._id) ? "secondary" : "ghost"}
                icon="flag"
                onClick={() => {
                  const m = new Set(marked);
                  if (m.has(q._id)) m.delete(q._id);
                  else m.add(q._id);
                  setMarked(m);
                  persistLocal(answers, m);
                }}
              >
                {marked.has(q?._id) ? "Marked" : "Mark for review"}
              </Button>
              {answers[q?._id] ? (
                <Button
                  size="sm"
                  variant="danger-ghost"
                  onClick={() => {
                    const next = { ...answers };
                    delete next[q._id];
                    changeAnswers(next);
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="secondary" icon="chevronLeft" disabled={index === 0} onClick={() => go(index - 1)}>
                Previous
              </Button>
              {index < questions.length - 1 ? (
                <Button size="sm" iconRight="chevronRight" onClick={() => go(index + 1)}>
                  Next
                </Button>
              ) : (
                <Button size="sm" onClick={() => setConfirmOpen(true)}>
                  Finish
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="hidden h-fit w-72 shrink-0 p-5 lg:block">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-examino-muted">Questions ({questions.length})</h2>
          {Grid}
        </Card>
      </div>

      <Modal open={gridOpen} onClose={() => setGridOpen(false)} title={`Questions (${questions.length})`} size="sm">
        {Grid}
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit your exam?"
        description="You can submit only once. After submitting, answers cannot be changed."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Keep answering
            </Button>
            <Button
              loading={phase === "submitting"}
              onClick={() => {
                setConfirmOpen(false);
                submit(false);
              }}
            >
              Submit now
            </Button>
          </>
        }
      >
        <dl className="space-y-2 text-sm">
          {[
            ["Total questions", questions.length, "text-examino-text"],
            ["Answered", answeredCount, "text-examino-blue"],
            ["Unanswered", questions.length - answeredCount, "text-examino-rose-dark"],
            ["Marked for review", marked.size, "text-amber-600"],
            ["Time left", fmtDuration(remaining), "text-examino-text"],
          ].map(([k, v, c]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-examino-muted">{k}</dt>
              <dd className={`font-semibold ${c}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </Modal>

      {submitError ? (
        <div role="alert" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-lg rounded-xl border border-red-200 bg-white p-4 shadow-dropdown">
          <p className="text-sm font-semibold text-examino-rose-dark">Submission didn't go through</p>
          <p className="mt-1 text-xs text-examino-muted">{submitError}</p>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSubmitError("")}>
              Dismiss
            </Button>
            <Button size="sm" onClick={() => submit(false)}>
              Try again
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
