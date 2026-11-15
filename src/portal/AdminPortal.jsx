import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PortalShell, { MiniBars } from "./PortalShell";
import { api } from "../teacher/api";
import useAsync from "../lib/useAsync";
import { useToast } from "../teacher/toast";
import { useDebounced } from "../teacher/hooks";
import { Avatar, Badge, Button, Card, CardHeader, ConfirmDialog, EmptyState, ErrorState, PageHeader, Pagination, SearchInput, Select, SkeletonRows, Tabs } from "../teacher/components/ui";
import { fmtDate, fmtDateTime } from "../teacher/utils";

const NAV = [
  { to: "/admin", label: "Overview", icon: "home", end: true },
  { to: "/admin/users", label: "Users & teachers", icon: "users" },
  { to: "/admin/organizations", label: "Coaching centres", icon: "globe" },
  { to: "/admin/audit-log", label: "Audit log", icon: "clock" },
];
const ROLE_LABEL = { student: "Student", tutor: "Teacher", org_admin: "Centre admin", super_admin: "Super admin" };

function Stat({ label, value, hint }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-examino-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-examino-text tabular-nums">{value}</p>
      {hint ? <p className="text-xs text-examino-muted">{hint}</p> : null}
    </Card>
  );
}

function Overview() {
  const { status, data, error, reload } = useAsync((signal) => api.adminOverview({ signal }), []);
  if (status === "loading") return <SkeletonRows rows={6} />;
  if (status === "error") return <ErrorState message={error} onRetry={reload} />;
  const r = data.users.byRole;
  return (
    <>
      <PageHeader title="Platform overview" description="Live counts from the database." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Students" value={r.student || 0} hint={`${data.users.inactive} deactivated accounts in total`} />
        <Stat label="Teachers" value={r.tutor || 0} />
        <Stat label="Centre admins" value={r.org_admin || 0} hint={`${data.content.organizations} coaching centres`} />
        <Stat label="Questions" value={data.content.questions} hint={`${data.content.hiddenQuestions} hidden · ${data.content.openReports} open reports`} />
        <Stat label="Live exams" value={data.content.exams} />
        <Stat label="Exam submissions" value={data.content.submissions} />
        <Stat label="Active batches" value={data.content.batches} />
        <Stat label="Finished battles" value={data.content.battles} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="New accounts" description="Last 30 days" />
          <div className="px-5 pb-5">
            <MiniBars series={data.series.signups} label="New accounts per day" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Exam submissions" description="Last 30 days" />
          <div className="px-5 pb-5">
            <MiniBars series={data.series.submissions} label="Submissions per day" />
          </div>
        </Card>
      </div>
    </>
  );
}

