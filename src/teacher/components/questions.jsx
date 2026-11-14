import { useState } from "react";
import MathText from "../../components/MathText";
import { imageUrl } from "../api";
import { EMPTY_FILTERS, useQuestionMetadata, useQuestionSearch } from "../hooks";
import { Badge, Button, EmptyState, ErrorState, Pagination, SearchInput, Select, SkeletonRows } from "./ui";
import Icon from "./Icon";
import { BN_OPTION_LETTERS } from "../utils";

const cx = (...c) => c.filter(Boolean).join(" ");
const DIFF_TONE = { easy: "green", medium: "amber", hard: "red" };

// HSC Standard Textbook Topics Mapping (NCTB)
export const HSC_STANDARD_CHAPTER_TOPICS = {
  "অধ্যায় ১: তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত": [
    "বিশ্বগ্রাম ধারণা (Global Village)",
    "ভার্চুয়াল রিয়েলিটি (Virtual Reality)",
    "কৃত্রিম বুদ্ধিমত্তা ও রোবোটিক্স (AI & Robotics)",
    "ক্রায়োসার্জারি (Cryosurgery)",
    "বায়োমেট্রিক্স ও বায়োইনফরমেটিক্স",
    "জেনেটিক ইঞ্জিনিয়ারিং (Genetic Engineering)",
    "ন্যানোটেকনোলজি (Nanotechnology)",
    "ই-কমার্স ও সমাজজীবনে প্রভাব",
  ],
  "Introduction to ICT": [
    "বিশ্বগ্রাম (Global Village)",
    "ভার্চুয়াল রিয়েলিটি (Virtual Reality)",
    "কৃত্রিম বুদ্ধিমত্তা ও রোবোটিক্স (AI & Robotics)",
    "ক্রায়োসার্জারি (Cryosurgery)",
    "বায়োমেট্রিক্স (Biometrics)",
    "বায়োইনফরমেটিক্স (Bioinformatics)",
    "জেনেটিক ইঞ্জিনিয়ারিং (Genetic Engineering)",
    "ন্যানোটেকনোলজি (Nanotechnology)",
  ],
  "অধ্যায় ২: কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং": [
    "ডেটা কমিউনিকেশন ও ব্যান্ডউইথ (Bandwidth)",
    "ডেটা ট্রান্সমিশন মেথড (Asynchronous, Synchronous)",
    "ডেটা ট্রান্সমিশন মোড (Simplex, Half/Full Duplex)",
    "তারযুক্ত মাধ্যম (Twisted Pair, Coaxial, Fiber Optic)",
    "তারবিহীন মাধ্যম (Wi-Fi, WiMAX, Bluetooth, Satellite)",
    "মোবাইল প্রজন্ম (1G, 2G, 3G, 4G, 5G)",
    "কম্পিউটার নেটওয়ার্ক (PAN, LAN, MAN, WAN)",
    "নেটওয়ার্ক টপোলজি (Star, Bus, Ring, Tree, Mesh, Hybrid)",
    "ক্লাউড কম্পিউটিং (Cloud Computing)",
  ],
  "Communication Systems": [
    "ব্যান্ডউইথ (Bandwidth)",
    "ডেটা ট্রান্সমিশন মোড",
    "তারযুক্ত মাধ্যম (Twisted Pair, Coaxial, Fiber Optic)",
    "তারবিহীন মাধ্যম (Wi-Fi, WiMAX, Bluetooth, Satellite)",
    "মোবাইল ফোনের বিভিন্ন প্রজন্ম (1G–5G)",
    "কম্পিউটার নেটওয়ার্ক (PAN, LAN, MAN, WAN)",
    "নেটওয়ার্ক টপোলজি (Bus, Ring, Star, Tree, Mesh)",
    "নেটওয়ার্কিং ডিভাইস (Modem, Router, Switch, Gateway)",
    "ক্লাউড কম্পিউটিং (Cloud Computing)",
  ],
  "অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস": [
    "সংখ্যা পদ্ধতি পরিচিতি ও ভিত্তি (Base)",
    "সংখ্যা পদ্ধতির রূপান্তর (Conversion)",
    "চিহ্নযুক্ত সংখ্যা ও ২-এর পরিপূরক (2's Complement)",
    "বাইনারি যোগ ও বিয়োগ",
    "কোড (BCD, EBCDIC, ASCII, Unicode)",
    "বুলিয়ান অ্যালজেবরা ও ডি-মরগানের উপপাদ্য",
    "মৌলিক ও সার্বজনীন লজিক গেইট (AND, OR, NOT, NAND, NOR)",
    "বিশেষ লজিক গেইট (XOR, XNOR)",
    "এনকোডার ও ডিকোডার (Encoder, Decoder)",
    "অ্যাডার (Half Adder, Full Adder)",
    "ফ্লিপ-ফ্লপ ও রেজিস্টার",
  ],
  "Number System & Digital Device": [
    "সংখ্যা পদ্ধতি পরিচিতি",
    "বাইনারি সংখ্যা পদ্ধতি",
    "বুলিয়ান বীজগণিত",
    "লজিক গেট (Logic Gates)",
    "কোডিং সিস্টেম",
  ],
  "অধ্যায় ৪: ওয়েব ডিজাইন পরিচিতি ও HTML": [
    "ওয়েবসাইটের কাঠামো (Tree, Network, Linear)",
    "ডোমেইন নেইম ও আইপি অ্যাড্রেস (DNS & IP)",
    "HTML বেসিক ট্যাগ ও সিনট্যাক্স",
    "টেক্সট ফরম্যাটিং ও কালার কোড",
    "হাইপারলিঙ্ক (Anchor Tag)",
    "ইমেজ যুক্তকরণ (img tag)",
    "টেবিল তৈরি (table, tr, th, td)",
    "ফর্ম তৈরি (Form, Input, Button)",
    "ওয়েবসাইট পাবলিশিং",
  ],
  "Web & HTML": [
    "URL ও ডোমেইন",
    "ওয়েবসাইট কাঠামো",
    "HTML ট্যাগ ও ফরম্যাটিং",
  ],
  "অধ্যায় ৫: প্রোগ্রামিং ভাষা (সি প্রোগ্রামিং)": [
    "প্রোগ্রামিং ভাষার স্তর ও প্রজন্ম",
    "অনুবাদক প্রোগ্রাম (Compiler, Interpreter)",
    "অ্যালগরিদম ও ফ্লোচার্ট",
    "সি প্রোগ্রামের গঠন (Structure)",
    "চলক, ধ্রুবক ও ডেটা টাইপ (int, float, char)",
    "অপারেটর ও এক্সপ্রেশন",
    "ইনপুট ও আউটপুট ফাংশন (printf, scanf)",
    "কন্ডিশনাল স্টেটমেন্ট (if, if-else, switch)",
    "লুপ কন্ট্রোল স্টেটমেন্ট (for, while, do-while)",
    "অ্যারে ও স্ট্রিং (Array & String)",
    "ফাংশন (Function)",
  ],
  "Programming & Language": [
    "প্রোগ্রামিং ভাষার প্রজন্ম",
    "অনুবাদক প্রোগ্রাম",
    "প্রোগ্রাম উন্নয়ন ধাপ",
    "সি প্রোগ্রামিং (C Language)",
  ],
  "অধ্যায় ৬: ডাটাবেজ ম্যানেজমেন্ট সিস্টেম": [
    "ডাটাবেজ ও ডিবিএমএস (DBMS) ধারণা",
    "রিলেশনাল ডাটাবেজ (RDBMS) ও টেবিল",
    "ফিল্ড, রেকর্ড ও ডেটা টাইপ",
    "প্রাইমারি কি ও ফরেন কি",
    "টেবিল রিলেশনশিপ (1:1, 1:N, N:M)",
    "এসকিউএল (SQL) কুয়েরি (SELECT, INSERT)",
    "ডাটা সিকিউরিটি ও ব্যাকআপ",
  ],
};

