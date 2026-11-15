// Thin client for the existing Examino Express API.
// Only endpoints that already exist in exam-backend/routes are used here.

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function toQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "All") return;
    sp.set(key, String(value));
  });
  return sp.toString();
}

export async function request(path, { method = "GET", body, formData, auth = true, signal } = {}) {
  const headers = {};
  const token = localStorage.getItem("token");
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload, signal });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new ApiError("Can't reach the Examino server. Check your connection and try again.", 0);
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok || (data && data.success === false)) {
    const message = data?.message || data?.error || `Request failed (${res.status}).`;
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent("examino:unauthorized"));
    }
    throw new ApiError(message, res.status);
  }

  return data;
}

export const api = {
  me: (opts) => request("/api/auth/me", opts),

  // Exams (routes/examRoutes.js)
  listExams: (opts) => request("/api/exams/list", opts),
  examAdmin: (code, opts) => request(`/api/exams/${encodeURIComponent(code)}/admin`, opts),
  createExam: (body) => request("/api/exams/create", { method: "POST", body }),
  deleteExam: (code) => request(`/api/exams/${encodeURIComponent(code)}`, { method: "DELETE" }),
  ranking: (code, opts) => request(`/api/exams/ranking/${encodeURIComponent(code)}`, opts),

  // Questions (routes/questionRoutes.js + routes/practiceRoutes.js)
  metadata: (opts) => request("/api/practice/metadata", opts),
  questionBank: (params, opts) => request(`/api/practice/question-bank?${toQuery(params)}`, opts),
  topicCounts: (params, opts) => request(`/api/practice/topic-counts?${toQuery(params)}`, opts),
  createQuestion: (formData) => request("/api/questions", { method: "POST", formData }),
  updateQuestion: (id, formData) => request(`/api/questions/${encodeURIComponent(id)}`, { method: "PUT", formData }),

  // Organizations (routes/organizationRoutes.js)
  organizations: (opts) => request("/api/organizations", opts),

  // Exams — teacher management
  updateExam: (code, body) => request(`/api/exams/${encodeURIComponent(code)}`, { method: "PUT", body }),

  // Exams — student flow (server-side attempt)
  studentExams: (opts) => request("/api/exams/student/available", opts),
  examDetails: (code, opts) => request(`/api/exams/${encodeURIComponent(code)}`, opts),
  startExam: (code) => request(`/api/exams/${encodeURIComponent(code)}/start`, { method: "POST" }),
  saveAnswers: (code, answers, opts) => request(`/api/exams/${encodeURIComponent(code)}/answers`, { method: "PUT", body: { answers }, ...opts }),
  submitExam: (code, answers, idempotencyKey) => request("/api/exams/submit", { method: "POST", body: { examCode: code, answers, idempotencyKey } }),
  myResult: (code, opts) => request(`/api/exams/${encodeURIComponent(code)}/my-result`, opts),
  studentRanking: (code, opts) => request(`/api/exams/ranking/${encodeURIComponent(code)}`, opts),
  studentHistory: (opts) => request("/api/exams/student/history", opts),

  // Question reports & revisions
  reportQuestion: (id, body) => request(`/api/questions/${encodeURIComponent(id)}/report`, { method: "POST", body }),
  questionReports: (status = "open", opts) => request(`/api/questions/reports?status=${status}`, opts),
  resolveReport: (id, status) => request(`/api/questions/reports/${encodeURIComponent(id)}`, { method: "PUT", body: { status } }),

  // Batches
  batches: (params, opts) => request(`/api/batches?${toQuery(params)}`, opts),
  createBatch: (body) => request("/api/batches", { method: "POST", body }),
  updateBatch: (id, body) => request(`/api/batches/${id}`, { method: "PUT", body }),
  archiveBatch: (id) => request(`/api/batches/${id}/archive`, { method: "POST" }),
  restoreBatch: (id) => request(`/api/batches/${id}/restore`, { method: "POST" }),
  regenerateBatchCode: (id) => request(`/api/batches/${id}/regenerate-code`, { method: "POST" }),
  batchStudents: (id, opts) => request(`/api/batches/${id}/students`, opts),
  addBatchStudents: (id, studentIds) => request(`/api/batches/${id}/students`, { method: "POST", body: { studentIds } }),
  removeBatchStudent: (id, studentId) => request(`/api/batches/${id}/students/${studentId}`, { method: "DELETE" }),
  moveBatchStudents: (id, studentIds, toBatchId) => request(`/api/batches/${id}/move`, { method: "POST", body: { studentIds, toBatchId } }),
  searchStudents: (params, opts) => request(`/api/batches/students/search?${toQuery(params)}`, opts),
  myBatches: (opts) => request("/api/batches/mine", opts),
  joinBatch: (code) => request("/api/batches/join", { method: "POST", body: { code } }),

  // Notices
  notices: (opts) => request("/api/notices", opts),
  markNoticeRead: (id) => request(`/api/notices/${id}/read`, { method: "POST" }),
  manageNotices: (opts) => request("/api/notices/manage", opts),
  createNotice: (formData) => request("/api/notices", { method: "POST", formData }),
  archiveNotice: (id) => request(`/api/notices/${id}`, { method: "DELETE" }),

  // Student dashboard
  studentDashboard: (opts) => request("/api/student/dashboard", opts),

  // Battles & league
  battleTopics: (opts) => request("/api/battles/topics", opts),
  findBattle: (filters) => request("/api/battles/find", { method: "POST", body: filters }),
  createFriendBattle: (filters) => request("/api/battles/friend", { method: "POST", body: filters }),
  joinFriendBattle: (roomCode) => request("/api/battles/join", { method: "POST", body: { roomCode } }),
  battle: (id, opts) => request(`/api/battles/${id}`, opts),
  answerBattle: (id, index, optionIndex) => request(`/api/battles/${id}/answer`, { method: "POST", body: { index, optionIndex } }),
  leaveBattle: (id) => request(`/api/battles/${id}/leave`, { method: "POST" }),
  currentBattle: (opts) => request("/api/battles/current", opts),
  battleHistory: (opts) => request("/api/battles/history", opts),
  leaderboard: (params, opts) => request(`/api/league/leaderboard?${toQuery(params)}`, opts),
  myLeague: (opts) => request("/api/league/me", opts),
  leagueRules: (opts) => request("/api/league/rules", opts),
};

export function imageUrl(file) {
  if (!file) return "";
  if (Array.isArray(file)) file = file[0];
  if (typeof file !== "string") return "";
  const trimmed = file.trim();
  if (/^(?:https?:|\/\/|data:image\/)/i.test(trimmed)) return trimmed;
  // If already starts with /uploads/ or uploads/, normalize to single /uploads/
  const clean = trimmed.replace(/^\/?(?:uploads\/)?/i, "");
  return `${API_BASE}/uploads/${clean}`;
}

export function studentExamLink(code) {
  return `${window.location.origin}/exams/${code}/details`;
}
