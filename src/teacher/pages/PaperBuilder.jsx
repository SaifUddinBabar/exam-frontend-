import { useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import MathText from "../../components/MathText";
import { api } from "../api";
import { useTeacherData } from "../teacherData";
import { useToast } from "../toast";
import { QuestionPicker } from "../components/questions";
import { Button, Card, CardHeader, Field, IconButton, Input, Modal, Notice, PageHeader, Select, Toggle } from "../components/ui";
import { BN_OPTION_LETTERS, BN_SECTION_LETTERS, toBanglaDigits } from "../utils";
import { Segmented } from "../components/ui";
import QuestionImage from "../../components/QuestionImage";
import { resolveQuestion } from "../../lib/questionLanguage";

// Paper text per language version. Questions are shown strictly in the chosen language.
const PAPER_TEXT = {
  bangla: {
    digits: toBanglaDigits,
    letters: BN_OPTION_LETTERS,
    sections: BN_SECTION_LETTERS,
    institution: "প্রতিষ্ঠানের নাম",
    exam: "পরীক্ষার নাম",
    cls: "শ্রেণি",
    subject: "বিষয়",
    time: "সময়",
    minutes: "মিনিট",
    total: "পূর্ণমান",
    section: "বিভাগ",
    key: "উত্তরমালা",
    note: "[দ্রষ্টব্য: সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত বর্ণসংবলিত বৃত্তসমূহ হতে সঠিক/সর্বোৎকৃষ্ট উত্তরের বৃত্তটি বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট কর। প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেওয়া যাবে না।]",
    unavailable: "অনুবাদ উপলব্ধ নেই",
  },
  english: {
    digits: (n) => String(n),
    letters: ["A", "B", "C", "D"],
    sections: ["A", "B", "C", "D", "E", "F"],
    institution: "Institution name",
    exam: "Exam name",
    cls: "Class",
    subject: "Subject",
    time: "Time",
    minutes: "minutes",
    total: "Full marks",
    section: "Section",
    key: "Answer key",
    note: "[Note: On the answer sheet, completely fill the circle with the letter of the correct/best answer against each question number using a ball-point pen. Do not mark the question paper.]",
    unavailable: "Translation unavailable",
  },
};

let sectionSeq = 0;
const newSection = (title = "বহুনির্বাচনি প্রশ্ন", questions = []) => ({ id: `s${++sectionSeq}`, title, marks: 1, questions });

const PRINT_CSS = `
@media print {
  @page { size: A4; margin: 14mm; }
  body * { visibility: hidden !important; }
  #exam-paper, #exam-paper * { visibility: visible !important; }
  #exam-paper { position: absolute; inset: 0 auto auto 0; width: 100%; border: 0 !important; box-shadow: none !important; padding: 0 !important; }
  .paper-question { break-inside: avoid; }
}`;

function Paper({ info, sections, showKey, lang = "bangla" }) {
  const T = PAPER_TEXT[lang];
  const total = sections.reduce((sum, s) => sum + s.questions.length * (Number(s.marks) || 0), 0);
  const starts = sections.map((_, i) => sections.slice(0, i).reduce((sum, s) => sum + s.questions.length, 0));
  const n = sections.reduce((sum, s) => sum + s.questions.length, 0);
  return (
    <div id="exam-paper" className="mx-auto w-full max-w-[794px] bg-white px-6 py-8 font-bengali text-[13.5px] leading-relaxed text-black shadow-elevated ring-1 ring-examino-border sm:px-12 sm:py-10">
      <header className="text-center">
        <p className="text-xl font-bold">{info.institution || T.institution}</p>
        <p className="mt-0.5 text-[15px] font-semibold">{info.examName || T.exam}</p>
        <p className="mt-0.5">
          {info.className ? `${T.cls}: ${info.className}` : null}
          {info.className && info.subject ? " · " : null}
          {info.subject ? `${T.subject}: ${info.subject}` : null}
        </p>
        <div className="mt-3 flex justify-between border-y border-black py-1.5 text-[13px] font-semibold">
          <span>
            {T.time}: {T.digits(info.duration || 0)} {T.minutes}
          </span>
          <span>
            {T.total}: {T.digits(total)}
          </span>
        </div>
        <p className="mt-2 text-left text-[12px] italic">{T.note}</p>
      </header>

      {sections.every((s) => !s.questions.length) ? (
        <p className="mt-10 text-center text-sm text-slate-400">Add questions to see them here.</p>
      ) : null}

      {sections.map((s, si) =>
        s.questions.length ? (
          <section key={s.id} className="mt-5">
            <div className="mb-2 flex items-baseline justify-between border-b border-dashed border-slate-400 pb-1">
              <p className="font-bold">
                {lang === "english" ? `${T.section} ${T.sections[si] || si + 1}` : `${T.sections[si] || T.digits(si + 1)} ${T.section}`} — {s.title}
              </p>
              <p className="text-[12px]">
                {T.digits(s.marks)} × {T.digits(s.questions.length)} = {T.digits(s.marks * s.questions.length)}
              </p>
            </div>
            <ol className="space-y-3">
              {s.questions.map((q, qi) => {
                const v = resolveQuestion(q, lang);
                return (
                  <li key={q._id} className="paper-question">
                    <p>
                      <span className="mr-1 font-semibold">{T.digits(starts[si] + qi + 1)}.</span>
                      {v.available ? <MathText text={v.text} /> : <span className="rounded bg-amber-100 px-1 text-[12px] font-semibold text-amber-900">[{T.unavailable}]</span>}
                    </p>
                    {v.available ? (
                      <>
                        <QuestionImage q={q} className="my-1 ml-5" />
                        <div className="ml-5 mt-1 grid grid-cols-2 gap-x-6 gap-y-0.5">
                          {v.options.map((o, i) => (
                            <p key={i}>
                              <span className="mr-1">{T.letters[i]})</span>
                              <MathText text={o} />
                            </p>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null
      )}

      {showKey && n > 0 ? (
        <section className="mt-8 border-t-2 border-black pt-3" style={{ breakBefore: "page" }}>
          <p className="mb-2 text-center font-bold">{T.key}</p>
          <div className="grid grid-cols-5 gap-1 text-[12.5px] sm:grid-cols-8">
            {sections
              .flatMap((s) => s.questions)
              .map((q, i) => {
                const idx = (q.options || []).indexOf(q.correctAnswer);
                return (
                  <span key={q._id}>
                    {T.digits(i + 1)}. {idx >= 0 ? T.letters[idx] : "—"}
                  </span>
                );
              })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function PaperBuilder({ preloadedQuestions, initialTitle, embedded = false }) {
  const location = useLocation();
  const { exams, userId } = useTeacherData();
  const { notify } = useToast();
  const initialQs = location.state?.questions || preloadedQuestions || [];
  const [info, setInfo] = useState(() => ({
    institution: "",
    examName: location.state?.title || initialTitle || "",
    className: "",
    subject: initialQs[0]?.subject || "",
    duration: 25,
  }));
  const [sections, setSections] = useState(() => [newSection(undefined, initialQs)]);
  const [activeId, setActiveId] = useState(() => sections[0].id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [lang, setLang] = useState("bangla");
  const unavailableCount = sections.flatMap((s) => s.questions).filter((q) => !resolveQuestion(q, lang).available).length;
  const [loadingExam, setLoadingExam] = useState(false);
  const [exporting, setExporting] = useState(false);
  const paperRef = useRef(null);

  const active = sections.find((s) => s.id === activeId) || sections[0];
  const allIds = useMemo(() => new Set(sections.flatMap((s) => s.questions.map((q) => q._id))), [sections]);
  const selectedMap = useMemo(() => new Map(active.questions.map((q) => [q._id, q])), [active]);
  const totalQuestions = allIds.size;
  const totalMarks = sections.reduce((sum, s) => sum + s.questions.length * (Number(s.marks) || 0), 0);

  const updateSection = (id, patch) => setSections((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const togglePicked = (q) => {
    if (!selectedMap.has(q._id) && allIds.has(q._id)) {
      notify({ tone: "info", title: "Already in another section", description: "Each question can appear once on a paper." });
      return;
    }
    updateSection(active.id, {
      questions: selectedMap.has(q._id) ? active.questions.filter((x) => x._id !== q._id) : [...active.questions, q],
    });
  };

  const moveQuestion = (sid, index, dir) => {
    const s = sections.find((x) => x.id === sid);
    const arr = [...s.questions];
    const j = index + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[index], arr[j]] = [arr[j], arr[index]];
    updateSection(sid, { questions: arr });
  };

  const loadFromExam = async (code) => {
    if (!code) return;
    setLoadingExam(true);
    try {
      const exam = await api.examAdmin(code);
      const qs = (exam.questions || []).filter((q) => !allIds.has(q._id));
      updateSection(active.id, { questions: [...active.questions, ...qs] });
      setInfo((i) => ({ ...i, examName: i.examName || exam.title, duration: exam.duration || i.duration, subject: i.subject || qs[0]?.subject || "" }));
      notify({ title: `Added ${qs.length} questions`, description: exam.title });
    } catch (err) {
      notify({ tone: "error", title: "Couldn't load that exam", description: err.message });
    } finally {
      setLoadingExam(false);
    }
  };

  const downloadPdf = async () => {
    setExporting(true);
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      await html2pdf()
        .set({
          margin: [10, 10, 12, 10],
          filename: `${info.examName || "question-paper"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"], avoid: ".paper-question" },
        })
        .from(document.getElementById("exam-paper"))
        .save();
    } catch (err) {
      notify({ tone: "error", title: "PDF export failed", description: err.message || "Try Print → Save as PDF instead." });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <style>{PRINT_CSS}</style>
      <PageHeader
        title="Question Paper Builder"
        description="Compose a print-ready MCQ paper in the familiar board format, then print it or save it as PDF."
        actions={
          <>
            <Button variant="secondary" icon="printer" onClick={() => window.print()} disabled={!totalQuestions}>
              Print
            </Button>
            <Button icon="download" onClick={downloadPdf} loading={exporting} disabled={!totalQuestions}>
              Download PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Paper details" />
            <div className="grid gap-3 p-5">
              <Field label="Institution" htmlFor="pb-inst">
                <Input id="pb-inst" value={info.institution} onChange={(e) => setInfo({ ...info, institution: e.target.value })} placeholder="আপনার কোচিং/প্রতিষ্ঠানের নাম" />
              </Field>
              <Field label="Exam name" htmlFor="pb-exam">
                <Input id="pb-exam" value={info.examName} onChange={(e) => setInfo({ ...info, examName: e.target.value })} placeholder="মডেল টেস্ট — ০৪" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Class" htmlFor="pb-class">
                  <Input id="pb-class" value={info.className} onChange={(e) => setInfo({ ...info, className: e.target.value })} placeholder="HSC 2027" />
                </Field>
                <Field label="Subject" htmlFor="pb-subject">
                  <Input id="pb-subject" value={info.subject} onChange={(e) => setInfo({ ...info, subject: e.target.value })} placeholder="ICT" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Time (minutes)" htmlFor="pb-dur">
                  <Input id="pb-dur" type="number" min={1} value={info.duration} onChange={(e) => setInfo({ ...info, duration: e.target.value })} />
                </Field>
                <Field label="Full marks">
                  <p className="flex h-10 items-center rounded-lg bg-slate-50 px-3 text-sm font-semibold tabular-nums">{totalMarks}</p>
                </Field>
              </div>
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-examino-text">Paper version</p>
                <Segmented label="Paper language" value={lang} onChange={setLang} options={[{ value: "bangla", label: "বাংলা" }, { value: "english", label: "English" }]} />
                {unavailableCount ? (
                  <p className="mt-2 text-xs font-medium text-amber-700">
                    {unavailableCount} question{unavailableCount === 1 ? " is" : "s are"} not available in {lang === "english" ? "English" : "Bengali"} and will print as “Translation unavailable”. Remove or replace them.
                  </p>
                ) : null}
              </div>
              <Toggle label="Answer key" description="Append an answer page at the end" checked={showKey} onChange={setShowKey} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Sections"
              description={`${totalQuestions} questions · ${totalMarks} marks`}
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  icon="plus"
                  disabled={sections.length >= 6}
                  onClick={() => {
                    const s = newSection(`বিভাগ ${toBanglaDigits(sections.length + 1)}`);
                    setSections((ss) => [...ss, s]);
                    setActiveId(s.id);
                  }}
                >
                  Section
                </Button>
              }
            />
            <div className="flex flex-col gap-3 p-4">
              {sections.map((s, si) => {
                const isActive = s.id === active.id;
                return (
                  <div key={s.id} className={`rounded-lg border p-3 ${isActive ? "border-examino-blue ring-1 ring-examino-blue" : "border-examino-border"}`}>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setActiveId(s.id)} aria-pressed={isActive} className="text-xs font-semibold text-examino-muted hover:text-examino-blue">
                        {BN_SECTION_LETTERS[si]} বিভাগ
                      </button>
                      <span className="flex-1" />
                      {sections.length > 1 ? (
                        <IconButton
                          icon="trash"
                          label="Remove section"
                          className="h-7 w-7"
                          size={14}
                          onClick={() => {
                            setSections((ss) => ss.filter((x) => x.id !== s.id));
                            if (isActive) setActiveId(sections.find((x) => x.id !== s.id).id);
                          }}
                        />
                      ) : null}
                    </div>
                    <div className="mt-2 grid grid-cols-[1fr_84px] gap-2">
                      <Input aria-label="Section title" value={s.title} onChange={(e) => updateSection(s.id, { title: e.target.value })} onFocus={() => setActiveId(s.id)} />
                      <Input aria-label="Marks per question" type="number" min={0} step="0.5" value={s.marks} onChange={(e) => updateSection(s.id, { marks: e.target.value })} title="Marks per question" />
                    </div>
                    {s.questions.length ? (
                      <ol className="mt-2 max-h-56 overflow-y-auto">
                        {s.questions.map((q, i) => (
                          <li key={q._id} className="flex items-center gap-1 py-1 text-[12.5px]">
                            <span className="w-5 text-right text-examino-muted">{i + 1}.</span>
                            <span className="line-clamp-1 min-w-0 flex-1 px-1">{q.question}</span>
                            <IconButton icon="chevronUp" label="Move up" className="h-6 w-6" size={13} onClick={() => moveQuestion(s.id, i, -1)} />
                            <IconButton icon="chevronDown" label="Move down" className="h-6 w-6" size={13} onClick={() => moveQuestion(s.id, i, 1)} />
                            <IconButton icon="x" label="Remove question" className="h-6 w-6" size={13} onClick={() => updateSection(s.id, { questions: s.questions.filter((x) => x._id !== q._id) })} />
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-2 text-xs text-examino-muted">No questions yet.</p>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon="plus"
                      className="mt-2 w-full"
                      onClick={() => {
                        setActiveId(s.id);
                        setPickerOpen(true);
                      }}
                    >
                      Add from question bank
                    </Button>
                  </div>
                );
              })}
              <Field label="Or copy questions from one of your exams" htmlFor="pb-from-exam">
                <Select id="pb-from-exam" value="" disabled={!exams.length || loadingExam} onChange={(e) => loadFromExam(e.target.value)}>
                  <option value="">{loadingExam ? "Loading…" : exams.length ? `Add to ${BN_SECTION_LETTERS[sections.indexOf(active)]} বিভাগ…` : "You have no exams yet"}</option>
                  {exams.map((e) => (
                    <option key={e.examCode} value={e.examCode}>
                      {e.title} ({e.examCode})
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>
          <Notice tone="neutral">Papers aren't saved on the server yet — print or download before leaving this page.</Notice>
        </div>

        <div ref={paperRef} className="min-w-0 overflow-x-auto rounded-xl bg-slate-100 p-3 sm:p-6">
          <Paper info={info} sections={sections} showKey={showKey} lang={lang} />
        </div>
      </div>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        size="xl"
        title={`Add questions to ${BN_SECTION_LETTERS[sections.indexOf(active)]} বিভাগ`}
        description={`${active.questions.length} selected in this section`}
        footer={<Button onClick={() => setPickerOpen(false)}>Done</Button>}
      >
        <QuestionPicker selected={selectedMap} onToggle={togglePicked} userId={userId} />
      </Modal>
    </>
  );
}
