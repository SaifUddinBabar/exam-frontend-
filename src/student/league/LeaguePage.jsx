import { useState } from "react";
import StudentLayout, { StudentPageHeader } from "../StudentLayout";
import { api } from "../../teacher/api";
import useAsync from "../../lib/useAsync";
import { Avatar, Badge, Card, CardHeader, EmptyState, ErrorState, LinkButton, Select, Skeleton, Tabs } from "../../teacher/components/ui";
import Icon from "../../teacher/components/Icon";
import { LeagueBadge, LEAGUE_COLORS } from "./LeagueBadge";

const cx = (...c) => c.filter(Boolean).join(" ");
const METRIC = { rating: "Rating", weeklyXp: "XP this week", xp: "XP" };

export default function LeaguePage() {
  const [scope, setScope] = useState("global");
  const batches = useAsync((signal) => api.myBatches({ signal }), []);
  const [batchId, setBatchId] = useState("");
  const myBatchList = batches.data?.batches || [];
  const effBatch = batchId || myBatchList[0]?._id || "";
  const me = useAsync((signal) => api.myLeague({ signal }), []);
  const rules = useAsync((signal) => api.leagueRules({ signal }), []);
  const board = useAsync(
    (signal) => (scope === "batch" && !effBatch ? Promise.resolve({ entries: [], me: null, metric: "xp" }) : api.leaderboard({ scope, batchId: scope === "batch" ? effBatch : undefined }, { signal })),
    [scope, effBatch]
  );

  const s = me.data?.stats;
  const earned = new Set((s?.achievements || []).map((a) => a.code));

  return (
    <StudentLayout>
      <StudentPageHeader eyebrow="League" title="Leagues & leaderboards" subtitle="Your rating moves with every ranked battle. XP comes from battles, exams and practice." actions={<LinkButton to="/battle" icon="swords">Battle now</LinkButton>} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="px-5 pt-3">
              <Tabs
                label="Leaderboard scope"
                value={scope}
                onChange={setScope}
                tabs={[
                  { value: "global", label: "Global" },
                  { value: "weekly", label: "This week" },
                  { value: "batch", label: "My batch" },
                  { value: "friends", label: "Friends" },
                ]}
              />
            </div>
            {scope === "batch" && myBatchList.length > 1 ? (
              <div className="px-5 pt-4">
                <Select aria-label="Batch" value={effBatch} onChange={(e) => setBatchId(e.target.value)} className="h-9 sm:w-72">
                  {myBatchList.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
            {board.status === "loading" ? (
              <div className="p-5">
                <Skeleton className="h-64" />
              </div>
            ) : board.status === "error" ? (
              <ErrorState message={board.error} onRetry={board.reload} />
            ) : scope === "batch" && !myBatchList.length ? (
              <EmptyState icon="layers" title="Join a batch to see its leaderboard." action={<LinkButton to="/batches" size="sm" variant="secondary">Join a batch</LinkButton>} />
            ) : !board.data.entries.length ? (
              <EmptyState
                icon="trophy"
                title="No one is ranked here yet."
                description={scope === "friends" ? "Friends are students you've finished a battle with." : scope === "weekly" ? "Earn XP this week to appear here." : "Finish a battle to get ranked."}
              />
            ) : (
              <>
                <ol className="divide-y divide-examino-border">
                  {board.data.entries.map((e) => (
                    <li key={`${e.rank}-${e.name}`} className={cx("flex items-center gap-3 px-5 py-3", e.isMe && "bg-examino-blue-light/50")}>
                      <span className={cx("w-7 text-center text-sm font-bold", e.rank <= 3 ? "text-amber-600" : "text-examino-muted")}>{e.rank}</span>
                      <Avatar name={e.name} size={34} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-examino-text">{e.name}</span>
                          {e.isMe ? <Badge tone="blue">You</Badge> : null}
                        </span>
                        <span className="text-xs text-examino-muted">
                          {e.league.name} · {e.wins} wins / {e.battles} battles
                        </span>
                      </span>
                      <LeagueBadge league={e.league} size={26} />
                      <span className="w-16 text-right text-sm font-bold text-examino-text">{e.value}</span>
                    </li>
                  ))}
                </ol>
                <p className="border-t border-examino-border px-5 py-3 text-xs text-examino-muted">
                  Ranked by {METRIC[board.data.metric] || board.data.metric}
                  {board.data.me && !board.data.entries.some((e) => e.isMe) ? ` · Your position: #${board.data.me.rank}` : ""}
                </p>
              </>
            )}
          </Card>

          <Card>
            <CardHeader title="Achievements" description="Earned only from real battles, exams and activity." />
            <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2">
              {(rules.data?.achievements || []).map((a) => (
                <div key={a.code} className={cx("flex items-start gap-3 rounded-xl border p-3", earned.has(a.code) ? "border-amber-200 bg-examino-amber-soft" : "border-examino-border opacity-70")}>
                  <span className={cx("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", earned.has(a.code) ? "bg-examino-amber text-white" : "bg-slate-100 text-examino-subtle")}>
                    <Icon name={earned.has(a.code) ? "star" : "lock"} size={16} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-examino-text">{a.title}</span>
                    <span className="text-xs text-examino-muted">{a.description}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            {me.status === "loading" ? (
              <Skeleton className="h-40" />
            ) : me.status === "error" ? (
              <ErrorState message={me.error} onRetry={me.reload} />
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <LeagueBadge league={s.league} size={64} />
                  <div>
                    <p className="text-xs text-examino-muted">Your league</p>
                    <p className="text-xl font-bold text-examino-text">{s.league.name}</p>
                    <p className="text-sm text-examino-muted">
                      Rating {s.rating}
                      {me.data.globalRank ? ` · #${me.data.globalRank} global` : ""}
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["XP", s.xp],
                    ["This week", s.weeklyXp],
                    ["Record", `${s.wins}W ${s.losses}L ${s.draws}D`],
                    ["Day streak", s.dayStreak],
                    ["Win streak", s.winStreak],
                    ["Peak rating", s.peakRating],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-slate-50 p-2.5">
                      <dt className="text-xs text-examino-muted">{k}</dt>
                      <dd className="font-bold text-examino-text">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </Card>

          <Card>
            <CardHeader title="Leagues" />
            <ul className="px-5 pb-4">
              {(rules.data?.leagues || []).map((l, i, arr) => (
                <li key={l.key} className={cx("flex items-center gap-3 rounded-lg px-2 py-2", s?.league.key === l.key && "bg-slate-50")}>
                  <LeagueBadge league={l} size={28} />
                  <span className="flex-1 text-sm font-semibold" style={{ color: LEAGUE_COLORS[l.key][0] }}>
                    {l.name}
                  </span>
                  <span className="text-xs text-examino-muted">{arr[i + 1] ? `${l.min}–${arr[i + 1].min - 1}` : `${l.min}+`}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 text-sm text-examino-muted">
            <p className="mb-2 font-semibold text-examino-text">How it's calculated</p>
            {rules.data ? (
              <ul className="space-y-1.5">
                <li>
                  Battle XP: win {rules.data.xp.battleWin} (with at least one correct answer), draw {rules.data.xp.battleDraw}, loss {rules.data.xp.battleLoss} (if you answered), +{rules.data.xp.battlePerCorrect} per correct answer. A player who loses connection for about 40 seconds forfeits.
                </li>
                <li>Exam XP: +{rules.data.xp.examPerCorrect} per correct answer on your first attempt.</li>
                <li>
                  Practice XP: +{rules.data.xp.practicePerCorrect} per correct answer in Test-mode practice (answers hidden until you submit), up to {rules.data.xp.practiceCap} per session and {rules.data.xp.practiceDailyCap} per day.
                </li>
                <li>
                  Rating: Elo, everyone starts at {rules.data.rating.start}. Only random-opponent battles change it. Beating a higher-rated player earns more.
                </li>
                <li>Your league follows your rating — you're promoted or demoted automatically when you cross a boundary.</li>
                <li>Weekly XP resets every Monday (Bangladesh time).</li>
              </ul>
            ) : (
              <Skeleton className="h-24" />
            )}
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
