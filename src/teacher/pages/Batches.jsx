import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../toast";
import { useDebounced } from "../hooks";
import Icon from "../components/Icon";
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  PageHeader,
  SearchInput,
  Segmented,
  Select,
  SkeletonRows,
  Textarea,
} from "../components/ui";
import useAsync from "../../lib/useAsync";

const cx = (...c) => c.filter(Boolean).join(" ");
const EMPTY = { name: "", classLevel: "HSC", academicYear: String(new Date().getFullYear() + 1), subject: "", description: "" };

function BatchForm({ open, initial, onClose, onSaved }) {
  const [f, setF] = useState(initial || EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const { notify } = useToast();
  useEffect(() => {
    setF(initial || EMPTY);
    setErr("");
  }, [initial, open]);
  const save = async () => {
    if (!f.name.trim()) return setErr("Batch name is required.");
    setBusy(true);
    try {
      const r = initial?._id ? await api.updateBatch(initial._id, f) : await api.createBatch(f);
      notify({ title: initial?._id ? "Batch updated" : "Batch created", description: r.batch.name });
      onSaved(r.batch);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?._id ? "Edit batch" : "New batch"}
      description="Example: HSC 2027 — Science — Batch A"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} onClick={save}>
            {initial?._id ? "Save" : "Create batch"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Batch name" htmlFor="bf-name" required error={err} className="sm:col-span-2">
          <Input id="bf-name" value={f.name} invalid={!!err} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="HSC 2027 — Science — Batch A" />
        </Field>
        <Field label="Class / exam level" htmlFor="bf-class">
          <Select id="bf-class" value={f.classLevel} onChange={(e) => setF({ ...f, classLevel: e.target.value })}>
            {["HSC", "SSC", "Admission", "Class 9", "Class 10", "Other"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
        </Field>
        <Field label="Academic year" htmlFor="bf-year">
          <Input id="bf-year" value={f.academicYear} onChange={(e) => setF({ ...f, academicYear: e.target.value })} />
        </Field>
        <Field label="Subject" htmlFor="bf-subject" className="sm:col-span-2">
          <Input id="bf-subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="ICT, Science…" />
        </Field>
        <Field label="Description" htmlFor="bf-desc" className="sm:col-span-2">
          <Textarea id="bf-desc" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}

function AddStudents({ batch, open, onClose, onAdded }) {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [picked, setPicked] = useState(new Map());
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();
  const res = useAsync((signal) => (open ? api.searchStudents({ q: dq, limit: 50 }, { signal }) : Promise.resolve({ students: [] })), [dq, open]);
  useEffect(() => {
    if (!open) {
      setPicked(new Map());
      setQ("");
    }
  }, [open]);
  const list = res.data?.students || [];
  const toggle = (s) =>
    setPicked((m) => {
      const n = new Map(m);
      if (n.has(s._id)) n.delete(s._id);
      else n.set(s._id, s);
      return n;
    });
  const inBatch = (s) => s.batches?.some((b) => b._id === batch?._id);
  const selectable = list.filter((s) => !inBatch(s));
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Add students to ${batch?.name || ""}`}
      description="Search registered students by name, phone or email. Students already in the batch are skipped."
      footer={
        <>
          <span className="mr-auto self-center text-sm text-examino-muted">{picked.size} selected</span>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!picked.size}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const r = await api.addBatchStudents(batch._id, [...picked.keys()]);
                notify({ title: `Added ${r.added} student${r.added === 1 ? "" : "s"}`, description: r.already ? `${r.already} were already in the batch.` : undefined });
                onAdded();
              } catch (e) {
                notify({ tone: "error", title: "Couldn't add students", description: e.message });
              } finally {
                setBusy(false);
              }
            }}
          >
            Add {picked.size || ""}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search by name, phone or email" autoFocus />
        {selectable.length ? (
          <label className="flex items-center gap-2 text-xs font-semibold text-examino-muted">
            <input
              type="checkbox"
              className="h-4 w-4 accent-examino-blue"
              checked={selectable.every((s) => picked.has(s._id))}
              onChange={(e) =>
                setPicked((m) => {
                  const n = new Map(m);
                  selectable.forEach((s) => (e.target.checked ? n.set(s._id, s) : n.delete(s._id)));
                  return n;
                })
              }
            />
            Select all {selectable.length} shown
          </label>
        ) : null}
        <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-examino-border">
          {res.status === "loading" ? (
            <SkeletonRows rows={4} />
          ) : res.status === "error" ? (
            <ErrorState message={res.error} onRetry={res.reload} />
          ) : !list.length ? (
            <EmptyState icon="users" title="No students found." />
          ) : (
            list.map((s) => {
              const already = inBatch(s);
              return (
                <label key={s._id} className={cx("flex items-center gap-3 border-b border-examino-border px-4 py-2.5 last:border-0", already ? "opacity-60" : "cursor-pointer hover:bg-slate-50")}>
                  <input type="checkbox" disabled={already} checked={already || picked.has(s._id)} onChange={() => toggle(s)} className="h-4 w-4 accent-examino-blue" />
                  <Avatar name={s.name} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.name}</span>
                    <span className="block truncate text-xs text-examino-muted">{[s.phone, s.email].filter(Boolean).join(" · ")}</span>
                  </span>
                  {already ? <Badge tone="green">In batch</Badge> : s.batches?.length ? <Badge tone="neutral">{s.batches.map((b) => b.name).join(", ")}</Badge> : null}
                </label>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}

function BatchDrawer({ batch, batches, open, onClose, onChanged }) {
  const { notify } = useToast();
  const res = useAsync((signal) => (batch ? api.batchStudents(batch._id, { signal }) : Promise.resolve(null)), [batch?._id]);
  const [sel, setSel] = useState(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [moveTo, setMoveTo] = useState("");
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => setSel(new Set()), [batch?._id]);
  if (!batch) return null;
  const students = (res.data?.students || []).filter((s) => !search || `${s.name} ${s.phone} ${s.email}`.toLowerCase().includes(search.toLowerCase()));
  const invite = `${window.location.origin}/batches?code=${batch.code}`;
  const copy = (text, label) => navigator.clipboard.writeText(text).then(() => notify({ title: `${label} copied` })).catch(() => notify({ tone: "error", title: "Couldn't copy" }));
  const refresh = () => {
    res.reload();
    onChanged();
  };

  return (
    <Drawer open={open} onClose={onClose} title={batch.name}>
      <div className="space-y-5">
        <div className="rounded-xl border border-examino-border bg-slate-50 p-4">
          <p className="text-xs font-medium text-examino-muted">Join code</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-2xl font-bold tracking-widest text-examino-navy">{batch.code}</span>
            <Button size="sm" variant="secondary" icon="copy" onClick={() => copy(batch.code, "Code")}>
              Copy code
            </Button>
            <Button size="sm" variant="secondary" icon="link" onClick={() => copy(invite, "Invite link")}>
              Copy invite link
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon="refresh"
              onClick={async () => {
                try {
                  await api.regenerateBatchCode(batch._id);
                  notify({ title: "New code created", description: "The old code no longer works." });
                  onChanged();
                } catch (e) {
                  notify({ tone: "error", title: "Couldn't change the code", description: e.message });
                }
              }}
            >
              New code
            </Button>
          </div>
          <p className="mt-2 text-xs text-examino-muted">Students enter this code under My batches, or open the invite link after signing in.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" icon="plus" onClick={() => setAddOpen(true)} disabled={batch.status === "archived"}>
            Add students
          </Button>
          <SearchInput value={search} onChange={setSearch} placeholder="Filter members" className="min-w-0 flex-1" />
        </div>

        {sel.size ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-examino-blue-light px-3 py-2 text-sm">
            <span className="font-semibold">{sel.size} selected</span>
            <Select aria-label="Move to batch" value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className="h-8 w-auto text-xs">
              <option value="">Move to…</option>
              {batches
                .filter((b) => b._id !== batch._id)
                .map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
            </Select>
            <Button
              size="sm"
              disabled={!moveTo}
              loading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const r = await api.moveBatchStudents(batch._id, [...sel], moveTo);
                  notify({ title: `Moved ${r.moved} student${r.moved === 1 ? "" : "s"}` });
                  setSel(new Set());
                  setMoveTo("");
                  refresh();
                } catch (e) {
                  notify({ tone: "error", title: "Couldn't move students", description: e.message });
                } finally {
                  setBusy(false);
                }
              }}
            >
              Move
            </Button>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-examino-border">
          {res.status === "loading" ? (
            <SkeletonRows rows={4} />
          ) : res.status === "error" ? (
            <ErrorState message={res.error} onRetry={res.reload} />
          ) : !students.length ? (
            <EmptyState icon="users" title={search ? "No members match." : "No students in this batch yet."} description={search ? undefined : "Add registered students or share the join code."} />
          ) : (
            <ul className="divide-y divide-examino-border">
              {students.map((s) => (
                <li key={s._id} className="flex items-center gap-3 px-4 py-2.5">
                  <input
                    type="checkbox"
                    aria-label={`Select ${s.name}`}
                    checked={sel.has(s._id)}
                    onChange={() =>
                      setSel((x) => {
                        const n = new Set(x);
                        if (n.has(s._id)) n.delete(s._id);
                        else n.add(s._id);
                        return n;
                      })
                    }
                    className="h-4 w-4 accent-examino-blue"
                  />
                  <Avatar name={s.name} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.name}</span>
                    <span className="block truncate text-xs text-examino-muted">{[s.phone, s.email].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="hidden text-xs text-examino-muted sm:block">{s.joinedVia === "code" ? "Joined by code" : "Added"}</span>
                  <button type="button" onClick={() => setRemoving(s)} className="rounded p-1.5 text-examino-muted hover:bg-examino-rose-light hover:text-examino-rose-dark" aria-label={`Remove ${s.name}`}>
                    <Icon name="x" size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <AddStudents
        batch={batch}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={() => {
          setAddOpen(false);
          refresh();
        }}
      />
      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove from batch?"
        confirmLabel="Remove"
        busy={busy}
        onCancel={() => setRemoving(null)}
        onConfirm={async () => {
          setBusy(true);
          try {
            await api.removeBatchStudent(batch._id, removing._id);
            notify({ title: `${removing.name} removed from ${batch.name}` });
            setRemoving(null);
            refresh();
          } catch (e) {
            notify({ tone: "error", title: "Couldn't remove", description: e.message });
          } finally {
            setBusy(false);
          }
        }}
      >
        {removing?.name} will stop seeing this batch's exams and notices. Their account and past results are not affected.
      </ConfirmDialog>
    </Drawer>
  );
}

export default function Batches() {
  const [status, setStatus] = useState("active");
  const res = useAsync((signal) => api.batches({ status: status === "archived" ? "archived" : undefined }, { signal }), [status]);
  const [form, setForm] = useState({ open: false, initial: null });
  const [openId, setOpenId] = useState(null);
  const [archiving, setArchiving] = useState(null);
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();
  const batches = res.data?.batches || [];
  const current = batches.find((b) => b._id === openId) || null;
  const total = batches.reduce((a, b) => a + b.studentCount, 0);

  return (
    <>
      <PageHeader
        title="Batches"
        description="Group students into batches, then send exams and notices to the batches you choose."
        actions={
          <Button icon="plus" onClick={() => setForm({ open: true, initial: null })}>
            New batch
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Batch status" value={status} onChange={setStatus} options={[{ value: "active", label: "Active" }, { value: "archived", label: "Archived" }]} />
        {status === "active" && batches.length ? (
          <p className="text-sm text-examino-muted">
            {batches.length} batches · {total} memberships
          </p>
        ) : null}
      </div>
      {res.status === "loading" ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : res.status === "error" ? (
        <Card>
          <ErrorState message={res.error} onRetry={res.reload} />
        </Card>
      ) : !batches.length ? (
        <Card>
          <EmptyState
            icon="layers"
            title={status === "archived" ? "No archived batches." : "No batches yet."}
            description={status === "archived" ? undefined : "Create your first batch, e.g. “HSC 2027 — Science — Batch A”."}
            action={
              status === "active" ? (
                <Button icon="plus" onClick={() => setForm({ open: true, initial: null })}>
                  New batch
                </Button>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {batches.map((b) => (
            <Card key={b._id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-examino-text">{b.name}</p>
                  <p className="text-xs text-examino-muted">{[b.classLevel, b.academicYear, b.subject].filter(Boolean).join(" · ")}</p>
                </div>
                <Badge tone={b.status === "archived" ? "neutral" : "green"}>{b.status === "archived" ? "Archived" : "Active"}</Badge>
              </div>
              {b.description ? <p className="mt-2 line-clamp-2 text-sm text-examino-muted">{b.description}</p> : null}
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-examino-text">
                  <Icon name="users" size={16} className="text-examino-muted" />
                  {b.studentCount} students
                </span>
                <span className="font-mono text-xs text-examino-muted">Code {b.code}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-examino-border pt-4">
                <Button size="sm" onClick={() => setOpenId(b._id)}>
                  Manage students
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setForm({ open: true, initial: b })}>
                  Edit
                </Button>
                {b.status === "archived" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await api.restoreBatch(b._id).catch((e) => notify({ tone: "error", title: e.message }));
                      res.reload();
                    }}
                  >
                    Restore
                  </Button>
                ) : (
                  <Button size="sm" variant="danger-ghost" onClick={() => setArchiving(b)}>
                    Archive
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <BatchForm
        open={form.open}
        initial={form.initial}
        onClose={() => setForm({ open: false, initial: null })}
        onSaved={() => {
          setForm({ open: false, initial: null });
          res.reload();
        }}
      />
      <BatchDrawer batch={current} batches={batches} open={Boolean(current)} onClose={() => setOpenId(null)} onChanged={res.reload} />
      <ConfirmDialog
        open={Boolean(archiving)}
        title="Archive this batch?"
        confirmLabel="Archive"
        busy={busy}
        onCancel={() => setArchiving(null)}
        onConfirm={async () => {
          setBusy(true);
          try {
            await api.archiveBatch(archiving._id);
            notify({ title: `${archiving.name} archived`, description: "You can restore it from the Archived tab." });
            setArchiving(null);
            res.reload();
          } catch (e) {
            notify({ tone: "error", title: "Couldn't archive", description: e.message });
          } finally {
            setBusy(false);
          }
        }}
      >
        Students stay in the batch and keep their results, but you can't add new students or target it until you restore it. The join code stops working.
      </ConfirmDialog>
    </>
  );
}
