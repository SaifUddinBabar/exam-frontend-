import { useEffect, useState } from "react";
import { api } from "../api";
import { useTeacherData } from "../teacherData";
import Icon from "../components/Icon";
import { Badge, Card, CardHeader, EmptyState, ErrorState, LinkButton, Notice, PageHeader, SkeletonRows } from "../components/ui";
import { fmtDate, fmtNum } from "../utils";

const PLAN_LABEL = { free: "Free", basic: "Basic", premium: "Premium", enterprise: "Enterprise" };
const STATUS_TONE = { active: "green", trial: "blue", suspended: "red" };

// Features that genuinely work in the app today, so the list never over-promises.
const AVAILABLE = [
  "Unlimited access to the shared question bank",
  "Create MCQ questions with images and maths",
  "Online exams with negative marking and shareable links",
  "Rank lists, score distribution and CSV export",
  "Print-ready question papers and PDF download",
];
const UPCOMING = ["Courses and enrollment", "Payments and payouts", "Branded teacher website", "Exam scheduling and attempt limits"];

export default function Subscription() {
  const { userId, exams, students } = useTeacherData();
  const [result, setResult] = useState({ tick: -1, status: "loading", org: null, error: null });
  const [tick, setTick] = useState(0);
  const state = result.tick === tick ? result : { status: "loading", org: null, error: null };

  useEffect(() => {
    const ctrl = new AbortController();
    api
      .organizations({ signal: ctrl.signal })
      .then((res) => {
        const org = (res?.organizations || []).find((o) => String(o.ownerId) === userId) || null;
        setResult({ tick, status: "ready", org, error: null });
      })
      .catch((err) => {
        if (err.name !== "AbortError") setResult({ tick, status: "error", org: null, error: err.message });
      });
    return () => ctrl.abort();
  }, [userId, tick]);

  return (
    <>
      <PageHeader title="Subscription & Plans" description="Your current plan, what it includes, and your usage." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Current plan" />
          {state.status === "loading" ? (
            <SkeletonRows rows={2} />
          ) : state.status === "error" ? (
            <ErrorState message={state.error} onRetry={() => setTick((t) => t + 1)} />
          ) : state.org ? (
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-2xl font-semibold">{PLAN_LABEL[state.org.plan] || state.org.plan}</p>
                <Badge tone={STATUS_TONE[state.org.status] || "neutral"}>{state.org.status}</Badge>
              </div>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-examino-muted">Organisation</dt>
                  <dd className="font-medium">{state.org.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-examino-muted">Code</dt>
                  <dd className="font-mono">{state.org.code || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-examino-muted">Member since</dt>
                  <dd>{fmtDate(state.org.createdAt)}</dd>
                </div>
              </dl>
              <Notice tone="neutral" className="mt-5">
                Plan validity dates and prices aren't stored by the backend yet, so renewal dates and BDT prices can't be shown.
              </Notice>
            </div>
          ) : (
            <EmptyState
              icon="card"
              title="No plan on record"
              description="You're using the individual teacher workspace. Plans are attached to organisations, and you don't own one."
            />
          )}
        </Card>

        <Card>
          <CardHeader title="Usage" description="From your real data" />
          <dl className="divide-y divide-examino-border px-5 py-2 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-examino-muted">Exams created</dt>
              <dd className="font-semibold tabular-nums">{fmtNum(exams.length)}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-examino-muted">Students reached</dt>
              <dd className="font-semibold tabular-nums">{fmtNum(students.length)}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-examino-muted">Usage limits</dt>
              <dd className="text-examino-muted">Not enforced</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Included today" />
          <ul className="space-y-2.5 p-5 text-sm">
            {AVAILABLE.map((f) => (
              <li key={f} className="flex gap-2">
                <Icon name="check" size={16} className="mt-0.5 text-emerald-600" />
                {f}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Coming later" />
          <ul className="space-y-2.5 p-5 text-sm text-examino-muted">
            {UPCOMING.map((f) => (
              <li key={f} className="flex gap-2">
                <Icon name="clock" size={16} className="mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Upgrade, renewal & billing history" />
          <div className="p-5">
            <p className="text-sm text-examino-muted">No billing integration is connected, so there are no invoices to show and upgrades can't be bought online yet.</p>
            <LinkButton to="/teacher/help" variant="secondary" className="mt-4" icon="help">
              How to get help
            </LinkButton>
          </div>
        </Card>
      </div>
    </>
  );
}
