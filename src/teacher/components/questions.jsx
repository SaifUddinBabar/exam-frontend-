import { useState, useMemo } from "react";
import MathText from "../../components/MathText";
import { imageUrl } from "../api";
import { EMPTY_FILTERS, useQuestionMetadata, useQuestionSearch } from "../hooks";
import { Badge, Button, EmptyState, ErrorState, Pagination, SearchInput, Select, SkeletonRows } from "./ui";
import Icon from "./Icon";
import { BN_OPTION_LETTERS, toBanglaDigits } from "../utils";
import { triggerHaptic } from "../../utils/haptics";

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

export function QuestionCard({ q, index, selected, onToggle, showAnswer = true, mine }) {
  const [openExplanation, setOpenExplanation] = useState(false);

  const handleToggle = () => {
    if (onToggle) {
      triggerHaptic("medium");
      onToggle(q);
    }
  };

  return (
    <article
      onClick={handleToggle}
      className={cx(
        "rounded-2xl border bg-white p-4 transition-all sm:p-5 shadow-xs cursor-pointer select-none",
        selected
          ? "border-emerald-600 bg-emerald-50/20 ring-2 ring-emerald-500/20"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        {onToggle ? (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            aria-label={`Select question ${index ?? ""}`}
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          {/* Top badges and actions matching user screenshot */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[11px] font-bold tracking-wide shadow-xs">
                {q.questionType === "board" ? "বোর্ড প্রশ্ন" : "অনুশীলনী"}
              </span>
              {q.questionType === "board" && q.boardName ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-200">
                  {q.boardName} {q.boardYear}
                </span>
              ) : null}
              {q.topic ? (
                <span className="max-w-[200px] truncate text-[11px] font-medium text-slate-500">
                  {q.topic}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {q.explanation ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic("light");
                    setOpenExplanation(!openExplanation);
                  }}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-emerald-50 transition-colors"
                >
                  <span>{openExplanation ? "ব্যাখ্যা লুকান" : "ব্যাখ্যা দেখুন"}</span>
                </button>
              ) : null}
              <span className="text-slate-400 text-sm">💬</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="mt-3">
            <p className="text-[15px] sm:text-base font-bold leading-relaxed text-slate-900 font-bengali">
              {index ? <span className="mr-1.5 text-slate-800 font-extrabold">{toBanglaDigits(index)}.</span> : null}
              <MathText text={q.question} />
            </p>
          </div>

          {q.image ? (
            <img
              src={imageUrl(q.image)}
              alt="Question figure"
              loading="lazy"
              className="mt-3 max-h-48 rounded-xl border border-slate-200 object-contain shadow-xs"
            />
          ) : null}

          {/* 4 Options Grid matching user screenshot */}
          <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
            {(q.options || []).map((opt, i) => {
              const isCorrect = showAnswer && opt === q.correctAnswer;
              return (
                <div
                  key={i}
                  className={cx(
                    "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-all",
                    isCorrect
                      ? "bg-[#0A3D62] text-white font-semibold shadow-xs ring-1 ring-[#0A3D62]"
                      : "bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100/70"
                  )}
                >
                  <span
                    className={cx(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isCorrect ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
                    )}
                  >
                    {BN_OPTION_LETTERS[i]}
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">
                    <MathText text={opt} />
                  </span>
                </div>
              );
            })}
          </div>

          {/* Explanation Box */}
          {openExplanation && q.explanation ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 text-sm leading-relaxed text-slate-800 animate-fadeIn"
            >
              <p className="font-bold text-xs uppercase tracking-wider text-emerald-800 mb-1">
                💡 সঠিক উত্তরের ব্যাখ্যা:
              </p>
              <MathText text={q.explanation} />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Inline question browser with selection. `selected` is a Map<id, question>. */
export function QuestionPicker({
  selected,
  onToggle,
  onSelectPage,
  userId,
  limit = 15,
  examTitle = "",
  onPreview,
  onSave
}) {
  const meta = useQuestionMetadata();
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    chapter: "অধ্যায় ৬: ডাটাবেজ ম্যানেজমেন্ট সিস্টেম"
  });
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [page, setPage] = useState(1);
  const [mobileTopicOpen, setMobileTopicOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Chapter list
  const allChapters = useMemo(() => {
    const list = [
      "অধ্যায় ১: তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত",
      "অধ্যায় ২: কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং",
      "অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
      "অধ্যায় ৪: ওয়েব ডিজাইন পরিচিতি ও HTML",
      "অধ্যায় ৫: প্রোগ্রামিং ভাষা (সি প্রোগ্রামিং)",
      "অধ্যায় ৬: ডাটাবেজ ম্যানেজমেন্ট সিস্টেম",
    ];
    (meta.subjects || []).forEach((s) => {
      (s.chapters || []).forEach((c) => {
        if (!list.includes(c.name)) list.push(c.name);
      });
    });
    return list;
  }, [meta.subjects]);

  // Current chapter topics
  const currentTopics = useMemo(() => {
    if (!filters.chapter) return [];
    if (HSC_STANDARD_CHAPTER_TOPICS[filters.chapter]) {
      return HSC_STANDARD_CHAPTER_TOPICS[filters.chapter];
    }
    const match = Object.keys(HSC_STANDARD_CHAPTER_TOPICS).find((k) =>
      k.toLowerCase().includes(filters.chapter.toLowerCase()) ||
      filters.chapter.toLowerCase().includes(k.toLowerCase())
    );
    return match ? HSC_STANDARD_CHAPTER_TOPICS[match] : [];
  }, [filters.chapter]);

  // When chapter changes, clear selected topics
  const handleChapterChange = (chapterName) => {
    triggerHaptic("light");
    setSelectedTopics([]);
    setFilters((prev) => ({
      ...prev,
      chapter: chapterName,
      topic: "",
    }));
    setPage(1);
  };

  // Toggle a topic checkbox
  const handleTopicToggle = (topicName) => {
    triggerHaptic("light");
    const exists = selectedTopics.includes(topicName);
    const next = exists
      ? selectedTopics.filter((t) => t !== topicName)
      : [...selectedTopics, topicName];

    setSelectedTopics(next);
    setFilters((prev) => ({
      ...prev,
      topic: next.join(","),
    }));
    setPage(1);
  };

  // Select / Unselect all topics
  const handleSelectAllTopics = () => {
    triggerHaptic("medium");
    if (selectedTopics.length === currentTopics.length) {
      setSelectedTopics([]);
      setFilters((prev) => ({ ...prev, topic: "" }));
    } else {
      setSelectedTopics([...currentTopics]);
      setFilters((prev) => ({ ...prev, topic: currentTopics.join(",") }));
    }
    setPage(1);
  };

  const result = useQuestionSearch(filters, page, limit);

  // Check if all questions on this page are selected
  const allOnPage =
    result.questions.length > 0 &&
    result.questions.every((q) => selected.has(q._id));

  const handleSelectPage = () => {
    triggerHaptic("medium");
    if (onSelectPage) {
      onSelectPage(result.questions, !allOnPage);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* 2 COLUMNS: LEFT = QUESTIONS & ACTIONS, RIGHT = TOPICS SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        {/* LEFT COLUMN: Questions, Header, Alerts */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Top Action Bar (Matching screenshot) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800 text-base sm:text-lg">
                {examTitle || "প্রশ্ন নির্বাচন"}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 shadow-2xs">
                {selected.size} নির্বাচিত
              </span>
            </div>

            <div className="flex items-center gap-3">
              {result.questions.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-slate-700 hover:text-emerald-700 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={allOnPage}
                    onChange={handleSelectPage}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                  <span>সব নির্বাচন</span>
                </label>
              )}

              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  if (onPreview) onPreview();
                  else setPreviewOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <span>👁️ প্রিভিউ</span>
              </button>

              {onSave && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("success");
                    onSave();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <span>💾 সেভ</span>
                </button>
              )}

              {/* Mobile Topic Button */}
              <button
                type="button"
                onClick={() => setMobileTopicOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                <span>📑 টপিক ({selectedTopics.length})</span>
              </button>
            </div>
          </div>

          {/* Yellow Banner (Matching screenshot) */}
          <div className="rounded-xl border border-amber-200/90 bg-amber-50/80 px-4 py-2.5 text-center text-xs font-semibold text-amber-900 shadow-2xs">
            প্রশ্নে ভুল পেলে রিপোর্ট করে প্রশ্নব্যাংক সমৃদ্ধ করুন।
          </div>

          {/* Search & Difficulty Filter Mini-bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[200px]">
              <SearchInput
                value={filters.search}
                onChange={(v) => {
                  setFilters((prev) => ({ ...prev, search: v }));
                  setPage(1);
                }}
                placeholder="প্রশ্ন খুঁজুন..."
                label="Search"
              />
            </div>
            <div className="flex items-center gap-1">
              {["", "easy", "medium", "hard"].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setFilters((prev) => ({ ...prev, difficulty: diff }));
                    setPage(1);
                  }}
                  className={cx(
                    "px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    filters.difficulty === diff
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {diff === "" ? "সকল" : diff === "easy" ? "সহজ" : diff === "medium" ? "মাঝারি" : "কঠিন"}
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              {result.status === "ready"
                ? `মোট ${result.total} টি প্রশ্ন পাওয়া গেছে (পৃষ্ঠা ${page} / ${result.totalPages})`
                : "লোড হচ্ছে..."}
            </span>
          </div>

          {result.status === "error" ? (
            <ErrorState message={result.error} onRetry={result.reload} />
          ) : result.status === "loading" ? (
            <SkeletonRows rows={4} />
          ) : !result.questions.length ? (
            <EmptyState
              icon="search"
              title="কোনো প্রশ্ন পাওয়া যায়নি"
              description="টপিক বা ফিল্টার পরিবর্তন করুন।"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {result.questions.map((q, i) => (
                <QuestionCard
                  key={q._id}
                  q={q}
                  index={(page - 1) * limit + i + 1}
                  selected={selected.has(q._id)}
                  onToggle={onToggle}
                  showAnswer={true}
                  mine={userId && q.tutorId === userId}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Pagination
                page={page}
                totalPages={result.totalPages}
                onChange={(p) => {
                  triggerHaptic("light");
                  setPage(p);
                }}
                summary={`পৃষ্ঠা ${page} এর ${result.totalPages}`}
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Topics Sidebar (Matching user screenshot) */}
        <aside className="hidden lg:flex flex-col sticky top-20 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-wide">
                টপিক -
              </h3>
              {selectedTopics.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedTopics([]);
                    setFilters((prev) => ({ ...prev, topic: "" }));
                    setPage(1);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  রিসেট ({selectedTopics.length})
                </button>
              )}
            </div>

            {/* Chapter Selection Dropdown */}
            <Select
              value={filters.chapter}
              onChange={(e) => handleChapterChange(e.target.value)}
              className="text-xs font-bold text-slate-800"
            >
              {allChapters.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </Select>
          </div>

          {/* Topic Checkboxes */}
          <div className="p-3 max-h-[70vh] overflow-y-auto space-y-1 divide-y divide-slate-100">
            <div className="pb-1.5 flex justify-between items-center px-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                টপিক তালিকা ({currentTopics.length})
              </span>
              <button
                type="button"
                onClick={handleSelectAllTopics}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                {selectedTopics.length === currentTopics.length ? "সব বাদ" : "সব বাছাই"}
              </button>
            </div>

            {currentTopics.map((topic) => {
              const checked = selectedTopics.includes(topic);
              return (
                <label
                  key={topic}
                  onClick={() => triggerHaptic("light")}
                  className={cx(
                    "flex items-start gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer text-xs transition-colors select-none",
                    checked
                      ? "bg-emerald-50/70 text-emerald-900 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleTopicToggle(topic)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                  <span className="min-w-0 flex-1 leading-snug">{topic}</span>
                </label>
              );
            })}
          </div>
        </aside>
      </div>

      {/* MOBILE TOPIC DRAWER */}
      {mobileTopicOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileTopicOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base text-slate-900">টপিক নির্বাচন</h3>
              <button
                type="button"
                onClick={() => setMobileTopicOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="my-3">
              <Select
                value={filters.chapter}
                onChange={(e) => handleChapterChange(e.target.value)}
                className="text-xs font-bold"
              >
                {allChapters.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {currentTopics.map((topic) => {
                const checked = selectedTopics.includes(topic);
                return (
                  <label
                    key={topic}
                    className={cx(
                      "flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-xs",
                      checked ? "bg-emerald-50 text-emerald-900 font-bold" : "text-slate-700"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTopicToggle(topic)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600"
                    />
                    <span className="min-w-0 flex-1">{topic}</span>
                  </label>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setMobileTopicOpen(false)}
              className="mt-4 w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs"
            >
              সম্পন্ন ({selectedTopics.length} টপিক নির্বাচিত)
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  নির্বাচিত প্রশ্ন প্রিভিউ ({selected.size} টি প্রশ্ন)
                </h3>
                <p className="text-xs text-slate-500">পরীক্ষায় এই প্রশ্নগুলো থাকবে।</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selected.size === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">কোনো প্রশ্ন নির্বাচন করা হয়নি।</p>
              ) : (
                Array.from(selected.values()).map((q, idx) => (
                  <QuestionCard
                    key={q._id}
                    q={q}
                    index={idx + 1}
                    selected={true}
                    onToggle={onToggle}
                    showAnswer={true}
                  />
                ))
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button onClick={() => setPreviewOpen(false)}>ঠিক আছে</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
