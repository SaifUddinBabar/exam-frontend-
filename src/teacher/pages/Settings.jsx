import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeacherData } from "../teacherData";
import { useToast } from "../toast";
import { Avatar, Button, Card, CardHeader, ConfirmDialog, Field, Input, Notice, PageHeader, Toggle } from "../components/ui";
import { fmtDate, readPref, writePref } from "../utils";

export default function Settings() {
  const { user } = useTeacherData();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [passMark, setPassMark] = useState(() => readPref("passMark", 33));
  const [showAnswers, setShowAnswers] = useState(() => readPref("showAnswers", true));
  const [collapsed, setCollapsed] = useState(() => readPref("sidebarCollapsed", false));
  const [confirmOut, setConfirmOut] = useState(false);

  const savePrefs = () => {
    const pm = Math.min(100, Math.max(0, Number(passMark) || 0));
    writePref("passMark", pm);
    writePref("showAnswers", showAnswers);
    writePref("sidebarCollapsed", collapsed);
    setPassMark(pm);
    notify({ title: "Preferences saved", description: "Stored in this browser. Sidebar changes apply on next load." });
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <PageHeader title="Settings" description="Your account and dashboard preferences." />
      <div className="grid max-w-4xl grid-cols-1 gap-6">
        <Card>
          <CardHeader title="Profile" description="From your Examino account" />
          <div className="p-5">
            <div className="flex items-center gap-4">
              <Avatar name={user.name || "Teacher"} size={56} />
              <div>
                <p className="text-base font-semibold">{user.name || "—"}</p>
                <p className="text-sm text-examino-muted">{user.email || "—"}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Field label="Name" htmlFor="st-name">
                <Input id="st-name" value={user.name || ""} readOnly disabled />
              </Field>
              <Field label="Role" htmlFor="st-role">
                <Input id="st-role" value={user.globalRole === "super_admin" ? "Super admin" : user.role === "org_admin" ? "Organisation admin" : "Teacher"} readOnly disabled />
              </Field>
              <Field label="Member since" htmlFor="st-since">
                <Input id="st-since" value={user.createdAt ? fmtDate(user.createdAt) : "—"} readOnly disabled />
              </Field>
            </div>
            <Notice tone="neutral" className="mt-4">
              Changing your name, email or password needs a profile-update endpoint that the API doesn't have yet.
            </Notice>
          </div>
        </Card>

        <Card>
          <CardHeader title="Dashboard preferences" description="Saved in this browser only" />
          <div className="flex flex-col gap-5 p-5">
            <Field label="Default pass mark (%)" htmlFor="st-pass" hint="Used for pass rates in Results & Analytics. SSC/HSC use 33%.">
              <Input id="st-pass" type="number" min={0} max={100} value={passMark} onChange={(e) => setPassMark(e.target.value)} className="w-28" />
            </Field>
            <Toggle label="Show answers in the question bank" description="Highlight the correct option and allow explanations" checked={showAnswers} onChange={setShowAnswers} />
            <Toggle label="Start with a collapsed sidebar" description="Icons only on desktop" checked={collapsed} onChange={setCollapsed} />
            <div>
              <Button onClick={savePrefs}>Save preferences</Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Session" />
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-examino-muted">Sign out of Examino on this device.</p>
            <Button variant="danger-ghost" icon="logout" onClick={() => setConfirmOut(true)}>
              Sign out
            </Button>
          </div>
        </Card>
      </div>
      <ConfirmDialog open={confirmOut} title="Sign out?" confirmLabel="Sign out" onCancel={() => setConfirmOut(false)} onConfirm={signOut}>
        You'll need your email and password to sign back in.
      </ConfirmDialog>
    </>
  );
}
