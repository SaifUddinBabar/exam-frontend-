import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTeacherData } from "../teacherData";
import StatCard from "../components/StatCard";
import { AreaChart, BarChart } from "../components/charts";
import Icon from "../components/Icon";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LinkButton,
  Notice,
  PageHeader,
  Segmented,
  SkeletonRows,
  SoonBadge,
} from "../components/ui";
import {
  DAY,
  EXAM_STATUS,
  average,
  bucketize,
  countBetween,
  dayBuckets,
  examQuestionCount,
  examStatus,
  firstName,
  fmtDateTime,
  fmtNum,
  greeting,
  timeAgo,
  weekBuckets,
} from "../utils";

const METRICS = [
  { value: "participation", label: "Exam participation" },
  { value: "enrollment", label: "New students" },
  { value: "performance", label: "Average score" },
  {
    value: "revenue",
    label: "Revenue",
    disabled: true,
    title: "Payments aren't connected yet",
  },
];

function AnalyticsCard() {
  const { attempts, students, rankingsLoading, examsStatus } = useTeacherData();
  const [metric, setMetric] = useState("participation");
  const [range, setRange] = useState(30);
  const [now] = useState(() => Date.now());

  const { series, total, prevTotal, unit } = useMemo(() => {
    const buckets =
      range <= 30
        ? dayBuckets(range, new Date(now))
        : weekBuckets(Math.ceil(range / 7), new Date(now));
    const from = now - range * DAY;
    const prevFrom = from - range * DAY;
    if (metric === "enrollment") {
      return {
        series: bucketize(students, (s) => s.firstSeen, buckets),
        total: countBetween(students, (s) => s.firstSeen, from, now + 1),
        prevTotal: countBetween(students, (s) => s.firstSeen, prevFrom, from),
        unit: "new students",
      };
    }
    if (metric === "performance") {
      const inRange = attempts.filter(
        (a) => new Date(a.createdAt).getTime() >= from,
      );
      const prev = attempts.filter((a) => {
        const t = new Date(a.createdAt).getTime();
        return t >= prevFrom && t < from;
      });
      const avg = average(inRange.map((a) => a.pct));
      const prevAvg = average(prev.map((a) => a.pct));
      return {
        series: bucketize(
          attempts,
          (a) => a.createdAt,
          buckets,
          (items) => average(items.map((a) => a.pct)),
        ),
        total: avg === null ? null : Math.round(avg),
        prevTotal: prevAvg === null ? null : Math.round(prevAvg),
        unit: "% average",
      };
    }
    return {
      series: bucketize(attempts, (a) => a.createdAt, buckets),
      total: countBetween(attempts, (a) => a.createdAt, from, now + 1),
      prevTotal: countBetween(attempts, (a) => a.createdAt, prevFrom, from),
      unit: "submissions",
    };
  }, [metric, range, attempts, students, now]);

  const loading = examsStatus === "loading" || rankingsLoading;
  const hasData = series.some((d) => d.value);
  const diff = total !== null && prevTotal !== null ? total - prevTotal : null;

  return (
    <Card className="xl:col-span-2">
      <CardHeader
        title="Performance analytics"
        description="Calculated from submissions to your exams"
        actions={
          <Segmented
            size="sm"
            label="Time range"
            value={range}
            onChange={setRange}
            options={[
              { value: 7, label: "7 days" },
              { value: 30, label: "30 days" },
              { value: 90, label: "90 days" },
            ]}
          />
        }
      />
      <div className="px-5 pt-4">
        <div className="-mx-1 overflow-x-auto px-1">
          <Segmented
            label="Metric"
            value={metric}
            onChange={setMetric}
            options={METRICS}
            size="sm"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-2xl font-semibold tabular-nums">
            {loading
              ? "…"
              : total === null
                ? "—"
                : `${fmtNum(total)}${metric === "performance" ? "%" : ""}`}
          </p>
          <p className="text-sm text-examino-muted">
            {metric === "performance" ? "average score" : unit} in the last{" "}
            {range} days
          </p>
          {!loading && diff !== null ? (
            <span
              className={`text-xs font-semibold ${diff > 0 ? "text-emerald-700" : diff < 0 ? "text-red-700" : "text-examino-muted"}`}
            >
              {diff > 0 ? "▲ +" : diff < 0 ? "▼ " : ""}
              {diff}
              {metric === "performance" ? " pts" : ""} vs previous {range} days
            </span>
          ) : null}
        </div>
      </div>
      <div className="px-3 pb-4 pt-2">
        {loading ? (
          <SkeletonRows rows={3} />
        ) : !hasData ? (
          <EmptyState
            icon="chart"
            title="No activity in this range"
            description="Charts fill in as students submit your exams. Share an exam link to get started."
            action={
              <LinkButton to="/teacher/exams" variant="secondary" size="sm">
                Go to exams
              </LinkButton>
            }
          />
        ) : metric === "performance" ? (
          <AreaChart
            data={series}
            maxValue={100}
            formatValue={(v) => Math.round(v)}
            valueSuffix="%"
            ariaLabel={`Average score per period, last ${range} days`}
          />
        ) : (
          <BarChart
            data={series}
            formatValue={(v) => Math.round(v)}
            ariaLabel={`${unit} per period, last ${range} days`}
            valueSuffix={` ${unit}`}
          />
        )}
      </div>
    </Card>
  );
}

