import { useEffect, useState } from "react";
import { api } from "../api";
import { useDebounced } from "../hooks";
import { Badge, SearchInput, Segmented, Spinner } from "./ui";
import Icon from "./Icon";

const cx = (...c) => c.filter(Boolean).join(" ");

// value: { mode: "all" | "batches" | "students", batchIds: string[], students: [{_id, name}] }
export const EMPTY_AUDIENCE = { mode: "all", batchIds: [], students: [] };

export function audienceError(a) {
  if (a.mode === "batches" && !a.batchIds.length) return "Select at least one batch.";
  if (a.mode === "students" && !a.students.length) return "Select at least one student.";
  return null;
}

export function audienceSummary(a, batches = []) {
  if (a.mode === "all") return "All students";
  if (a.mode === "batches") return a.batchIds.map((id) => batches.find((b) => b._id === id)?.name || "Batch").join(", ");
  return `${a.students.length} selected student${a.students.length === 1 ? "" : "s"}`;
}

export default function AudiencePicker({ value, onChange, allLabel = "All students" }) {
  const [batches, setBatches] = useState({ status: "loading", list: [] });
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [results, setResults] = useState({ status: "idle", list: [] });

  useEffect(() => {
    const ctrl = new AbortController();
    api
      .batches({}, { signal: ctrl.signal })
      .then((r) => setBatches({ status: "ready", list: r.batches || [] }))
      .catch((e) => e.name !== "AbortError" && setBatches({ status: "error", list: [] }));
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    if (value.mode !== "students") return undefined;
    const ctrl = new AbortController();
    setResults((r) => ({ ...r, status: "loading" }));
    api
      .searchStudents({ q: dq, limit: 20 }, { signal: ctrl.signal })
      .then((r) => setResults({ status: "ready", list: r.students || [] }))
      .catch((e) => e.name !== "AbortError" && setResults({ status: "error", list: [] }));
    return () => ctrl.abort();
  }, [dq, value.mode]);

  const toggleBatch = (id) => onChange({ ...value, batchIds: value.batchIds.includes(id) ? value.batchIds.filter((x) => x !== id) : [...value.batchIds, id] });
  const toggleStudent = (s) =>
    onChange({ ...value, students: value.students.some((x) => x._id === s._id) ? value.students.filter((x) => x._id !== s._id) : [...value.students, { _id: s._id, name: s.name }] });

  return (
    <div className="space-y-3">
      <Segmented
        label="Audience"
        value={value.mode}
        onChange={(mode) => onChange({ ...value, mode })}
        options={[
          { value: "all", label: allLabel },
          { value: "batches", label: "Batches" },
          { value: "students", label: "Individual students" },
        ]}
      />

      {value.mode === "batches" ? (
        batches.status === "loading" ? (
          <Spinner className="text-examino-blue" />
        ) : !batches.list.length ? (
          <p className="text-sm text-examino-muted">
            You have no batches yet. Create one in <a href="/teacher/batches" className="font-semibold text-examino-blue hover:underline">Batches</a>.
          </p>
        ) : (
          <div className="grid max-h-60 gap-2 overflow-y-auto sm:grid-cols-2">
            {batches.list.map((b) => {
              const on = value.batchIds.includes(b._id);
              return (
                <label key={b._id} className={cx("flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm", on ? "border-examino-blue bg-examino-blue-light" : "border-examino-border hover:bg-slate-50")}>
                  <input type="checkbox" checked={on} onChange={() => toggleBatch(b._id)} className="h-4 w-4 accent-examino-blue" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{b.name}</span>
                    <span className="text-xs text-examino-muted">{b.studentCount} students</span>
                  </span>
                </label>
              );
            })}
          </div>
        )
      ) : null}

      {value.mode === "students" ? (
        <div className="space-y-2">
          {value.students.length ? (
            <div className="flex flex-wrap gap-1.5">
              {value.students.map((s) => (
                <button key={s._id} type="button" onClick={() => toggleStudent(s)} className="inline-flex items-center gap-1 rounded-full bg-examino-blue-light px-2.5 py-1 text-xs font-semibold text-examino-blue-hover hover:bg-blue-100">
                  {s.name}
                  <Icon name="x" size={12} />
                </button>
              ))}
            </div>
          ) : null}
          <SearchInput value={q} onChange={setQ} placeholder="Search students by name, phone or email" />
          <div className="max-h-56 overflow-y-auto rounded-lg border border-examino-border">
            {results.status === "loading" ? (
              <div className="p-3">
                <Spinner className="text-examino-blue" />
              </div>
            ) : !results.list.length ? (
              <p className="p-3 text-sm text-examino-muted">No students found.</p>
            ) : (
              results.list.map((s) => {
                const on = value.students.some((x) => x._id === s._id);
                return (
                  <label key={s._id} className="flex cursor-pointer items-center gap-3 border-b border-examino-border px-3 py-2 text-sm last:border-0 hover:bg-slate-50">
                    <input type="checkbox" checked={on} onChange={() => toggleStudent(s)} className="h-4 w-4 accent-examino-blue" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{s.name}</span>
                      <span className="text-xs text-examino-muted">{s.phone || s.email}</span>
                    </span>
                    {s.batches?.length ? <Badge tone="neutral">{s.batches.length} batch{s.batches.length > 1 ? "es" : ""}</Badge> : null}
                  </label>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function useBatchesList() {
  const [list, setList] = useState([]);
  useEffect(() => {
    api.batches({}).then((r) => setList(r.batches || [])).catch(() => {});
  }, []);
  return list;
}
