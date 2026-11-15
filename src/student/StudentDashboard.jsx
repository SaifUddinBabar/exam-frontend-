import { Link } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import { api } from "../teacher/api";
import useAsync from "../lib/useAsync";
import { Badge, Card, CardHeader, EmptyState, ErrorState, LinkButton, Skeleton } from "../teacher/components/ui";
import Icon from "../teacher/components/Icon";
import { STATUS_META, fmtWhen, relative } from "./examFormat";
import { LeagueBadge } from "./league/LeagueBadge";

const cx = (...c) => c.filter(Boolean).join(" ");

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "শুভ সকাল";
  if (h < 17) return "শুভ অপরাহ্ন";
  return "শুভ সন্ধ্যা";
}

function Stat({ label, value, hint, icon, tone = "blue" }) {
  const tones = { blue: "bg-examino-blue-light text-examino-blue", amber: "bg-examino-amber-soft text-amber-600", green: "bg-examino-green-light text-emerald-600", navy: "bg-slate-100 text-examino-navy" };
  return (
    <Card className="flex items-center gap-4 p-4">
      <span className={cx("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-examino-muted">{label}</p>
        <p className="text-xl font-bold text-examino-text">{value}</p>
        {hint ? <p className="truncate text-xs text-examino-muted">{hint}</p> : null}
      </div>
    </Card>
  );
}

function Sparkline({ values }) {
  if (!values || values.length < 2) return <p className="text-sm text-examino-muted">Take two or more exams to see your trend.</p>;
  const w = 260;
  const h = 64;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (Math.max(0, Math.min(100, v)) / 100) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h + 4}`} className="h-20 w-full" role="img" aria-label={`Recent exam scores: ${values.join(", ")} percent`}>
      <polyline points={pts} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => (
        <circle key={i} cx={(i / (values.length - 1)) * w} cy={h - (Math.max(0, Math.min(100, v)) / 100) * h} r="3" fill="#2563EB" />
      ))}
    </svg>
  );
}

export default function StudentDashboard() {
  const { status, data, error, reload } = useAsync((signal) => api.studentDashboard({ signal }), []);

  if (status === "loading") {
    return (
      <StudentLayout>
        <Skeleton className="mb-6 h-28" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="mt-6 h-64" />
      </StudentLayout>
    );
  }
  if (status === "error") {
    return (
      <StudentLayout>
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      </StudentLayout>
    );
  }

  const d = data;
  const s = d.stats;
  const firstName = (d.user?.name || "").split(" ")[0] || "Student";

  return (
    <StudentLayout>
      {/* Welcome */}
      <section className="relative mb-6 overflow-hidden rounded-banner bg-examino-navy px-6 py-6 text-white sm:px-8">
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-300 font-bengali">{greeting()},</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">{firstName}</h1>
            <p className="mt-2 text-sm text-slate-300">
              {d.exams.some((e) => e.status === "in_progress")
                ? "You have an exam in progress."
                : d.exams.some((e) => e.status === "active")
                  ? `${d.exams.filter((e) => e.status === "active").length} exam(s) open for you now.`
                  : "No exams open right now — a good time to practise or battle."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton to="/battle" icon="swords" className="bg-white !text-examino-navy hover:bg-slate-100">
              Battle now
            </LinkButton>
            <LinkButton to="/practice" variant="navy" icon="target" className="border border-white/20">
              Practice
            </LinkButton>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-examino-blue/30 blur-3xl" aria-hidden="true" />
      </section>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="League" value={s.league.name} hint={s.league.next ? `${s.league.next.needed} rating to ${s.league.next.name}` : "Top league"} icon="trophy" tone="amber" />
        <Stat label="Rating · Rank" value={`${s.rating}${d.globalRank ? ` · #${d.globalRank}` : ""}`} hint={d.globalRank ? "Global rank" : "Finish a battle to get ranked"} icon="star" tone="navy" />
        <Stat label="Total XP" value={s.xp} hint={`${s.weeklyXp} this week`} icon="sparkle" tone="blue" />
        <Stat label="Day streak" value={`${s.dayStreak} ${s.dayStreak === 1 ? "day" : "days"}`} hint={`Best ${s.bestDayStreak}`} icon="flame" tone="green" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Upcoming / open exams */}
          <Card>
            <CardHeader title="Your exams" description="Open, in-progress and upcoming exams assigned to you." actions={<Link to="/exams" className="text-sm font-semibold text-examino-blue hover:underline">All exams</Link>} />
            {d.exams.length ? (
              <ul className="divide-y divide-examino-border">
                {d.exams.map((e) => {
                  const meta = STATUS_META[e.status];
                  return (
                    <li key={e.examCode} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge tone={meta.tone} dot>
                            {meta.label}
                          </Badge>
                          <span className="text-xs text-examino-muted">
                            {e.totalQuestions} Q · {e.duration} min
                          </span>
                        </div>
                        <p className="truncate font-semibold text-examino-text font-bengali">{e.title}</p>
                        <p className="text-xs text-examino-muted">{e.status === "upcoming" ? `Opens ${fmtWhen(e.startTime)} (${relative(e.startTime)})` : e.endTime ? `Closes ${fmtWhen(e.endTime)}` : "No deadline"}</p>
                      </div>
                      <LinkButton size="sm" variant={e.status === "upcoming" ? "secondary" : "primary"} to={e.status === "in_progress" ? `/exam/${e.examCode}` : `/exams/${e.examCode}/details`}>
                        {e.status === "in_progress" ? "Resume" : e.status === "upcoming" ? "Details" : "Start"}
                      </LinkButton>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon="clipboard" title="No exams available yet." description="Exams your teacher assigns to you or your batches will show here." />
            )}
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader title="Personal progress" description="From your submitted exams and battles." actions={<Link to="/performance" className="text-sm font-semibold text-examino-blue hover:underline">Details</Link>} />
            <div className="grid grid-cols-1 gap-6 px-5 pb-5 sm:grid-cols-2">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Exams taken", d.progress.examsTaken],
                  ["Average", d.progress.averagePct === null ? "—" : `${d.progress.averagePct}%`],
                  ["Best", d.progress.bestPct === null ? "—" : `${d.progress.bestPct}%`],
                  ["Battles", `${s.wins}W · ${s.losses}L`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-slate-50 p-3">
                    <dt className="text-xs text-examino-muted">{k}</dt>
                    <dd className="text-lg font-bold text-examino-text">{v}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <p className="mb-2 text-xs font-medium text-examino-muted">Recent exam scores (%)</p>
                <Sparkline values={d.progress.recentPcts} />
              </div>
            </div>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader title="Recent activity" />
            {d.activity.length ? (
              <ul className="divide-y divide-examino-border">
                {d.activity.map((a, i) => (
                  <li key={i}>
                    <Link to={a.link} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-examino-muted">
                        <Icon name={a.type === "battle" ? "swords" : a.type === "exam" ? "clipboard" : "target"} size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-examino-text font-bengali">{a.title}</span>
                        <span className="text-xs text-examino-muted">{relative(a.at)}</span>
                      </span>
                      <span className="text-sm font-semibold text-examino-text">{a.detail}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon="clock" title="No activity yet." description="Exams, practice sessions and battles you finish will appear here." />
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* League card */}
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <LeagueBadge league={s.league} size={56} />
              <div>
                <p className="text-xs font-medium text-examino-muted">Current league</p>
                <p className="text-lg font-bold text-examino-text">{s.league.name}</p>
                <p className="text-xs text-examino-muted">Rating {s.rating}</p>
              </div>
            </div>
            {s.league.next ? (
              <>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-examino-blue" style={{ width: `${Math.max(4, 100 - (s.league.next.needed / Math.max(1, s.league.next.min - s.league.min)) * 100)}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-examino-muted">
                  {s.league.next.needed} rating points to {s.league.next.name}
                </p>
              </>
            ) : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <LinkButton to="/battle" size="sm" icon="swords">
                Battle
              </LinkButton>
              <LinkButton to="/league" size="sm" variant="secondary">
                Leaderboard
              </LinkButton>
            </div>
          </Card>

          {/* Notices */}
          <Card>
            <CardHeader title="Latest notices" description={d.unreadNotices ? `${d.unreadNotices} unread` : undefined} actions={<Link to="/notices" className="text-sm font-semibold text-examino-blue hover:underline">All</Link>} />
            {d.notices.length ? (
              <ul className="divide-y divide-examino-border">
                {d.notices.map((n) => (
                  <li key={n._id}>
                    <Link to={`/notices#${n._id}`} className="block px-5 py-3 hover:bg-slate-50">
                      <span className="flex items-center gap-2">
                        {!n.read ? <span className="h-2 w-2 shrink-0 rounded-full bg-examino-blue" aria-label="Unread" /> : null}
                        <span className={cx("truncate text-sm text-examino-text font-bengali", !n.read && "font-semibold")}>{n.title}</span>
                        {n.priority !== "normal" ? <Badge tone={n.priority === "urgent" ? "red" : "amber"}>{n.priority}</Badge> : null}
                      </span>
                      <span className="text-xs text-examino-muted">
                        {n.authorName ? `${n.authorName} · ` : ""}
                        {relative(n.publishAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon="megaphone" title="No notices yet." />
            )}
          </Card>

          {/* Batches */}
          <Card>
            <CardHeader title="My batches" actions={<Link to="/batches" className="text-sm font-semibold text-examino-blue hover:underline">Manage</Link>} />
            {d.batches.length ? (
              <ul className="divide-y divide-examino-border">
                {d.batches.map((b) => (
                  <li key={b._id} className="px-5 py-3">
                    <p className="text-sm font-semibold text-examino-text">{b.name}</p>
                    <p className="text-xs text-examino-muted">{[b.classLevel, b.academicYear, b.subject, b.teacherName && `by ${b.teacherName}`].filter(Boolean).join(" · ")}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon="layers" title="You haven't joined a batch." description="Ask your teacher for a batch code." action={<LinkButton to="/batches" size="sm" variant="secondary">Join with code</LinkButton>} />
            )}
          </Card>

          {/* Practice topics */}
          <Card className="p-5">
            <p className="text-sm font-semibold text-examino-text">Practice topics</p>
            <p className="mt-1 text-sm text-examino-muted">Build a practice set from any chapter and topic, or revise the topics you miss most.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <LinkButton to="/practice/create" size="sm" variant="secondary" icon="target">
                New practice
              </LinkButton>
              <LinkButton to="/weak-topics" size="sm" variant="secondary" icon="flag">
                Weak topics
              </LinkButton>
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
