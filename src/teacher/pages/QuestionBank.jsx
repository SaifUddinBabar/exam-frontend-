import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QuestionPicker } from "../components/questions";
import CreateQuestion from "./CreateQuestion";
import PaperBuilder from "./PaperBuilder";
import { useTeacherData } from "../teacherData";
import { api } from "../api";
import { useToast } from "../toast";
import { Badge, Button, Drawer, EmptyState, ErrorState, PageHeader, SkeletonRows, Tabs } from "../components/ui";
import useAsync from "../../lib/useAsync";
import { fmtDateTime } from "../utils";

const REASON = {
  wrong_answer: "Wrong correct answer",
  typo: "Typo / formatting",
  wrong_subject: "Wrong subject / chapter",
  wrong_topic: "Wrong topic",
  image_missing: "Image missing / wrong",
  duplicate: "Duplicate",
  language: "Language mixed",
  other: "Other",
};

function ReportsDrawer({ open, onClose }) {
  const res = useAsync((signal) => (open ? api.questionReports("open", { signal }) : Promise.resolve({ reports: [] })), [open]);
  const { notify } = useToast();
  const act = async (r, status) => {
    try {
      await api.resolveReport(r._id, status);
      notify({ title: status === "resolved" ? "Marked as fixed" : "Report dismissed" });
      res.reload();
    } catch (e) {
      notify({ tone: "error", title: "Couldn't update", description: e.message });
    }
  };
  return (
    <Drawer open={open} onClose={onClose} title="Question reports">
      {res.status === "loading" ? (
        <SkeletonRows rows={3} />
      ) : res.status === "error" ? (
        <ErrorState message={res.error} onRetry={res.reload} />
      ) : !res.data.reports.length ? (
        <EmptyState icon="check" title="No open reports." />
      ) : (
        <ul className="space-y-3">
          {res.data.reports.map((r) => (
            <li key={r._id} className="rounded-xl border border-examino-border p-3">
              <div className="mb-1 flex items-center gap-2">
                <Badge tone="amber">{REASON[r.reason] || r.reason}</Badge>
                <span className="text-xs text-examino-muted">{fmtDateTime(r.createdAt)}</span>
              </div>
              <p className="line-clamp-2 text-sm font-medium text-examino-text font-bengali">{r.questionId?.question}</p>
              <p className="text-xs text-examino-muted font-bengali">{[r.questionId?.chapter, r.questionId?.topic].filter(Boolean).join(" › ")}</p>
              {r.note ? <p className="mt-1 text-sm text-slate-700">“{r.note}”</p> : null}
              <p className="mt-1 text-xs text-examino-muted">By {r.reportedBy?.name || "user"}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => act(r, "resolved")}>
                  Mark fixed
                </Button>
                <Button size="sm" variant="ghost" onClick={() => act(r, "dismissed")}>
                  Dismiss
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}

export default function QuestionBank() {
  const { userId } = useTeacherData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "browse";
  const [selected, setSelected] = useState(() => new Map());
  const [editing, setEditing] = useState(null);
  const [reportsOpen, setReportsOpen] = useState(false);
  const chosen = [...selected.values()];

  const switchTab = (t) => {
    if (t !== "create") setEditing(null);
    setSearchParams({ tab: t });
  };
  const toggle = (q) =>
    setSelected((prev) => {
      const m = new Map(prev);
      if (m.has(q._id)) m.delete(q._id);
      else m.set(q._id, q);
      return m;
    });
  const selectPage = (qs, add) =>
    setSelected((prev) => {
      const m = new Map(prev);
      qs.forEach((q) => (add ? m.set(q._id, q) : m.delete(q._id)));
      return m;
    });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Question Bank"
        description="Browse and filter questions, create or edit questions, and build printable papers — all in one place."
        actions={
          <Button variant="secondary" icon="flag" onClick={() => setReportsOpen(true)}>
            Reports
          </Button>
        }
      />
      <Tabs
        label="Question bank sections"
        value={tab}
        onChange={switchTab}
        tabs={[
          { value: "browse", label: "Browse questions" },
          { value: "create", label: editing ? "Edit question" : "Create question" },
          { value: "builder", label: "PDF / Print builder", count: chosen.length || undefined },
        ]}
      />

      {tab === "browse" ? (
        <>
          <QuestionPicker
            selected={selected}
            onToggle={toggle}
            onSelectPage={selectPage}
            userId={userId}
            limit={12}
            examTitle="Browse questions"
            onEditQuestion={(q) => {
              setEditing(q);
              setSearchParams({ tab: "create" });
            }}
          />
          {chosen.length ? (
            <div className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-examino-navy p-4 text-white shadow-dropdown">
              <p className="text-sm font-semibold">{chosen.length} questions selected</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" className="!text-slate-300 hover:!bg-white/10" onClick={() => setSelected(new Map())}>
                  Clear
                </Button>
                <Button size="sm" variant="secondary" icon="file" onClick={() => switchTab("builder")}>
                  Build paper
                </Button>
                <Button size="sm" icon="clipboard" onClick={() => navigate("/teacher/exams/new", { state: { questions: chosen } })}>
                  Create online exam
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {tab === "create" ? (
        <CreateQuestion
          embedded
          editQuestion={editing}
          onCancelEdit={() => {
            setEditing(null);
            switchTab("browse");
          }}
          onSuccess={() => {
            setEditing(null);
            switchTab("browse");
          }}
        />
      ) : null}

      {tab === "builder" ? <PaperBuilder embedded preloadedQuestions={chosen} /> : null}

      <ReportsDrawer open={reportsOpen} onClose={() => setReportsOpen(false)} />
    </div>
  );
}
