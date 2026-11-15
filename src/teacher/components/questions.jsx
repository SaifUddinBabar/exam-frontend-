import { useEffect, useMemo, useState } from "react";
import MathText from "../../components/MathText";
import QuestionImage from "../../components/QuestionImage";
import { api } from "../api";
import { EMPTY_FILTERS, useQuestionMetadata, useQuestionSearch } from "../hooks";
import { useToast } from "../toast";
import { Badge, Button, Card, Drawer, EmptyState, ErrorState, Field, Modal, Pagination, SearchInput, Segmented, Select, SkeletonRows, Textarea } from "./ui";
import Icon from "./Icon";
import { BN_OPTION_LETTERS, toBanglaDigits } from "../utils";
import { triggerHaptic } from "../../utils/haptics";
import { resolveQuestion, TRANSLATION_UNAVAILABLE } from "../../lib/questionLanguage";

const cx = (...c) => c.filter(Boolean).join(" ");

// Syllabus topic suggestions used by the Create Question form (not for counting).
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
    "ডেটাবেজ ম্যানেজমেন্ট সিস্টেম",
    "কী ফিল্ড",
    "রিলেশনাল ডেটাবেজ ম্যানেজমেন্ট সিস্টেম",
    "ডেটাবেজ রিলেশন",
    "ডেটাবেজ তৈরি",
    "ডেটা টাইপ",
    "সর্টিং এবং ইনডেক্সিং",
    "ডেটা সিকিউরিটি",
    "ডেটাবেজ ম্যানেজমেন্ট",
    "রিলেশনাল ডেটাবেজ",
    "প্রাইমারি কি",
    "এসকিউএল (SQL)",
    "RDBMS-এর বৈশিষ্ট্য RDBMS-এর ব্যবহার",
  ],
};

// ---------------------------------------------------------------------------
// Question card (teacher view). Strict language: shows only the selected
// language's text/options/explanation, or "Translation unavailable".
// ---------------------------------------------------------------------------
const DIFF_META = {
  easy: ["সহজ · Easy", "green"],
  medium: ["মাঝারি · Medium", "amber"],
  hard: ["কঠিন · Hard", "red"],
  unclassified: ["অনির্ধারিত · Unclassified", "neutral"],
};
const REPORT_REASONS = [
  ["wrong_answer", "Wrong correct answer"],
  ["typo", "Typo or formatting"],
  ["wrong_subject", "Wrong subject / chapter"],
  ["wrong_topic", "Wrong topic"],
  ["image_missing", "Image missing or wrong"],
  ["duplicate", "Duplicate question"],
  ["language", "Language mixed up"],
  ["other", "Other"],
];

export function ReportQuestionDialog({ q, onClose }) {
  const [reason, setReason] = useState("wrong_answer");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();
  return (
    <Modal
      open={Boolean(q)}
      onClose={onClose}
      size="sm"
      title="Report this question"
      description="The question isn't changed. Its owner reviews the report."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={busy}
            icon="flag"
            onClick={async () => {
              setBusy(true);
              try {
                const r = await api.reportQuestion(q._id, { reason, note });
                notify({ title: r.alreadyReported ? "You already reported this question" : "Report sent" });
                onClose();
              } catch (e) {
                notify({ tone: "error", title: "Couldn't send the report", description: e.message });
              } finally {
                setBusy(false);
              }
            }}
          >
            Send report
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="What's wrong?" htmlFor="rq-reason">
          <Select id="rq-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REPORT_REASONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Details (optional)" htmlFor="rq-note">
          <Textarea id="rq-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
        </Field>
      </div>
    </Modal>
  );
}

