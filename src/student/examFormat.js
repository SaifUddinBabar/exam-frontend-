// Formatting helpers shared by the student exam pages.
const dt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const d = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const fmtWhen = (v) => (v ? dt.format(new Date(v)) : "—");
export const fmtDay = (v) => (v ? d.format(new Date(v)) : "—");

export function fmtDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function relative(v, now = Date.now()) {
  if (!v) return "";
  const diff = new Date(v).getTime() - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hrs = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  const txt = mins < 60 ? `${mins} min` : hrs < 48 ? `${hrs} h` : `${days} days`;
  return diff >= 0 ? `in ${txt}` : `${txt} ago`;
}

export const STATUS_META = {
  in_progress: { label: "In progress", tone: "amber" },
  active: { label: "Open now", tone: "green" },
  upcoming: { label: "Upcoming", tone: "blue" },
  completed: { label: "Completed", tone: "neutral" },
  missed: { label: "Missed", tone: "red" },
  closed: { label: "Closed", tone: "neutral" },
};

export const pct = (score, total) => (total ? Math.round((score / total) * 100) : 0);