function Users() {
  const [role, setRole] = useState("");
  const [statusF, setStatusF] = useState("");
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();
  const res = useAsync((signal) => api.adminUsers({ role, status: statusF, q: dq, page }, { signal }), [role, statusF, dq, page]);

  const apply = async (u, patch, label) => {
    setBusy(true);
    try {
      await api.adminUpdateUser(u._id, patch);
      notify({ title: label, description: u.name });
      setConfirm(null);
      res.reload();
    } catch (e) {
      notify({ tone: "error", title: "Couldn't update", description: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Users & teachers" description="Change roles or deactivate accounts. Deactivated users can't sign in; their results are kept." />
      <Card>
        <div className="flex flex-col gap-3 px-5 pt-3 md:flex-row md:items-end md:justify-between">
          <Tabs
            label="Role"
            value={role}
            onChange={(v) => {
              setRole(v);
              setPage(1);
            }}
            tabs={[
              { value: "", label: "All" },
              { value: "student", label: "Students" },
              { value: "tutor", label: "Teachers" },
              { value: "org_admin", label: "Centre admins" },
            ]}
          />
          <div className="flex gap-2 pb-2">
            <Select aria-label="Status" value={statusF} onChange={(e) => setStatusF(e.target.value)} className="h-9 w-36">
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
            </Select>
            <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name, email or phone" className="w-full md:w-64" />
          </div>
        </div>
        {res.status === "loading" ? (
          <SkeletonRows rows={6} />
        ) : res.status === "error" ? (
          <ErrorState message={res.error} onRetry={res.reload} />
        ) : !res.data.users.length ? (
          <EmptyState icon="users" title="No users match." />
        ) : (
          <>
            <ul className="divide-y divide-examino-border">
              {res.data.users.map((u) => (
                <li key={u._id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={u.name} size={34} />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-semibold text-examino-text">
                        {u.name}
                        {!u.isActive ? <Badge tone="red">Deactivated</Badge> : null}
                        {u.globalRole === "super_admin" ? <Badge tone="navy">Super admin</Badge> : null}
                      </p>
                      <p className="truncate text-xs text-examino-muted">
                        {[u.email, u.phone].filter(Boolean).join(" · ")} · joined {fmtDate(u.createdAt)}
                        {u.organizations.length ? ` · ${u.organizations.map((o) => o.name).join(", ")}` : ""}
                        {u.role === "student" ? ` · ${u.submissions} exam submissions` : ""}
                      </p>
                    </div>
                  </div>
                  {u.globalRole === "super_admin" ? null : (
                    <div className="flex items-center gap-2">
                      <Select aria-label={`Role of ${u.name}`} value={u.role} onChange={(e) => setConfirm({ u, patch: { role: e.target.value }, label: `Role changed to ${ROLE_LABEL[e.target.value]}`, text: `Change ${u.name}'s role from ${ROLE_LABEL[u.role]} to ${ROLE_LABEL[e.target.value]}?` })} className="h-9 w-40">
                        <option value="student">Student</option>
                        <option value="tutor">Teacher</option>
                        <option value="org_admin">Centre admin</option>
                      </Select>
                      <Button
                        size="sm"
                        variant={u.isActive ? "danger-ghost" : "secondary"}
                        onClick={() =>
                          setConfirm({ u, patch: { isActive: !u.isActive }, label: u.isActive ? "Account deactivated" : "Account reactivated", text: u.isActive ? `Deactivate ${u.name}? They won't be able to sign in. Results are kept.` : `Reactivate ${u.name}?` })
                        }
                      >
                        {u.isActive ? "Deactivate" : "Reactivate"}
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <Pagination page={page} totalPages={res.data.totalPages} onChange={setPage} summary={`${res.data.total} users`} />
          </>
        )}
      </Card>
      <ConfirmDialog open={Boolean(confirm)} title="Confirm change" confirmLabel="Confirm" tone={confirm?.patch?.isActive === false ? "danger" : "primary"} busy={busy} onCancel={() => setConfirm(null)} onConfirm={() => apply(confirm.u, confirm.patch, confirm.label)}>
        {confirm?.text}
      </ConfirmDialog>
    </>
  );
}

function Organizations() {
  const res = useAsync((signal) => api.adminOrganizations({ signal }), []);
  const { notify } = useToast();
  const change = async (o, patch) => {
    try {
      await api.adminUpdateOrganization(o._id, patch);
      notify({ title: "Coaching centre updated", description: o.name });
      res.reload();
    } catch (e) {
      notify({ tone: "error", title: "Couldn't update", description: e.message });
    }
  };
  return (
    <>
      <PageHeader title="Coaching centres" description="Organizations on Examino. Suspending a centre blocks its admin portal." />
      <Card>
        {res.status === "loading" ? (
          <SkeletonRows rows={4} />
        ) : res.status === "error" ? (
          <ErrorState message={res.error} onRetry={res.reload} />
        ) : !res.data.organizations.length ? (
          <EmptyState icon="globe" title="No coaching centres yet." />
        ) : (
          <ul className="divide-y divide-examino-border">
            {res.data.organizations.map((o) => (
              <li key={o._id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold text-examino-text">
                    {o.name}
                    <Badge tone={o.status === "active" ? "green" : o.status === "trial" ? "blue" : "red"}>{o.status}</Badge>
                  </p>
                  <p className="text-xs text-examino-muted">
                    Code {o.code} · {o.location} · owner {o.owner?.name || "—"} · {o.members.org_admin || 0} admins, {o.members.teacher || 0} teachers, {o.members.student || 0} students · since {fmtDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select aria-label="Plan" value={o.plan} onChange={(e) => change(o, { plan: e.target.value })} className="h-9 w-32">
                    {["free", "basic", "premium", "enterprise"].map((p) => (
                      <option key={p} value={p}>
                        {p[0].toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </Select>
                  <Select aria-label="Status" value={o.status} onChange={(e) => change(o, { status: e.target.value })} className="h-9 w-32">
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                  </Select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

export function AuditLog({ load }) {
  const res = useAsync((signal) => load({ signal }), []);
  return (
    <>
      <PageHeader title="Audit log" description="Every administrative change, newest first." />
      <Card>
        {res.status === "loading" ? (
          <SkeletonRows rows={4} />
        ) : res.status === "error" ? (
          <ErrorState message={res.error} onRetry={res.reload} />
        ) : !res.data.entries.length ? (
          <EmptyState icon="clock" title="No changes recorded yet." />
        ) : (
          <ul className="divide-y divide-examino-border">
            {res.data.entries.map((e) => (
              <li key={e._id} className="px-5 py-3 text-sm">
                <p className="font-medium text-examino-text">
                  {e.actorId?.name || "Someone"} · <span className="font-mono text-xs">{e.action}</span>
                </p>
                <p className="text-xs text-examino-muted">
                  {fmtDateTime(e.createdAt)} · {e.targetType} {String(e.targetId).slice(-6)} · {JSON.stringify(e.before)} → {JSON.stringify(e.after)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

export default function AdminPortal() {
  return (
    <PortalShell title="Platform administration" subtitle="Platform admin" nav={NAV}>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="users" element={<Users />} />
        <Route path="organizations" element={<Organizations />} />
        <Route path="audit-log" element={<AuditLog load={api.adminAuditLog} />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </PortalShell>
  );
}