export function QuestionFilters({ filters, onChange, meta, compact }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const allChapters = useMemo(() => {
    const map = new Map();
    (meta.subjects || []).forEach((s) => {
      (s.chapters || []).forEach((c) => {
        if (!map.has(c.name)) map.set(c.name, { ...c, subjectName: s.name });
      });
    });
    return Array.from(map.values());
  }, [meta.subjects]);

  const subject = meta.subjects.find((s) => s.name === filters.subject);
  const availableChapters = subject ? subject.chapters : allChapters;
  const currentChapterObj = availableChapters.find((c) => c.name === filters.chapter);

  // Merge database topics with standard HSC syllabus topics
  const availableTopics = useMemo(() => {
    if (!filters.chapter) return [];
    const dbTopics = currentChapterObj?.topics || [];
    const stdTopics = HSC_STANDARD_CHAPTER_TOPICS[filters.chapter] || [];
    return Array.from(new Set([...dbTopics, ...stdTopics]));
  }, [filters.chapter, currentChapterObj]);

  const active = Object.entries(filters).some(([k, v]) => k !== "search" && v);

  return (
    <div className="flex flex-col gap-3">
      <SearchInput value={filters.search} onChange={(v) => set({ search: v })} placeholder="Search question text" label="Search questions" />
      <div className={cx("grid gap-2", compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-6")}>
        <Select aria-label="Subject" value={filters.subject} onChange={(e) => set({ subject: e.target.value, chapter: "", topic: "" })}>
          <option value="">All subjects</option>
          {meta.subjects.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} ({s.totalQuestions})
            </option>
          ))}
        </Select>
        <Select
          aria-label="Chapter"
          value={filters.chapter}
          onChange={(e) => {
            const chName = e.target.value;
            const foundCh = allChapters.find((c) => c.name === chName);
            set({
              chapter: chName,
              subject: foundCh?.subjectName || filters.subject,
              topic: "",
            });
          }}
        >
          <option value="">All chapters (অধ্যায় নির্বাচন)</option>
          {availableChapters.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} {c.questionCount ? `(${c.questionCount})` : ""}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Topic"
          value={filters.topic}
          onChange={(e) => set({ topic: e.target.value })}
          disabled={!filters.chapter}
          className={!filters.chapter ? "opacity-60" : "font-semibold text-examino-blue"}
        >
          <option value="">
            {!filters.chapter ? "টপিক (আগে অধ্যায় নির্বাচন করুন)" : "সব টপিক (All Topics)"}
          </option>
          {availableTopics.map((t) => (
            <option key={t} value={t}>
              📌 {t}
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
