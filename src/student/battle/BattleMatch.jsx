import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExaminoLogo from "../../components/ExaminoLogo";
import MathText from "../../components/MathText";
import QuestionImage from "../../components/QuestionImage";
import { api, streamBattle } from "../../teacher/api";
import { Badge, Button, Card, ConfirmDialog, ErrorState, LinkButton, Spinner } from "../../teacher/components/ui";
import Icon from "../../teacher/components/Icon";
import { resolveQuestion, setLanguagePref, TRANSLATION_UNAVAILABLE } from "../../lib/questionLanguage";
import { useLanguage } from "../../lib/useAsync";
import { triggerHaptic } from "../../utils/haptics";
import { LeagueBadge } from "../league/LeagueBadge";

const cx = (...c) => c.filter(Boolean).join(" ");
const LETTERS = ["ক", "খ", "গ", "ঘ"];

export default function BattleMatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lang = useLanguage();
  const [battle, setBattle] = useState(null);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [feedback, setFeedback] = useState(null); // { index, chosen, correctIndex, correct, points }
  const [sending, setSending] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [league, setLeague] = useState(null);
  const [live, setLive] = useState(false);

  const apply = useCallback((b) => {
    setBattle(b);
    setOffset(new Date(b.serverNow).getTime() - Date.now());
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await api.battle(id);
      apply(r.battle);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, [id, apply]);

  useEffect(() => {
    load();
  }, [load]);

  // Live updates: one Server-Sent Events stream while the battle is open (the server is the
  // source of truth and the stream is also our heartbeat). If it fails, fall back to polling
  // every 2.5 s and try the stream again.
  const open = Boolean(battle) && battle.status !== "finished" && battle.status !== "cancelled";
  useEffect(() => {
    if (!open) return undefined;
    const ctrl = new AbortController();
    let stopped = false;
    let poll = null;
    let retry = null;
    const stopPoll = () => {
      clearInterval(poll);
      poll = null;
    };
    const connect = async () => {
      let failed = false;
      try {
        await streamBattle(
          id,
          (b) => {
            setLive(true);
            stopPoll();
            apply(b);
          },
          ctrl.signal
        );
      } catch (e) {
        if (e?.name === "AbortError") return;
        failed = true;
      }
      if (stopped) return;
      setLive(false);
      if (!poll) poll = setInterval(load, 2500);
      retry = setTimeout(connect, failed ? 10_000 : 1_000);
    };
    connect();
    return () => {
      stopped = true;
      ctrl.abort();
      stopPoll();
      clearTimeout(retry);
    };
  }, [id, open, load, apply]);

  // A random room that was paired with an older waiting room moves to that battle.
  useEffect(() => {
    if (battle?.mergedInto) navigate(`/battle/${battle.mergedInto}`, { replace: true });
  }, [battle?.mergedInto, navigate]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (battle?.status === "finished") api.myLeague().then((r) => setLeague(r.stats)).catch(() => {});
  }, [battle?.status]);

  if (error && !battle) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-examino-bg p-4">
        <Card className="w-full max-w-md">
          <ErrorState message={error} onRetry={load} />
          <div className="pb-6 text-center">
            <LinkButton to="/battle" variant="secondary" size="sm">
              Back to battles
            </LinkButton>
          </div>
        </Card>
      </div>
    );
  }
  if (!battle) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-examino-bg">
        <Spinner size={28} className="text-examino-blue" />
      </div>
    );
  }

  const serverNow = now + offset;
  const shell = (children) => (
    <div className="flex min-h-screen flex-col bg-examino-bg">
      <header className="flex items-center justify-between border-b border-white/10 bg-examino-navy px-4 py-3 text-white sm:px-6">
        <ExaminoLogo light size="sm" to={null} />
        {battle.status === "waiting" || battle.status === "active" ? (
          <Button size="sm" variant="ghost" className="!text-slate-300 hover:!bg-white/10" onClick={() => setLeaveOpen(true)}>
            {battle.status === "waiting" ? "Cancel" : "Leave battle"}
          </Button>
        ) : (
          <LinkButton to="/battle" size="sm" variant="ghost" className="!text-slate-300 hover:!bg-white/10">
            Back to arena
          </LinkButton>
        )}
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-10">{children}</main>
      <ConfirmDialog
        open={leaveOpen}
        title={battle.status === "waiting" ? "Cancel this battle?" : "Leave the battle?"}
        confirmLabel={battle.status === "waiting" ? "Cancel battle" : "Leave and lose"}
        onCancel={() => setLeaveOpen(false)}
        onConfirm={async () => {
          setLeaveOpen(false);
          try {
            const r = await api.leaveBattle(battle._id);
            if (r.battle.status === "cancelled") navigate("/battle");
            else apply(r.battle);
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        {battle.status === "waiting" ? "The room will close." : "Leaving a running battle counts as a loss and your opponent wins."}
      </ConfirmDialog>
    </div>
  );

  // ------------------------------------------------------------- waiting
  if (battle.status === "waiting") {
    const left = Math.max(0, Math.ceil((new Date(battle.expiresAt).getTime() - serverNow) / 1000));
    return shell(
      <Card className="p-8 text-center">
        <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-examino-blue-light text-examino-blue">
          <Icon name="swords" size={28} />
        </span>
        {battle.mode === "group" ? (
          <>
            <h1 className="text-xl font-bold text-examino-text">Group room · {battle.players.length}/{battle.maxPlayers} players</h1>
            <p className="mt-1 text-sm text-examino-muted">Share the code. {battle.isHost ? "Start when everyone has joined." : "The host will start the battle."}</p>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(battle.roomCode).then(() => setCopied(true))}
              className="mx-auto mt-5 flex items-center gap-3 rounded-xl border-2 border-dashed border-examino-blue/40 bg-examino-blue-light/40 px-6 py-3 font-mono text-3xl font-bold tracking-[0.3em] text-examino-navy"
              aria-label={`Copy room code ${battle.roomCode}`}
            >
              {battle.roomCode}
              <Icon name={copied ? "check" : "copy"} size={18} className="text-examino-blue" />
            </button>
            <ul className="mx-auto mt-5 max-w-xs space-y-1.5 text-left text-sm">
              {battle.players.map((pl, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-medium text-examino-text">{pl.name}</span>
                  {i === 0 ? <Badge tone="blue">Host</Badge> : pl.isMe ? <Badge tone="neutral">You</Badge> : null}
                </li>
              ))}
            </ul>
            {battle.isHost ? (
              <Button
                className="mt-5"
                icon="swords"
                disabled={battle.players.length < 2}
                onClick={async () => {
                  try {
                    const r = await api.startGroupBattle(battle._id);
                    apply(r.battle);
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                Start battle
              </Button>
            ) : null}
          </>
        ) : battle.mode === "friend" ? (
          <>
            <h1 className="text-xl font-bold text-examino-text">Share this room code</h1>
            <p className="mt-1 text-sm text-examino-muted">Your friend opens Battle → Join a room and enters it.</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(battle.roomCode).then(() => setCopied(true));
              }}
              className="mx-auto mt-5 flex items-center gap-3 rounded-xl border-2 border-dashed border-examino-blue/40 bg-examino-blue-light/40 px-6 py-3 font-mono text-3xl font-bold tracking-[0.3em] text-examino-navy"
              aria-label={`Copy room code ${battle.roomCode}`}
            >
              {battle.roomCode}
              <Icon name={copied ? "check" : "copy"} size={18} className="text-examino-blue" />
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-examino-text">Finding an opponent…</h1>
            <p className="mt-1 text-sm text-examino-muted">Matching students who chose the same subject, chapter, topic and difficulty.</p>
          </>
        )}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-examino-muted">
          <Spinner size={14} /> Waiting · {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")} left
        </div>
      </Card>
    );
  }

  if (battle.status === "cancelled") {
    return shell(
      <Card className="p-8 text-center">
        <h1 className="text-xl font-bold text-examino-text">No opponent joined</h1>
        <p className="mt-1 text-sm text-examino-muted">The room closed. Try again — more students may be online now.</p>
        <LinkButton to="/battle" className="mt-5">
          Back to arena
        </LinkButton>
      </Card>
    );
  }

  const me = battle.me;
  const opp = battle.opponent;
  const total = battle.totalQuestions;

  // ------------------------------------------------------------- finished
  if (battle.status === "finished") {
    const res = battle.result;
    const delta = me.ratingAfter != null && me.ratingBefore != null ? me.ratingAfter - me.ratingBefore : 0;
    const answered = new Map(me.answers.map((a) => [a.index, a]));
    return shell(
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className={cx("px-6 py-8 text-center text-white", res.winner === "me" ? "bg-gradient-to-br from-examino-blue to-examino-navy" : res.winner === "draw" ? "bg-slate-600" : "bg-examino-navy")}>
            <p className="text-sm uppercase tracking-widest text-white/70">{res.reason === "forfeit" ? "Forfeit" : res.reason === "disconnect" ? (res.winner === "me" ? "Opponent disconnected" : "You were disconnected") : res.reason === "time" ? "Won on time" : "Final score"}</p>
            <h1 className="mt-1 text-3xl font-bold">{battle.mode === "group" ? (res.placement === 1 && res.winner !== "draw" ? "1st place!" : `#${res.placement} of ${battle.players.length}`) : res.winner === "me" ? "Victory!" : res.winner === "draw" ? "Draw" : "Defeat"}</h1>
            {battle.mode === "group" ? (
              <ol className="mx-auto mt-4 max-w-sm space-y-1 text-left text-sm">
                {[...battle.players]
                  .sort((x, y) => (x.placement || 99) - (y.placement || 99))
                  .map((pl) => (
                    <li key={pl.name + pl.placement} className={cx("flex justify-between rounded-lg px-3 py-1.5", pl.isMe ? "bg-white/20 font-semibold" : "bg-white/10")}>
                      <span>
                        #{pl.placement} {pl.name}
                        {pl.left ? " (left)" : ""}
                      </span>
                      <span>{pl.score}</span>
                    </li>
                  ))}
              </ol>
            ) : null}
            <div className="mt-5 flex items-center justify-center gap-6 text-lg">
              <div>
                <p className="text-sm text-white/70">You</p>
                <p className="text-3xl font-bold">{me.score}</p>
              </div>
              <span className="text-white/50">vs</span>
              <div>
                <p className="text-sm text-white/70">{opp?.name || "Opponent"}</p>
                <p className="text-3xl font-bold">{opp?.score ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-examino-border text-center">
            <div className="p-4">
              <p className="text-xs text-examino-muted">Correct</p>
              <p className="text-lg font-bold text-examino-text">
                {me.correctCount}/{total}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-examino-muted">XP earned</p>
              <p className="text-lg font-bold text-examino-text">+{me.xpEarned || 0}</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-examino-muted">Rating</p>
              <p className={cx("text-lg font-bold", delta > 0 ? "text-emerald-600" : delta < 0 ? "text-examino-rose-dark" : "text-examino-text")}>{battle.mode === "friend" ? "Unranked" : `${delta > 0 ? "+" : ""}${delta}`}</p>
            </div>
          </div>
          {league ? (
            <div className="flex items-center justify-center gap-3 border-t border-examino-border p-4 text-sm text-examino-muted">
              <LeagueBadge league={league.league} size={28} /> {league.league.name} league · rating {league.rating}
            </div>
          ) : null}
        </Card>
        <div className="flex flex-wrap justify-center gap-2">
          <LinkButton to="/battle" icon="swords">
            Battle again
          </LinkButton>
          <LinkButton to="/league" variant="secondary">
            Leaderboard
          </LinkButton>
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-examino-text">Question review</h2>
          {battle.questions.map((q) => {
            const v = resolveQuestion(q, lang);
            const a = answered.get(q.index);
            return (
              <Card key={q.index} className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-examino-muted">Q{q.index + 1}</span>
                  <Badge tone={!a ? "neutral" : a.correct ? "green" : "red"}>{!a ? "No answer" : a.correct ? `+${a.points}` : `${a.points}`}</Badge>
                </div>
                {v.available ? (
                  <>
                    <p className="mb-2 text-sm font-semibold text-examino-text font-bengali">
                      <MathText text={v.text} />
                    </p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {v.options.map((o, i) => (
                        <div key={i} className={cx("rounded-lg border px-3 py-1.5 text-sm font-bengali", i === q.correctIndex ? "border-emerald-300 bg-examino-green-light" : a && Number(a.answer) === i ? "border-red-300 bg-examino-rose-light" : "border-examino-border")}>
                          <span className="mr-2 font-bold text-examino-muted">{LETTERS[i]}</span>
                          <MathText text={o} />
                        </div>
                      ))}
                    </div>
                    {v.explanation ? (
                      <p className="mt-2 text-xs leading-relaxed text-examino-muted font-bengali">
                        <MathText text={v.explanation} />
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm font-semibold text-amber-800">{TRANSLATION_UNAVAILABLE[lang]}</p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------- active
  const startsIn = Math.ceil((new Date(battle.startedAt).getTime() - serverNow) / 1000);
  if (startsIn > 0) {
    return shell(
      <Card className="p-10 text-center">
        <p className="text-sm text-examino-muted">
          {battle.mode === "group" ? (
            <>Group battle · {battle.players.length} players</>
          ) : (
            <>
              You vs <span className="font-semibold text-examino-text">{opp?.name}</span>
            </>
          )}
        </p>
        <p className="mt-4 text-6xl font-bold text-examino-blue tabular-nums">{startsIn}</p>
        <p className="mt-2 text-sm text-examino-muted">Get ready…</p>
      </Card>
    );
  }

  const remaining = Math.max(0, Math.ceil((new Date(battle.endsAt).getTime() - serverNow) / 1000));
  const showing = feedback ? feedback.index : me.answered;
  const doneAll = me.answered >= total && !feedback;
  const q = battle.questions[Math.min(showing, total - 1)];
  const v = resolveQuestion(q, lang);

  const answer = async (optionIndex) => {
    if (sending || feedback) return;
    setSending(true);
    triggerHaptic("light");
    try {
      const r = await api.answerBattle(battle._id, q.index, optionIndex);
      triggerHaptic(r.correct ? "success" : "error");
      setFeedback({ index: q.index, chosen: optionIndex, correctIndex: r.correctIndex, correct: r.correct, points: r.points });
      setTimeout(() => {
        setFeedback(null);
        apply(r.battle);
      }, 900);
    } catch (e) {
      if (e.status === 409) load();
      else setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const oppGrace = battle.mode !== "group" && opp && opp.connected === false && opp.graceEndsAt ? Math.max(0, Math.ceil((new Date(opp.graceEndsAt).getTime() - serverNow) / 1000)) : null;
  return shell(
    <div className="space-y-4">
      {oppGrace !== null ? (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-amber-200 bg-examino-amber-soft px-4 py-2.5 text-sm font-medium text-amber-900">
          <Spinner size={14} className="text-amber-700" />
          {opp.name} lost connection. Keep playing — they forfeit if not back in {oppGrace}s.
        </p>
      ) : null}
      {error && !live ? (
        <p role="status" className="rounded-xl border border-examino-border bg-white px-4 py-2.5 text-sm text-examino-muted">
          Connection problem — retrying. Your answers are saved on the server.
        </p>
      ) : null}
      {battle.mode === "group" ? (
        <div className="flex flex-wrap gap-2">
          {battle.players
            .filter((pl) => !pl.isMe)
            .map((pl, i) => (
              <span key={i} className={cx("rounded-full border px-3 py-1 text-xs font-semibold", pl.left ? "border-slate-200 text-examino-subtle line-through" : pl.connected === false ? "border-amber-200 bg-examino-amber-soft text-amber-900" : "border-examino-border bg-white text-examino-text")}>
                {pl.name} · {pl.score} · {pl.answered}/{total}
                {!pl.left && pl.connected === false ? " · reconnecting" : ""}
              </span>
            ))}
        </div>
      ) : null}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <p className="truncate text-sm font-semibold text-examino-text">You · {me.score}</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-examino-blue transition-all" style={{ width: `${(me.answered / total) * 100}%` }} />
          </div>
        </div>
        <div className={cx("rounded-lg px-3 py-1.5 font-mono text-lg font-bold tabular-nums", remaining <= 20 ? "bg-examino-rose text-white" : "bg-examino-navy text-white")} role="timer">
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
        </div>
        <div className={cx("text-right", battle.mode === "group" && "invisible")} aria-hidden={battle.mode === "group"}>
          <p className="truncate text-sm font-semibold text-examino-text">
            {opp?.name} · {opp?.score ?? 0}
          </p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="ml-auto h-full rounded-full bg-examino-amber transition-all" style={{ width: `${((opp?.answered || 0) / total) * 100}%` }} />
          </div>
        </div>
      </div>

      {doneAll ? (
        <Card className="p-10 text-center">
          <Spinner size={22} className="text-examino-blue" />
          <p className="mt-3 font-semibold text-examino-text">All answered!</p>
          <p className="text-sm text-examino-muted">Waiting for {opp?.name} to finish or for the clock to run out.</p>
        </Card>
      ) : (
        <Card className="p-5 sm:p-7">
          <div className="mb-4 flex items-center justify-between text-xs text-examino-muted">
            <span className="font-bold">
              Question {q.index + 1} / {total}
            </span>
            <span className="flex items-center gap-2">
              <span className="hidden truncate font-bengali sm:inline">{q.topic || q.chapter}</span>
              <button type="button" onClick={() => setLanguagePref(lang === "english" ? "bangla" : "english")} className="rounded-md border border-examino-border px-2 py-0.5 font-semibold text-examino-text hover:bg-slate-50" aria-label="Switch question language">
                {lang === "english" ? "EN" : "বাংলা"}
              </button>
            </span>
          </div>
          {v.available ? (
            <>
              <p className="mb-4 text-base font-semibold leading-relaxed text-examino-text sm:text-lg font-bengali">
                <MathText text={v.text} />
              </p>
              <QuestionImage q={q} className="mb-4" />
              <div className="grid gap-3">
                {v.options.map((o, i) => {
                  const fb = feedback;
                  const state = fb ? (i === fb.correctIndex ? "correct" : i === fb.chosen ? "wrong" : "idle") : "idle";
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={Boolean(fb) || sending}
                      onClick={() => answer(i)}
                      className={cx(
                        "flex items-start gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-colors",
                        state === "correct" ? "border-emerald-400 bg-examino-green-light" : state === "wrong" ? "border-red-400 bg-examino-rose-light" : "border-examino-border bg-white hover:border-examino-blue hover:bg-examino-blue-light/50"
                      )}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-examino-muted">{LETTERS[i]}</span>
                      <span className="flex-1 pt-0.5 font-bengali">
                        <MathText text={o} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {feedback ? (
                <p className={cx("mt-4 text-center text-sm font-semibold", feedback.correct ? "text-emerald-600" : "text-examino-rose-dark")}>
                  {feedback.correct ? `Correct! +${feedback.points}` : `Wrong ${feedback.points}`}
                </p>
              ) : null}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-amber-300 bg-examino-amber-soft p-6 text-center">
              <p className="font-semibold text-amber-900">{TRANSLATION_UNAVAILABLE[lang]}</p>
              <p className="mt-1 text-xs text-amber-800">This question is only available in {lang === "english" ? "Bengali" : "English"}.</p>
              <Button size="sm" variant="secondary" className="mt-3" onClick={() => setLanguagePref(lang === "english" ? "bangla" : "english")}>
                Show in {lang === "english" ? "বাংলা" : "English"}
              </Button>
            </div>
          )}
        </Card>
      )}
      {error ? <p className="text-center text-sm text-examino-rose-dark">{error}</p> : null}
    </div>
  );
}
