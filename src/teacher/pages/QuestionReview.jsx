import { useState } from "react";
import { api } from "../api";
import { useToast } from "../toast";
import useAsync from "../../lib/useAsync";
import MathText from "../../components/MathText";
import QuestionImage from "../../components/QuestionImage";
import { Badge, Button, Card, EmptyState, ErrorState, Notice, Pagination, Segmented, Select, SkeletonRows } from "../components/ui";

const cx = (...c) => c.filter(Boolean).join(" ");
const LETTERS = ["ক", "খ", "গ", "ঘ"];

// Teacher review queue. Read-only listing; every change is a normal, revisioned question
// edit made by the teacher (nothing is applied automatically).
export default function QuestionReview({ onEditQuestion }) {
  const { notify } = useToast();
  const [kind, setKind] = useState("uncategorised");
  const [chapter, setChapter] = useState("");
  const [page, setPage] = useState(1);
  const q = useAsync((signal) => request({ kind, chapter, page }, signal), [kind, chapter, page]);

  const counts = q.data?.counts || {};
  const totalOf = (k) => Object.values(counts).reduce((a, c) => a + (c[k] || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <Notice tone="info" title="Nothing here changes on its own">
        Suggestions come from the syllabus keywords. A question changes only when you pick a topic or chapter below — the original is kept in its revision history. Questions you report go to the Reports panel.
      </Notice>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-full overflow-x-auto" title="Battle issues: questions that need a missing passage or figure, or have duplicate options — battles and the tournament skip them">
        <Segmented
          label="Review list"
          value={kind}
          onChange={(v) => {
            setKind(v);
            setPage(1);
          }}
          options={[
            { value: "uncategorised", label: `No topic (${q.data ? totalOf("uncategorised") : "…"})` },
            { value: "unplayable", label: `Battle issues (${q.data ? totalOf("unplayable") : "…"})` },
          ]}
        />
        </div>
        <Select
          aria-label="Chapter"
          value={chapter}
          onChange={(e) => {
            setChapter(e.target.value);
            setPage(1);
          }}
          className="sm:w-72"
        >
          <option value="">All chapters</option>
          {(q.data?.chapters || []).map((c) => (
            <option key={c.chapterId} value={c.chapterId}>
              {c.chapterName} ({counts[c.chapterId]?.[kind] ?? 0})
            </option>
          ))}
        </Select>
      </div>

      {q.status === "loading" && !q.data ? (
        <Card className="p-5">
          <SkeletonRows rows={4} />
        </Card>
      ) : q.status === "error" ? (
        <Card>
          <ErrorState message={q.error} onRetry={q.reload} />
        </Card>
      ) : !q.data.items.length ? (
        <Card>
          <EmptyState icon="check" title={kind === "uncategorised" ? "Every question here has a topic." : "No questions need attention for battles."} />
        </Card>
      ) : (
        <>
          <p className="text-sm text-examino-muted">
            {q.data.total} question{q.data.total === 1 ? "" : "s"} · page {q.data.page} of {q.data.totalPages}
          </p>
          {q.data.items.map((item) => (
            <ReviewCard key={item._id} item={item} chapters={q.data.chapters} kind={kind} onEdit={onEditQuestion} onDone={q.reload} notify={notify} />
          ))}
          <Pagination page={q.data.page} totalPages={q.data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

function request({ kind, chapter, page }, signal) {
  const p = new URLSearchParams({ kind, page: String(page), limit: "10" });
  if (chapter) p.set("chapter", chapter);
  return api.reviewQueue(p.toString(), { signal });
}

function ReviewCard({ item, chapters, kind, onEdit, onDone, notify }) {
  const own = chapters.find((c) => c.chapterId === item.resolved.chapterId);
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState("");

  const save = async (fields, label) => {
    setBusy(label);
    try {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      await api.updateQuestion(item._id, fd);
      notify({ title: "Saved", description: label });
      onDone();
    } catch (e) {
      notify({ tone: "error", title: "Couldn't save", description: e.message });
    } finally {
      setBusy("");
    }
  };
  const report = async () => {
    setBusy("report");
    try {
      await api.reportQuestion(item._id, { reason: "wrong_subject", note: `From the review queue (${kind}).` });
      notify({ title: "Reported", description: "It now appears in the Reports panel." });
      onDone();
    } catch (e) {
      notify({ tone: "error", title: "Couldn't report", description: e.message });
    } finally {
      setBusy("");
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
        <Badge tone="neutral">{own?.shortName || own?.chapterName || item.chapter}</Badge>
        {item.topic ? <span className="text-examino-muted">stored topic: “{item.topic}”</span> : <span className="text-examino-muted">no stored topic</span>}
        {item.issues.map((i) => (
          <Badge key={i.code} tone="amber">
            {i.label}
          </Badge>
        ))}
        {item.hasOpenReport ? <Badge tone="blue">Reported</Badge> : null}
      </div>
      <p className="font-bengali text-[15px] font-medium leading-relaxed text-examino-text">
        <MathText text={item.question} />
      </p>
      <QuestionImage q={item} className="mt-2" />
      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {(item.options || []).map((o, i) => (
          <li key={i} className={cx("flex gap-2 rounded-lg border px-3 py-1.5 text-sm font-bengali", o === item.correctAnswer ? "border-examino-green/40 bg-examino-green-light text-examino-text" : "border-examino-border text-examino-muted")}>
            <span className="font-semibold">{LETTERS[i]}</span>
            <MathText text={o} />
          </li>
        ))}
      </ul>

      {item.hints.length ? (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-examino-muted">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {item.hints.map((h) => {
              const move = h.chapterId !== item.resolved.chapterId;
              const label = move ? `Move to ${chapters.find((c) => c.chapterId === h.chapterId)?.shortName || h.chapterName} · ${h.topic}` : h.topic;
              return (
                <Button key={h.chapterId + h.topic} size="sm" variant="secondary" className="h-auto min-h-8 max-w-full whitespace-normal py-1.5 text-left" loading={busy === label} disabled={Boolean(busy)} onClick={() => save(move ? { chapter: h.chapterName, topic: h.topic } : { topic: h.topic }, label)}>
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 border-t border-examino-border pt-3 sm:flex-row sm:items-center">
        <Select aria-label="Choose a topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="sm:w-72">
          <option value="">Choose a topic in this chapter…</option>
          {(own?.topics || []).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Button size="sm" disabled={!topic || Boolean(busy)} loading={busy === topic} onClick={() => save({ topic }, topic)}>
          Set topic
        </Button>
        <div className="flex gap-2 sm:ml-auto">
          {onEdit ? (
            <Button size="sm" variant="ghost" icon="edit" onClick={() => onEdit(item)}>
              Edit
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" icon="flag" loading={busy === "report"} disabled={Boolean(busy) || item.hasOpenReport} onClick={report}>
            Not ICT / wrong subject
          </Button>
        </div>
      </div>
    </Card>
  );
}
