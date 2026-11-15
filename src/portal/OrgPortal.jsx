import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PortalShell, { MiniBars } from "./PortalShell";
import { AuditLog } from "./AdminPortal";
import { api } from "../teacher/api";
import useAsync from "../lib/useAsync";
import { useToast } from "../teacher/toast";
import { Avatar, Badge, Button, Card, CardHeader, ConfirmDialog, EmptyState, ErrorState, Field, Input, PageHeader, SearchInput, Select, SkeletonRows, Tabs } from "../teacher/components/ui";
import { fmtDate, fmtDateTime } from "../teacher/utils";

const NAV = [
  { to: "/organization", label: "Overview", icon: "home", end: true },
  { to: "/organization/members", label: "Teachers & students", icon: "users" },
  { to: "/organization/invitations", label: "Invitations", icon: "link" },
  { to: "/organization/audit-log", label: "Audit log", icon: "clock" },
];
const ROLE = { org_admin: "Centre admin", teacher: "Teacher", student: "Student" };

function useOrg() {
  return useAsync((signal) => api.orgOverview({ signal }), []);
}

function Overview() {
  const { status, data, error, reload } = useOrg();
  if (status === "loading") return <SkeletonRows rows={6} />;
  if (status === "error") return <ErrorState message={error} onRetry={reload} />;
  const r = data.members.byRole;
  return (
    <>
      <PageHeader eyebrow={`Code ${data.organization.code}`} title={data.organization.name} description={`${data.organization.location || ""} · ${data.organization.plan} plan`} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Teachers", r.teacher || 0],
          ["Students", r.student || 0],
          ["Exams by your teachers", data.content.exams],
          ["Average score", data.content.averagePct === null ? "—" : `${data.content.averagePct}%`],
        ].map(([k, v]) => (
          <Card key={k} className="p-4">
            <p className="text-xs font-medium text-examino-muted">{k}</p>
            <p className="mt-1 text-2xl font-bold text-examino-text">{v}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Exam submissions" description={`Last 30 days · ${data.content.submissions} in total`} />
          <div className="px-5 pb-5">
            <MiniBars series={data.series.submissions} label="Submissions per day" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Recent exams" />
          {data.recentExams.length ? (
            <ul className="divide-y divide-examino-border">
              {data.recentExams.map((e) => (
                <li key={e._id} className="px-5 py-2.5 text-sm">
                  <p className="truncate font-medium text-examino-text font-bengali">{e.title}</p>
                  <p className="text-xs text-examino-muted">
                    {e.examCode} · {fmtDate(e.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="clipboard" title="No exams yet." />
          )}
        </Card>
      </div>
    </>
  );
}

function Members() {
  const [role, setRole] = useState("");
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();
  const res = useAsync((signal) => api.orgMembers({ role, q, status: "all" }, { signal }), [role, q]);
  const apply = async () => {
    setBusy(true);
    try {
      await api.orgUpdateMember(confirm.m.membershipId, confirm.patch);
      notify({ title: confirm.label, description: confirm.m.user.name });
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
      <PageHeader title="Teachers & students" description="Members of your coaching centre. Removing a member ends their membership; their account and results are kept." />
      <Card>
        <div className="flex flex-col gap-3 px-5 pt-3 md:flex-row md:items-end md:justify-between">
          <Tabs label="Role" value={role} onChange={setRole} tabs={[{ value: "", label: "All" }, { value: "teacher", label: "Teachers" }, { value: "student", label: "Students" }, { value: "org_admin", label: "Admins" }]} />
          <SearchInput value={q} onChange={setQ} placeholder="Name, email or phone" className="mb-2 w-full md:w-64" />
        </div>
        {res.status === "loading" ? (
          <SkeletonRows rows={5} />
        ) : res.status === "error" ? (
          <ErrorState message={res.error} onRetry={res.reload} />
        ) : !res.data.members.length ? (
          <EmptyState icon="users" title="No members yet." description="Invite teachers and students from Invitations." />
        ) : (
          <ul className="divide-y divide-examino-border">
            {res.data.members.map((m) => (
              <li key={m.membershipId} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={m.user.name} size={34} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-sm font-semibold text-examino-text">
                      {m.user.name}
                      {m.status !== "active" ? <Badge tone="neutral">Removed</Badge> : null}
                    </p>
                    <p className="truncate text-xs text-examino-muted">
                      {[m.user.email, m.user.phone].filter(Boolean).join(" · ")} · joined {fmtDate(m.joinedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select aria-label={`Role of ${m.user.name}`} value={m.role} onChange={(e) => setConfirm({ m, patch: { role: e.target.value }, label: `Role changed to ${ROLE[e.target.value]}`, text: `Change ${m.user.name} to ${ROLE[e.target.value]} in your centre?` })} className="h-9 w-36">
                    {Object.entries(ROLE).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                  <Button size="sm" variant={m.status === "active" ? "danger-ghost" : "secondary"} onClick={() => setConfirm({ m, patch: { status: m.status === "active" ? "inactive" : "active" }, label: m.status === "active" ? "Member removed" : "Member restored", text: m.status === "active" ? `Remove ${m.user.name} from your centre?` : `Restore ${m.user.name}?` })}>
                    {m.status === "active" ? "Remove" : "Restore"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <ConfirmDialog open={Boolean(confirm)} title="Confirm change" confirmLabel="Confirm" tone={confirm?.patch?.status === "inactive" ? "danger" : "primary"} busy={busy} onCancel={() => setConfirm(null)} onConfirm={apply}>
        {confirm?.text}
      </ConfirmDialog>
    </>
  );
}

function Invitations() {
  const org = useOrg();
  const orgId = org.data?.organization?._id;
  const list = useAsync((signal) => (orgId ? api.orgInvitations(orgId, { signal }) : Promise.resolve(null)), [orgId]);
  const [form, setForm] = useState({ role: "student", recipientEmail: "", maxUses: 1, expiryDays: 7 });
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();
  const invitations = list.data?.invitations || list.data?.data || [];
  const create = async () => {
    setBusy(true);
    try {
      const r = await api.createInvitation({ organizationId: orgId, ...form, maxUses: Number(form.maxUses), expiryDays: Number(form.expiryDays) });
      const code = r.invitation?.inviteCode || r.inviteCode;
      if (code) {
        await navigator.clipboard?.writeText(`${window.location.origin}/invite/${code}`).catch(() => {});
        notify({ title: "Invitation created", description: `Link copied: /invite/${code}` });
      }
      list.reload();
    } catch (e) {
      notify({ tone: "error", title: "Couldn't create the invitation", description: e.message });
    } finally {
      setBusy(false);
    }
  };
  if (org.status === "loading") return <SkeletonRows rows={4} />;
  if (org.status === "error") return <ErrorState message={org.error} onRetry={org.reload} />;
  return (
    <>
      <PageHeader title="Invitations" description="Invite teachers and students to join your coaching centre with a link." />
      <Card className="mb-6">
        <CardHeader title="New invitation" />
        <div className="grid gap-3 px-5 pb-5 sm:grid-cols-5 sm:items-end">
          <Field label="Role" htmlFor="inv-role">
            <Select id="inv-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </Select>
          </Field>
          <Field label="Email (optional)" htmlFor="inv-email" className="sm:col-span-2">
            <Input id="inv-email" type="email" value={form.recipientEmail} onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })} />
          </Field>
          <Field label="Uses" htmlFor="inv-uses">
            <Input id="inv-uses" type="number" min={1} max={500} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          </Field>
          <Button loading={busy} icon="link" onClick={create}>
            Create link
          </Button>
        </div>
      </Card>
      <Card>
        {list.status === "loading" ? (
          <SkeletonRows rows={3} />
        ) : !invitations.length ? (
          <EmptyState icon="link" title="No invitations yet." />
        ) : (
          <ul className="divide-y divide-examino-border">
            {invitations.map((i) => (
              <li key={i._id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-mono text-sm font-semibold text-examino-text">
                    {i.inviteCode}
                    <Badge tone={i.status === "active" ? "green" : "neutral"}>{i.status}</Badge>
                  </p>
                  <p className="text-xs text-examino-muted">
                    {i.role} · used {i.usedCount}/{i.maxUses} · expires {fmtDateTime(i.expiresAt)}
                    {i.recipientEmail ? ` · ${i.recipientEmail}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" icon="copy" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/invite/${i.inviteCode}`).then(() => notify({ title: "Link copied" }))}>
                    Copy link
                  </Button>
                  {i.status === "active" ? (
                    <Button
                      size="sm"
                      variant="danger-ghost"
                      onClick={async () => {
                        await api.revokeInvitation(i._id).catch((e) => notify({ tone: "error", title: e.message }));
                        list.reload();
                      }}
                    >
                      Revoke
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

export default function OrgPortal() {
  return (
    <PortalShell title="Coaching centre" subtitle="Centre admin" nav={NAV}>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="members" element={<Members />} />
        <Route path="invitations" element={<Invitations />} />
        <Route path="audit-log" element={<AuditLog load={api.orgAuditLog} />} />
        <Route path="*" element={<Navigate to="/organization" replace />} />
      </Routes>
    </PortalShell>
  );
}