function RecentActivity() {
  const { attempts, exams, rankingsLoading, examsStatus } = useTeacherData();
  const items = useMemo(() => {
    const subs = attempts.slice(0, 20).map((a) => ({
      id: `s-${a.id}`,
      at: a.createdAt,
      icon: "check",
      text: (
        <>
          <b className="font-semibold">{a.name}</b> submitted{" "}
          <span className="font-medium">{a.examTitle}</span>
        </>
      ),
      meta: `${a.score}/${a.total}`,
      to: `/teacher/results/${a.examCode}`,
    }));
    const created = exams.slice(0, 20).map((e) => ({
      id: `e-${e._id || e.examCode}`,
      at: e.createdAt,
      icon: "clipboard",
      text: (
        <>
          You created <span className="font-medium">{e.title}</span>
        </>
      ),
      meta: e.examCode,
      to: `/teacher/results/${e.examCode}`,
    }));
    return [...subs, ...created]
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 6);
  }, [attempts, exams]);

  return (
    <Card>
      <CardHeader
        title="Recent activity"
        description="Submissions and exams you created"
      />
      {examsStatus === "loading" || rankingsLoading ? (
        <SkeletonRows rows={4} />
      ) : items.length ? (
        <ul className="px-2 py-3">
          {items.map((it) => (
            <li key={it.id}>
              <Link
                to={it.to}
                className="flex gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50"
              >
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-examino-muted">
                  <Icon name={it.icon} size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] leading-snug text-examino-text">
                    {it.text}
                  </span>
                  <span className="text-xs text-examino-muted">
                    <span className="font-mono">{it.meta}</span> ·{" "}
                    {timeAgo(it.at)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="clock"
          title="No activity yet"
          description="Your exam submissions and new exams will appear here."
        />
      )}
    </Card>
  );
}

function UpcomingExams() {
  const { exams, examsStatus } = useTeacherData();
  const scheduled = useMemo(
    () =>
      exams
        .filter((e) => ["scheduled", "live"].includes(examStatus(e)))
        .sort(
          (a, b) =>
            new Date(a.startTime || a.endTime) -
            new Date(b.startTime || b.endTime),
        ),
    [exams],
  );
  const list = scheduled.length ? scheduled.slice(0, 5) : exams.slice(0, 5);

  return (
    <Card className="xl:col-span-2">
      <CardHeader
        title={scheduled.length ? "Upcoming exams" : "Your latest exams"}
        description={
          scheduled.length
            ? "Scheduled and live exams"
            : "No exams have a schedule yet — showing your most recent exams"
        }
        actions={
          <LinkButton
            to="/teacher/exams"
            variant="ghost"
            size="sm"
            iconRight="arrowRight"
          >
            All exams
          </LinkButton>
        }
      />
      {examsStatus === "loading" ? (
        <SkeletonRows rows={4} />
      ) : list.length ? (
        <>
          <ul className="mt-3 divide-y divide-examino-border border-t border-examino-border sm:hidden">
            {list.map((e) => {
              const st = EXAM_STATUS[examStatus(e)];
              return (
                <li key={e.examCode}>
                  <Link
                    to={`/teacher/results/${e.examCode}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-examino-text">
                        {e.title}
                      </p>
                      <p className="mt-0.5 text-xs text-examino-muted">
                        {e.startTime ? fmtDateTime(e.startTime) : "No schedule"}{" "}
                        · {fmtNum(e.submissionCount || 0)} took it
                      </p>
                    </div>
                    <Badge tone={st.tone} dot={examStatus(e) === "live"}>
                      {st.label}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-y border-examino-border bg-slate-50/70 text-left text-xs font-semibold text-examino-muted">
                  <th className="px-5 py-2.5">Exam</th>
                  <th className="px-3 py-2.5">Scheduled</th>
                  <th className="px-3 py-2.5 text-right">Participants</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-5 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((e) => {
                  const st = EXAM_STATUS[examStatus(e)];
                  return (
                    <tr
                      key={e.examCode}
                      className="border-b border-examino-border last:border-0"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-examino-text">
                          {e.title}
                        </p>
                        <p className="text-xs text-examino-muted">
                          <span className="font-mono">{e.examCode}</span> ·{" "}
                          {examQuestionCount(e)} questions · {e.duration} min
                        </p>
                      </td>
                      <td className="px-3 py-3 text-examino-muted">
                        {e.startTime ? fmtDateTime(e.startTime) : "No schedule"}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {fmtNum(e.submissionCount || 0)}
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={st.tone} dot={examStatus(e) === "live"}>
                          {st.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/teacher/results/${e.examCode}`}
                          className="text-xs font-semibold text-examino-blue hover:underline"
                        >
                          View results
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <EmptyState
          icon="clipboard"
          title="You haven't created an exam yet"
          description="Pick questions from the bank and publish your first online exam."
          action={
            <LinkButton to="/teacher/exams/new" icon="plus">
              Create exam
            </LinkButton>
          }
        />
      )}
    </Card>
  );
}

const QUICK_ACTIONS = [
  {
    to: "/teacher/exams/new",
    icon: "clipboard",
    label: "Create new exam",
    desc: "Pick questions and publish",
  },
  {
    to: "/teacher/questions/new",
    icon: "plusSquare",
    label: "Add questions",
    desc: "MCQ with maths & images",
  },
  {
    to: "/teacher/paper-builder",
    icon: "file",
    label: "Create question paper",
    desc: "Print-ready board format",
  },
  {
    label: "Add students",
    icon: "users",
    desc: "Needs an enrollment API",
    soon: true,
  },
  {
    label: "Create course",
    icon: "book",
    desc: "Needs a course API",
    soon: true,
  },
];

function QuickActions() {
  return (
    <Card>
      <CardHeader title="Quick actions" />
      <div className="grid gap-2 p-4">
        {QUICK_ACTIONS.map((a) =>
          a.soon ? (
            <div
              key={a.label}
              className="flex items-center gap-3 rounded-lg border border-dashed border-examino-border px-3 py-2.5 opacity-80"
              aria-disabled="true"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-examino-subtle">
                <Icon name={a.icon} size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium text-examino-muted">
                  {a.label} <SoonBadge />
                </span>
                <span className="text-xs text-examino-subtle">{a.desc}</span>
              </span>
            </div>
          ) : (
            <Link
              key={a.label}
              to={a.to}
              className="group flex items-center gap-3 rounded-lg border border-examino-border px-3 py-2.5 transition-colors hover:border-examino-blue/40 hover:bg-examino-blue-light/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-examino-blue-light text-examino-blue">
                <Icon name={a.icon} size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-examino-text">
                  {a.label}
                </span>
                <span className="text-xs text-examino-muted">{a.desc}</span>
              </span>
              <Icon
                name="chevronRight"
                size={16}
                className="text-examino-subtle group-hover:text-examino-blue"
              />
            </Link>
          ),
        )}
      </div>
    </Card>
  );
}

export default function Overview() {
  const {
    user,
    exams,
    examsStatus,
    examsError,
    students,
    rankingsLoading,
    rankingsFailed,
    reload,
  } = useTeacherData();

  const [now] = useState(() => Date.now());
  const kpis = useMemo(() => {
    const d30 = now - 30 * DAY;
    const d60 = now - 60 * DAY;
    const weeks = weekBuckets(12, new Date(now));
    return {
      students: students.length,
      studentsDelta:
        countBetween(students, (s) => s.firstSeen, d30, now + 1) -
        countBetween(students, (s) => s.firstSeen, d60, d30),
      studentsSpark: bucketize(students, (s) => s.firstSeen, weeks).map(
        (b) => b.value,
      ),
      exams: exams.length,
      examsDelta:
        countBetween(exams, (e) => e.createdAt, d30, now + 1) -
        countBetween(exams, (e) => e.createdAt, d60, d30),
      examsSpark: bucketize(exams, (e) => e.createdAt, weeks).map(
        (b) => b.value,
      ),
    };
  }, [students, exams, now]);

  if (examsStatus === "error") {
    return (
      <Card>
        <ErrorState
          title="Couldn't load your dashboard"
          message={examsError}
          onRetry={reload}
        />
      </Card>
    );
  }

  const loadingExams = examsStatus === "loading";

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${firstName(user.name)}!`}
        description="Here's what's happening with your teaching business today."
        actions={
          <>
            <LinkButton
              to="/teacher/questions/new"
              variant="secondary"
              icon="plus"
            >
              Add questions
            </LinkButton>
            <LinkButton to="/teacher/exams/new" icon="clipboard">
              Create exam
            </LinkButton>
          </>
        }
      />

      {rankingsFailed ? (
        <Notice
          tone="warning"
          className="mb-6"
          action={
            <button
              type="button"
              onClick={reload}
              className="text-xs font-semibold text-amber-900 underline"
            >
              Retry
            </button>
          }
        >
          Results for {rankingsFailed} exam{rankingsFailed > 1 ? "s" : ""}{" "}
          couldn't be loaded, so student numbers may be incomplete.
        </Notice>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total students"
          icon="users"
          state={loadingExams || rankingsLoading ? "loading" : "ready"}
          value={fmtNum(kpis.students)}
          delta={kpis.students ? kpis.studentsDelta : null}
          deltaLabel="new vs previous 30 days"
          note="Students who took your exams"
          spark={kpis.students ? kpis.studentsSpark : null}
        />
        <StatCard
          label="Active courses"
          icon="book"
          state="unavailable"
          unavailableText="Courses aren't supported by the current backend."
          unavailableLink={{ to: "/teacher/courses", label: "What's coming" }}
        />
        <StatCard
          label="Exams created"
          icon="clipboard"
          state={loadingExams ? "loading" : "ready"}
          value={fmtNum(kpis.exams)}
          delta={kpis.exams ? kpis.examsDelta : null}
          deltaLabel="vs previous 30 days"
          note="Create your first exam to start"
          spark={kpis.exams ? kpis.examsSpark : null}
        />
        <StatCard
          label="Total revenue"
          icon="wallet"
          state="unavailable"
          unavailableText="No payment integration is connected."
          unavailableLink={{
            to: "/teacher/payments",
            label: "Payments status",
          }}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <AnalyticsCard />
        <RecentActivity />
        <UpcomingExams />
        <QuickActions />
      </div>
    </>
  );
}
