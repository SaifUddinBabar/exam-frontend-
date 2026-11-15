import { useState } from "react";
import { api, imageUrl } from "../api";
import { useToast } from "../toast";
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Select, SkeletonRows, Textarea } from "../components/ui";
import AudiencePicker, { EMPTY_AUDIENCE, audienceError } from "../components/AudiencePicker";
import Icon from "../components/Icon";
import useAsync from "../../lib/useAsync";
import { fmtDateTime } from "../utils";

const EMPTY = { title: "", body: "", priority: "normal", publishAt: "", expiresAt: "" };

function Compose({ open, onClose, onSent }) {
  const [f, setF] = useState(EMPTY);
  const [audience, setAudience] = useState(EMPTY_AUDIENCE);
  const [file, setFile] = useState(null);
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();

  const send = async () => {
    const e = {};
    if (!f.title.trim()) e.title = "Title is required.";
    const a = audienceError(audience);
    if (a) e.audience = a;
    if (f.expiresAt && new Date(f.expiresAt) <= new Date(f.publishAt || Date.now())) e.expiresAt = "Expiry must be after publishing.";
    if (file && file.size > 10 * 1024 * 1024) e.file = "Attachment must be 10 MB or smaller.";
    setErr(e);
    if (Object.keys(e).length) return;
    const fd = new FormData();
    fd.append("title", f.title.trim());
    fd.append("body", f.body.trim());
    fd.append("priority", f.priority);
    if (f.publishAt) fd.append("publishAt", new Date(f.publishAt).toISOString());
    if (f.expiresAt) fd.append("expiresAt", new Date(f.expiresAt).toISOString());
    fd.append("audienceAll", audience.mode === "all" ? "true" : "false");
    if (audience.mode === "batches") fd.append("batchIds", JSON.stringify(audience.batchIds));
    if (audience.mode === "students") fd.append("studentIds", JSON.stringify(audience.students.map((s) => s._id)));
    if (file) fd.append("attachment", file);
    setBusy(true);
    try {
      await api.createNotice(fd);
      notify({ title: f.publishAt && new Date(f.publishAt) > new Date() ? "Notice scheduled" : "Notice published" });
      setF(EMPTY);
      setAudience(EMPTY_AUDIENCE);
      setFile(null);
      onSent();
    } catch (e2) {
      notify({ tone: "error", title: "Couldn't publish", description: e2.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="New notice"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} icon="megaphone" onClick={send}>
            Publish
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="n-title" required error={err.title} className="sm:col-span-2">
          <Input id="n-title" value={f.title} invalid={!!err.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Class moved to Sunday 5 PM" />
        </Field>
        <Field label="Details" htmlFor="n-body" className="sm:col-span-2">
          <Textarea id="n-body" rows={5} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        </Field>
        <Field label="Priority" htmlFor="n-pri">
          <Select id="n-pri" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </Select>
        </Field>
        <Field label="Attachment" htmlFor="n-file" hint="Image or PDF, up to 10 MB" error={err.file}>
          <input id="n-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold" />
        </Field>
        <Field label="Publish at" htmlFor="n-pub" hint="Leave empty to publish now">
          <Input id="n-pub" type="datetime-local" value={f.publishAt} onChange={(e) => setF({ ...f, publishAt: e.target.value })} />
        </Field>
        <Field label="Expires" htmlFor="n-exp" hint="Optional — hidden after this" error={err.expiresAt}>
          <Input id="n-exp" type="datetime-local" value={f.expiresAt} onChange={(e) => setF({ ...f, expiresAt: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <p className="mb-2 text-[13px] font-medium text-examino-text">Send to</p>
          <AudiencePicker value={audience} onChange={setAudience} />
          {err.audience ? <p className="mt-2 text-xs font-medium text-examino-rose-dark">{err.audience}</p> : null}
        </div>
      </div>
    </Modal>
  );
}

export default function Notices() {
  const res = useAsync((signal) => api.manageNotices({ signal }), []);
  const [compose, setCompose] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();
  const list = res.data?.notices || [];
  const now = Date.now();

  return (
    <>
      <PageHeader
        title="Notices"
        description="Announcements for all students, chosen batches or individual students. Only the chosen audience can see a notice."
        actions={
          <Button icon="plus" onClick={() => setCompose(true)}>
            New notice
          </Button>
        }
      />
      <Card>
        {res.status === "loading" ? (
          <SkeletonRows rows={4} />
        ) : res.status === "error" ? (
          <ErrorState message={res.error} onRetry={res.reload} />
        ) : !list.length ? (
          <EmptyState icon="megaphone" title="No notices yet." action={<Button icon="plus" onClick={() => setCompose(true)}>New notice</Button>} />
        ) : (
          <ul className="divide-y divide-examino-border">
            {list.map((n) => {
              const scheduled = new Date(n.publishAt).getTime() > now;
              const expired = n.expiresAt && new Date(n.expiresAt).getTime() < now;
              return (
                <li key={n._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-examino-text font-bengali">{n.title}</p>
                      {n.priority !== "normal" ? <Badge tone={n.priority === "urgent" ? "red" : "amber"}>{n.priority}</Badge> : null}
                      {scheduled ? <Badge tone="blue">Scheduled</Badge> : expired ? <Badge tone="neutral">Expired</Badge> : <Badge tone="green">Live</Badge>}
                    </div>
                    {n.body ? <p className="mt-1 line-clamp-2 text-sm text-examino-muted font-bengali">{n.body}</p> : null}
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-examino-muted">
                      <span>{scheduled ? "Publishes" : "Published"} {fmtDateTime(n.publishAt)}</span>
                      {n.expiresAt ? <span>Expires {fmtDateTime(n.expiresAt)}</span> : null}
                      <span>
                        To:{" "}
                        {n.audience.all
                          ? "All students"
                          : [...(n.audience.batchIds || []).map((b) => b.name || "Batch"), n.audience.studentIds?.length ? `${n.audience.studentIds.length} student(s)` : null].filter(Boolean).join(", ")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="eye" size={13} /> Read by {n.readCount}
                      </span>
                      {n.attachmentUrl ? (
                        <a href={imageUrl(n.attachmentUrl)} target="_blank" rel="noopener noreferrer" className="font-semibold text-examino-blue hover:underline">
                          {n.attachmentName || "Attachment"}
                        </a>
                      ) : null}
                    </p>
                  </div>
                  <Button size="sm" variant="danger-ghost" icon="trash" onClick={() => setRemoving(n)}>
                    Remove
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <Compose
        open={compose}
        onClose={() => setCompose(false)}
        onSent={() => {
          setCompose(false);
          res.reload();
        }}
      />
      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove this notice?"
        confirmLabel="Remove"
        busy={busy}
        onCancel={() => setRemoving(null)}
        onConfirm={async () => {
          setBusy(true);
          try {
            await api.archiveNotice(removing._id);
            notify({ title: "Notice removed" });
            setRemoving(null);
            res.reload();
          } catch (e) {
            notify({ tone: "error", title: "Couldn't remove", description: e.message });
          } finally {
            setBusy(false);
          }
        }}
      >
        Students will no longer see “{removing?.title}”. It is archived, not permanently deleted.
      </ConfirmDialog>
    </>
  );
}
