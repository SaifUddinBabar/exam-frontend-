// Strict per-question language display. Mirrors exam-backend utils/questionLanguage.js.
// The other language is NEVER used as a silent fallback: if the selected
// language is not available, callers show "Translation unavailable".

const BN_RX = /[ঀ-৿]/;
const LATIN_WORD_RX = /[A-Za-z]{3,}/;
const has = (v) => typeof v === "string" && v.trim() !== "";
const list4 = (v) => Array.isArray(v) && v.length === 4 && v.every(has);

const anyBn = (q) => BN_RX.test(q.question || "") || (q.options || []).some((o) => BN_RX.test(o || ""));
const anyLatinWord = (q) => LATIN_WORD_RX.test(q.question || "") || (q.options || []).some((o) => LATIN_WORD_RX.test(o || ""));

export const LANGS = { bangla: "bangla", english: "english" };

export function getLanguagePref() {
  try {
    return localStorage.getItem("examino_language_mode") === "english" ? "english" : "bangla";
  } catch {
    return "bangla";
  }
}

export function setLanguagePref(mode) {
  try {
    localStorage.setItem("examino_language_mode", mode);
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new CustomEvent("languageModeChanged", { detail: { mode } }));
}

/**
 * Returns { available, text, options, explanation, optionIndexMap } for the given language.
 * `options` keeps the original option order so option index i always means the same answer.
 */
export function resolveQuestion(q, lang = "bangla") {
  if (!q) return { available: false };
  const base = { text: q.question || "", options: q.options || [], explanation: q.explanation || "" };
  if (lang === "english") {
    if (has(q.questionEn)) return { available: true, text: q.questionEn, options: list4(q.optionsEn) ? q.optionsEn : base.options, explanation: q.explanationEn || "" };
    if (!anyBn(q)) return { available: true, ...base };
    return { available: false };
  }
  if (has(q.questionBn)) return { available: true, text: q.questionBn, options: list4(q.optionsBn) ? q.optionsBn : base.options, explanation: q.explanationBn || "" };
  if (anyBn(q) || !anyLatinWord(q)) return { available: true, ...base };
  return { available: false };
}

export const TRANSLATION_UNAVAILABLE = { bangla: "অনুবাদ উপলব্ধ নেই", english: "Translation unavailable" };
