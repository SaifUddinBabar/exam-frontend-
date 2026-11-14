import { useState } from "react";
import MathText from "../../components/MathText";
import { imageUrl } from "../api";
import { EMPTY_FILTERS, useQuestionMetadata, useQuestionSearch } from "../hooks";
import { Badge, Button, EmptyState, ErrorState, Pagination, SearchInput, Select, SkeletonRows } from "./ui";
import Icon from "./Icon";
import { BN_OPTION_LETTERS } from "../utils";

const cx = (...c) => c.filter(Boolean).join(" ");
const DIFF_TONE = { easy: "green", medium: "amber", hard: "red" };

export function QuestionFilters({ filters, onChange, meta, compact }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const subject = meta.subjects.find((s) => s.name === filters.subject);
  const chapter = subject?.chapters.find((c) => c.name === filters.chapter);
  const active = Object.entries(filters).some(([k, v]) => k !== "search" && v);

  return (
    <div className="flex flex-col gap-3">
      <SearchInput value={filters.search} onChange={(v) => set({ search: v })} placeholder="Search question text" label="Search questions" />
      <div className={cx("grid gap-2", compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-6")}>
        <Select aria-label="Subject" value={filters.subject} onChange={(e) => set({ subject: e.target.value, chapter: "", topic: "" })}>
          <option value="">All subjects</option>
          {meta.subjects.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} ({s.totalQuestions})
            </option>
          ))}
        </Select>
        <Select aria-label="Chapter" value={filters.chapter} onChange={(e) => set({ chapter: e.target.value, topic: "" })} disabled={!subject}>
          <option value="">{subject ? "All chapters" : "Chapter (pick subject)"}</option>
          {subject?.chapters.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.questionCount})
            </option>
          ))}
        </Select>
        <Select aria-label="Topic" value={filters.topic} onChange={(e) => set({ topic: e.target.value })} disabled={!chapter || !chapter.topics.length}>
          <option value="">{chapter ? "All topics" : "Topic (pick chapter)"}</option>
          {chapter?.topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select aria-label="Difficulty" value={filters.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
          <option value="">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
        <Select aria-label="Board" value={filters.boardName} onChange={(e) => set({ boardName: e.target.value })}>
          <option value="">All boards</option>
          {meta.boards.map((b) => (
            <option key={b} value={b}>
              {b} board
            </option>
          ))}
        </Select>
        <Select aria-label="Board year" value={filters.boardYear} onChange={(e) => set({ boardYear: e.target.value })}>
          <option value="">Any year</option>
          {meta.boardYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>
      {active ? (
        <button type="button" className="self-start text-xs font-semibold text-examino-blue hover:underline" onClick={() => onChange({ ...EMPTY_FILTERS, search: filters.search })}>
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

export function QuestionCard({ q, index, selected, onToggle, showAnswer, mine }) {
  const [openExplanation, setOpenExplanation] = useState(false);
  return (
    <article className={cx("rounded-xl border bg-white p-4 transition-colors sm:p-5", selected ? "border-examino-blue ring-1 ring-examino-blue" : "border-examino-border")}>
      <div className="flex items-start gap-3">
        {onToggle ? (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggle(q)}
            aria-label={`Select question ${index ?? ""}`}
            className="mt-1 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-slate-300 accent-examino-blue"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-examino-muted">
            <span className="font-medium text-slate-600">{q.subject}</span>
            <span aria-hidden="true">·</span>
            <span>{q.chapter}</span>
            {q.topic ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="max-w-[260px] truncate">{q.topic}</span>
              </>
            ) : null}
            <span className="ml-auto flex flex-wrap gap-1.5">
              {q.questionType === "board" && q.boardName ? (
                <Badge tone="indigo">
                  {q.boardName} {q.boardYear}
                </Badge>
              ) : null}
              <Badge tone={DIFF_TONE[q.difficulty] || "neutral"}>{q.difficulty ? q.difficulty[0].toUpperCase() + q.difficulty.slice(1) : "—"}</Badge>
              {mine ? <Badge tone="blue">Yours</Badge> : null}
            </span>
          </div>
          <p className="mt-2 text-[15px] font-medium leading-relaxed text-examino-text">
            {index ? <span className="mr-1 text-examino-muted">{index}.</span> : null}
            <MathText text={q.question} />
          </p>
          {q.image ? <img src={imageUrl(q.image)} alt="Question figure" loading="lazy" className="mt-3 max-h-48 rounded-lg border border-examino-border object-contain" /> : null}
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {(q.options || []).map((opt, i) => {
              const correct = showAnswer && opt === q.correctAnswer;
              return (
                <li
                  key={i}
                  className={cx(
                    "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                    correct ? "border-emerald-300 bg-examino-green-light" : "border-examino-border"
                  )}
                >
                  <span className={cx("font-semibold", correct ? "text-emerald-700" : "text-examino-muted")}>{BN_OPTION_LETTERS[i]}.</span>
                  <span className="min-w-0 flex-1">
                    <MathText text={opt} />
                  </span>
                  {correct ? <Icon name="check" size={16} className="text-emerald-700" title="Correct answer" /> : null}
                </li>
              );
            })}
          </ol>
          {showAnswer && q.explanation ? (
            <div className="mt-3">
              <button type="button" className="text-xs font-semibold text-examino-blue hover:underline" aria-expanded={openExplanation} onClick={() => setOpenExplanation((o) => !o)}>
                {openExplanation ? "Hide explanation" : "Show explanation"}
              </button>
              {openExplanation ? (
                <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-700">
                  <MathText text={q.explanation} />
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Inline question browser with selection. `selected` is a Map<id, question>. */
export function QuestionPicker({ selected, onToggle, onSelectPage, userId, limit = 10 }) {
  const meta = useQuestionMetadata();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const result = useQuestionSearch(filters, page, limit);

  const allOnPage = result.questions.length > 0 && result.questions.every((q) => selected.has(q._id));

  return (
    <div className="flex flex-col gap-4">
      <QuestionFilters
        filters={filters}
        meta={meta}
        compact
        onChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />
      <div className="flex items-center justify-between text-xs text-examino-muted">
        <span>{result.status === "ready" ? `${result.total.toLocaleString("en-IN")} questions match` : "Searching…"}</span>
        {onSelectPage && result.questions.length ? (
          <Button variant="ghost" size="sm" onClick={() => onSelectPage(result.questions, !allOnPage)}>
            {allOnPage ? "Unselect page" : "Select page"}
          </Button>
        ) : null}
      </div>
      {result.status === "error" ? (
        <ErrorState message={result.error} onRetry={result.reload} />
      ) : result.status === "loading" ? (
        <SkeletonRows rows={4} />
      ) : !result.questions.length ? (
        <EmptyState icon="search" title="No questions match" description="Change the filters or add your own question first." />
      ) : (
        <div className="flex flex-col gap-3">
          {result.questions.map((q, i) => (
            <QuestionCard key={q._id} q={q} index={(page - 1) * limit + i + 1} selected={selected.has(q._id)} onToggle={onToggle} showAnswer mine={userId && q.tutorId === userId} />
          ))}
        </div>
      )}
      {result.totalPages > 1 ? (
        <div className="overflow-hidden rounded-lg border border-examino-border [&>nav]:border-t-0">
          <Pagination page={page} totalPages={result.totalPages} onChange={setPage} summary={`Page ${page} of ${result.totalPages}`} />
        </div>
      ) : null}
    </div>
  );
}
