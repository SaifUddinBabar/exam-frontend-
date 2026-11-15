import { useEffect, useState } from "react";
import StudentLayout, { StudentPageHeader } from "../StudentLayout";
import { api } from "../../teacher/api";
import useAsync, { useLanguage } from "../../lib/useAsync";
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, Skeleton } from "../../teacher/components/ui";
import MathText from "../../components/MathText";
import QuestionImage from "../../components/QuestionImage";
import Icon from "../../teacher/components/Icon";
import { resolveQuestion, setLanguagePref, TRANSLATION_UNAVAILABLE } from "../../lib/questionLanguage";

const cx = (...c) => c.filter(Boolean).join(" ");
const LETTERS = ["ক", "খ", "গ", "ঘ"];
const fmtSecs = (ms) => (ms == null ? "—" : `${Math.round(ms / 1000)}s`);

// Daily tournament: one attempt, server clock, answers and results stay private until tomorrow.
export default function TournamentPage() {
  const lang = useLanguage();
  const { status, data, error, reload, setData } = useAsync((signal) => api.tournamentToday({ signal }), []);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [offset, setOffset] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (data?.serverNow) setOffset(new Date(data.serverNow).getTime() - Date.now());
    if (data?.me && !data.me.finishedAt) {
      const next = [...Array(data.totalQuestions).keys()].find((k) => !data.me.answers.some((a) => a.index === k));
      if (next !== undefined) setIndex(next);
    }
  }, [data]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const running = data?.me && !data.me.finishedAt;
  const remaining = running ? Math.max(0, Math.ceil((new Date(data.me.endsAt).getTime() - (now + offset)) / 1000)) : 0;
  useEffect(() => {
    if (running && remaining === 0) api.tournamentFinish().then((r) => setData(r)).catch(() => reload());
  }, [running, remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (fn) => {
    setBusy(true);
    setErr("");
    try {
      const r = await fn();
      if (r?.day) setData(r);
      return r;
    } catch (e) {
      setErr(e.message);
      reload();
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") {
    return (
      <StudentLayout maxWidth="max-w-4xl">
        <Skeleton className="h-72" />
      </StudentLayout>
    );
  }
  if (status === "error") {
    return (
      <StudentLayout maxWidth="max-w-4xl">
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      </StudentLayout>
    );
  }

  const answeredSet = new Set((data.me?.answers || []).map((a) => a.index));
  const q = data.questions?.[index];
  const v = q ? resolveQuestion(q, lang) : null;

  return (
    <StudentLayout maxWidth="max-w-5xl">
      <StudentPageHeader eyebrow={`Daily tournament · ${data.day}`} title="Today's tournament" subtitle={`${data.totalQuestions} questions · ${data.secondsPerQuestion} s each · ${data.participants} taking part today`} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!data.me ? (
            <Card className="p-8 text-center">
              <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-examino-amber-soft text-amber-600">
                <Icon name="trophy" size={26} />
              </span>
              <h2 className="text-xl font-bold text-examino-text">One attempt. Same questions for everyone.</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-examino-muted">The clock starts when you press Start and runs on the server. Your score shows when you finish; correct answers open tomorrow so nobody can share them today.</p>
              <Button size="lg" className="mt-6" icon="swords" loading={busy} onClick={() => act(api.tournamentStart)}>
                Start tournament
              </Button>
            </Card>
          ) : data.me.finishedAt ? (
            <Card className="p-8 text-center">
              <p className="text-sm uppercase tracking-widest text-examino-muted">Finished</p>
              <p className="mt-2 text-4xl font-bold text-examino-text">{data.me.score}</p>
              <p className="mt-1 text-sm text-examino-muted">
                {data.me.correctCount} correct · {fmtSecs(data.me.timeMs)} · rank #{data.myRank} · +{data.me.xpEarned} XP
              </p>
              <p className="mt-4 text-sm text-examino-muted">Come back tomorrow for a new set.</p>
            </Card>
          ) : (
            <Card className="p-5 sm:p-7">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-examino-muted">
                  Question {index + 1} / {data.totalQuestions}
                </span>
                <span className={cx("rounded-lg px-3 py-1 font-mono text-base font-bold tabular-nums text-white", remaining <= 30 ? "bg-examino-rose" : "bg-examino-navy")} role="timer">
                  {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
                </span>
              </div>
              {!v.available ? (
                <div className="rounded-xl border border-dashed border-amber-300 bg-examino-amber-soft p-6 text-center">
                  <p className="font-semibold text-amber-900">{TRANSLATION_UNAVAILABLE[lang]}</p>
                  <Button size="sm" variant="secondary" className="mt-3" onClick={() => setLanguagePref(lang === "english" ? "bangla" : "english")}>
                    Show in {lang === "english" ? "বাংলা" : "English"}
                  </Button>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-base font-semibold leading-relaxed text-examino-text sm:text-lg font-bengali">
                    <MathText text={v.text} />
                  </p>
                  <QuestionImage q={q} className="mb-4" />
                  <div className="grid gap-3">
                    {v.options.map((o, i) => {
                      const chosen = data.me.answers.find((a) => a.index === index)?.optionIndex === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={busy || answeredSet.has(index)}
                          onClick={async () => {
                            const r = await act(() => api.tournamentAnswer(index, i));
                            if (r) setData(await api.tournamentToday());
                          }}
                          className={cx("flex items-start gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-colors", chosen ? "border-examino-blue bg-examino-blue-light" : "border-examino-border bg-white hover:border-examino-blue hover:bg-examino-blue-light/50 disabled:hover:bg-white")}
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-examino-muted">{LETTERS[i]}</span>
                          <span className="flex-1 pt-0.5 font-bengali">
                            <MathText text={o} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {[...Array(data.totalQuestions).keys()].map((k) => (
                  <button key={k} type="button" onClick={() => setIndex(k)} className={cx("h-8 w-8 rounded-lg text-xs font-bold", k === index ? "ring-2 ring-examino-navy" : "", answeredSet.has(k) ? "bg-examino-blue text-white" : "bg-slate-100 text-examino-muted")} aria-label={`Question ${k + 1}`}>
                    {k + 1}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex justify-end">
                <Button variant="secondary" loading={busy} onClick={() => act(api.tournamentFinish)}>
                  Finish now
                </Button>
              </div>
              {err ? <p className="mt-3 text-sm text-examino-rose-dark">{err}</p> : null}
            </Card>
          )}
        </div>
        <Card>
          <CardHeader title="Today's leaderboard" description="Score, then time used" />
          {!data.leaderboard.length ? (
            <EmptyState icon="trophy" title="No finishers yet." />
          ) : (
            <ol className="divide-y divide-examino-border">
              {data.leaderboard.map((r) => (
                <li key={r.rank} className={cx("flex items-center justify-between px-5 py-2.5 text-sm", r.isMe && "bg-examino-blue-light/50")}>
                  <span className="flex items-center gap-2">
                    <span className="w-6 text-right font-semibold text-examino-muted">{r.rank}</span>
                    <span className="font-medium text-examino-text">{r.name}</span>
                    {r.isMe ? <Badge tone="blue">You</Badge> : null}
                  </span>
                  <span className="text-right font-semibold text-examino-text">
                    {r.score} <span className="text-xs font-normal text-examino-muted">{fmtSecs(r.timeMs)}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </StudentLayout>
  );
}
