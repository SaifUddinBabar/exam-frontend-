import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTeacherData } from "../teacherData";
import { EMPTY_FILTERS, useQuestionMetadata, useQuestionSearch } from "../hooks";
import { QuestionCard, QuestionFilters } from "../components/questions";
import { Button, Card, EmptyState, ErrorState, LinkButton, Notice, PageHeader, Pagination, SkeletonRows, Toggle } from "../components/ui";
import { readPref, writePref } from "../utils";

const PAGE_SIZE = 12;

export default function QuestionBank() {
  const { userId } = useTeacherData();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const meta = useQuestionMetadata();
  const [filters, setFilters] = useState(() => ({ ...EMPTY_FILTERS, search: params.get("search") || "" }));
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Map());
  const [showAnswers, setShowAnswers] = useState(() => readPref("showAnswers", true));
  const result = useQuestionSearch(filters, page, PAGE_SIZE);

  const toggle = (q) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(q._id)) next.delete(q._id);
      else next.set(q._id, q);
      return next;
    });

  const selectPage = () =>
    setSelected((prev) => {
      const next = new Map(prev);
      const all = result.questions.every((q) => next.has(q._id));
      result.questions.forEach((q) => (all ? next.delete(q._id) : next.set(q._id, q)));
      return next;
    });

  const chosen = [...selected.values()];

  return (
    <>
      <PageHeader
        title="Question Bank"
        description="Browse, filter and reuse questions for exams and printed papers."
        actions={
          <LinkButton to="/teacher/questions/new" icon="plus">
            Create question
          </LinkButton>
        }
      />

      <Card className="p-4 sm:p-5">
        <QuestionFilters
          filters={filters}
          meta={meta}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
        />
      </Card>

      <div className="mb-3 mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-examino-muted">
          {result.status === "ready" ? (
            <>
              <b className="font-semibold text-examino-text">{result.total.toLocaleString("en-IN")}</b> questions
            </>
          ) : (
            "Loading questions…"
          )}
        </p>
        <div className="flex items-center gap-4">
          {result.questions.length ? (
            <Button variant="ghost" size="sm" onClick={selectPage}>
              {result.questions.every((q) => selected.has(q._id)) ? "Unselect page" : "Select page"}
            </Button>
          ) : null}
          <div className="w-44">
            <Toggle
              label="Show answers"
              checked={showAnswers}
              onChange={(v) => {
                setShowAnswers(v);
                writePref("showAnswers", v);
              }}
            />
          </div>
        </div>
      </div>

      {result.status === "error" ? (
        <Card>
          <ErrorState title="Couldn't load questions" message={result.error} onRetry={result.reload} />
        </Card>
      ) : result.status === "loading" ? (
        <Card>
          <SkeletonRows rows={5} />
        </Card>
      ) : !result.questions.length ? (
        <Card>
          <EmptyState
            icon="database"
            title="No questions match these filters"
            description="Clear a filter, or add the question yourself."
            action={<LinkButton to="/teacher/questions/new" size="sm" icon="plus">Create question</LinkButton>}
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {result.questions.map((q, i) => (
            <QuestionCard key={q._id} q={q} index={(page - 1) * PAGE_SIZE + i + 1} selected={selected.has(q._id)} onToggle={toggle} showAnswer={showAnswers} mine={userId && q.tutorId === userId} />
          ))}
          <Card>
            <Pagination page={page} totalPages={result.totalPages} onChange={setPage} summary={`Page ${page} of ${result.totalPages}`} />
          </Card>
        </div>
      )}

      <Notice tone="neutral" className="mt-5">
        All questions use the current schema: single-answer MCQ with four options. Editing, deleting and multiple-correct questions need update/delete endpoints that the API doesn't have yet.
      </Notice>

      {chosen.length ? (
        <div className="sticky bottom-4 z-30 mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-examino-navy px-4 py-3 text-white shadow-dropdown">
          <p className="flex-1 text-sm">
            <b className="font-semibold">{chosen.length}</b> question{chosen.length === 1 ? "" : "s"} selected
          </p>
          <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setSelected(new Map())}>
            Clear
          </Button>
          <Button variant="secondary" size="sm" icon="file" onClick={() => navigate("/teacher/paper-builder", { state: { questions: chosen } })}>
            Question paper
          </Button>
          <Button size="sm" icon="clipboard" onClick={() => navigate("/teacher/exams/new", { state: { questions: chosen } })}>
            Create exam
          </Button>
        </div>
      ) : null}
    </>
  );
}
