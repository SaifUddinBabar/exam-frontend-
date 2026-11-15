import { useState } from "react";
import StudentLayout, { StudentPageHeader } from "./StudentLayout";
import { api } from "../teacher/api";
import useAsync from "../lib/useAsync";
import { Button, Card, CardHeader, EmptyState, ErrorState, Field, Input, Skeleton } from "../teacher/components/ui";
import { useToast } from "../teacher/toast";

export default function StudentBatches() {
  const { status, data, error, reload } = useAsync((signal) => api.myBatches({ signal }), []);
  // Invite links look like /batches?code=ABC123 — prefill the code.
  const [code, setCode] = useState(() => new URLSearchParams(window.location.search).get("code") || "");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const { notify } = useToast();

  const join = async (e) => {
    e.preventDefault();
    setFormError("");
    const c = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,12}$/.test(c)) {
      setFormError("Enter the code your teacher gave you (letters and numbers).");
      return;
    }
    setBusy(true);
    try {
      const r = await api.joinBatch(c);
      notify({ title: r.alreadyMember ? `You're already in ${r.batch.name}` : `Joined ${r.batch.name}` });
      setCode("");
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <StudentLayout maxWidth="max-w-3xl">
      <StudentPageHeader title="My batches" subtitle="Your teacher's exams and notices for a batch reach you once you're in it." />
      <Card className="mb-6">
        <CardHeader title="Join a batch" description="Ask your teacher for the batch code." />
        <form onSubmit={join} className="flex flex-col gap-3 px-5 pb-5 sm:flex-row sm:items-end">
          <Field label="Batch code" htmlFor="batch-code" error={formError} className="flex-1">
            <Input id="batch-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 7F3A9C" autoComplete="off" className="h-10 uppercase tracking-widest" invalid={Boolean(formError)} />
          </Field>
          <Button type="submit" loading={busy}>
            Join batch
          </Button>
        </form>
      </Card>
      {status === "loading" ? (
        <Skeleton className="h-40" />
      ) : status === "error" ? (
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      ) : !data.batches.length ? (
        <Card>
          <EmptyState icon="layers" title="You're not in any batch yet." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.batches.map((b) => (
            <Card key={b._id} className="p-5">
              <p className="font-semibold text-examino-text">{b.name}</p>
              <p className="mt-1 text-sm text-examino-muted">{[b.classLevel, b.academicYear, b.subject].filter(Boolean).join(" · ") || "Batch"}</p>
              {b.teacherName ? <p className="mt-3 text-xs text-examino-muted">Teacher: {b.teacherName}</p> : null}
              {b.description ? <p className="mt-2 text-sm text-slate-700 font-bengali">{b.description}</p> : null}
            </Card>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
