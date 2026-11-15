import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MathText from "../../components/MathText";
import { api } from "../api";
import { useQuestionMetadata } from "../hooks";
import { useToast } from "../toast";
import { Badge, Button, Card, CardHeader, Field, Input, Notice, PageHeader, Segmented, Select, Textarea } from "../components/ui";
import Icon from "../components/Icon";
import { BN_OPTION_LETTERS } from "../utils";
import { HSC_STANDARD_CHAPTER_TOPICS } from "../components/questions";

// Board names accepted by models/Question.js
const BOARDS = ["Dhaka", "Chittagong", "Rajshahi", "Cumilla", "Jessore", "Barishal", "Sylhet", "Dinajpur", "Mymensingh"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const blank = (keep = {}) => ({
  subject: keep.subject || "ICT",
  chapter: keep.chapter || "",
  topic: keep.topic || "",
  difficulty: keep.difficulty || "medium",
  questionType: keep.questionType || "normal",
  boardName: keep.boardName || "",
  boardYear: keep.boardYear || "",
  question: "",
  questionBn: "",
  questionEn: "",
  options: ["", "", "", ""],
  optionsBn: ["", "", "", ""],
  optionsEn: ["", "", "", ""],
  correct: null,
  explanation: "",
  explanationBn: "",
  explanationEn: "",
  langMode: "bangla", // 'bangla' | 'english' | 'bilingual'
});

function validate(f) {
  const e = {};
  if (!f.subject.trim()) e.subject = "Subject is required.";
  if (!f.chapter.trim()) e.chapter = "Chapter is required.";
  if (f.question.trim().length < 5) e.question = "Write at least 5 characters.";
  const trimmed = f.options.map((o) => o.trim());
  trimmed.forEach((o, i) => {
    if (!o) e[`option${i}`] = "Option can't be empty.";
  });
  if (new Set(trimmed.filter(Boolean)).size < trimmed.filter(Boolean).length) e.options = "Each option must be different.";
  if (f.correct === null) e.correct = "Mark the correct option.";
  if (f.questionType === "board") {
    if (!f.boardName) e.boardName = "Pick a board.";
    if (!/^\d{4}$/.test(f.boardYear)) e.boardYear = "Use a 4-digit year, e.g. 2024.";
  }
  return e;
}

export default function CreateQuestion({ embedded = false, onSuccess, editQuestion = null, onCancelEdit }) {
  const meta = useQuestionMetadata();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [form, setForm] = useState(() => blank());
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const fileRef = useRef(null);
  const questionRef = useRef(null);

  useEffect(() => {
    if (editQuestion) {
      const opts = Array.isArray(editQuestion.options)
        ? editQuestion.options.map((o) => (typeof o === "string" ? o : o.text || ""))
        : ["", "", "", ""];
      while (opts.length < 4) opts.push("");
      const correctIdx = opts.findIndex((o) => o === editQuestion.correctAnswer);
      const isEnglish = editQuestion.version === "english" || (/^[a-zA-Z0-9\s.,?!'"()-]+$/.test(editQuestion.question || "") && !/[\u0980-\u09FF]/.test(editQuestion.question || ""));
      setForm({
        subject: editQuestion.subject || "ICT",
        chapter: editQuestion.chapter || "",
        topic: editQuestion.topic || "",
        difficulty: editQuestion.difficulty || "medium",
        questionType: editQuestion.questionType || "normal",
        boardName: editQuestion.boardName || "",
        boardYear: editQuestion.boardYear || "",
        question: editQuestion.question || "",
        questionBn: editQuestion.questionBn || (!isEnglish ? editQuestion.question : ""),
        questionEn: editQuestion.questionEn || (isEnglish ? editQuestion.question : ""),
        options: opts.slice(0, 4),
        optionsBn: editQuestion.optionsBn?.length === 4 ? editQuestion.optionsBn : opts.slice(0, 4),
        optionsEn: editQuestion.optionsEn?.length === 4 ? editQuestion.optionsEn : ["", "", "", ""],
        correct: correctIdx >= 0 ? correctIdx : 0,
        explanation: editQuestion.explanation || "",
        explanationBn: editQuestion.explanationBn || (!isEnglish ? editQuestion.explanation : ""),
        explanationEn: editQuestion.explanationEn || (isEnglish ? editQuestion.explanation : ""),
        langMode: editQuestion.questionBn && editQuestion.questionEn ? "bilingual" : (isEnglish ? "english" : "bangla")
      });
    }
  }, [editQuestion]);

  const set = (patch) => {
    const next = { ...form, ...patch };
    setForm(next);
    if (touched) setErrors(validate(next));
  };

  const preview = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const subjectMeta = meta.subjects.find((s) => s.name === form.subject);
  const chapterMeta = subjectMeta?.chapters.find((c) => c.name === form.chapter);

  const allChapters = useMemo(() => {
    const set = new Set();
    (meta.subjects || []).forEach((s) => {
      (s.chapters || []).forEach((c) => set.add(c.name));
    });
    Object.keys(HSC_STANDARD_CHAPTER_TOPICS).forEach((k) => set.add(k));
    return Array.from(set);
  }, [meta.subjects]);

  const chapters = (subjectMeta?.chapters && subjectMeta.chapters.length > 0)
    ? subjectMeta.chapters.map((c) => c.name)
    : allChapters;

  const standardTopics = useMemo(() => {
    if (!form.chapter) return [];
    if (HSC_STANDARD_CHAPTER_TOPICS[form.chapter]) return HSC_STANDARD_CHAPTER_TOPICS[form.chapter];
    const matchKey = Object.keys(HSC_STANDARD_CHAPTER_TOPICS).find((k) =>
      k.toLowerCase().includes(form.chapter.toLowerCase()) || form.chapter.toLowerCase().includes(k.toLowerCase())
    );
    return matchKey ? HSC_STANDARD_CHAPTER_TOPICS[matchKey] : [];
  }, [form.chapter]);

  const availableTopics = useMemo(() => {
    return Array.from(new Set([...(chapterMeta?.topics || []), ...standardTopics]));
  }, [chapterMeta, standardTopics]);

  const onFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, image: "Choose an image file (PNG, JPG, WebP)." }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((e) => ({ ...e, image: "Image must be 2 MB or smaller so it loads on mobile data." }));
      return;
    }
    setErrors((e) => ({ ...e, image: undefined }));
    setImage(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(form);
    setErrors(errs);
    setServerError("");
    if (Object.keys(errs).length) {
      notify({ tone: "error", title: "Check the highlighted fields", description: Object.values(errs)[0] });
      return;
    }
    const options = form.options.map((o) => o.trim());
    const mainQuestion = (form.question || (form.langMode === "english" ? form.questionEn : form.questionBn) || "").trim();
    const fd = new FormData();
    fd.append("question", mainQuestion);
    fd.append("options", JSON.stringify(options));
    fd.append("correctAnswer", options[form.correct]);
    fd.append("subject", form.subject.trim());
    fd.append("chapter", form.chapter.trim());
    fd.append("topic", form.topic.trim());
    fd.append("difficulty", form.difficulty);
    fd.append("questionType", form.questionType);
    if (form.questionBn) fd.append("questionBn", form.questionBn.trim());
    if (form.questionEn) fd.append("questionEn", form.questionEn.trim());
    if (form.explanationBn) fd.append("explanationBn", form.explanationBn.trim());
    if (form.explanationEn) fd.append("explanationEn", form.explanationEn.trim());
    fd.append("version", form.langMode === "english" ? "english" : (form.langMode === "bangla" ? "bangla" : "bilingual"));
    if (form.questionType === "board") {
      fd.append("boardName", form.boardName);
      fd.append("boardYear", form.boardYear);
    }
    if (form.explanation.trim()) fd.append("explanation", form.explanation.trim());
    if (image) fd.append("image", image);

    setSaving(true);
    try {
      if (editQuestion?._id) {
        await api.updateQuestion(editQuestion._id, fd);
        notify({
          title: "প্রশ্ন আপডেট সম্পন্ন হয়েছে",
          description: `${form.subject} · ${form.chapter}`
        });
      } else {
        await api.createQuestion(fd);
        notify({
          title: "প্রশ্ন সংরক্ষণ করা হয়েছে",
          description: `${form.subject} · ${form.chapter}`,
          action: {
            label: "ব্যাংক দেখুন",
            onClick: () => {
              if (onSuccess) onSuccess();
              else navigate(`/teacher/questions?search=${encodeURIComponent(mainQuestion.slice(0, 40))}`);
            }
          }
        });
        setForm(blank(form));
      }
      setImage(null);
      setTouched(false);
      setErrors({});
      questionRef.current?.focus();
      if (onSuccess) onSuccess();
    } catch (err) {
      setServerError(err.message);
      notify({ tone: "error", title: "সংরক্ষণ করা যায়নি", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title="Create question"
        description="Add a single-answer MCQ to the bank. Bangla, English and inline maths ($…$) are supported."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/teacher/questions")}>
              Cancel
            </Button>
            <Button type="submit" icon="check" loading={saving}>
              Save question
            </Button>
          </>
        }
      />
      {serverError ? (
        <Notice tone="warning" className="mb-5" title="The server rejected this question">
          {serverError}
        </Notice>
      ) : null}

      {editQuestion ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-300 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs">
              ✏️
            </span>
            <div>
              <p className="font-extrabold text-sm text-amber-900">প্রশ্ন সম্পাদনা মোড (Edit Question)</p>
              <p className="text-xs text-amber-700">Question ID: {editQuestion._id}</p>
            </div>
          </div>
          {onCancelEdit ? (
            <Button variant="secondary" size="sm" onClick={onCancelEdit}>
              বাতিল করুন (Cancel)
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Classification & Language" description="বিষয়, চ্যাপ্টার, টপিক, ভাষা এবং কাঠিন্যের মান নির্ধারণ করুন" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="ভাষার ধরন (Language)" className="sm:col-span-2">
                <Segmented
                  label="Language Mode"
                  value={form.langMode}
                  onChange={(v) => set({ langMode: v })}
                  options={[
                    { value: "bangla", label: "🇧🇩 বাংলা ভার্সন" },
                    { value: "english", label: "🇬🇧 English Version" },
                    { value: "bilingual", label: "🌐 উভয় ভার্সন (Bilingual)" },
                  ]}
                />
              </Field>

              <Field label="Subject" htmlFor="cq-subject" required error={errors.subject}>
                <Input id="cq-subject" list="cq-subjects" value={form.subject} invalid={!!errors.subject} onChange={(e) => set({ subject: e.target.value, chapter: "", topic: "" })} placeholder="e.g. ICT" />
                <datalist id="cq-subjects">
                  {meta.subjects.map((s) => (
                    <option key={s.name} value={s.name} />
                  ))}
                </datalist>
              </Field>
              <Field label="Chapter" htmlFor="cq-chapter" required error={errors.chapter}>
                <Input id="cq-chapter" list="cq-chapters" value={form.chapter} invalid={!!errors.chapter} onChange={(e) => set({ chapter: e.target.value, topic: "" })} placeholder="e.g. Communication Systems" />
                <datalist id="cq-chapters">
                  {chapters.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Topic" htmlFor="cq-topic" hint="Optional">
                <Input id="cq-topic" list="cq-topics" value={form.topic} onChange={(e) => set({ topic: e.target.value })} placeholder="e.g. বিশ্বগ্রাম বা সিলেক্ট করুন" />
                <datalist id="cq-topics">
                  {availableTopics.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </Field>
              <Field label="Difficulty">
                <Segmented
                  label="Difficulty"
                  value={form.difficulty}
                  onChange={(v) => set({ difficulty: v })}
                  options={[
                    { value: "easy", label: "সহজ" },
                    { value: "medium", label: "মাঝারি" },
                    { value: "hard", label: "কঠিন" },
                    { value: "unclassified", label: "অনির্ধারিত" },
                  ]}
                />
              </Field>
              <Field label="Question type" className="sm:col-span-2">
                <Segmented
                  label="Question type"
                  value={form.questionType}
                  onChange={(v) => set({ questionType: v })}
                  options={[
                    { value: "normal", label: "Regular" },
                    { value: "board", label: "Board question" },
                  ]}
                />
              </Field>
              {form.questionType === "board" ? (
                <>
                  <Field label="Board" htmlFor="cq-board" required error={errors.boardName}>
                    <Select id="cq-board" value={form.boardName} onChange={(e) => set({ boardName: e.target.value })}>
                      <option value="">Select board</option>
                      {BOARDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Exam year" htmlFor="cq-year" required error={errors.boardYear}>
                    <Input id="cq-year" inputMode="numeric" maxLength={4} value={form.boardYear} invalid={!!errors.boardYear} onChange={(e) => set({ boardYear: e.target.value.replace(/\D/g, "") })} placeholder="2024" />
                  </Field>
                </>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Question" description="Wrap maths in dollar signs, e.g. $x^2 + 5x + 6 = 0$" />
            <div className="flex flex-col gap-4 p-5">
              <Field label="Question text" htmlFor="cq-question" required error={errors.question}>
                <Textarea ref={questionRef} id="cq-question" rows={4} value={form.question} invalid={!!errors.question} onChange={(e) => set({ question: e.target.value })} placeholder="নিচের কোনটি একটি দুর্বল অ্যাসিড?" />
              </Field>

              <Field label="Figure" hint="Optional · PNG, JPG or WebP up to 2 MB" error={errors.image}>
                {preview ? (
                  <div className="flex items-center gap-3 rounded-lg border border-examino-border p-3">
                    <img src={preview} alt="Selected figure preview" className="h-16 w-24 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{image?.name}</p>
                      <p className="text-xs text-examino-muted">{Math.round((image?.size || 0) / 1024)} KB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setImage(null)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      onFile(e.dataTransfer.files?.[0]);
                    }}
                    className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-sm text-examino-muted hover:border-examino-blue hover:bg-examino-blue-light/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue"
                  >
                    <Icon name="image" size={22} />
                    <span>
                      <b className="font-semibold text-examino-blue">Upload an image</b> or drag it here
                    </span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </Field>

              <fieldset>
                <legend className="mb-1.5 text-[13px] font-medium">
                  Options <span className="text-examino-rose-dark">*</span>
                  <span className="ml-2 font-normal text-examino-muted">Select the radio button next to the correct answer</span>
                </legend>
                <div className="flex flex-col gap-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correct"
                        checked={form.correct === i}
                        onChange={() => set({ correct: i })}
                        aria-label={`Mark option ${BN_OPTION_LETTERS[i]} as correct`}
                        className="h-5 w-5 shrink-0 cursor-pointer accent-emerald-600"
                      />
                      <span className="w-5 text-sm font-semibold text-examino-muted">{BN_OPTION_LETTERS[i]}</span>
                      <Input
                        aria-label={`Option ${BN_OPTION_LETTERS[i]}`}
                        value={opt}
                        invalid={!!errors[`option${i}`]}
                        onChange={(e) => {
                          const options = [...form.options];
                          options[i] = e.target.value;
                          set({ options });
                        }}
                        className={form.correct === i ? "border-emerald-400 bg-examino-green-light/60" : ""}
                      />
                    </div>
                  ))}
                </div>
                {errors.correct || errors.options || errors.option0 || errors.option1 || errors.option2 || errors.option3 ? (
                  <p className="mt-2 text-xs text-red-700" role="alert">
                    {errors.correct || errors.options || "Fill in all four options."}
                  </p>
                ) : null}
              </fieldset>

              <Field label="Explanation" htmlFor="cq-exp" hint="Shown to students when they review answers">
                <Textarea id="cq-exp" rows={3} value={form.explanation} onChange={(e) => set({ explanation: e.target.value })} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardHeader title="Student preview" description="How the question appears during an exam" />
            <div className="p-5">
              <div className="rounded-xl border border-examino-border p-4">
                <div className="flex flex-wrap gap-1.5">
                  {form.subject ? <Badge>{form.subject}</Badge> : null}
                  {form.questionType === "board" && form.boardName ? (
                    <Badge tone="indigo">
                      {form.boardName} {form.boardYear}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-3 min-h-[3rem] text-base font-medium leading-relaxed">
                  {form.question ? <MathText text={form.question} /> : <span className="text-examino-subtle">Your question will appear here.</span>}
                </p>
                {preview ? <img src={preview} alt="" className="mt-3 max-h-40 rounded-lg border border-examino-border object-contain" /> : null}
                <div className="mt-3 flex flex-col gap-2">
                  {form.options.map((o, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-examino-border px-3 py-2.5 text-sm">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold">{BN_OPTION_LETTERS[i]}</span>
                      {o ? <MathText text={o} /> : <span className="text-examino-subtle">Option {BN_OPTION_LETTERS[i]}</span>}
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-examino-muted">
                Answer key: <b className="font-semibold text-emerald-700">{form.correct === null ? "not set" : `${BN_OPTION_LETTERS[form.correct]}. ${form.options[form.correct] || "…"}`}</b>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
