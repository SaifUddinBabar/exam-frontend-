import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout, { StudentPageHeader } from "../StudentLayout";
import { api } from "../../teacher/api";
import useAsync from "../../lib/useAsync";
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, Field, Input, LinkButton, Segmented, Select, Skeleton } from "../../teacher/components/ui";
import Icon from "../../teacher/components/Icon";
import { relative } from "../examFormat";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function BattleLobby() {
  const navigate = useNavigate();
  const topics = useAsync((signal) => api.battleTopics({ signal }), []);
  const current = useAsync((signal) => api.currentBattle({ signal }), []);
  const history = useAsync((signal) => api.battleHistory({ signal }), []);
  const [f, setF] = useState({ className: "", subject: "", chapter: "", topic: "", difficulty: "mixed" });
  const [mode, setMode] = useState("random");
  const [roomCode, setRoomCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const subjects = topics.data?.subjects || [];
  const subject = subjects.find((s) => s.name === f.subject) || (subjects.length === 1 ? subjects[0] : null);
  const chapter = subject?.chapters.find((c) => c.name === f.chapter);
  const available = useMemo(() => {
    if (chapter) return f.topic ? chapter.topics.find((t) => t.name === f.topic)?.count || 0 : chapter.count;
    return subject ? subject.count : subjects.reduce((a, s) => a + s.count, 0);
  }, [chapter, subject, subjects, f.topic]);

  const go = async (action) => {
    setBusy(true);
    setErr("");
    try {
      const filters = { ...f, subject: f.subject || subject?.name || "" };
      const r = action === "join" ? await api.joinFriendBattle(roomCode.trim().toUpperCase()) : action === "friend" ? await api.createFriendBattle(filters) : await api.findBattle(filters);
      navigate(`/battle/${r.battle._id}`);
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  };

  const open = current.data?.battle;

  return (
    <StudentLayout maxWidth="max-w-6xl">
      <StudentPageHeader eyebrow="Battle arena" title="Challenge a classmate" subtitle="10 questions, 20 seconds each. Same questions for both players — the server keeps the clock and the score." />

      {open ? (
        <Card className="mb-6 flex flex-col gap-3 border-examino-blue/40 bg-examino-blue-light/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-examino-text">{open.status === "waiting" ? "You have a battle waiting for an opponent." : "You have a battle in progress."}</p>
            {open.roomCode ? <p className="text-sm text-examino-muted">Room code {open.roomCode}</p> : null}
          </div>
          <Button onClick={() => navigate(`/battle/${open._id}`)}>{open.status === "waiting" ? "Open room" : "Resume battle"}</Button>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Set up your battle" description="Students see topic names and question counts only — questions appear when the battle starts." />
          {topics.status === "loading" ? (
            <div className="p-5">
              <Skeleton className="h-40" />
            </div>
          ) : topics.status === "error" ? (
            <ErrorState message={topics.error} onRetry={topics.reload} />
          ) : (
            <div className="space-y-5 px-5 pb-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Class" htmlFor="b-class">
                  <Select id="b-class" value={f.className} onChange={(e) => setF({ ...f, className: e.target.value })}>
                    <option value="">Any class</option>
                    {(topics.data.classes || []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Subject" htmlFor="b-subject">
                  <Select id="b-subject" value={f.subject || subject?.name || ""} onChange={(e) => setF({ ...f, subject: e.target.value, chapter: "", topic: "" })}>
                    {subjects.length > 1 ? <option value="">Any subject</option> : null}
                    {subjects.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.count})
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Chapter" htmlFor="b-chapter">
                  <Select id="b-chapter" value={f.chapter} onChange={(e) => setF({ ...f, chapter: e.target.value, topic: "" })} disabled={!subject}>
                    <option value="">All chapters</option>
                    {(subject?.chapters || []).map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.count})
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Topic" htmlFor="b-topic">
                  <Select id="b-topic" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} disabled={!chapter || !chapter.topics.length}>
                    <option value="">All topics</option>
                    {(chapter?.topics || []).map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.count})
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="mb-1.5 text-[13px] font-medium text-examino-text">Difficulty</p>
                  <Segmented
                    label="Difficulty"
                    value={f.difficulty}
                    onChange={(v) => setF({ ...f, difficulty: v })}
                    options={[
                      { value: "mixed", label: "Mixed" },
                      { value: "easy", label: "Easy" },
                      { value: "medium", label: "Medium" },
                      { value: "hard", label: "Hard" },
                    ]}
                  />
                </div>
                <p className="text-sm text-examino-muted">
                  <span className="font-semibold text-examino-text">{available}</span> questions in this selection
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-[13px] font-medium text-examino-text">Mode</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    ["random", "swords", "Random opponent", "Ranked · changes your rating"],
                    ["friend", "users", "Challenge a friend", "Create a room and share the code"],
                    ["join", "link", "Join a room", "Enter your friend's code"],
                  ].map(([v, icon, title, sub]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setMode(v)}
                      aria-pressed={mode === v}
                      className={cx("rounded-xl border p-4 text-left transition-colors", mode === v ? "border-examino-blue bg-examino-blue-light ring-2 ring-examino-blue/20" : "border-examino-border hover:bg-slate-50")}
                    >
                      <Icon name={icon} size={20} className={mode === v ? "text-examino-blue" : "text-examino-muted"} />
                      <p className="mt-2 text-sm font-semibold text-examino-text">{title}</p>
                      <p className="text-xs text-examino-muted">{sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {mode === "join" ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Field label="Room code" htmlFor="room" className="flex-1">
                    <Input id="room" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} placeholder="6 characters" className="h-10 uppercase tracking-widest" autoComplete="off" />
                  </Field>
                  <Button loading={busy} disabled={roomCode.trim().length !== 6} onClick={() => go("join")}>
                    Join room
                  </Button>
                </div>
              ) : (
                <Button size="lg" icon="swords" loading={busy} disabled={available < 5 || Boolean(open)} onClick={() => go(mode)} className="w-full sm:w-auto">
                  {mode === "friend" ? "Create room" : "Find opponent"}
                </Button>
              )}
              {available < 5 && mode !== "join" ? <p className="text-sm text-examino-rose-dark">At least 5 questions are needed. Choose a wider topic.</p> : null}
              {open && mode !== "join" ? <p className="text-sm text-examino-muted">Finish or leave your current battle first.</p> : null}
              {err ? (
                <p role="alert" className="text-sm text-examino-rose-dark">
                  {err}
                </p>
              ) : null}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <p className="text-sm font-semibold text-examino-text">How scoring works</p>
            <ul className="mt-2 space-y-1.5 text-sm text-examino-muted">
              <li>Correct: +10, plus up to +5 for speed</li>
              <li>Wrong: −2 · No answer: 0</li>
              <li>Tie on score → faster player wins</li>
              <li>Leaving a running battle counts as a loss</li>
              <li>Random battles change your rating; friend rooms don't</li>
            </ul>
            <LinkButton to="/league" size="sm" variant="secondary" className="mt-4">
              League & XP rules
            </LinkButton>
          </Card>
          <Card>
            <CardHeader title="Recent battles" />
            {history.status === "loading" ? (
              <div className="p-5">
                <Skeleton className="h-24" />
              </div>
            ) : !(history.data?.battles || []).length ? (
              <EmptyState icon="swords" title="No battles yet." />
            ) : (
              <ul className="divide-y divide-examino-border">
                {history.data.battles.slice(0, 8).map((b) => (
                  <li key={b._id}>
                    <button type="button" onClick={() => navigate(`/battle/${b._id}`)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-slate-50">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-examino-text">vs {b.opponentName}</span>
                        <span className="text-xs text-examino-muted">{relative(b.finishedAt)}</span>
                      </span>
                      <span className="text-right">
                        <Badge tone={b.result === "win" ? "green" : b.result === "loss" ? "red" : "neutral"}>{b.result === "win" ? "Won" : b.result === "loss" ? "Lost" : "Draw"}</Badge>
                        <span className="block text-xs text-examino-muted">
                          {b.myScore}–{b.opponentScore}
                          {b.ratingChange ? ` · ${b.ratingChange > 0 ? "+" : ""}${b.ratingChange}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
