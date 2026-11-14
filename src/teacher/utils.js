// Pure helpers for formatting and for deriving teacher analytics from real API data.

export const DAY = 24 * 60 * 60 * 1000;

export function userId(user) {
  return String(user?.id || user?._id || "");
}

export function firstName(name = "") {
  return name.trim().split(/\s+/)[0] || "there";
}

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]).join("") || "?").toUpperCase();
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const shortDayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const numFmt = new Intl.NumberFormat("en-IN");

export const fmtDate = (d) => (d ? dateFmt.format(new Date(d)) : "—");
export const fmtDateTime = (d) => (d ? dateTimeFmt.format(new Date(d)) : "—");
export const fmtShortDay = (d) => shortDayFmt.format(new Date(d));
export const fmtNum = (n) => (n === null || n === undefined || Number.isNaN(n) ? "—" : numFmt.format(n));
export const fmtPct = (n, digits = 0) =>
  n === null || n === undefined || Number.isNaN(n) ? "—" : `${n.toFixed(digits)}%`;

export function timeAgo(d, now = Date.now()) {
  const diff = Math.max(0, now - new Date(d).getTime());
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export const toBanglaDigits = (value) => String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
export const BN_OPTION_LETTERS = ["ক", "খ", "গ", "ঘ"];
export const BN_SECTION_LETTERS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ"];

// ---------- Exams ----------

export const EXAM_STATUS = {
  draft: { label: "Draft", tone: "neutral" },
  scheduled: { label: "Scheduled", tone: "blue" },
  live: { label: "Live", tone: "green" },
  completed: { label: "Completed", tone: "slate" },
  open: { label: "Open", tone: "indigo" },
};

export function examStatus(exam, now = Date.now()) {
  if (exam?.isPublished === false) return "draft";
  const start = exam?.startTime ? new Date(exam.startTime).getTime() : null;
  const end = exam?.endTime ? new Date(exam.endTime).getTime() : null;
  if (start && now < start) return "scheduled";
  if (end && now > end) return "completed";
  if (start || end) return "live";
  return "open";
}

export const examQuestionCount = (exam) => (Array.isArray(exam?.questions) ? exam.questions.length : 0);

// ---------- Attempts & students ----------

// Flatten rankings ({code: [{name, roll, score, createdAt}]}) into attempt rows.
export function buildAttempts(exams, rankings) {
  const rows = [];
  exams.forEach((exam) => {
    const list = rankings[exam.examCode];
    if (!Array.isArray(list)) return;
    const total = examQuestionCount(exam);
    list.forEach((r) => {
      const score = Number(r.score) || 0;
      rows.push({
        id: r._id || `${exam.examCode}-${r.roll}-${r.createdAt}`,
        examCode: exam.examCode,
        examTitle: exam.title,
        name: (r.name || "Unnamed").trim(),
        roll: String(r.roll || "").trim(),
        score,
        total,
        pct: total > 0 ? Math.min(100, (score / total) * 100) : null,
        createdAt: r.createdAt,
      });
    });
  });
  return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export const studentKey = (a) => `${a.roll.toLowerCase()}|${a.name.toLowerCase()}`;

export function aggregateStudents(attempts, now = Date.now()) {
  const map = new Map();
  attempts.forEach((a) => {
    const key = studentKey(a);
    if (!map.has(key)) {
      map.set(key, { key, name: a.name, roll: a.roll, attempts: [] });
    }
    map.get(key).attempts.push(a);
  });
  return [...map.values()].map((s) => {
    const pcts = s.attempts.map((a) => a.pct).filter((p) => p !== null);
    const times = s.attempts.map((a) => new Date(a.createdAt).getTime());
    const last = Math.max(...times);
    return {
      ...s,
      examsTaken: new Set(s.attempts.map((a) => a.examCode)).size,
      avgPct: pcts.length ? pcts.reduce((x, y) => x + y, 0) / pcts.length : null,
      bestPct: pcts.length ? Math.max(...pcts) : null,
      firstSeen: new Date(Math.min(...times)),
      lastSeen: new Date(last),
      active: now - last <= 30 * DAY,
    };
  });
}

// ---------- Time series ----------

export function dayBuckets(days, now = new Date()) {
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  const buckets = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const start = new Date(end.getTime() - i * DAY);
    buckets.push({ start: start.getTime(), end: start.getTime() + DAY, label: fmtShortDay(start) });
  }
  return buckets;
}

export function weekBuckets(weeks, now = new Date()) {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const bEnd = end.getTime() - i * 7 * DAY;
    buckets.push({ start: bEnd - 7 * DAY, end: bEnd, label: fmtShortDay(bEnd - 6 * DAY) });
  }
  return buckets;
}

// Count items per bucket, or aggregate with `reduce(itemsInBucket) -> number|null`.
export function bucketize(items, getTime, buckets, reduce) {
  return buckets.map((b) => {
    const inside = items.filter((it) => {
      const t = new Date(getTime(it)).getTime();
      return t >= b.start && t < b.end;
    });
    return { label: b.label, value: reduce ? reduce(inside) : inside.length };
  });
}

export function countBetween(items, getTime, from, to) {
  return items.filter((it) => {
    const t = new Date(getTime(it)).getTime();
    return t >= from && t < to;
  }).length;
}

export const average = (values) => {
  const v = values.filter((x) => x !== null && x !== undefined && !Number.isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

export function median(values) {
  const v = values.filter((x) => x !== null && !Number.isNaN(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

// ---------- CSV ----------

export function downloadCsv(filename, rows) {
  const escape = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "﻿" + rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- Local preferences (per-browser conveniences only) ----------

export function readPref(key, fallback) {
  try {
    const raw = localStorage.getItem(`examino.teacher.${key}`);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writePref(key, value) {
  try {
    localStorage.setItem(`examino.teacher.${key}`, JSON.stringify(value));
  } catch {
    /* storage unavailable — preference simply won't persist */
  }
}