export function QuestionCard({ q, index, selected, onToggle, showAnswer = true, langVersion = "bangla", onReport, onEdit }) {
  const [openExplanation, setOpenExplanation] = useState(false);
  const view = resolveQuestion(q, langVersion);
  const correctIdx = (q.options || []).indexOf(q.correctAnswer);
  const [diffLabel, diffTone] = DIFF_META[q.difficulty] || DIFF_META.unclassified;
  const letters = langVersion === "english" ? ["A", "B", "C", "D"] : BN_OPTION_LETTERS;
  const toggle = () => onToggle && (triggerHaptic("light"), onToggle(q));

  return (
    <article className={cx("rounded-xl border bg-white p-4 shadow-xs transition-all sm:p-5", selected ? "border-examino-blue ring-2 ring-examino-blue/20 bg-blue-50/20" : "border-slate-200 hover:border-slate-300 hover:shadow-subtle")}>
      <div className="flex items-start gap-3">
        {onToggle ? (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={toggle}
            aria-label={`Select question ${index ?? ""}`}
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded accent-examino-blue"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          {/* Card Top Metadata & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {q.questionType === "board" ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100 font-bengali">
                  <Icon name="book" size={12} />
                  {q.boardName} {q.boardYear ? toBanglaDigits(q.boardYear) : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-2xs font-bengali">
                  <Icon name="book" size={12} />
                  অনুশীলনী
                </span>
              )}
              <Badge tone={diffTone}>{diffLabel}</Badge>
              <span className="max-w-[280px] truncate text-xs text-examino-muted font-bengali" title={[q.subject, q.chapter, q.topic].filter(Boolean).join(" › ")}>
                {[q.chapter, q.topic].filter(Boolean).join(" › ")}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {view.available && view.explanation ? (
                <button
                  type="button"
                  onClick={() => setOpenExplanation((o) => !o)}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors font-bengali"
                >
                  <Icon name="eye" size={13} />
                  {openExplanation ? "ব্যাখ্যা লুকান" : "ব্যাখ্যা দেখুন"}
                </button>
              ) : null}
              {onEdit ? (
                <Button size="sm" variant="ghost" icon="file" onClick={() => onEdit(q)}>
                  Edit
                </Button>
              ) : null}
              {onReport ? (
                <button
                  type="button"
                  onClick={() => onReport(q)}
                  aria-label="Report question"
                  className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="রিপোর্ট করুন"
                >
                  <Icon name="alert" size={15} />
                </button>
              ) : null}
            </div>
          </div>

          {!view.available ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-examino-amber-soft px-3 py-2.5 text-sm">
              <p className="font-semibold text-amber-900">
                {index ? `${index}. ` : ""}
                {TRANSLATION_UNAVAILABLE[langVersion]}
              </p>
              <p className="text-xs text-amber-800">This question exists only in {langVersion === "english" ? "Bengali" : "English"}. Switch the version to see it.</p>
            </div>
          ) : (
            <>
              {/* Question Statement */}
              <p className="mt-3 text-[15px] font-semibold leading-relaxed text-slate-900 sm:text-base font-bengali">
                {index ? <span className="mr-1.5 font-bold text-slate-700">{langVersion === "english" ? `${index}.` : `${toBanglaDigits(index)}.`}</span> : null}
                <MathText text={view.text} />
              </p>
              <QuestionImage q={q} className="mt-3" />

              {/* 4 Options Grid */}
              <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
                {view.options.map((opt, i) => {
                  const isCorrect = showAnswer && i === correctIdx;
                  return (
                    <div
                      key={i}
                      className={cx(
                        "flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-all",
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50/80 font-semibold text-emerald-950 shadow-2xs"
                          : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-white"
                      )}
                    >
                      <span
                        className={cx(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                          isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200/90 text-slate-700"
                        )}
                      >
                        {letters[i]}
                      </span>
                      <span className="min-w-0 flex-1 leading-snug font-bengali">
                        <MathText text={opt} />
                      </span>
                      {isCorrect ? (
                        <Icon name="check" size={16} className="shrink-0 text-emerald-600" />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Dropdown Box */}
              {openExplanation && view.explanation ? (
                <div className="mt-3.5 rounded-lg border border-emerald-200/80 bg-emerald-50/40 p-3.5 text-sm leading-relaxed text-slate-800 font-bengali">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <Icon name="book" size={14} />
                    <span>ব্যাখ্যা (Explanation)</span>
                  </div>
                  <MathText text={view.explanation} />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Question picker: chapter + real topic counts sidebar, language, difficulty,
// search, pagination, page selection. Counts come from the database.
// ---------------------------------------------------------------------------
function TopicList({ chapters, chapter, onChapter, topics, noTopicCount, selectedTopics, onToggleTopic, onClearTopics }) {
  return (
    <div className="flex flex-col bg-white">
      {/* Header matching reference image */}
      <div className="border-b border-examino-border bg-slate-50/80 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 font-bengali">টপিক -</h3>
          {selectedTopics.length ? (
            <button
              type="button"
              onClick={onClearTopics}
              className="text-xs font-semibold text-examino-blue hover:underline font-bengali"
            >
              মুছে ফেলুন ({toBanglaDigits(selectedTopics.length)})
            </button>
          ) : null}
        </div>
        {chapter ? (
          <p className="mt-1 text-xs font-semibold text-examino-blue font-bengali truncate" title={chapter}>
            {chapter}
          </p>
        ) : (
          <p className="mt-1 text-xs text-slate-400 font-bengali">অধ্যায় নির্বাচন করুন</p>
        )}
      </div>

      {/* Chapter Selection Dropdown */}
      <div className="border-b border-examino-border p-3 bg-white">
        <label htmlFor="qp-chapter" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-examino-muted font-bengali">
          অধ্যায় নির্বাচন
        </label>
        <Select
          id="qp-chapter"
          value={chapter}
          onChange={(e) => onChapter(e.target.value)}
          className="text-sm font-bengali w-full"
        >
          <option value="">— সব অধ্যায় (All Chapters) —</option>
          {chapters.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({toBanglaDigits(c.questionCount)})
            </option>
          ))}
        </Select>
      </div>

      {/* Topics Checklist */}
      <div className="max-h-[62vh] space-y-1 overflow-y-auto p-2.5">
        {!chapter ? (
          <div className="px-3 py-6 text-center text-xs text-examino-muted font-bengali">
            একটি অধ্যায় নির্বাচন করলে সেই অধ্যায়ের সকল টপিক এখানে দেখতে পাবেন।
          </div>
        ) : !topics.length && !noTopicCount ? (
          <div className="px-3 py-6 text-center text-xs text-examino-muted font-bengali">
            এই অধ্যায়ে কোনো নির্দিষ্ট টপিক পাওয়া যায়নি।
          </div>
        ) : (
          topics.map((t) => {
            const checked = selectedTopics.includes(t.name);
            const count = t.count || 0;
            return (
              <label
                key={t.name}
                className={cx(
                  "group flex cursor-pointer items-start gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-all select-none",
                  checked
                    ? "bg-examino-blue/10 font-semibold text-examino-blue ring-1 ring-examino-blue/30"
                    : "text-slate-700 hover:bg-slate-100/70"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTopic(t.name)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded cursor-pointer accent-examino-blue"
                />
                <span className="min-w-0 flex-1 leading-snug font-bengali">
                  {t.label || t.name}
                </span>
                <span
                  className={cx(
                    "text-xs font-semibold transition-colors",
                    checked
                      ? "text-examino-blue"
                      : count > 0
                      ? "text-slate-500"
                      : "text-slate-300"
                  )}
                >
                  ({toBanglaDigits(count)})
                </span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

export function QuestionPicker({ selected, onToggle, onSelectPage, userId, limit = 15, examTitle = "", onSave, onEditQuestion }) {
  const meta = useQuestionMetadata();
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, version: "bangla" });
  const [page, setPage] = useState(1);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reporting, setReporting] = useState(null);
  const [counts, setCounts] = useState({ topics: [], noTopic: 0, stats: null });
  const selectedTopics = filters.topic ? filters.topic.split("||") : [];
  const lang = filters.version;

  const chapters = useMemo(() => {
    const map = new Map();
    (meta.subjects || []).forEach((s) => (s.chapters || []).forEach((c) => map.set(c.name, { ...c, questionCount: (map.get(c.name)?.questionCount || 0) + c.questionCount })));
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "bn"));
  }, [meta.subjects]);

  // Default to first available chapter if none chosen yet
  useEffect(() => {
    if (!filters.chapter && chapters.length > 0) {
      setFilters((f) => ({ ...f, chapter: chapters[0].name }));
    }
  }, [chapters, filters.chapter]);

  // Real topic + difficulty counts for the current chapter / language.
  useEffect(() => {
    const ctrl = new AbortController();
    api
      .topicCounts({ chapter: filters.chapter || undefined, subject: filters.subject || undefined, version: lang }, { signal: ctrl.signal })
      .then((res) =>
        setCounts({
          topics: Object.entries(res.topicCounts || {})
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
          noTopic: res.noTopicCount || 0,
          stats: res.stats || null,
        })
      )
      .catch(() => {});
    return () => ctrl.abort();
  }, [filters.chapter, filters.subject, lang]);

  const set = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const toggleTopic = (t) => {
    const next = selectedTopics.includes(t) ? selectedTopics.filter((x) => x !== t) : [...selectedTopics, t];
    set({ topic: next.join("||") });
  };

  const result = useQuestionSearch(filters, page, limit);
  const allOnPage = result.questions.length > 0 && result.questions.every((q) => selected.has(q._id));
  const s = counts.stats;

  const topicPanel = (
    <TopicList
      chapters={chapters}
      chapter={filters.chapter}
      onChapter={(c) => set({ chapter: c, topic: "" })}
      topics={counts.topics}
      noTopicCount={counts.noTopic}
      selectedTopics={selectedTopics}
      onToggleTopic={toggleTopic}
      onClearTopics={() => set({ topic: "" })}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3.5">
          {/* Top Action & Control Bar */}
          <Card className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base font-bold text-slate-800 font-bengali">
                {filters.chapter || examTitle || "প্রশ্নব্যাংক"}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 font-bengali">
                {toBanglaDigits(selected.size)}/{toBanglaDigits(result.total || 100)} নির্বাচিত
              </span>
              <Segmented
                label="Question language"
                size="sm"
                value={lang}
                onChange={(v) => set({ version: v })}
                options={[
                  { value: "bangla", label: "বাংলা Version" },
                  { value: "english", label: "English Version" },
                ]}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {result.questions.length ? (
                <label className="flex cursor-pointer items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 font-bengali select-none">
                  <input
                    type="checkbox"
                    checked={allOnPage}
                    onChange={() => onSelectPage && onSelectPage(result.questions, !allOnPage)}
                    className="h-4 w-4 rounded accent-examino-blue cursor-pointer"
                  />
                  সব নির্বাচন
                </label>
              ) : null}
              <Button size="sm" variant="secondary" icon="eye" onClick={() => setPreviewOpen(true)} disabled={!selected.size} className="font-bengali">
                প্রিভিউ
              </Button>
              {onSave ? (
                <Button size="sm" iconRight="chevronRight" onClick={onSave} disabled={!selected.size} className="font-bengali">
                  সেভ
                </Button>
              ) : null}
              <Button size="sm" variant="navy" icon="filter" className="lg:hidden font-bengali" onClick={() => setTopicsOpen(true)}>
                টপিক{selectedTopics.length ? ` (${toBanglaDigits(selectedTopics.length)})` : ""}
              </Button>
            </div>
          </Card>

          {/* Yellow Advisory Banner matching reference image */}
          <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-2 text-center text-xs font-medium text-amber-900 shadow-2xs font-bengali sm:text-sm">
            <span>প্রশ্নে ভুল পেলে রিপোর্ট করে প্রশ্নব্যাংক সমৃদ্ধ করুন।</span>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <SearchInput value={filters.search} onChange={(v) => set({ search: v })} placeholder="প্রশ্ন বা অপশন দিয়ে খুঁজুন..." className="md:flex-1" />
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Difficulty">
              {[
                ["", "সকল", s?.total],
                ["easy", "সহজ", s?.easy],
                ["medium", "মাঝারি", s?.medium],
                ["hard", "কঠিন", s?.hard],
                ["unclassified", "অনির্ধারিত", s?.unclassified],
              ].map(([id, label, n]) => (
                <button
                  key={id || "all"}
                  type="button"
                  aria-pressed={filters.difficulty === id}
                  onClick={() => set({ difficulty: id })}
                  className={cx(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold font-bengali transition-colors",
                    filters.difficulty === id ? "border-examino-navy bg-examino-navy text-white" : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {label}
                  {n !== undefined ? <span className={filters.difficulty === id ? "text-white/70" : "text-slate-400 font-mono"}>({toBanglaDigits(n)})</span> : null}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-examino-muted font-bengali">
            {result.status === "ready" ? `${toBanglaDigits(result.total)}টি প্রশ্ন · পৃষ্ঠা ${toBanglaDigits(page)} / ${toBanglaDigits(result.totalPages)}` : "লোড হচ্ছে…"}
            {selectedTopics.length ? ` · নির্বাচিত টপিক: ${toBanglaDigits(selectedTopics.length)}টি` : ""}
          </p>

          {result.status === "error" ? (
            <Card>
              <ErrorState message={result.error} onRetry={result.reload} />
            </Card>
          ) : result.status === "loading" ? (
            <Card>
              <SkeletonRows rows={4} />
            </Card>
          ) : !result.questions.length ? (
            <Card>
              <EmptyState icon="search" title="No questions match these filters." description="Try another topic, difficulty or language version." />
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {result.questions.map((q, i) => (
                <QuestionCard
                  key={q._id}
                  q={q}
                  index={(page - 1) * limit + i + 1}
                  selected={selected.has(q._id)}
                  onToggle={onToggle}
                  onEdit={onEditQuestion}
                  onReport={setReporting}
                  langVersion={lang}
                  mine={userId && q.tutorId === userId}
                />
              ))}
            </div>
          )}

          {result.totalPages > 1 ? (
            <Card className="overflow-hidden">
              <Pagination page={page} totalPages={result.totalPages} onChange={setPage} summary={`Page ${page} of ${result.totalPages}`} />
            </Card>
          ) : null}
        </div>

        <Card className="sticky top-20 hidden overflow-hidden lg:block">{topicPanel}</Card>
      </div>

      <Drawer open={topicsOpen} onClose={() => setTopicsOpen(false)} title="Chapter & topics" footer={<Button onClick={() => setTopicsOpen(false)}>Show {result.total} questions</Button>}>
        {topicPanel}
      </Drawer>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} size="lg" title={`Selected questions (${selected.size})`} footer={<Button onClick={() => setPreviewOpen(false)}>Done</Button>}>
        <div className="space-y-3">
          {[...selected.values()].map((q, idx) => (
            <QuestionCard key={q._id} q={q} index={idx + 1} selected onToggle={onToggle} langVersion={lang} />
          ))}
        </div>
      </Modal>

      <ReportQuestionDialog q={reporting} onClose={() => setReporting(null)} />
    </div>
  );
}
